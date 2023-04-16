import { BTreeNode } from "./b-tree-node";

export interface IteratorCurrent {
  node: BTreeNode;
  valueIndex: number;
}

export type IteratorStack = IteratorCurrent[];
