import { BTreeNode } from "./b-tree-node";
import { List } from "../list";
import { IteratorCurrent, IteratorStack } from "./b-tree.types";
import { GraphStructure, Iterator, ListItemContent, ListItemPayload, ListStructure } from "../list.types";
import { InvertedIndexEnum } from "../../inverted-index";
import { v4 as uuidv4 } from "uuid";

const DEFAULT_ORDER = 2;

export class BTree extends List {
  private root: BTreeNode;
  private readonly _order: number;

  get order(): number {
    return this._order;
  }

  constructor(order?: number) {
    super();
    this._order = order || DEFAULT_ORDER;
  }

  /**
   * Search a value in the Tree and return the node. O(log N)
   */
  private searchByDocId(node: BTreeNode, docId: number): { node: BTreeNode, content: ListItemContent } | null {
    const contentIndex = node.contents.findIndex((content) => content.docId === docId);
    if (contentIndex !== -1) {
      return { node, content: node.contents[contentIndex] };
    }

    if (node.isLeaf) {
      return null;
    }

    let child: number = 0;
    while (child < node.length && node.contents[child].docId < docId) {
      child++;
    }

    return this.searchByDocId(node.children[child], docId);
  }

  updateBTreeContent(docId: number, termCount: number) {
    const { content } = this.searchByDocId(this.root, docId);
    if (content === null) {
      return null;
    }

    content.payload.termCount = termCount;
  }

  insertOrIncrementByDocId(docId: number, { docLength, termCount: incrementTermsNumber = 1 }: ListItemPayload) {
    const searchResult = this.root && this.searchByDocId(this.root, docId);
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
  };

  /**
   * Insert a new value in the tree O(log N)
   */
  insert(listItemContent: ListItemContent) {
    const actual = this.root;

    this._length += 1;

    if (!actual) {
      this.root = new BTreeNode(true);
      this.root.addContent(listItemContent);
      return;
    }

    if (!actual.isFull(this._order)) {
      this.insertNonFull(actual, listItemContent);
      return;
    }

    // Create a new node to become the root
    // Append the old root to the new one
    const temp = new BTreeNode(false);
    this.root = temp;

    temp.addChild(actual, 0);

    this.split(actual, temp, 1);
    this.insertNonFull(temp, listItemContent);
  };

  /**
   * Divide child node from parent into parent.values[pos-1] and parent.values[pos]. O(1)
   */
  private split(child: BTreeNode, parent: BTreeNode, pos: number) {
    const newChild = new BTreeNode(child.isLeaf);

    // Create a new child
    // Pass values from the old child to the new
    for (let k = 1; k < this._order; k++) {
      newChild.addContent(child.removeContent(this._order));
    }

    // Trasspass child nodes from the old child to the new
    if (!child.isLeaf) {
      for (let k = 1; k <= this._order; k++) {
        newChild.addChild(child.removeChild(this._order), k - 1);
      }
    }

    // Add new child to the parent
    parent.addChild(newChild, pos);

    // Pass value to parent
    parent.addContent(child.removeContent(this._order - 1));
    parent.isLeaf = false;
  }

  /**
   * Insert a value in a not-full node. O(1)
   */
  private insertNonFull(node: BTreeNode, content: ListItemContent) {
    if (node.isLeaf) {
      node.addContent(content);
      return;
    }

    let temp = node.length;
    while (temp >= 1 && content.docId < node.contents[temp - 1].docId) {
      temp = temp - 1;
    }

    if (node.children[temp].isFull(this._order)) {
      this.split(node.children[temp], node, temp + 1);
      if (content.docId > node.contents[temp].docId) {
        temp = temp + 1;
      }
    }

    this.insertNonFull(node.children[temp], content);
  }

  /**
   * Deletes the value from the Tree. O(log N)
   */
  delete(docId: number) {
    this._length -= 1;

    if (this.root.length === 1
      && !this.root.isLeaf
      && this.root.children[0].length === this._order - 1
      && this.root.children[1].length === this._order - 1
    ) {
      // Check if the root can shrink the tree into its children
      this.mergeNodes(this.root.children[1], this.root.children[0]);
      this.root = this.root.children[0];
    }

    // Start looking for the value to delete
    this.deleteFromNode(this.root, docId);
  }

  /**
   * Delete a value from a node
   */
  private deleteFromNode(node: BTreeNode, docId: number) {
    // Check if value is in the actual node
    const index = node.contents.findIndex((content) => content.docId === docId);
    if (index >= 0) {
      // Value present in the node
      if (node.isLeaf && node.length > this._order - 1) {
        // If the node is a leaf and has more than order-1 values, just delete it
        node.removeContent(node.contents.findIndex((content) => content.docId === docId));
        return;
      }

      // Check if one child has enough values to transfer
      if (
        node.children[index].length > this._order - 1
        || node.children[index + 1].length > this._order - 1
      ) {
        // One of the immediate children has enough values to transfer
        if (node.children[index].length > this._order - 1) {
          // Replace the target value for the highest of left node.
          // Then delete that value from the child
          const predecessor = this.getExtremeFromSubTree(node.children[index], true);
          node.contents[index] = predecessor;
          return this.deleteFromNode(node.children[index], predecessor.docId);
        }

        const successor = this.getExtremeFromSubTree(node.children[index + 1], false);
        node.contents[index] = successor;
        return this.deleteFromNode(node.children[index + 1], successor.docId);
      }

      // Children has not enough values to transfer. Do a merge
      this.mergeNodes(node.children[index + 1], node.children[index]);
      return this.deleteFromNode(node.children[index], docId);
    }

    // Value is not present in the node
    if (node.isLeaf) {
      // Value is not in the tree
      return;
    }

    // Value is not present in the node, search in the children
    let nextNode = 0;
    while (nextNode < node.length && node.contents[nextNode].docId < docId) {
      nextNode++;
    }

    if (node.children[nextNode].length > this._order - 1) {
      // Child node has enough values to continue
      return this.deleteFromNode(node.children[nextNode], docId);
    }

    // Child node has not enough values to continue
    // Before visiting next node transfer a value or merge it with a brother
    if (
      (nextNode > 0 && node.children[nextNode - 1].length > this._order - 1)
      || (nextNode < node.length && node.children[nextNode + 1].length > this._order - 1)
    ) {
      // One of the immediate children has enough values to transfer
      if (nextNode > 0 && node.children[nextNode - 1].length > this._order - 1) {
        this.transferValue(node.children[nextNode - 1], node.children[nextNode]);
      } else {
        this.transferValue(node.children[nextNode + 1], node.children[nextNode]);
      }

      return this.deleteFromNode(node.children[nextNode], docId);
    }

    // No immediate brother with enough values.
    // Merge node with immediate one brother
    this.mergeNodes(
      nextNode > 0 ? node.children[nextNode - 1] : node.children[nextNode + 1],
      node.children[nextNode]);

    return this.deleteFromNode(node.children[nextNode], docId);
  }

  /**
   * Get the lower or higher value in a subtree
   * @param { boolean } isMax true for find max, false for min
   */
  private getExtremeFromSubTree(node: BTreeNode, isMax: boolean): ListItemContent {
    while (!node.isLeaf) {
      node = node.children[isMax ? node.length : 0];
    }

    return node.contents[isMax ? node.length - 1 : 0];
  }

  /**
   * Transfer one value from the origin to the target.
   */
  private transferValue(origin: BTreeNode, target: BTreeNode) {
    const originIndex = origin.parent.children.indexOf(origin);
    const targetIndex = origin.parent.children.indexOf(target);

    if (originIndex < targetIndex) {
      target.addContent(target.parent.removeContent(originIndex));
      origin.parent.addContent(origin.removeContent(origin.length - 1));

      if (!origin.isLeaf) {
        target.addChild(origin.removeChild(origin.children.length - 1), 0);
      }
    } else {
      target.addContent(target.parent.removeContent(targetIndex));
      origin.parent.addContent(origin.removeContent(0));

      if (!origin.isLeaf) {
        target.addChild(origin.removeChild(0), target.children.length);
      }
    }
  }

  /**
   * Merge 2 nodes into one with the parent median value. O(1)
   */
  private mergeNodes(origin: BTreeNode, target: BTreeNode) {
    const originIndex = origin.parent.children.indexOf(origin);
    const targetIndex = target.parent.children.indexOf(target);

    target.addContent(target.parent.removeContent(Math.min(originIndex, targetIndex)));

    for (let i = origin.length - 1; i >= 0; i--) {
      target.addContent(origin.removeContent(i));
    }

    // Remove reference to origin node
    target.parent.removeChild(originIndex);

    // Transfer all the children from origin node to target
    if (!origin.isLeaf) {
      while (origin.children.length) {
        originIndex > targetIndex
          ? target.addChild(origin.removeChild(0), target.children.length)
          : target.addChild(origin.removeChild(origin.children.length - 1), 0);
      }
    }
  }

  private iteratorStep(stack: IteratorStack): ListItemContent | null {
    let current = stack[stack.length - 1];
    if (!current) {
      return null;
    }

    if (current.node.isLeaf) {
      const result = this.leafIteratorStep(current);

      if (result !== null) {
        return result;
      }

      stack.pop();
      if (stack.length === 0) {
        return null;
      }
      current = stack[stack.length - 1];
    }

    let isNodeEnd = current.valueIndex === current.node.length;
    while (isNodeEnd) {
      stack.pop();

      if (stack.length === 0) {
        return null;
      }

      current = stack[stack.length - 1];
      isNodeEnd = current.valueIndex === current.node.length;
    }


    const returnedValue = current.node.contents[current.valueIndex];
    current.valueIndex += 1;

    stack.push({
      node: current.node.children[current.valueIndex],
      valueIndex: 0
    });
    this.expandStackToNextLeaf(stack);

    return returnedValue;
  }

  private leafIteratorStep(current: IteratorCurrent): ListItemContent | null {
    if (current.valueIndex >= current.node.length) {
      return null;
    }

    const indexOfReturned = current.valueIndex;
    current.valueIndex += 1;

    return current.node.contents[indexOfReturned];
  }

  private expandStackToNextLeaf(stack: IteratorStack) {
    let node = stack[stack.length - 1].node;

    while (!node.isLeaf) {
      node = node.children[0];
      stack.push({ node, valueIndex: 0 });
    }
  }

  iterator(): Iterator {
    const initStack = [{
      node: this.root,
      valueIndex: 0
    }];
    this.expandStackToNextLeaf(initStack);

    let current = null;
    return {
      next: () => {
        current = this.iteratorStep(initStack);
        return current;
      },
      current: () => current
    };
  }

  [Symbol.iterator]() {
    const iterator = this.iterator();

    const next = () => {
      const nextContent = iterator.next();

      if (nextContent) {
        return { done: false, value: nextContent };
      } else {
        return { done: true, value: null };
      }
    };

    return { next };
  }

  getStructure(): ListStructure {
    let structure: GraphStructure = {} as GraphStructure;

    if (!this.root) {
      structure = {
        nodes: [],
        edges: []
      };
    }

    const nodeId = uuidv4();
    structure = this.structureStep(this.root, nodeId);

    return {
      type: InvertedIndexEnum.BTREE_INDEX,
      structure
    };
  }

  private structureStep(node: BTreeNode, nodeId: string): GraphStructure {
    const structure: GraphStructure = {
      nodes: [{
        id: nodeId,
        docIds: node.contents.map(value => value.docId)
      }],
      edges: []
    };

    if (!node.children.length) {
      return structure;
    }

    for (const child of node.children) {
      const childNodeId = uuidv4();
      structure.edges.push({
        target: childNodeId,
        source: nodeId
      });

      const childStructure = this.structureStep(child, childNodeId);
      structure.nodes.push(...childStructure.nodes);
      structure.edges.push(...childStructure.edges);
    }

    return structure;
  }
}
