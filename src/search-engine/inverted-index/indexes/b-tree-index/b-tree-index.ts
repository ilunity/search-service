import { InvertedIndex, InvertedIndexEnum } from "../../index";
import { BTree } from "../../../lists/b-tree";

export class BTreeIndex extends InvertedIndex {
  constructor() {
    super(InvertedIndexEnum.BTREE_INDEX);
  }

  makeList() {
    return new BTree();
  }
}
