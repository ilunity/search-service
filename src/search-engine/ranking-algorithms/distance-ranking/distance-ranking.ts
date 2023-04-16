import { SearchAlgorithm } from '../search-algorithm';
import { SearchParams } from '../search-algorithm.types';
import { TopKHeadElement } from '../top-k-head';

export class DistanceRanking extends SearchAlgorithm {
  constructor() {
    super();
  }

  public search?(searchParams: SearchParams): TopKHeadElement[];
}
