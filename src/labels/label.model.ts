import {BelongsToMany, Column, DataType, Model, Table} from 'sequelize-typescript';
import {ReleaseLabels} from "../releases/release-labels.model";
import {Release} from "../releases/releases.model";

interface LabelCreationAttrs {
    name:string;
}

@Table({ tableName: 'labels' })
export class Label extends Model<Label, LabelCreationAttrs> {
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    id: number;

    @Column({ type: DataType.STRING, allowNull: false })
    name: string;

    @BelongsToMany(() => Release, () => ReleaseLabels)
    releases: Release[];
}