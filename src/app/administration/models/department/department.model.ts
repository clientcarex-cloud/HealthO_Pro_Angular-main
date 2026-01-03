import { DepartmentGroupModel } from "./dept-group.model";
import { DepartmentTypeModel } from "./dept-type.model";

export interface DepartmentModel {
    id: string;
    departmentGroup?: DepartmentGroupModel;
    departmentType?: DepartmentTypeModel;
    name: string;
    oldName: string;
    reportHeader: string;
    showReportHeader: boolean;
    reportFooter: string;
    showReportFooter: boolean;
    status: boolean;
    disabled: boolean;
}  