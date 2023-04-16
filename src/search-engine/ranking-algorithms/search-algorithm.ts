import { TopKHeadElement } from './top-k-head';
import { SearchParams } from './search-algorithm.types';
import { PorterStemmerRu } from 'natural';

const tokenize = PorterStemmerRu.tokenizeAndStem;

export abstract class SearchAlgorithm {
  public search?(searchParams: SearchParams): TopKHeadElement[];

  protected tokenizeQuery(query: string): string[] {
    const tokenizedQuery = tokenize(query);
    return tokenizedQuery;
  }
}
