import { Controller, Get, Post, Body, Param, Patch, Delete, NotFoundException } from '@nestjs/common';
import { LabelsService } from './labels.service';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';

@Controller('api/labels')
export class LabelsController {
    constructor(private readonly labelsService: LabelsService) {}

    @Post()
    async create(@Body() createLabelDto: CreateLabelDto) {
        return this.labelsService.createLabel(createLabelDto);
    }

    @Get()
    async findAll() {
        return this.labelsService.findAllLabels();
    }

    @Get(':id')
    async findOne(@Param('id') id: number) {
        return this.labelsService.findLabelById(id);
    }

    @Patch(':id')
    async update(@Param('id') id: number, @Body() updateLabelDto: UpdateLabelDto) {
        const updatedLabel = await this.labelsService.updateLabel(id, updateLabelDto);
        return updatedLabel;
    }

    @Delete(':id')
    async remove(@Param('id') id: number) {
        await this.labelsService.deleteLabel(id);
        return { message: 'Label deleted successfully' };
    }

    @Get('search/:name')
    async findByName(@Param('name') name: string) {
        try {
            return await this.labelsService.findLabelByName(name);
        } catch (error) {
            if (error instanceof NotFoundException) {
                return { message: error.message };
            }
            throw error;
        }
    }
}