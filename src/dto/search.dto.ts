import { IsDefined, IsEnum, IsString } from "class-validator";
import { SearchAlgorithmEnum } from "../search-engine/ranking-algorithms";

export class SearchDto {
  @IsDefined()
  @IsString()
  readonly indexName: string;

  @IsDefined()
  @IsEnum(SearchAlgorithmEnum)
  readonly algorithmType: SearchAlgorithmEnum;

  @IsDefined()
  @IsString()
  readonly query: string;
}
