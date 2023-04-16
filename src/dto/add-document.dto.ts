import { IsDefined, IsString } from "class-validator";

export class AddDocumentDto {
  @IsDefined()
  @IsString()
  readonly indexName: string;

  @IsDefined()
  @IsString()
  readonly content: string;
}
