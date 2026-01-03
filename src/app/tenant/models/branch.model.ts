import { CityModel } from "./city.model";

export interface BranchModel {
    id: string;
    name: string;
    oldName: string;
    shortName: string;
    address: string;
    area: string;
    city?: CityModel;
    pinCode: string;
    emailId: string;
    cPersonName1: string;
    cPersonMobileNo1: string;
    cPersonName2: string;
    cPersonMobileNo2: string;
    websiteUrl: string;
    status: boolean;
    tenantId: string;
}  