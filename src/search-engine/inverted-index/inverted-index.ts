import { PorterStemmerRu } from "natural";
import { IndexRecord, InvertedIndexEnum } from "./inverted-index.types";
import { List, ListStructure } from "../lists";
import { TermInfo } from "../search-engine.types";

const tokenize = PorterStemmerRu.tokenizeAndStem;

export abstract class InvertedIndex {
  private _index: IndexRecord = {};
  private _docsCount: number = 0;
  private _sumDocsLength: number;
  type: InvertedIndexEnum;
  minScore: number;

  get index(): IndexRecord {
    return this._index;
  }

  get docsCount(): number {
    return this._docsCount;
  }

  get sumDocsLength(): number {
    return this._sumDocsLength;
  }

  constructor(type: InvertedIndexEnum, minScore?: number) {
    this._docsCount = 0;
    this._sumDocsLength = 0;
    this.minScore = minScore || 10;
    this.type = type;
  }

  protected makeList?(): List;

  private indexWord(term: string, docId: number, docLength: number, termCount = 1) {
    const isWordExist = term in this._index;

    if (!isWordExist) {
      const newList = this.makeList();
      this._index[term] = newList;
    }

    this._index[term].insertOrIncrementByDocId(docId, { docLength, termCount });
  }

  indexText(content: string): number {
    const docLength = content.length;
    const tokenizedQuery = tokenize(content);

    const docId = this._docsCount++;
    this._sumDocsLength += docLength;

    for (const word of tokenizedQuery) {
      this.indexWord(word, docId, docLength);
    }

    return docId;
  }

  getTerms(): TermInfo[] {
    return Object.entries(this._index).map(([term, list]) => ({
      term,
      docsCount: list.length
    }));
  }

  getListStructure(term: string): ListStructure | null{
    const list = this._index[term];
    if (!list) {
      return null;
    }

    return list.getStructure();
  }
}
