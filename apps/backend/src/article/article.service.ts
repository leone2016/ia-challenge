import { Injectable } from '@nestjs/common';
import { EntityManager, QueryOrder, wrap } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/mysql';

import { User } from '../user/user.entity';
import {Article, ArticleDTO} from './article.entity';
import { IArticleRO, IArticlesRO, ICommentsRO } from './article.interface';
import { Comment } from './comment.entity';
import { CreateArticleDto, CreateCommentDto } from './dto';
import {TagService} from "../tag/tag.service";
import {UserFavorites} from "../userFavorites/userFavorites.entity";
import {RoasterUserArticleDto} from "../userFavorites/dto/roaster-user-article.dto";

@Injectable()
export class ArticleService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Article)
    private readonly articleRepository: EntityRepository<Article>,
    @InjectRepository(Comment)
    private readonly commentRepository: EntityRepository<Comment>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    @InjectRepository(UserFavorites)
    private readonly userFavoritesRepository: EntityRepository<UserFavorites>,
    private tagService: TagService,
  ) {}


  async findAll(userId: number, query: Record<string, string>): Promise<IArticlesRO> {
    const user = userId
      ? await this.userRepository.findOne(userId, { populate: ['followers', 'favorites'] })
      : undefined;
    const qb = this.articleRepository.createQueryBuilder('a').select('a.*').leftJoin('a.author', 'u');

    if ('tag' in query) {
      qb.andWhere({ tagList: new RegExp(query.tag) });
    }

    if ('author' in query) {
      const author = await this.userRepository.findOne({ username: query.author });

      if (!author) {
        return { articles: [], articlesCount: 0 };
      }

      qb.andWhere({ author: author.id });
    }

    if ('favorited' in query) {
      const author = await this.userRepository.findOne({ username: query.favorited }, { populate: ['favorites'] });

      if (!author) {
        return { articles: [], articlesCount: 0 };
      }

      const ids = author.favorites.$.getIdentifiers();
      qb.andWhere({ author: ids });
    }

    qb.orderBy({ createdAt: QueryOrder.DESC });
    const res = await qb.clone().count('id', true).execute('get');
    const articlesCount = res.count;

    if ('limit' in query) {
      qb.limit(+query.limit);
    }

    if ('offset' in query) {
      qb.offset(+query.offset);
    }

    const articles = await qb.getResult();

    return { articles: articles.map((a) => a.toJSON(user!)), articlesCount };
  }

  async findFeed(userId: number, query: Record<string, string>): Promise<IArticlesRO> {
    const user = userId
      ? await this.userRepository.findOne(userId, { populate: ['followers', 'favorites'] })
      : undefined;
    const res = await this.articleRepository.findAndCount(
      { author: { followers: userId } },
      {
        populate: ['author'],
        orderBy: { createdAt: QueryOrder.DESC },
        limit: +query.limit,
        offset: +query.offset,
      },
    );

    console.log('findFeed', { articles: res[0], articlesCount: res[1] });
    return { articles: res[0].map((a) => a.toJSON(user!)), articlesCount: res[1] };
  }

  async findOne(userId: number, where: Partial<Article>): Promise<IArticleRO> {
    const user = userId
      ? await this.userRepository.findOneOrFail(userId, { populate: ['followers', 'favorites'] })
      : undefined;
    const article = await this.articleRepository.findOne(where, { populate: ['author', "collaborator"] });
    // console.log(article.collaborator)
    return { article: article && article.toJSON(user) } as IArticleRO;
  }

  async addComment(userId: number, slug: string, dto: CreateCommentDto) {
    const article = await this.articleRepository.findOneOrFail({ slug }, { populate: ['author'] });
    const author = await this.userRepository.findOneOrFail(userId);
    const comment = new Comment(author, article, dto.body);
    await this.em.persistAndFlush(comment);

    return { comment, article: article.toJSON(author) };
  }

  async deleteComment(userId: number, slug: string, id: number): Promise<IArticleRO> {
    const article = await this.articleRepository.findOneOrFail({ slug }, { populate: ['author'] });
    const user = await this.userRepository.findOneOrFail(userId);
    const comment = this.commentRepository.getReference(id);

    if (article.comments.contains(comment)) {
      article.comments.remove(comment);
      await this.em.removeAndFlush(comment);
    }

    return { article: article.toJSON(user) };
  }

  async favorite(id: number, slug: string): Promise<IArticleRO> {
    const article = await this.articleRepository.findOneOrFail({ slug }, { populate: ['author'] });
    const user = await this.userRepository.findOneOrFail(id, { populate: ['favorites', 'followers'] });

    if (!user.favorites.contains(article)) {
      user.favorites.add(article);
      article.favoritesCount++;
    }

    await this.em.flush();
    return { article: article.toJSON(user) };
  }

  async unFavorite(id: number, slug: string): Promise<IArticleRO> {
    const article = await this.articleRepository.findOneOrFail({ slug }, { populate: ['author'] });
    const user = await this.userRepository.findOneOrFail(id, { populate: ['followers', 'favorites'] });

    if (user.favorites.contains(article)) {
      user.favorites.remove(article);
      article.favoritesCount--;
    }

    await this.em.flush();
    return { article: article.toJSON(user) };
  }

  async findComments(slug: string): Promise<ICommentsRO> {
    const article = await this.articleRepository.findOne({ slug }, { populate: ['comments'] });
    return { comments: article!.comments.getItems() };
  }

  async create(userId: number, dto: CreateArticleDto) {
    const user = await this.userRepository.findOne(
      { id: userId },
      { populate: ['followers', 'favorites', 'articles'] },
    );
    const article = new Article(user!, dto.title, dto.description, dto.body);
    let tags = dto.tagList.map(x=>x.toLowerCase());
    article.tagList.push(...tags);
    user?.articles.add(article);
    this.tagService.Create({tags});
    await this.em.flush();
    return { article: article.toJSON(user!) };
  }

  async update(userId: number, slug: string, articleData: any): Promise<IArticleRO> {
    const user = await this.userRepository.findOne(
      { id: userId },
      { populate: ['followers', 'favorites', 'articles'] },
    );
    const { createdAt, ...articleWithoutCreatedAt } = articleData;
    const article = await this.articleRepository.findOne({ slug }, { populate: ['author', 'collaborator'] });
    wrap(article).assign(articleWithoutCreatedAt);
    const users: User[] = await this.userRepository.find({ email: { $in: articleData.collaboratorList } } );
    console.log(article)
    article && users.map((user: User)=> {
       if(!article.collaborator.contains(user)){
         article.collaborator.add(user)
      }
    })

    await this.em.flush();

    return { article: article!.toJSON(user!) };
  }

  async delete(slug: string) {
    return this.articleRepository.nativeDelete({ slug });
  }


  async findRoaster( query: Record<string, string>){
    const qb =  this.articleRepository.createQueryBuilder( 'a')
      .select(['u.id', 'u.username'])
      .addSelect('COUNT(DISTINCT a.id) as totalArticlesWritten')
      .addSelect('COALESCE(COUNT(uf.article_id), 0) as totalLikesReceived ')
      .addSelect('MIN(a.created_at) as firstArticleDate')
      .leftJoin('a.author', 'u')
      .leftJoin('a.userFavorites', 'uf')
      .groupBy(['u.id', 'u.username'])
      .orderBy({ [3]: QueryOrder.DESC })

    if ('limit' in query) {
      qb.limit(+query.limit);
    }

    if ('offset' in query) {
      qb.offset(+query.offset);
    }

    const result = await qb.getFormattedQuery();
    const roaster: RoasterUserArticleDto[] =  await this.em.getConnection().execute(result)
    return { roaster };
  }

  async collaboratorUser(collaboratorList: string[], article: Article){
    // const users: User[] = await this.userRepository.find({ email: { $in: collaboratorList } } );
    //
    // users.map((user: User)=> {
    //   if(!user.collaborator.contains(article)){
    //     user.collaborator.add(article)
    //   }
    // })
  //   // const article = await this.articleRepository.findOneOrFail({ slug }, { populate: ['author'] });
  //   // const user = await this.userRepository.findOneOrFail(id, { populate: ['favorites', 'followers'] });
  //   //
  //   // if (!user.favorites.contains(article)) {
  //   //   user.favorites.add(article);
  //   //   article.favoritesCount++;
  //   // }
  //
  //   await this.em.flush();
    return { article:  ""};
   }

}
