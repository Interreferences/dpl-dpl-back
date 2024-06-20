import { Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Track } from "./tracks.model";
import {Artist} from "../artists/artists.model";

@Table({ tableName: 'track_artists' })
export class TrackArtists extends Model<TrackArtists> {
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number;

    @ForeignKey(() => Track)
    @Column({ type: DataType.INTEGER, allowNull: false })
    trackId: number;

    @ForeignKey(() => Artist)
    @Column({ type: DataType.INTEGER, allowNull: false })
    artistId: number;
}