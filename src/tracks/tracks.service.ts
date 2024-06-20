import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {Track} from "./tracks.model";
import {FileService, FileType} from "../file/file.service";
import {CreateTrackDto} from "./dto/create-track.dto";
import {UpdateTrackDto} from "./dto/update-track.dto";
import {TrackArtists} from "./track-artists.model";
import {Artist} from "../artists/artists.model";
import {Op} from "sequelize";
import {Genres} from "../genres/genres.model";
import {Release} from "../releases/releases.model";
import {Label} from "../labels/label.model";
import {ReleaseType} from "../release-type/release-type.model";
@Injectable()
export class TracksService {
    constructor(
        @InjectModel(Track) private trackRepository: typeof Track,
        @InjectModel(TrackArtists) private trackArtistsRepository: typeof TrackArtists,
        private fileService: FileService
    ) {}

    async createTrack(createTrackDto: CreateTrackDto, audio) {
        const filePath = await this.fileService.createFile(FileType.AUDIO, audio);

        const track = await this.trackRepository.create({
            ...createTrackDto,
            audio: filePath,
            listens: 0,
        });

        const artistIds = createTrackDto.artistIds;
        for (const artistId of artistIds) {
            await this.trackArtistsRepository.create({
                trackId: track.id,
                artistId: artistId
            });
        }

        return track;
    }

    async findMostPopularTracks(): Promise<Track[]> {
        return await this.trackRepository.findAll({
            attributes: ['id', 'title', 'audio', 'explicit_content', 'listens', 'createdAt'],
            order: [['listens', 'DESC']], // Сортировка по количеству прослушиваний по убыванию
            limit: 10, // Ограничение до 10 треков
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
                    model: Release,
                    attributes: ['id', 'title', 'cover'], // Поля из таблицы releases
                },
            ],
        });
    }

    async findAllTracks() {
        return await this.trackRepository.findAll({
            attributes: ['id', 'title', 'audio', 'explicit_content', 'listens', 'createdAt'],
            include: [
                {
                    model: Artist,
                    attributes: ['id', 'name'], // Поля из таблицы artists
                    through: { attributes: [] }, // Исключаем выборку полей из таблицы связи track_artists
                },
                {
                    model: Release,
                    attributes: ['id', 'title', 'cover'], // Поля из таблицы releases
                },
            ],
        });
    }

    async findAllTracksReleased() {
        return await this.trackRepository.findAll({
            attributes: ['id', 'title', 'audio', 'explicit_content', 'listens', 'createdAt', 'releaseId'],
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
                    model: Release,
                    attributes: ['id', 'title', 'cover'], // Поля из таблицы releases
                },
            ],
        });
    }

    async findTrackById(id: number) {
        const track = await this.trackRepository.findByPk(id, {
            include: [
                {
                    model: Artist,
                    attributes: ['id', 'name', 'avatar', 'createdAt'], // Поля из таблицы artists
                    through: { attributes: [] }, // Исключаем выборку полей из таблицы связи track_artists
                },
                {
                    model: Genres,
                    attributes: ['id', 'name'], // Поля из таблицы genres
                },
                {
                    model: Release,
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
                },
            ],
        });
        if (!track) {
            throw new NotFoundException('Трек не найден');
        }
        return track;
    }

    async incrementListens(id: number): Promise<Track> {
        const track = await this.trackRepository.findByPk(id);
        if (!track) {
            throw new Error('Track not found');
        }

        track.listens += 1;
        await track.save();

        return track;
    }

    async updateTrack(id: number, updateTrackDto: UpdateTrackDto, audio?: any) {
        const track = await this.trackRepository.findByPk(id);

        if (!track) {
            throw new NotFoundException('Трек не найден');
        }

        // Обновление аудиофайла
        if (audio) {
            // Удаление старого файла
            await this.fileService.removeFile(track.audio);
            // Создание нового файла
            const filePath = await this.fileService.createFile(FileType.AUDIO, audio);
            track.audio = filePath;
        }

        // Обновление трека
        await track.update(updateTrackDto);

        // Обновление артистов
        if (updateTrackDto.artistIds) {
            await this.trackArtistsRepository.destroy({ where: { trackId: id } });
            for (const artistId of updateTrackDto.artistIds) {
                await this.trackArtistsRepository.create({
                    trackId: id,
                    artistId: artistId
                });
            }
        }

        // Save the updated track to ensure audio path is stored
        await track.save();

        return this.findTrackById(id); // Возвращаем обновленный трек с включенными данными об артистах и языках
    }

    async deleteTrack(id: number) {
        const track = await this.trackRepository.findByPk(id);

        if (!track) {
            throw new NotFoundException('Трек не найден');
        }

        // Удаление записей из промежуточных таблиц
        await this.trackArtistsRepository.destroy({ where: { trackId: id } });

        // Удаление аудиофайла
        this.fileService.removeFile(track.audio);

        // Удаление трека
        await track.destroy();
    }

    async findTrackByName(title: string) {
        const tracks = await this.trackRepository.findAll({
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
            ],
        });
        if (!tracks.length) {
            throw new NotFoundException(`Треки по запросу: "${title}" не найдены`)
        }
        return tracks;
    }

    async findTracksByNameReleased(title: string) {
        const tracks = await this.trackRepository.findAll({
            where: {
                title: {
                    [Op.iLike]: `%${title}%`
                },
                releaseId: {
                    [Op.ne]: 0
                }
            },
            include: [
                {
                    model: Artist,
                    through: { attributes: [] }, // Отключить промежуточную таблицу в результате
                },
            ],
        });
        if (!tracks.length) {
            throw new NotFoundException(`Треки по запросу: "${title}" не найдены`)
        }
        return tracks;
    }

    async findAllTracksWithoutRelease() {
        return await this.trackRepository.findAll({
            where: {
                releaseId: null
            },
            attributes: ['id', 'title', 'audio', 'explicit_content', 'listens', 'createdAt'],
            include: [
                {
                    model: Artist,
                    attributes: ['id', 'name'],
                    through: { attributes: [] },
                },
                {
                    model: Genres,
                    attributes: ['id', 'name'],
                }
            ],
        });
    }

}
