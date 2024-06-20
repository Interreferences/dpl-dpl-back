import {BelongsTo, BelongsToMany, Column, DataType, ForeignKey, HasMany, Model, Table} from "sequelize-typescript";
import { Artist } from "../artists/artists.model";
import { ReleaseArtists } from "./release-artists.model";
import { Label } from "../labels/label.model";
import { ReleaseLabels } from "./release-labels.model";
import {ReleaseType} from "../release-type/release-type.model";
import {Track} from "../tracks/tracks.model";

interface ReleaseCreationAttrs {
    title: string;
    cover: string;
    releaseType: number;
    published: boolean;
    releaseDate: Date;
}

@Table({ tableName: 'releases' })
export class Release extends Model<Release, ReleaseCreationAttrs> {
    @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number;

    @Column({ type: DataType.STRING, unique: false, allowNull: false })
    title: string;

    @Column({ type: DataType.STRING, unique: false, allowNull: false })
    cover: string;

    @ForeignKey(() => ReleaseType)
    @Column({ type: DataType.INTEGER, allowNull: false })
    releaseType: number;

    @Column({ type: DataType.DATEONLY, allowNull: false }) // Используем тип данных DATEONLY для даты релиза
    releaseDate: Date;

    @BelongsTo(() => ReleaseType)
    releasesType: ReleaseType;

    @BelongsToMany(() => Artist, () => ReleaseArtists)
    artists: Artist[];

    @BelongsToMany(() => Label, () => ReleaseLabels)
    labels: Label[];

    @HasMany(() => Track)  // Добавляем связь hasMany
    tracks: Track[];
}