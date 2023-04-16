import { BM25Options, IDFParams } from './bm-25.types';
import { PostingList, RankingParameters, SearchAlgorithm, SearchParams, TermsSets } from '../index';
import { CalculateScoreParams, TermsSet } from '../terms-set';
import { IndexRecord } from '../../inverted-index';
import { TopKHead, TopKHeadElement } from '../top-k-head';

export class Bm25 extends SearchAlgorithm {
  private k: number;
  private b: number;
  private minScore: number;

  constructor(bm25Options?: BM25Options) {
    super();
    const { k = 2, b = 0.75, minScore = 0 } = bm25Options || {};
    this.k = k;
    this.b = b;
    this.minScore = minScore;
  }

  search({ index, query, maxDocs, docsCount, sumDocsLength }: SearchParams): TopKHeadElement[] {
    const topKHead = new TopKHead(maxDocs);

    const tokenizedQuery = this.tokenizeQuery(query);
    const postingLists = this.makePostingLists(index, tokenizedQuery, docsCount);

    const termsSets = this.makeTermsSets(postingLists);
    if (termsSets === null) {
      return topKHead.topList;
    }

    const { requiredTerms, nonRequiredTerms } = termsSets;

    let currentDocId = -1;
    while (!requiredTerms.isEmpty()) {
      let currentScore = 0;

      const nextDoc = requiredTerms.nextDoc(currentDocId);
      if (!nextDoc) {
        continue;
      }
      currentDocId = nextDoc.docId;
      nonRequiredTerms.skipLessThan(currentDocId);


      const calculateScoreParams: CalculateScoreParams = {
        bm25: this,
        docId: currentDocId,
        docsCount,
        docLengthAverage: sumDocsLength / docsCount,
      };

      currentScore += requiredTerms.calculateScore(calculateScoreParams);
      currentScore += nonRequiredTerms.calculateScore(calculateScoreParams);

      if (currentScore >= this.minScore) {
        topKHead.add({
          docId: currentDocId,
          score: currentScore,
        });
      }
    }

    return topKHead.topList;
  }

  score({ termFrequency, docLength, docLengthAverage, ...IDFParams }: RankingParameters) {
    return (
      (termFrequency * (this.k + 1)) * this.IDF(IDFParams)
      / (termFrequency + this.k * (1 - this.b + this.b * (docLength / docLengthAverage)))
    );
  }

  IDF({ docsCount, docsWithTermCount }: IDFParams) {
    return Math.log(
      (docsCount - docsWithTermCount + 0.5)
      / (docsWithTermCount + 0.5),
    );
  }

  makePostingLists(index: IndexRecord, query: string[], docsCount: number): PostingList[] {
    let postingLists: PostingList[] = [];
    for (const term of query) {
      const postingList = index[term];

      if (!postingList) {
        continue;
      }

      const upperBound = this.upperBound({
        docsCount: docsCount,
        docsWithTermCount: postingList.length,
      });

      postingLists.push({
        iterator: postingList.iterator(),
        upperBound,
        length: postingList.length,
      });
    }

    return postingLists;
  }

  upperBound(params: IDFParams) {
    return (this.k + 1) * this.IDF(params);
  }

  makeTermsSets(postingLists: PostingList[]): TermsSets | null {
    postingLists.sort((a, b) => a.upperBound > b.upperBound ? 1 : -1);

    let partialUpperBound = 0;
    for (let i = 0; i < postingLists.length; i++) {

      partialUpperBound += postingLists[i].upperBound;
      if (partialUpperBound >= this.minScore) {
        const requiredTerms = new TermsSet(postingLists.splice(i));
        const nonRequiredTerms = new TermsSet(postingLists);

        return {
          requiredTerms,
          nonRequiredTerms,
        };
      }
    }

    return null;
  }
}
