export interface BM25Options {
  b?: number;
  k?: number;
  minScore?: number;
}

export interface IDFParams {
  docsCount: number;
  docsWithTermCount: number;
}
