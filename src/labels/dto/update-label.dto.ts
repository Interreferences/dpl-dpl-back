import { IsString, Length } from 'class-validator';

export class UpdateLabelDto {
    @IsString({ message: 'Название лейбла должно быть строкой' })
    @Length(3, 40, { message: 'Название лейбла должно содержать не менее 3 и не более 60 символов' })
    readonly name: string;
}