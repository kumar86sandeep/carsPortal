import { Component, OnInit } from '@angular/core';
//import DealerService 
import { TitleService, DealerService, CommonUtilsService } from '../../../core/_services';
//import shared services
import { AlertService, PageLoaderService } from '../../../shared/_services'

import { PagedData, Transaction, Page } from "../../../core/_models";
import { environment } from '../../../../environments/environment';
import { untilDestroyed } from 'ngx-take-until-destroy';// unsubscribe from observables when the component destroyed

@Component({
  selector: 'app-payment-methods',
  templateUrl: './payment-methods.component.html',
  styleUrls: ['./payment-methods.component.css']
})
export class PaymentMethodsComponent implements OnInit {

  //title and bradcrumbs
  readonly title: string = 'Saved Card Listing';
  readonly breadcrumbs: any[] = [{ page: 'Home', link: '/dealer/home' }, { page: 'Saved Card Listing', link: '' }];
  paymentListings = new Array(); 
  
  userData = JSON.parse(localStorage.getItem('loggedinUser'));//parsing the local store data
  
  //Defined records limit and records limit options
  currentPageLimit: number = environment.DEFAULT_RECORDS_LIMIT
  readonly pageLimitOptions = environment.DEFAULT_PAGE_LIMIT_OPTIONS
  
  postData = {    
    dealer_id: localStorage.getItem('loggedinUserId')
  }
  
  constructor(private dealerService: DealerService, private titleService:TitleService,private commonUtilsService:CommonUtilsService, private pageLoaderService:PageLoaderService) {

    this.titleService.setTitle();   
    this.getPaymentMethods(this.postData);      
  }


  /**
  * get Payment Method Listings.
  */
  getPaymentMethods(postData) {  
    this.commonUtilsService.showPageLoader();

    //hit api to fetch data
    this.commonUtilsService.dealerPaymentMethodListings(postData).pipe(untilDestroyed(this)).subscribe(
      //case success
      (responseData) => {
        //console.log('pagedData', responseData)
        
        this.paymentListings = [...responseData.payment_details];  
               
          
        
        this.commonUtilsService.hidePageLoader();
        //case error 
      }, error => {
        this.commonUtilsService.onError(error);
      });
  }

  async removeCard(card_id){
    if(await this.commonUtilsService.isCardRemoveConfirmed()) {
      let removeData = {    
        dealer_id: localStorage.getItem('loggedinUserId'),
        card_id: card_id
      }
      this.commonUtilsService.showPageLoader();
      this.commonUtilsService.removeDealerCard(removeData).pipe(untilDestroyed(this)).subscribe(
        //case success
        (responseData) => {
          //console.log('pagedData', responseData)
          
          this.paymentListings = [...responseData.payment_details];  
          this.commonUtilsService.onSuccess(responseData.success);
          //case error 
        }, error => {
          this.commonUtilsService.onError(error);
        });
    }
  }

  async defaultCard(card_id){
    if(await this.commonUtilsService.isDefaultCardConfirmed()) {
      let defaultCardData = {    
        dealer_id: localStorage.getItem('loggedinUserId'),
        card_id: card_id
      }
      this.commonUtilsService.showPageLoader();
      this.commonUtilsService.dealerDefaultCard(defaultCardData).pipe(untilDestroyed(this)).subscribe(
        //case success
        (responseData) => {
          //console.log('pagedData', responseData)
          
          this.paymentListings = [...responseData.payment_details];  
          this.commonUtilsService.onSuccess(responseData.success);
          //case error 
        }, error => {
          this.commonUtilsService.onError(error);
        });
    }
  }

  ngOnInit() {
    
  }

  //destroy 
  ngOnDestroy() {

  }

}
