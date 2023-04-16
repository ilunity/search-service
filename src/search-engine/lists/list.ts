import { Iterator, ListItemContent, ListItemPayload, ListStructure } from "./list.types";

export abstract class List {
  protected _length: number;

  get length(): number {
    return this._length;
  }

  constructor() {
    this._length = 0;
  }

  public insert?(listItemContent: ListItemContent): void;
  public iterator?(): Iterator;
  /**
   * Inserts the new payload or increments terms number in existing item
   * */
  public insertOrIncrementByDocId?(docId: number, payload: ListItemPayload);

  [Symbol.iterator]() {
    const iterator = this.iterator();

    const next = () => {
      const nextContent = iterator.next();

      if (nextContent) {
        return { done: false, value: nextContent };
      } else {
        return { done: true, value: null };
      }
    };

    return { next };
  }

  public getStructure?(): ListStructure;
}
