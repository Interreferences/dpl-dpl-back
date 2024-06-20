import {Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query} from '@nestjs/common';
import { GenresService } from './genres.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Controller('api/genres')
export class GenresController {
    constructor(private genresService: GenresService) {}

    @Post()
    create(@Body() dto: CreateGenreDto) {
        return this.genresService.createGenre(dto);
    }

    @Get()
    getAll() {
        return this.genresService.getAllGenres();
    }

    @Get('search/:name')
    async findByName(@Param('name') name: string) {
        try {
            return await this.genresService.findGenreByName(name);
        } catch (error) {
            if (error instanceof NotFoundException) {
                return { message: error.message };
            }
            throw error;
        }
    }

    @Get(':id')
    getById(@Param('id') id: number) {
        return this.genresService.getGenreById(id);
    }

    @Patch(':id')
    update(@Param('id') id: number, @Body() dto: UpdateGenreDto) {
        return this.genresService.updateGenre(id, dto);
    }

    @Delete(':id')
    delete(@Param('id') id: number) {
        return this.genresService.deleteGenre(id);
    }
}

