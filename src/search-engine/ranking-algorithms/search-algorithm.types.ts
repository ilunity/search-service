import { IndexRecord } from "../inverted-index";
import { Bm25 } from "./bm-25";
import { FrequencyRanking } from "./frequency-ranking";
import { DistanceRanking } from "./distance-ranking";
import { Iterator } from "../lists";
import { TermsSet } from "./terms-set";

export interface SearchParams {
  index: IndexRecord;
  query: string;
  maxDocs: number;
  sumDocsLength: number;
  docsCount: number;
}

export interface RankingParameters {
  termFrequency: number;
  docLength: number;
  docLengthAverage: number;
  docsWithTermCount: number;
  docsCount: number;
}

export interface PostingList {
  iterator: Iterator;
  upperBound: number;
  length: number;
}

export interface TermsSets {
  requiredTerms: TermsSet;
  nonRequiredTerms: TermsSet;
}

export enum SearchAlgorithmEnum {
  BM25_SCORE = "BM25_SCORE",
  FREQUENCY_SCORE = "FREQUENCY_SCORE",
  DISTANCE_SCORE = "DISTANCE_SCORE",
}

export const SEARCH_ALGORITHMS = {
  [SearchAlgorithmEnum.BM25_SCORE]: Bm25,
  [SearchAlgorithmEnum.FREQUENCY_SCORE]: FrequencyRanking,
  [SearchAlgorithmEnum.DISTANCE_SCORE]: DistanceRanking
};
