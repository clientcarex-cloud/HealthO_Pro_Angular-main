import { StateModel } from "./state.model";

export interface CityModel {
    id: string;
    name: string;
    oldName: string;
    status: boolean;
    state?: StateModel;
}  