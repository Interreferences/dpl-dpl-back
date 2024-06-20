import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {CreateArtistDto} from './dto/create-artist.dto';
import { Artist } from './artists.model';
import {UpdateArtistDto} from './dto/update-artist.dto';
import { Op } from 'sequelize';
import { FileService, FileType } from '../file/file.service';
import {TrackArtists} from "../tracks/track-artists.model";
import {ReleaseArtists} from "../releases/release-artists.model";
import {Track} from "../tracks/tracks.model";
import {Release} from "../releases/releases.model";
import {Genres} from "../genres/genres.model";
import {ReleaseType} from "../release-type/release-type.model";
import {Label} from "../labels/label.model";

@Injectable()
export class ArtistsService {
    constructor(
        @InjectModel(Artist) private artistRepository: typeof Artist,
        @InjectModel(TrackArtists) private trackArtistsRepository: typeof TrackArtists,
        @InjectModel(ReleaseArtists) private releaseArtistsRepository: typeof ReleaseArtists,
        private fileService: FileService
    ) {}

    async createArtist(dto: CreateArtistDto, avatar, banner) {
        const avatarPath = await this.fileService.createFile(FileType.IMAGE, avatar);
        const bannerPath = await this.fileService.createFile(FileType.IMAGE, banner);

        // Создаем артиста в базе данных
        const artist = await this.artistRepository.create({
            ...dto,
            avatar: avatarPath,
            banner: bannerPath
        });

        return artist;
    }

    async findAllArtists() {
        return await this.artistRepository.findAll({
            attributes: ['id', 'name', 'avatar', 'createdAt']
        });
    }

    async findArtistById(id: number) {
        const artist = await this.artistRepository.findByPk(id, {
            include: [
                {
                    model:Track,
                    attributes: ['id', 'title', 'audio', 'explicit_content', 'listens', 'createdAt'],
                    through: { attributes: [] },
                    where: {
                        releaseId: {
                            [Op.ne]: null, // Условие для того, чтобы releaseId не был null
                        },
                    },
                    include: [
                        {
                            model: Artist,
                            attributes: ['id', 'name'], // Поля из таблицы artists
                            through: { attributes: [] }, // Исключаем выборку полей из таблицы связи track_artists
                        },
                        {
                            model:Release,
                            attributes: ['id', 'title', 'cover'],
                        },
                    ],
                },
                {
                    model:Release,
                    attributes: ['id', 'title', 'cover', 'releaseDate'],
                    through: { attributes: [] },
                    include: [
                        {
                            model: ReleaseType,
                            attributes: ['id', 'title']
                        },
                        {
                            model: Label,
                            attributes: ['id', 'name'],
                            through: { attributes: [] }, // Отключить промежуточную таблицу в результате
                        },
                        {
                            model: Artist,
                            attributes: ['id', 'name'],
                            through: { attributes: [] }, // Отключить промежуточную таблицу в результате
                        },
                    ],
                },
            ],
        });
        if (!artist) {
            throw new NotFoundException('Артист не найден');
        }
        return artist;
    }

    async findLastAddedArtists(): Promise<Artist[]> {
        return await this.artistRepository.findAll({
            attributes: ['id', 'name', 'avatar', 'createdAt'],
            order: [['createdAt', 'DESC']], // Сортировка по дате создания по убыванию (последние добавленные)
            limit: 10, // Ограничение до 10 артистов
        });
    }

    async updateArtist(id: number, updateArtistDto: UpdateArtistDto, avatar, banner) {
        const artist = await this.artistRepository.findByPk(id);
        if (!artist) {
            throw new NotFoundException('Артист не найден');
        }

        if (avatar) {
            await this.fileService.removeFile(artist.avatar);
            const avatarPath = await this.fileService.createFile(FileType.IMAGE, avatar);
            artist.avatar = avatarPath;
        }

        if (banner) {
            await this.fileService.removeFile(artist.banner);
            const bannerPath = await this.fileService.createFile(FileType.IMAGE, banner);
            artist.banner = bannerPath;
        }
        await artist.save();

        return this.findArtistById(id);
    }

    async deleteArtist(id: number) {
        const artist = await this.artistRepository.findByPk(id);
        if (artist) {
            this.fileService.removeFile(artist.avatar);
            this.fileService.removeFile(artist.banner);

            await this.trackArtistsRepository.destroy({ where: { artistId: id } });
            await this.releaseArtistsRepository.destroy({ where: { artistId: id } });


            await artist.destroy();
        }
        return artist;
    }

    async findArtistByName(name: string) {
        const artists = await this.artistRepository.findAll({
            where: {
                name: {
                    [Op.iLike]: `%${name}%`
                }
            }
        });
        if (!artists.length) {
            throw new NotFoundException(`Артисты по запросу: "${name}" не найдены`);
        }
        return artists;
    }
}
