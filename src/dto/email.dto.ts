import { IsString, IsNotEmpty } from 'class-validator';

export class ParseMailDto {
  @IsString()
  @IsNotEmpty()
  filePathOrUrl: string;
}
