import { IdConfigCategoryModel } from "./idconfig-category.model";
import { IdConfigResetModel } from "./idconfig-reset.model";
import { IdConfigSeparatorModel } from "./idconfig-separator.model";
import { IdConfigTypeModel } from "./idconfig-type.model";

export interface IdConfigModel {
    id: string;
    category?: IdConfigCategoryModel;
    type?: IdConfigTypeModel,
    reset?: IdConfigResetModel,
    prefix: string,
    separator?: IdConfigSeparatorModel,
    initialValue: number,
    startDate: Date,
    startedDate: string,
    preview: string,
    status: boolean;
    disabled: boolean;
} 