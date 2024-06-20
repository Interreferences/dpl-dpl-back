import { IsString, Length } from 'class-validator';

export class CreateGenreDto {
    @IsString({ message: 'Название жанра должно быть строкой' })
    @Length(1, 40, { message: 'Название жанра должно содержать не менее 3 и не более 40 символов' })
    readonly name: string;
}