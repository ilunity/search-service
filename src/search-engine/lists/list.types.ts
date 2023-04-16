import { InvertedIndexEnum } from "../inverted-index";

export interface ListItemPayload {
  termCount: number;
  docLength: number;
}

export interface ListItemContent {
  docId: number;
  payload: ListItemPayload;
}

export interface Iterator {
  next: () => ListItemContent | null;
  current: () => ListItemContent | null;
}

export type GraphStructure = {
  nodes: { id: string, docIds: number[] }[];
  edges: { source: string, target: string }[];
}

export type ListStructure = {
  type: InvertedIndexEnum;
  structure: GraphStructure;
};
