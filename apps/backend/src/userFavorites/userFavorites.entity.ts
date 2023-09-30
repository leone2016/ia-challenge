import {
  Entity,
  ManyToOne, OneToMany,
  PrimaryKey,
} from '@mikro-orm/core';
import {User} from "../user/user.entity";
import {Article} from "../article/article.entity";
@Entity({tableName: 'user_favorites'})
export class UserFavorites {

  @PrimaryKey()
  id!: number;


  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Article)
  article!: Article;

}
