import { ListItemContent } from '../../list.types';

export class BTreeNode {
  isLeaf: boolean;
  parent: BTreeNode = null;
  private _contents: ListItemContent[] = [];
  children: BTreeNode[] = [];

  get contents(): ListItemContent[] {
    return this._contents;
  }

  constructor(isLeaf) {
    this.isLeaf = isLeaf;
  }

  /**
   * Number of values
   * @returns {number}
   */
  get length(): number {
    return this._contents.length;
  }

  /**
   * Add value
   * @param {number} content
   */
  addContent(content: ListItemContent) {
    if (!content) {
      return;
    }

    let pos: number = 0;
    while (pos < this.length && this._contents[pos].docId < content.docId) {
      pos++;
    }

    this._contents.splice(pos, 0, content);
  }

  /**
   * Delete value and return it
   * @param {number} pos position
   * @return {number}
   */
  removeContent(pos: number): ListItemContent {
    if (pos >= this.length) {
      return null;
    }

    return this._contents.splice(pos, 1)[0];
  }

  /**
   * Add child node at position pos
   * @param {BTreeNode} node
   * @param {number} pos
   */
  addChild(node: BTreeNode, pos: number) {
    this.children.splice(pos, 0, node);
  }

  /**
   * Remove node from position and return it
   * @param {number} pos
   * @return {BTreeNode}
   */

  removeChild(pos: number): BTreeNode {
    return this.children.splice(pos, 1)[0];
  }

  /**
   * Check if node is full
   * @param {number} order
   * @return {boolean}
   */
  isFull(order: number): boolean {
    return this.length === (2 * order - 1);
  }
}
