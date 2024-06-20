import { Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import {Release} from "./releases.model";
import {Label} from "../labels/label.model";

@Table({ tableName: 'release_labels' })
export class ReleaseLabels extends Model<ReleaseLabels> {
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number;

    @ForeignKey(() => Release)
    @Column({ type: DataType.INTEGER, allowNull: false })
    releaseId: number;

    @ForeignKey(() => Label)
    @Column({ type: DataType.INTEGER, allowNull: false })
    labelId: number;
}