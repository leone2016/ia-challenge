import {
  Entity,
  ManyToOne, OneToMany,
  PrimaryKey,
} from '@mikro-orm/core';
import {User} from "../user/user.entity";
import {Article} from "../article/article.entity";
@Entity({tableName: 'article_author'})
export class ArticleAuthor {

  // mandatory for mikroOrm
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Article)
  article!: Article;

}
