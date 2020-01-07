import { Component, OnInit } from '@angular/core';
//import DealerService 
import { TitleService, DealerService, CommonUtilsService } from '../../../core/_services';
//import shared services
import { AlertService, PageLoaderService } from '../../../shared/_services'

import { PagedData, Transaction, Page } from "../../../core/_models";
import { environment } from '../../../../environments/environment';
import { untilDestroyed } from 'ngx-take-until-destroy';// unsubscribe from observables when the component destroyed

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {

  //title and bradcrumbs
  readonly title: string = 'Transactions Listing';
  readonly breadcrumbs: any[] = [{ page: 'Home', link: '/dealer/home' }, { page: 'Transactions Listing', link: '' }];
  transactions = new Array<Transaction>() //array of Car type 
  page = new Page(); //object of Page type
  userData = JSON.parse(localStorage.getItem('loggedinUser'));//parsing the local store data
  
  //Defined records limit and records limit options
  currentPageLimit: number = environment.DEFAULT_RECORDS_LIMIT
  readonly pageLimitOptions = environment.DEFAULT_PAGE_LIMIT_OPTIONS
  
  _defaultPagination = {
  
    limit: this.currentPageLimit,      
    paginate_action:'',
    rowId:'',
    offset:1,
    stripe_customer_id: this.userData['stripe_customer_id']
  }
  rowId:string = ''
  hasMorePages:boolean = false;
  constructor(private dealerService: DealerService, private titleService:TitleService,private commonUtilsService:CommonUtilsService, private pageLoaderService:PageLoaderService) {

    this.titleService.setTitle();
    console.log('_defaultPagination',this._defaultPagination);
    this.setPage(this._defaultPagination);      
   }

   /**
  * To fetch the records according to type(All, Archive, Sold, Active)
  * @param type type of records(All, WishList, Hidden, Active)
  * @return  void
  */
  onChangeListType(type): void {  
  //  this._defaultPagination.status = type;
    this.setPage(this._defaultPagination);
  }


   setPage(page) {    
    
    this.commonUtilsService.showPageLoader();

    //hit api to fetch data
    this.dealerService.transactionsListing(page).pipe(untilDestroyed(this)).subscribe(

      //case success
      (pagedData) => {
       
        this.hasMorePages = pagedData.has_more
        this.transactions = [...pagedData.data];  
        console.log('rows',this.transactions); 
        
         
        
        this.commonUtilsService.hidePageLoader();
        //case error 
      }, error => {
        this.commonUtilsService.onError(error);
      });
  }

  applyPagination(type){
   
    this._defaultPagination.paginate_action = type
    this._defaultPagination.rowId = this.rowId
    
    if(type=="prev"){
      this._defaultPagination.offset = (this._defaultPagination.offset)-1      
    }else if(type=="next"){    
      this._defaultPagination.offset = (this._defaultPagination.offset)+1     
    }

    console.log('page',this._defaultPagination);
    this.setPage(this._defaultPagination);
  }
  
  /**
   * To change the records limit on page
   * @param limit number of records to dispaly on page
   * @return  void
   */

  onLimitChange(limit: any): void {
    this.currentPageLimit = this._defaultPagination.limit =  parseInt(limit)
    this.setPage(this._defaultPagination);
  }

  formatDate(timeStamp,rowId){
    this.rowId = rowId 
    return new Date(timeStamp * 1000)
  }


  ngOnInit() {
    
  }

  //destroy 
  ngOnDestroy() {

  }


}
