import { IsDefined, IsString } from "class-validator";

export class GetListStructureDto {
  @IsDefined()
  @IsString()
  readonly indexName: string;

  @IsDefined()
  @IsString()
  readonly term: string;
}
