import { Bm25 } from '../bm-25';

export interface CalculateScoreParams {
  bm25: Bm25;
  docId: number;
  docsCount: number;
  docLengthAverage: number;
}
