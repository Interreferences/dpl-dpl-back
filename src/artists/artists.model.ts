import {BelongsToMany, Column, DataType, HasMany, Model, Table} from "sequelize-typescript";
import {Track} from "../tracks/tracks.model";
import {TrackArtists} from "../tracks/track-artists.model";
import {ReleaseArtists} from "../releases/release-artists.model";
import {Release} from "../releases/releases.model";

interface ArtistCreationAttrs {
    name:string;
    avatar: string;
    banner:string;
}

@Table({ tableName: 'artists' })
export class Artist extends Model<Artist, ArtistCreationAttrs> {
    @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number;

    @Column({ type: DataType.STRING, allowNull: false })
    name: string;

    @Column({ type: DataType.STRING, allowNull: false })
    avatar: string;

    @Column({ type: DataType.STRING, allowNull: false })
    banner: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    bio: string;

    @BelongsToMany(() => Track, () => TrackArtists)
    tracks: Track[];

    @BelongsToMany(() => Release, () => ReleaseArtists)
    releases: Release[];
}