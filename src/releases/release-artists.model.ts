import { Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import {Artist} from "../artists/artists.model";
import {Release} from "./releases.model";

@Table({ tableName: 'release_artists' })
export class ReleaseArtists extends Model<ReleaseArtists> {
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number;

    @ForeignKey(() => Release)
    @Column({ type: DataType.INTEGER, allowNull: false })
    releaseId: number;

    @ForeignKey(() => Artist)
    @Column({ type: DataType.INTEGER, allowNull: false })
    artistId: number;
}