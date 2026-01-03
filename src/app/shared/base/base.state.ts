import { SortDirection } from "@sharedcommon/directives/sortable.directive";

export interface State {
    page: number;
    pageSize: number;
    searchTerm: string;
    startIndex: number;
    endIndex: number;
    totalRecords: number;
    sortColumn: string;
    sortDirection: SortDirection;
    startDate?:any;
    endDate?:any;
}