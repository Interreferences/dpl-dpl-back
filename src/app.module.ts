import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ConfigModule } from "@nestjs/config";
import { Genres } from "./genres/genres.model";
import { GenresModule } from './genres/genres.module';
import { LabelsModule } from './labels/labels.module';
import { Label } from "./labels/label.model";
import { ArtistsModule } from './artists/artists.module';
import { Artist } from "./artists/artists.model";
import { FileModule } from './file/file.module';
import * as path from 'path';
import { ServeStaticModule } from "@nestjs/serve-static";
import { TracksModule } from './tracks/tracks.module';
import { ReleasesModule } from './releases/releases.module';
import { Track } from "./tracks/tracks.model";
import { Release } from "./releases/releases.model";
import { TrackArtists } from "./tracks/track-artists.model";
import { ReleaseArtists } from "./releases/release-artists.model";
import { ReleaseTypeModule } from './release-type/release-type.module';
import { ReleaseType } from "./release-type/release-type.model";
import { ReleaseLabels } from "./releases/release-labels.model";
@Module({
    controllers: [],
    providers: [],
    imports: [
        ServeStaticModule.forRoot({
            rootPath: path.resolve(__dirname, 'static'),
        }),
        ConfigModule.forRoot({
            envFilePath: '.env',
        }),
        SequelizeModule.forRoot({
            dialect: 'postgres',
            host: process.env.POSTGRES_HOST,
            port: Number(process.env.POSTGRES_PORT),
            username: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DB,
            models: [
                Genres,
                Label,
                Artist,
                Track,
                Release,
                TrackArtists,
                ReleaseArtists,
                ReleaseLabels,
                ReleaseType
            ],
            autoLoadModels: true,
            synchronize: true,
            logging: console.log,
        }),
        GenresModule,
        LabelsModule,
        ArtistsModule,
        FileModule,
        TracksModule,
        ReleasesModule,
        ReleaseTypeModule,
    ],
})
export class AppModule {}
