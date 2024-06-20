import { Module } from '@nestjs/common';
import { ReleaseTypeController } from './release-type.controller';
import { ReleaseTypeService } from './release-type.service';
import {SequelizeModule} from "@nestjs/sequelize";
import {ReleaseType} from "./release-type.model";
import {Release} from "../releases/releases.model";

@Module({
  imports: [
    SequelizeModule.forFeature([ReleaseType, Release]),
  ],
  controllers: [ReleaseTypeController],
  providers: [ReleaseTypeService]
})
export class ReleaseTypeModule {}
