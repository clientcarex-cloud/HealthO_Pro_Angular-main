import { CountryModel } from "./country.model";

export interface StateModel {
    id: string;
    name: string;
    oldName: string;
    status: boolean;
    country?: CountryModel;
}  