import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
//import core services
import { UserAuthService, TitleService, CommonUtilsService } from '../../../core/_services';
@Component({
  selector: 'app-purchase-dealership',
  templateUrl: './purchase-dealership.component.html',
  styleUrls: ['./purchase-dealership.component.css']
})
export class PurchaseDealershipComponent implements OnInit {
  dealer_id:string = "";
  plan_code:string = ""; 
  iframeUrl:string = "";

  //title and breadcrumbs
  readonly title: string = 'Purchase Dealership'
  readonly breadcrumbs: any[] = [{ page: 'Home', link: '/dealer/home' }, { page: 'Purchase Dealership', link: '' }]
  constructor(private activatedRoute: ActivatedRoute, private router: Router, private commonUtilsService:CommonUtilsService, private userAuthService: UserAuthService) { }

  ngOnInit() {
    
     
      this.dealer_id = this.activatedRoute.snapshot.params.dealer_id;      
      this.plan_code = this.activatedRoute.snapshot.params.plan_code;      
      localStorage.setItem('snapshotDealer', this.dealer_id);
      //console.log('dealer_id', this.dealer_id);
      this.fetchDealerDetails(this.dealer_id, this.plan_code); //fetch dealer details
    
  }

  /**
  * Fetch Dealer Details by ID.
  */
 private fetchDealerDetails(dealer_id, plan_code){
    //hit api to fetch data
    this.commonUtilsService.showPageLoader();
    this.userAuthService.fetchDealerDetailsForUpgradingSubscription({ id: dealer_id }).subscribe(
      //case success
      (response) => {
        //console.log(response);    
        
        if(response){

          // Upgrading a subscription (Check subscription is not equal to current/free plan)
          if(response.membership_type != plan_code && response.membership_type != 'free'){
            this.updateSubscription(dealer_id, response.subscription_id, plan_code);
          }

          if(response.membership_type == plan_code && response.subscription_status == 'non_renewing'){
            this.updateSubscription(dealer_id, response.subscription_id, plan_code);
          }

          // Purchasing a new Subscription
          if(response.membership_type == 'free'){
            this.iframeUrl = "https://subscriptions.zoho.com/subscribe/57a2ee87bc4643469efda2d0a6a5b067a5e12fff46ccfe5bad482bf477cf719e/"+plan_code+"?first_name="+response.name.first_name+"&last_name="+response.name.last_name+"&email="+response.emails[0].email;
          } 

         // this.iframeUrl = "https://subscriptions.zoho.com/hostedpage/2-bfaf7e3bedf40dea17ed00b16cc418d742c1012e30d0d37693a8f3a50a3a369f83bd430b5cf0bb0098e383d16635bfca/checkout";
        }  
        
        this.commonUtilsService.hidePageLoader();
      }, error => {
        //this.commonUtilsService.hidePageLoader();
        this.commonUtilsService.onError(error);
      }
    );
 }
  /**
  * Fetch Dealer Details by ID.
  */
  private updateSubscription(dealer_id, subscription_id, plan_code){
    this.commonUtilsService.showPageLoader();
    // get Subscription Details From Zoho Using HostPageId
    let postedData = {id:dealer_id, subscription_id: subscription_id, plan_code: plan_code}
    this.userAuthService.updateSubscription(postedData)      
    .subscribe(
    (response) => {
      
      if(response){
        this.iframeUrl = response.url;
      } 
      this.commonUtilsService.hidePageLoader(); 
    },
    error => {
      //console.log(error);  
      this.commonUtilsService.onError(error);    
    });
  }

}
