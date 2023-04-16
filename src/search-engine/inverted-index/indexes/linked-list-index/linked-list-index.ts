import { InvertedIndex, InvertedIndexEnum } from "../../index";
import { LinkedList } from "../../../lists/linked-list";

export class LinkedListIndex extends InvertedIndex {
  constructor() {
    super(InvertedIndexEnum.LINKED_LIST_INDEX);
  }

  makeList() {
    return new LinkedList();
  }
}
