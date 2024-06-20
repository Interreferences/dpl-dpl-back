import { ArrayNotEmpty, ArrayUnique, IsArray, IsBoolean, IsDate, IsNumber, IsOptional, IsString, Length } from "class-validator";
import { Transform, Type } from "class-transformer";

export class CreateReleaseDto {
    @IsString({message: 'Название должно быть строкой'})
    @Length(1, 80, {message: 'Название должно содержать от 1 до 80 символов'})
    readonly title: string;

    @IsDate({ message: 'Дата релиза должна быть действительной датой' })
    @Type(() => Date)
    readonly releaseDate: Date;

    @IsArray({ message: 'Артисты должны быть массивом идентификаторов' })
    @ArrayNotEmpty({ message: 'Массив артистов не должен быть пустым' })
    @ArrayUnique({ message: 'Идентификаторы артистов должны быть уникальными' })
    @IsNumber({}, { each: true, message: 'Каждый идентификатор артиста должен быть числом' })
    @Transform(({ value }) => (Array.isArray(value) ? value.map(Number) : [Number(value)]))
    readonly artistIds: number[];

    @IsArray({ message: 'Треки должны быть массивом идентификаторов' })
    @ArrayNotEmpty({ message: 'Массив треков не должен быть пустым' })
    @ArrayUnique({ message: 'Идентификаторы треков должны быть уникальными' })
    @IsNumber({}, { each: true, message: 'Каждый идентификатор трека должен быть числом' })
    @Transform(({ value }) => (Array.isArray(value) ? value.map(Number) : [Number(value)]))
    readonly trackIds: number[];

    @IsArray({ message: 'Лейблы должны быть массивом идентификаторов' })
    @ArrayNotEmpty({ message: 'Массив лейблов не должен быть пустым' })
    @ArrayUnique({ message: 'Идентификаторы лейблов должны быть уникальными' })
    @IsNumber({}, { each: true, message: 'Каждый идентификатор лейбла должен быть числом' })
    @Transform(({ value }) => (Array.isArray(value) ? value.map(Number) : [Number(value)]))
    readonly labelIds: number[];
}
