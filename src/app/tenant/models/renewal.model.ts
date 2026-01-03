export interface RenewalModel {
    id: string;
    newExpiry: Date;
    extendedDate: string;
    renewedDate: string;
    remarks: string;
    disabled: boolean;
    branchId: string;
    dbName: string;
}  