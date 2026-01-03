import { SMSProviderModel } from "./smsprovider.model";

export interface SMSConfigModel {
    id: string;
    transProvider: SMSProviderModel,
    transSenderId: string;
    promoProvider: SMSProviderModel,
    promoSenderId: string;
    entityId: string;
    status: Boolean;
    branchId: string;
    dbName: string;
}  