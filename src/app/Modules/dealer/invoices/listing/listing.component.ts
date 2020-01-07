import { Component, OnInit } from '@angular/core';
//import DealerService 
import { TitleService, DealerService, CommonUtilsService } from '../../../../core/_services';
//import shared services
import { AlertService, PageLoaderService } from '../../../../shared/_services'

import { PagedData, Invoice, Page } from "../../../../core/_models";
import { environment } from '../../../../../environments/environment';
import { untilDestroyed } from 'ngx-take-until-destroy';// unsubscribe from observables when the component destroyed

@Component({
  selector: 'app-invoice-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.css']
})
export class ListingComponent implements OnInit {
  
  //title and bradcrumbs
  readonly title: string = 'Invoice Listing';
  readonly breadcrumbs: any[] = [{ page: 'Home', link: '/dealer/home' }, { page: 'Invoice Listing', link: '' }];
  invoices = new Array<Invoice>() //array of Car type 
  page = new Page(); //object of Page type

  //Defined records limit and records limit options
  currentPageLimit: number = environment.DEFAULT_RECORDS_LIMIT
  readonly pageLimitOptions = environment.DEFAULT_PAGE_LIMIT_OPTIONS

  _defaultPagination = {
    count: 0,
    limit: this.currentPageLimit,
    offset: 1,
    status:'All',
    pageSize: 1//this.currentPageLimit
  }

  hasMorePages:boolean = false;
  constructor(private dealerService: DealerService, private titleService:TitleService,private commonUtilsService:CommonUtilsService, private pageLoaderService:PageLoaderService) {

    this.titleService.setTitle();
    this.setPage(this._defaultPagination);      
   }

   /**
  * To fetch the records according to type(All, Archive, Sold, Active)
  * @param type type of records(All, WishList, Hidden, Active)
  * @return  void
  */
  onChangeListType(type): void {  
    this._defaultPagination.status = type;
    this.setPage(this._defaultPagination);
  }


   setPage(page) {

    this.page.pageNumber = page.offset;
    this.page.size = page.pageSize;
    this.page.type = page.status;
    
    this.commonUtilsService.showPageLoader();

    //hit api to fetch data
    this.dealerService.invoiceListing(page).pipe(untilDestroyed(this)).subscribe(

      //case success
      (pagedData) => {
       // this.listingSection.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });//scroll the page to defined section #contentSection
      //  this.page = pagedData.page;       
        this.hasMorePages = pagedData.page_context.has_more_page;
        this.invoices = [...pagedData.invoices];  
        console.log('rows',this.invoices);  
        
        this.commonUtilsService.hidePageLoader();
        //case error 
      }, error => {
        this.commonUtilsService.onError(error);
      });
  }

  applyPagination(type){
    if(type=="prev"){
      this._defaultPagination.offset = (this.page.pageNumber)-1
      
    }else if(type=="next"){    
      this._defaultPagination.offset = (this.page.pageNumber)+1
     
    }
    console.log('page',this._defaultPagination);
    this.setPage(this._defaultPagination);
  }

  invoiceDetails(invoice_id){
    this.pageLoaderService.setLoaderText('Invoice will be open in new tab.');//setting loader text
    this.commonUtilsService.showPageLoader();
    let newWindow = window.open();
    //hit api to fetch data
    this.dealerService.invoiceDetails({invoice_id}).pipe(untilDestroyed(this)).subscribe(

      //case success
      (details) => {       
        console.log('details',details);
        this.commonUtilsService.hidePageLoader();
      //  window.open(details.invoice.invoice_url, "_blank");
        newWindow.location.href = details.invoice.invoice_url;
        
        //case error 
      }, error => {
        this.commonUtilsService.onError(error);
      });
  }

  ngOnInit() {
    
  }

  //destroy 
  ngOnDestroy() {

  }

  onSort(event){
    
  }
}
