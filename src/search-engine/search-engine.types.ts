import { InvertedIndexEnum } from "./inverted-index";

export interface TermInfo {
  term: string;
  docsCount: number;
}

export type GetIndexReturn = Record<string, {
  docsCount: number;
  terms: TermInfo[];
  type: InvertedIndexEnum;
}>
