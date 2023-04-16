import { IsDefined, IsEnum, IsString } from "class-validator";
import { InvertedIndexEnum } from "../search-engine/inverted-index";

export class CreateIndexDto {
  @IsDefined()
  @IsString()
  readonly name: string;

  @IsDefined()
  @IsEnum(InvertedIndexEnum)
  readonly type: InvertedIndexEnum;
}
