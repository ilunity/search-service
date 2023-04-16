import { List } from "../list";
import { LinkedNode } from "./linked-node";
import { Iterator, ListItemContent, ListItemPayload, ListStructure } from "../list.types";
import { v4 as uuidv4 } from "uuid";
import { InvertedIndexEnum } from "../../inverted-index";

export class LinkedList extends List {
  private firstNode: LinkedNode = null;

  constructor() {
    super();
  }

  insertOrIncrementByDocId(docId: number, {
    docLength,
    termCount: incrementTermsNumber = 1
  }: ListItemPayload) {
    const searchResult = this.searchByDocId(docId);
    if (searchResult) {
      const { content } = searchResult;
      content.payload.termCount += incrementTermsNumber;
      return;
    }

    this.insert({
      docId,
      payload: {
        termCount: incrementTermsNumber,
        docLength
      }
    });
  }

  private searchByDocId(docId: number): { node: LinkedNode, content: ListItemContent } | null {
    if (!this.firstNode) {
      return null;
    }

    let currentNode = this.firstNode;
    while (currentNode.next && currentNode.next.docId < docId) {
      currentNode = currentNode.next;
    }

    const isFirstNodeEqual = this.firstNode.docId === docId;
    const isDocNotExists = !isFirstNodeEqual && currentNode.next === null;
    if (isDocNotExists) {
      return null;
    }

    const returnedNode = isFirstNodeEqual ? this.firstNode : currentNode.next;

    return {
      node: returnedNode,
      content: {
        docId: returnedNode.docId,
        payload: returnedNode.payload
      }
    };
  }

  insert({ docId, payload }: ListItemContent) {
    this._length += 1;
    const newNode = new LinkedNode(docId, payload);

    if (!this.firstNode) {
      return this.firstNode = newNode;
    }

    let currentNode = this.firstNode;
    if (currentNode.docId >= newNode.docId) {
      this.firstNode = newNode;
      newNode.next = currentNode;
      return;
    }

    while (currentNode.next && currentNode.next.docId < newNode.docId) {
      currentNode = currentNode.next;
    }

    const isAllNodesLessThanNew = currentNode.next === null;
    if (isAllNodesLessThanNew) {
      currentNode.next = newNode;
    } else {
      newNode.next = currentNode.next;
      currentNode.next = newNode;
    }
  }

  private iteratorStep(node: LinkedNode): ListItemContent | null {
    if (!node) {
      if (this.firstNode) {
        return this.firstNode;
      }

      return null;
    }

    const nextNode = node.next;
    return nextNode;
  }

  iterator(): Iterator {
    let current = null;
    return {
      next: () => {
        current = this.iteratorStep(current);
        return current;
      },
      current: () => current
    };
  }

  getStructure(): ListStructure {
    const listStructure: ListStructure = {
      type: InvertedIndexEnum.LINKED_LIST_INDEX,
      structure: {
        nodes: [],
        edges: []
      }
    };

    if (!this.firstNode) {
      return listStructure;
    }

    let currentNode = this.firstNode;
    let currentNodeId = uuidv4();
    while (currentNode.next) {
      listStructure.structure.nodes.push({
        id: currentNodeId,
        docIds: [currentNode.docId]
      });

      const newNodeId = uuidv4();
      listStructure.structure.edges.push({
        source: currentNodeId,
        target: newNodeId
      });

      currentNode = currentNode.next;
      currentNodeId = newNodeId;
    }

    listStructure.structure.nodes.push({
      id: currentNodeId,
      docIds: [currentNode.docId]
    })

    return listStructure;
  }
}
