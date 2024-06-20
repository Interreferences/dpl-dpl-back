import { ArrayNotEmpty, ArrayUnique, IsArray, IsBoolean, IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateTrackDto {
    @IsOptional()
    @IsString({ message: 'Название должно быть строкой' })
    readonly title?: string;

    @IsOptional()
    @IsString({ message: 'Текст должен быть строкой' })
    readonly text?: string;

    @IsOptional()
    @IsString({ message: 'Ссылка на клип должна быть строкой' })
    readonly clip?: string;

    @IsOptional()
    @IsBoolean({ message: 'Поле "Explicit content" должно быть булевым значением' })
    @Transform(({ value }) => value === 'true' || value === true)
    readonly explicit_content?: boolean;

    @IsOptional()
    @IsNumber({}, { message: 'Id жанра должно быть числом' })
    @Transform(({ value }) => Number(value))
    readonly genreId?: number;

    @IsOptional()
    @IsArray({ message: 'Артисты должны быть массивом идентификаторов' })
    @ArrayNotEmpty({ message: 'Массив артистов не должен быть пустым' })
    @ArrayUnique({ message: 'Идентификаторы артистов должны быть уникальными' })
    @IsNumber({}, { each: true, message: 'Каждый идентификатор артиста должен быть числом' })
    @Transform(({ value }) => (Array.isArray(value) ? value.map(Number) : [Number(value)]))
    readonly artistIds?: number[];
}