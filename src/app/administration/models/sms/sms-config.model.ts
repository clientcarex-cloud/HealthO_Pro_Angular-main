import { SMSCategoryModel } from "./sms-category.model";
import { SMSTransTypeModel } from "./sms-transtype.model";

export interface SMSConfigModel {
    id: string;
    smsTransType: SMSTransTypeModel;
    smsCategory: SMSCategoryModel;
    templateId: string;
    smsBody: string;
    smsStatus: boolean;
    wapBody: string;
    wapSendWithImg: boolean;
    wapStatus: boolean;
    disabled: boolean;
}  