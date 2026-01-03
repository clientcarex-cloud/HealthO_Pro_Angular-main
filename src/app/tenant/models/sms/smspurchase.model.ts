export interface SMSPurchaseModel {
    id: string;
    purchaseDate: string;
    count: number;
    remarks: string;
    disabled: boolean;
    branchId: string;
    dbName: string;
}  