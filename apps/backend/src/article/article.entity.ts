import {
  ArrayType,
  Collection,
  Entity,
  EntityDTO, ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  wrap,
} from '@mikro-orm/core';
import slug from 'slug';

import { User } from '../user/user.entity';
import { Comment } from './comment.entity';
import {UserFavorites} from "../userFavorites/userFavorites.entity";
import {ArticleAuthor} from "./articleAuthor.entity";

@Entity()
export class Article {
  @PrimaryKey({ type: 'number' })
  id: number;

  @Property()
  slug: string;

  @Property()
  title: string;

  @Property()
  description = '';

  @Property()
  body = '';

  @Property({ type: 'date' })
  createdAt = new Date();

  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property({ type: ArrayType })
  tagList: string[] = [];

  @ManyToOne(() => User)
  author: User;

  @OneToMany(() => Comment, (comment) => comment.article, { eager: true, orphanRemoval: true })
  comments = new Collection<Comment>(this);

  @Property({ type: 'number' })
  favoritesCount = 0;

  @OneToMany(() => UserFavorites, (userFavorites) => userFavorites.article, { eager: false,  hidden: true })
  userFavorites = new Collection<UserFavorites>(this);

  @ManyToMany({
    entity: () => User,
    pivotTable: 'article_author',
    hidden: true })
  collaborator = new Collection<User>(this);

  @Property({ type: 'date', nullable: true })
  locked_at : Date ;

  @ManyToOne({
    entity: () => User,
    joinColumn: 'locked_by',
    nullable: true})
  locked_by?: User ;

  constructor(author: User, title: string, description: string, body: string) {
    this.author = author;
    this.title = title;
    this.description = description;
    this.body = body;
    this.slug = slug(title, { lower: true }) + '-' + ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
  }

  toJSON(user?: User) {
    const o = wrap<Article>(this).toObject() as ArticleDTO;
    o.favorited = user && user.favorites.isInitialized() ? user.favorites.contains(this) : false;
    o.author = this.author.toJSON(user);
    o.authors = this.collaborator;
    o.collaboratorList = this.collaborator.toArray().map(author => author.email);
    o.islocked = !!this.locked_by
    return o;
  }
}

export interface ArticleDTO extends EntityDTO<Article> {
  favorited?: boolean;
  authors:  Collection<User, object>;
  collaboratorList: string[];
  islocked?: boolean;
}
