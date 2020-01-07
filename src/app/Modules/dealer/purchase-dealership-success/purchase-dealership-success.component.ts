import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';// unsubscribe from observables when the component destroyed
//import core services
import { UserAuthService, TitleService, CommonUtilsService } from '../../../core/_services';
@Component({
  selector: 'app-purchase-dealership-success',
  templateUrl: './purchase-dealership-success.component.html',
  styleUrls: ['./purchase-dealership-success.component.css']
})
export class PurchaseDealershipSuccessComponent implements OnInit {

  hostedpage_id:string = "";
  userData: any = {};
  subscriptionName:string="";
  subscriptionCode:string="";
  subscriptionAutoRenewDate:string = "";
  subscriptionAmount:string = "";

  title: string = 'Thank You';  
  breadcrumbs: any[] = [{ page: 'Home', link: '/web' }, { page: 'Thank You', link: '' }]
  constructor(private activatedRoute: ActivatedRoute, private router: Router, private commonUtilsService:CommonUtilsService, private userAuthService: UserAuthService) {
    //this.userData = JSON.parse(localStorage.getItem('loggedinUser'));//parsing the local store data

  }

  ngOnInit() {
    //console.log(this.activatedRoute.snapshot.queryParamMap.get("hostedpage_id"))
    if(this.activatedRoute.snapshot.queryParamMap.get("hostedpage_id")){
      this.hostedpage_id = this.activatedRoute.snapshot.queryParamMap.get("hostedpage_id");
      this.getSubscriptionDetailsByHostPageID(this.hostedpage_id);
      //console.log(this.hostedPageDetails);
      
    }  
  }

  /**
  * Save Zoho Host Page ID after payment Success
  */
  private saveHostPageId(hostedpage_id, subscriptionCode): void{
    
    let postedData = {hostedpage_id:hostedpage_id, membership_type:subscriptionCode, id:localStorage.getItem('snapshotDealer')}
    
    this.userAuthService.updateHostPageId(postedData)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response) => {
          //console.log('response', response);

          // Only Works If Dealer User Logged In
          if (JSON.parse(localStorage.getItem("loggedinDealerUser"))) {
            localStorage.setItem('loggedinUser', JSON.stringify(response))//setting updated user data to localstorage
            this.userAuthService.isProfileUpdated(true); //trigeering the profile updated observable

            //this.getSubscriptionDetails();
            
          } 
          
          
        },
        error => {
          this.commonUtilsService.onError(error);
        });

  }


  /**
  * get Subscription Details using Dealer Id
  */
  private getSubscriptionDetails(){
    // get Subscription Details From Zoho Using HostPageId
    let postedData = {id:localStorage.getItem('snapshotDealer')}
    this.userAuthService.getSubscriptionDetails(postedData)      
    .subscribe(
    (response) => {
     // console.log('getSubscriptionDetails', response);
      this.subscriptionAutoRenewDate = response.data.subscription.current_term_ends_at;
      this.subscriptionName = response.data.subscription.plan.name;
      this.subscriptionAmount = response.data.subscription.currency_symbol+response.data.subscription.plan.price;
      this.commonUtilsService.hidePageLoader();
    },
    error => {
      //console.log(error);
      this.commonUtilsService.hidePageLoader();
    });
  }

  /**
  * get Subscription Details From Zoho Using HostPageId
  */  
  private getSubscriptionDetailsByHostPageID(hostedpage_id){   
    this.commonUtilsService.showPageLoader();
    let postedData = {hostedpage_id:hostedpage_id}
    this.userAuthService.getSubscriptionDetailsByHostPageID(postedData)      
    .subscribe(
    (response) => {
      //console.log('getSubscriptionDetails', response);
      this.subscriptionAutoRenewDate = response.data.subscription.current_term_ends_at;
      this.subscriptionName = response.data.subscription.plan.name;
      this.subscriptionCode = response.data.subscription.plan.plan_code;
      this.subscriptionAmount = response.data.subscription.currency_symbol+response.data.subscription.plan.price;
      this.saveHostPageId(hostedpage_id, this.subscriptionCode); //fetch dealer details

      this.commonUtilsService.hidePageLoader();
    },
    error => {
      //console.log(error);
      this.commonUtilsService.onError(error);
      //this.commonUtilsService.hidePageLoader();
    });
  }

  // This method must be present, even if empty.
  ngOnDestroy() {
    // To protect you, we'll throw an error if it doesn't exist.
  }

}
