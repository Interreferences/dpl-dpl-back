import {Column, DataType, HasMany, Model, Table} from "sequelize-typescript";
import {Release} from "../releases/releases.model";

interface ReleaseTypeCreationAttrs {
    title: string;
}

@Table({tableName: 'release-type'})
export class ReleaseType extends Model<ReleaseType, ReleaseTypeCreationAttrs> {

    @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number;

    @Column({ type: DataType.STRING, unique: true, allowNull: false })
    title: string;

    @HasMany(() => Release)
    releases: Release[];
}