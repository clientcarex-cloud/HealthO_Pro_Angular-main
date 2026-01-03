export interface TenantModel {
    id: string;
    identifier: string;
    name: string;
    dbName: string;
    status: boolean;
    isSelected?:any;
}  