import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Patch,
    Post,
    UploadedFiles,
    UseInterceptors
} from '@nestjs/common';
import {TracksService} from "./tracks.service";
import {FileFieldsInterceptor} from "@nestjs/platform-express";
import {CreateTrackDto} from "./dto/create-track.dto";
import {UpdateTrackDto} from "./dto/update-track.dto";

@Controller('api/tracks')
export class TracksController {
    constructor(private readonly tracksService: TracksService) {}

    @Post()
    @UseInterceptors(FileFieldsInterceptor([
        {name: 'audio', maxCount: 1},
    ]))
    async create(@UploadedFiles() files, @Body() createTrackDto: CreateTrackDto){
        const {audio} = files
        return this.tracksService.createTrack(createTrackDto, audio[0]);
    }

    @Get()
    async findAll() {
        return this.tracksService.findAllTracks();
    }

    @Get('/released')
    async findAllReleased() {
        return this.tracksService.findAllTracksReleased();
    }

    @Get('/view/:id')
    async addListen(@Param('id') id: number) {
        return this.tracksService.incrementListens(id);
    }

    @Get('/withoutRelease')
    async findAllTracksWithoutRelease() {
        return this.tracksService.findAllTracksWithoutRelease();
    }

    @Get('/top')
    async findMostPopularTracks() {
        return this.tracksService.findMostPopularTracks();
    }

    @Get(':id')
    async findOne(@Param('id') id: number) {
        return this.tracksService.findTrackById(id);
    }

    @Patch(':id')
    @UseInterceptors(FileFieldsInterceptor([
        {name: 'audio', maxCount: 1},
    ]))
    async update(@Param('id') id: number, @Body() updateTrackDto: UpdateTrackDto, @UploadedFiles() files) {
        const {audio} = files;
        return this.tracksService.updateTrack(id, updateTrackDto, audio ? audio[0] : null)
    }

    @Delete(':id')
    async remove(@Param('id') id: number) {
        await this.tracksService.deleteTrack(id);
        return {message: 'Трек успешно удален'};
    }

    @Get('search/:title')
    async findTracksByName(@Param('title') title: string) {
        try {
            return await this.tracksService.findTrackByName(title);
        } catch (error) {
            if (error instanceof NotFoundException) {
                return { message: error.message };
            }
            throw error;
        }
    }

    @Get('search-released/:title')
    async findTracksByNameReleased(@Param('title') title: string) {
        try {
            return await this.tracksService.findTracksByNameReleased(title);
        } catch (error) {
            if (error instanceof NotFoundException) {
                return { message: error.message };
            }
            throw error;
        }
    }

}
