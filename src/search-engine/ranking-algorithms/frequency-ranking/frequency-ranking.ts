import { SearchAlgorithm } from '../search-algorithm';
import { SearchParams } from '../search-algorithm.types';
import { TopKHead, TopKHeadElement } from '../top-k-head';
import { IndexRecord } from '../../inverted-index';
import { ScoresMap } from './frequency-ranking.types';

export class FrequencyRanking extends SearchAlgorithm {

  constructor() {
    super();
  }

  search(searchParams: SearchParams): TopKHeadElement[] {
    const { index, query, maxDocs } = searchParams;
    const tokenizedQuery = this.tokenizeQuery(query);

    const scoreMap = this.makeScoresList(index, tokenizedQuery);
    const topKHead = new TopKHead(maxDocs);
    for (const [docId, score] of Object.entries(scoreMap)) {
      topKHead.add({ docId: +docId, score });
    }

    return topKHead.topList;
  }

  private makeScoresList(index: IndexRecord, tokenizedQuery: string[]): ScoresMap {
    const scoresMap: ScoresMap = {};

    for (const term of tokenizedQuery) {
      const postingList = index[term];

      if (!postingList) {
        continue;
      }

      const iterator = postingList.iterator();

      let currentDoc = iterator.next();
      while (currentDoc) {
        const { docId, payload: { termCount } } = currentDoc;

        const isDocAlreadyInList = docId in scoresMap;
        if (isDocAlreadyInList) {
          scoresMap[docId] += termCount;
        } else {
          scoresMap[docId] = termCount;
        }

        currentDoc = iterator.next();
      }
    }

    return scoresMap;
  }
}
