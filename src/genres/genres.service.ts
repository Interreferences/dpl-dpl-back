import {Injectable, NotFoundException} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Genres } from './genres.model';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import {Op} from "sequelize";
import {Track} from "../tracks/tracks.model";
import {Artist} from "../artists/artists.model";
import {Release} from "../releases/releases.model";

@Injectable()
export class GenresService {
    constructor(@InjectModel(Genres) private genreRepository: typeof Genres) {}

    async createGenre(dto: CreateGenreDto) {
        const genre = await this.genreRepository.create(dto);
        return genre;
    }

    async getAllGenres() {
        return await this.genreRepository.findAll();
    }

    async getGenreById(id: number) {
        return await this.genreRepository.findByPk(id, {
            include: [{
                model: Track, // включаем модель Track
                attributes: ['id', 'title', 'audio', 'explicit_content', 'listens', 'createdAt'],
                include: [
                    {
                        model: Artist,
                        attributes: ['id', 'name'], // Поля из таблицы artists
                        through: { attributes: [] }, // Исключаем выборку полей из таблицы связи track_artists
                    },
                    {
                        model: Genres,
                        attributes: ['id', 'name'], // Поля из таблицы genres
                    },
                    {
                        model: Release,
                        attributes: ['id', 'title', 'cover'], // Поля из таблицы releases
                    },
                ],
            }]
        });
    }

    async updateGenre(id: number, dto: UpdateGenreDto) {
        const genre = await this.genreRepository.findByPk(id);
        if (!genre) {
            throw new Error('Genre not found');
        }
        return await genre.update(dto);
    }

    async deleteGenre(id: number) {
        const genre = await this.genreRepository.findByPk(id);
        if (genre) {
            await genre.destroy();
        }
        return genre;
    }

    async findGenreByName(name: string): Promise<Genres[]> {
        const genres = await this.genreRepository.findAll({
            where: {
                name: {
                    [Op.iLike]: `%${name}%`
                }
            }
        });
        if (!genres.length) {
            throw new NotFoundException(`Labels with name containing "${name}" not found`);
        }
        return genres;
    }
}
