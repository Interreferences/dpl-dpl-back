import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {ReleaseTypeService} from "./release-type.service";
import {CreateReleaseTypeDto} from "./dto/create-release-type.dto";

@Controller('release-type')
export class ReleaseTypeController {

    constructor(private releaseTypeService: ReleaseTypeService) {}

    @Post()
    create(@Body() dto: CreateReleaseTypeDto){
        return this.releaseTypeService.createReleaseType(dto);
    }

    @Get('/:title')
    getByValue(@Param('title') title: string) {
        return this.releaseTypeService.getReleaseTypeByValue(title);
    }

}
