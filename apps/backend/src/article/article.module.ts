import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthMiddleware } from '../user/auth.middleware';
import { User } from '../user/user.entity';
import { UserModule } from '../user/user.module';
import { ArticleController } from './article.controller';
import { Article } from './article.entity';
import { ArticleService } from './article.service';
import { Comment } from './comment.entity';
import {TagModule} from "../tag/tag.module";
import {UserFavoritesModule} from "../userFavorites/userFavorites.module";
import {UserFavorites} from "../userFavorites/userFavorites.entity";
import {ScheduleModule} from "@nestjs/schedule";

@Module({
  controllers: [ArticleController],
  imports: [ScheduleModule.forRoot(),MikroOrmModule.forFeature({ entities: [Article, Comment, User, UserFavorites] }), UserModule, TagModule, UserFavoritesModule],
  providers: [ArticleService],
})
export class ArticleModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'articles/feed', method: RequestMethod.GET },
        { path: 'articles', method: RequestMethod.POST },
        { path: 'articles/:slug', method: RequestMethod.DELETE },
        { path: 'articles/:slug', method: RequestMethod.PUT },
        { path: 'articles/:slug/comments', method: RequestMethod.POST },
        { path: 'articles/:slug/comments/:id', method: RequestMethod.DELETE },
        { path: 'articles/:slug/favorite', method: RequestMethod.POST },
        { path: 'articles/:slug/favorite', method: RequestMethod.DELETE },
        { path: 'articles/:slug/lock', method: RequestMethod.POST },
        { path: 'articles/:slug/unlock', method: RequestMethod.POST },
        { path: 'articles/:slug/check-lock', method: RequestMethod.GET },
      );
  }
}
