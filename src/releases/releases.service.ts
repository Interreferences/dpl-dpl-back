import {Injectable, NotFoundException} from '@nestjs/common';
import {CreateReleaseDto} from "./dto/create-release.dto";
import {InjectModel} from "@nestjs/sequelize";
import {Release} from "./releases.model";
import {FileService, FileType} from "../file/file.service";
import {ReleaseArtists} from "./release-artists.model";
import {ReleaseLabels} from "./release-labels.model";
import {Track} from "../tracks/tracks.model";
import {UpdateReleaseDto} from "./dto/update-release.dto";
import {ReleaseTypeService} from "../release-type/release-type.service";
import {Artist} from "../artists/artists.model";
import {Label} from "../labels/label.model";
import {Genres} from "../genres/genres.model";
import {Op} from "sequelize";
import {ReleaseType} from "../release-type/release-type.model";

@Injectable()
export class ReleasesService {

    constructor(
        @InjectModel(Release) private releaseRepository: typeof Release,
        @InjectModel(ReleaseArtists) private releaseArtistsRepository: typeof ReleaseArtists,
        @InjectModel(ReleaseLabels) private releaseLabelsRepository: typeof ReleaseLabels,
        @InjectModel(Track) private trackRepository: typeof Track,
        @InjectModel(ReleaseType) private releaseTypeRepository: typeof ReleaseType,
        private fileService: FileService,
        private releaseTypeService: ReleaseTypeService
    ) {}

    async createRelease(createReleaseDto: CreateReleaseDto, cover) {
        const coverPath = await this.fileService.createFile(FileType.IMAGE, cover);

        // Получаем количество треков
        const trackCount = createReleaseDto.trackIds.length;

        // Получаем идентификаторы типов релизов
        const allReleaseTypes = await this.releaseTypeService.getAllReleaseTypes();
        let releaseTypeId;
        if (trackCount >= 1) {
            releaseTypeId = allReleaseTypes.find(type => type.title === 'Сингл')?.id;
        } else if (trackCount >= 1 && trackCount <= 4) {
            releaseTypeId = allReleaseTypes.find(type => type.title === 'Мини-альбом')?.id;
        } else if (trackCount >= 5) {
            releaseTypeId = allReleaseTypes.find(type => type.title === 'Альбом')?.id;
        }

        const release = await this.releaseRepository.create({
            ...createReleaseDto,
            cover: coverPath,
            releaseType: releaseTypeId
        });

        const artistIds = createReleaseDto.artistIds;
        for (const artistId of artistIds) {
            await this.releaseArtistsRepository.create({
                releaseId: release.id,
                artistId: artistId
            });
        }

        const labelIds = createReleaseDto.labelIds;
        for (const labelId of labelIds) {
            await this.releaseLabelsRepository.create({
                releaseId: release.id,
                labelId: labelId
            });
        }

        const trackIds = createReleaseDto.trackIds;
        for (const trackId of trackIds) {
            const track = await this.trackRepository.findByPk(trackId);
            if (track) {
                track.releaseId = release.id;
                await track.save();
            }
        }

        return release;
    }

    async findAllReleases() {
        return await this.releaseRepository.findAll({
            attributes: ['id', 'title', 'cover', 'releaseDate'],
            include: [
                {
                    model: ReleaseType,
                    attributes: ['id', 'title']
                },
                {
                    model: Artist,
                    attributes: ['id', 'name'],
                    through: { attributes: [] }, // Отключить промежуточную таблицу в результате
                },
                {
                    model: Label,
                    attributes: ['id', 'name'],
                    through: { attributes: [] }, // Отключить промежуточную таблицу в результате
                },
            ],
        });
    }

    async findReleaseById(id: number) {
        const release = await this.releaseRepository.findByPk(id, {
            include: [
                {
                    model: Artist,
                    through: { attributes: [] }, // Отключить промежуточную таблицу в результате
                },
                {
                    model: Label,
                    through: { attributes: [] }, // Отключить промежуточную таблицу в результате
                },
                {
                    model: Track,
                    attributes: ['id', 'title', 'audio', 'explicit_content', 'listens', 'releaseId', 'genreId'], // Указываем атрибуты, которые хотим получить
                    include: [
                        {
                            model: Artist,
                            through: { attributes: [] }, // Отключить промежуточную таблицу в результате
                        },
                        {
                            model: Release,
                            attributes: ['id', 'title', 'cover'],
                        },
                        {
                            model: Genres,
                            attributes: ['id', 'name'], // Указываем атрибуты жанра, которые хотим получить
                        },
                    ]
                },
            ],
        });
        if (!release) {
            throw new NotFoundException('Релиз не найден');
        }
        return release;
    }

    async updateRelease(id: number, updateReleaseDto: UpdateReleaseDto, cover?: any) {
        const release = await this.releaseRepository.findByPk(id);
        if (!release) {
            throw new NotFoundException('Релиз не найден');
        }

        if (cover) {
            await this.fileService.removeFile(release.cover);
            const coverPath = await this.fileService.createFile(FileType.IMAGE, cover);
            release.cover = coverPath;
        }

        const artistIds = updateReleaseDto.artistIds;
        if (artistIds) {
            await this.releaseArtistsRepository.destroy({ where: { releaseId: id } });
            for (const artistId of artistIds) {
                await this.releaseArtistsRepository.create({ releaseId: id, artistId: artistId });
            }
        }

        const labelIds = updateReleaseDto.labelIds;
        if (labelIds) {
            await this.releaseLabelsRepository.destroy({ where: { releaseId: id } });
            for (const labelId of labelIds) {
                await this.releaseLabelsRepository.create({ releaseId: id, labelId: labelId });
            }
        }

        const trackIds = updateReleaseDto.trackIds;
        if (trackIds) {
            // Открепляем все существующие треки от релиза
            await this.trackRepository.update({ releaseId: null }, { where: { releaseId: id } });

            // Проверяем количество треков и определяем тип релиза
            const trackCount = trackIds.length;
            const allReleaseTypes = await this.releaseTypeService.getAllReleaseTypes();
            let releaseTypeId;
            if (trackCount === 1) {
                releaseTypeId = allReleaseTypes.find(type => type.title === 'Сингл')?.id;
            } else if (trackCount >= 2 && trackCount <= 4) {
                releaseTypeId = allReleaseTypes.find(type => type.title === 'EP')?.id;
            } else if (trackCount >= 5) {
                releaseTypeId = allReleaseTypes.find(type => type.title === 'Альбом')?.id;
            }
            release.releaseType = releaseTypeId;

            // Привязываем новые треки к релизу
            for (const trackId of trackIds) {
                const track = await this.trackRepository.findByPk(trackId);
                if (track) {
                    track.releaseId = release.id;
                    await track.save();
                }
            }
        }

        // Обновляем поля релиза
        Object.assign(release, updateReleaseDto);

        // Обновляем статус публикации в зависимости от даты релиза
        const releaseDate = new Date(updateReleaseDto.releaseDate);

        await release.save();

        return this.findReleaseById(id); // Возвращаем обновленный релиз с включенными данными
    }

    async deleteRelease(id: number) {
        const release = await this.releaseRepository.findByPk(id);

        if (!release) {
            throw new NotFoundException('Релиз не найден');
        }

        await this.releaseLabelsRepository.destroy({where: {releaseId: id } });
        await this.releaseArtistsRepository.destroy({where: {releaseId: id } });
        // Открепляем все треки от релиза
        await this.trackRepository.update({ releaseId: null }, { where: { releaseId: id } });

        // Удаляем файл обложки, если он есть
        this.fileService.removeFile(release.cover);

        // Удаляем релиз из базы данных
        await release.destroy();
    }

    async findReleaseByName(title: string) {
        const releases = await this.releaseRepository.findAll({
            where: {
                title: {
                    [Op.iLike]: `%${title}%`
                }
            },
            include: [
                {
                    model: Artist,
                    through: { attributes: [] }, // Отключить промежуточную таблицу в результате
                },
                {
                    model: Label,
                    through: { attributes: [] }, // Отключить промежуточную таблицу в результате
                },
                {
                    model: Track,
                    attributes: ['id', 'title', 'audio', 'explicit_content', 'listens', 'releaseId', 'genreId'], // Указываем атрибуты, которые хотим получить
                    include: [
                        {
                            model: Artist,
                            through: { attributes: [] }, // Отключить промежуточную таблицу в результате
                        },
                        {
                            model: Genres,
                            attributes: ['id', 'name'], // Указываем атрибуты жанра, которые хотим получить
                        },
                    ]
                },
            ],
        });
        if (!releases.length) {
            throw new NotFoundException(`Релизы по запросу: "${title}" не найдены`)
        }
        return releases;
    }
}
