import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { jwtConstants } from './utils/constant';
import { join } from 'path/posix';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { User, UserSchema } from './model/user.schema';
import { Video, VideoSchema } from './model/video.schema';
import { UserController } from './controller/user.controller';
import { VideoController } from './controller/video.controller';
import { UserService } from './service/user.service';
import { VideoService } from './service/video.service';
import { isAuthenticated } from './app.middleware';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://172.17.0.2:27017/Stream'),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public')
    }),
    MulterModule.register({
      storage: diskStorage({
        destination: './public',
        filename: (req, file, next) => {
          const extension = file.mimetype.split('/')[1];
          next(null, `${uuidv4()}-${Date.now()}.${extension}`)
        }
      })
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]),
  ],
  controllers: [AppController, UserController, VideoController],
  providers: [AppService, UserService, VideoService],
})
export class AppModule { 

  // configure middlware
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(isAuthenticated)
      .exclude({
        path: `api/video/:id`, method: RequestMethod.GET
      })
      .forRoutes(VideoController);
  }
}
