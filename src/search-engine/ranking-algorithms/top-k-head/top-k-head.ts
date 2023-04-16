import { TopKHeadElement } from './top-k-head.types';

export class TopKHead {
  private _topList: TopKHeadElement[] = [];
  k: number;

  get topList(): TopKHeadElement[] {
    return this._topList;
  }

  constructor(k: number) {
    this.k = k;
  }

  add(element: TopKHeadElement) {
    let insertedIndex = 0;
    while (insertedIndex < this._topList.length && this._topList[insertedIndex].score >= element.score) {
      insertedIndex++;
    }

    const isIndexInsideArray = insertedIndex < this._topList.length;
    if (isIndexInsideArray) {
      this.insert(insertedIndex, element);

      const isListOverflow = this._topList.length > this.k;
      if (isListOverflow) {
        this._topList.pop();
      }

      return;
    }

    const isFreePlaceInList = this._topList.length < this.k;
    if (isFreePlaceInList) {
      this._topList.push(element);
    }
  }

  private insert(index: number, element: TopKHeadElement) {
    this._topList.splice(index, 0, element);
  }
}
