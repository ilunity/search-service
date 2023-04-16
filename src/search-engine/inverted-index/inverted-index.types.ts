import { List } from "../lists";
import { BTreeIndex } from "./indexes/b-tree-index";
import { LinkedListIndex } from "./indexes/linked-list-index";

export type IndexRecord = Record<string, List>;

export enum InvertedIndexEnum {
  BTREE_INDEX = "BTREE_INDEX",
  LINKED_LIST_INDEX = "LINKED_LIST_INDEX",
}

export const INVERTED_INDEXES = {
  [InvertedIndexEnum.BTREE_INDEX]: BTreeIndex,
  [InvertedIndexEnum.LINKED_LIST_INDEX]: LinkedListIndex
};
