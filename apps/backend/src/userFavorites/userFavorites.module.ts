import {Module} from "@nestjs/common";
import {MikroOrmModule} from "@mikro-orm/nestjs";
import {UserFavorites} from "./userFavorites.entity";

@Module({
  controllers: [],
  exports: [],
  imports: [MikroOrmModule.forFeature({ entities: [UserFavorites] })],
  providers: [],
})
export class UserFavoritesModule {}
