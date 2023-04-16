import { BadRequestException, Injectable } from "@nestjs/common";
import { SearchEngine } from "./search-engine";
import { CreateIndexDto } from "./dto/create-index.dto";
import { AddDocumentDto } from "./dto/add-document.dto";
import { SearchDto } from "./dto/search.dto";
import { TopKHeadElement } from "./search-engine/ranking-algorithms/top-k-head";
import { GetIndexReturn } from "./search-engine/search-engine.types";
import { GetListStructureDto } from "./dto/get-list-structure.dto";

@Injectable()
export class AppService {
  private searchEngine: SearchEngine;

  constructor() {
    this.searchEngine = new SearchEngine();
  }

  createIndex({ name, type }: CreateIndexDto) {
    const isIndexWasCreated = this.searchEngine.createIndex(name, type);
    if (!isIndexWasCreated) {
      throw new BadRequestException("Индекс с таким именем уже существует");
    }
  }

  getIndexes(): GetIndexReturn {
    return this.searchEngine.getIndexes();
  }

  addDoc({ indexName, content }: AddDocumentDto): number {
    const result = this.searchEngine.addDoc(indexName, content);
    if (result === null) {
      throw new BadRequestException("Указанный индекс не найден");
    }

    return result;
  }

  getListStructure({ indexName, term }: GetListStructureDto) {
    const result = this.searchEngine.getListStructure(indexName, term);
    if (result === null) {
      throw new BadRequestException("Указанный индекс или слово не найдены");
    }

    return result;
  }

  search({ indexName, algorithmType, query }: SearchDto): TopKHeadElement[] {
    return this.searchEngine.search(indexName, algorithmType, query);
  }
}
