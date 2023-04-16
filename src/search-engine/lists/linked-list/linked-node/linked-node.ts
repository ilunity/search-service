import { ListItemPayload } from '../../list.types';

export class LinkedNode {
  docId: number;
  payload: ListItemPayload;
  next: LinkedNode = null;

  constructor(docId: number, payload: ListItemPayload) {
    this.docId = docId;
    this.payload = payload;
  }
}
