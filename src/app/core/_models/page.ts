/**
 * An object used to get page information from the server
 */
export class Page {
    //The number of elements in the page
    size: number = 0;
    //The total number of elements
    totalElements: number = 0;

    //The total number of elements after filter
    filteredElements: number = 0;

    //The total number of pages
    totalPages: number = 0;
    //The current page number
    pageNumber: number = 1;
    //car listing type(All, Active, Archived, Sold)
    type: string = 'active';
    //sorting
    sortProperty: string = 'created_at';
    sortDirection: string = 'desc';
    //search field
    search: string = '';
    searchName: string = '';
    search_type:string= '';
    //filters field
    filters: any = {};
}