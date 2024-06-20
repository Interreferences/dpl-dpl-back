import {Column, DataType, HasMany, Model, Table} from 'sequelize-typescript';
import {Track} from "../tracks/tracks.model";

interface GenreCreationAttrs {
    name:string;
}

@Table({ tableName: 'genres' })
export class Genres extends Model<Genres, GenreCreationAttrs> {
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number;

    @Column({type: DataType.STRING, unique: true, allowNull: false})
    name: string;

    @HasMany(() => Track)
    tracks: Track[];
}