import { CalculateScoreParams } from './terms-set.types';
import { PostingList } from '../search-algorithm.types';
import { ListItemContent } from '../../lists';


export class TermsSet {
  protected _postingLists: PostingList[];

  constructor(postingLists: PostingList[]) {
    this._postingLists = postingLists;
  }

  isEmpty() {
    return this._postingLists.length === 0;
  }

  nextDoc(docId: number): ListItemContent {
    this.skipLessThan(docId, true);
    this.sortPostingLists();
    return this._postingLists.length ? this._postingLists[0].iterator.current() : null;
  }

  skipLessThan(docId: number, deleteEquals = false) {
    for (const postingList of this._postingLists) {
      let { docId: currentDocId } = postingList.iterator.current() || postingList.iterator.next();

      let isNeedToSkip = (currentDocId !== null) && (currentDocId < docId || deleteEquals && currentDocId === docId);
      while (isNeedToSkip) {
        const nextContent = postingList.iterator.next();
        currentDocId = nextContent ? nextContent.docId : null;

        isNeedToSkip = (currentDocId !== null) && (currentDocId < docId || deleteEquals && currentDocId === docId);
      }
    }

    this.deleteNullPostingLists();
  }

  protected deleteNullPostingLists() {
    let postingListsCount = this._postingLists.length;
    let i = 0;

    while (i < postingListsCount) {
      if (this._postingLists[i].iterator.current() === null) {
        this._postingLists.splice(i, 1);
        i--;
        postingListsCount--;
      }

      i++;
    }
  }

  sortPostingLists() {
    this._postingLists.sort((a, b) => {
      return a.iterator.current() > b.iterator.current() ? 1 : -1
    });
  }

  calculateScore(
    {
      docId,
      bm25,
      docsCount,
      docLengthAverage,
    }: CalculateScoreParams,
  ) {
    let sumScore = 0;
    for (const postingList of this._postingLists) {
      const { docId: currentDocId, payload: { termCount, docLength } } = postingList.iterator.current();

      if (currentDocId === docId) {
        sumScore += bm25.score({
          termFrequency: termCount,
          docsWithTermCount: postingList.length,
          docsCount,
          docLength,
          docLengthAverage,
        });
      }
    }

    return sumScore;
  }
}
