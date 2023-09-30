import { IsNotEmpty } from 'class-validator';
import {Property} from "@mikro-orm/core";

export class RoasterUserArticleDto {
  @IsNotEmpty()
  readonly id: number;

  @IsNotEmpty()
  readonly username: string;


  @IsNotEmpty()
  readonly totalArticlesWritten: number;

  @IsNotEmpty()
  readonly totalLikesReceived: number;

  @IsNotEmpty()
  @Property({fieldName: 'first_article_date'})
  readonly firstArticleDate: string;

}
