import { Body, Controller, Get, Post } from "@nestjs/common";
import { AppService } from "./app.service";
import { CreateIndexDto } from "./dto/create-index.dto";
import { AddDocumentDto } from "./dto/add-document.dto";
import { SearchDto } from "./dto/search.dto";
import { TopKHeadElement } from "./search-engine/ranking-algorithms/top-k-head";
import { GetIndexReturn } from "./search-engine/search-engine.types";
import { GetListStructureDto } from "./dto/get-list-structure.dto";

@Controller("api/v1/index")
export class AppController {
  constructor(private readonly appService: AppService) {
  }

  @Post()
  createIndex(
    @Body() createIndexDto: CreateIndexDto
  ) {
    return this.appService.createIndex(createIndexDto);
  }

  @Get()
  getIndexes(): GetIndexReturn {
    return this.appService.getIndexes();
  }

  @Post("doc")
  addDoc(
    @Body() addDocumentDto: AddDocumentDto
  ): number {
    return this.appService.addDoc(addDocumentDto);
  }

  @Post("structure")
  getListStructure(
    @Body() getListStructureDto: GetListStructureDto
  ) {
    return this.appService.getListStructure(getListStructureDto);
  }

  @Post("search")
  search(
    @Body() searchDto: SearchDto
  ): TopKHeadElement[] {
    return this.appService.search(searchDto);
  }
}
