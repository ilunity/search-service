import { INVERTED_INDEXES, InvertedIndex, InvertedIndexEnum } from "./inverted-index";
import { SEARCH_ALGORITHMS, SearchAlgorithm, SearchAlgorithmEnum } from "./ranking-algorithms";
import { TopKHeadElement } from "./ranking-algorithms/top-k-head";
import { GetIndexReturn } from "./search-engine.types";
import { ListStructure } from "./lists";

export class SearchEngine {
  private indexes: Record<string, InvertedIndex> = {};

  /**
   * Returns true if new index has been created and false if index is already exists
   */
  createIndex(name: string, type: InvertedIndexEnum): boolean {
    const isIndexExists = name in this.indexes;
    if (isIndexExists) {
      return false;
    }

    this.indexes[name] = this.makeIndex(type);
    return true;
  }

  private makeIndex(type: InvertedIndexEnum): InvertedIndex {
    return new INVERTED_INDEXES[type]();
  }

  getIndexes(): GetIndexReturn {
    let indexes = {};

    for (const [indexName, invertedIndex] of Object.entries(this.indexes)) {
      indexes[indexName] = {
        docsCount: invertedIndex.docsCount,
        terms: invertedIndex.getTerms(),
        type: invertedIndex.type
      };
    }

    return indexes;
  }

  addDoc(indexName: string, content: string): number | null {
    const index = this.indexes[indexName];
    if (!index) {
      return null;
    }

    return index.indexText(content);
  }

  search(indexName: string, algorithmType: SearchAlgorithmEnum, query: string): TopKHeadElement[] | null {
    const index = this.indexes[indexName];
    if (!index) {
      return null;
    }

    const searchAlgorithm = this.makeSearchAlgorithm(algorithmType);
    const result = searchAlgorithm.search({
      index: index.index,
      docsCount: index.docsCount,
      sumDocsLength: index.sumDocsLength,
      query,
      maxDocs: 10
    });

    return result;
  }

  private makeSearchAlgorithm(algorithmType: SearchAlgorithmEnum): SearchAlgorithm {
    return new SEARCH_ALGORITHMS[algorithmType]();
  };

  getListStructure(indexName: string, term: string): ListStructure | null {
    const index = this.indexes[indexName];
    if (!index) {
      return null;
    }

    return index.getListStructure(term);
  }
}
