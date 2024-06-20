import { Injectable } from '@nestjs/common';
import {CreateReleaseTypeDto} from "./dto/create-release-type.dto";
import {ReleaseType} from "./release-type.model";
import {InjectModel} from "@nestjs/sequelize";

@Injectable()
export class ReleaseTypeService {

    constructor(@InjectModel(ReleaseType) private releaseTypeRepository: typeof ReleaseType) {}

    async onModuleInit() {
        const releaseTypeTitles = ['Сингл', 'Мини-альбом', 'Альбом'];

        for (const title of releaseTypeTitles) {
            const releaseType = await this.getReleaseTypeByValue(title);

            if (!releaseType) {
                const defaultReleaseTypeDto: CreateReleaseTypeDto = {
                    title: title
                };
                await this.createReleaseType(defaultReleaseTypeDto);
            }
        }
    }

    async createReleaseType(dto: CreateReleaseTypeDto) {
        return this.releaseTypeRepository.create(dto);
    }

    async getReleaseTypeByValue(title: string) {
        return this.releaseTypeRepository.findOne({where: {title}});
    }

    async getAllReleaseTypes() {
        return this.releaseTypeRepository.findAll();
    }

}
