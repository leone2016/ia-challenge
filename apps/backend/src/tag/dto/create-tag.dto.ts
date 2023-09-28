import {IsNotEmpty} from "class-validator";

export class CreatetagDto {
  @IsNotEmpty()
  readonly tags: string[];
}
