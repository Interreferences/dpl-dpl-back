import { Module } from '@nestjs/common';
import { ReleasesController } from './releases.controller';
import { ReleasesService } from './releases.service';
import {SequelizeModule} from "@nestjs/sequelize";
import {Track} from "../tracks/tracks.model";
import {Artist} from "../artists/artists.model";
import {ReleaseArtists} from "./release-artists.model";
import {ReleaseType} from "../release-type/release-type.model";
import {FileService} from "../file/file.service";
import {ReleaseLabels} from "./release-labels.model";
import {Release} from "./releases.model";
import {ReleaseTypeService} from "../release-type/release-type.service";

@Module({
  imports: [
    SequelizeModule.forFeature([Release ,Track, ReleaseArtists, ReleaseLabels, Artist, ReleaseType]),
  ],
  controllers: [ReleasesController],
  providers: [ReleasesService, FileService, ReleaseTypeService],
})
export class ReleasesModule {}
