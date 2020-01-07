import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';// unsubscribe from observables when the component destroyed
//import core services
import { UserAuthService, TitleService, CommonUtilsService } from '../../../core/_services';

@Component({
  selector: 'app-preview-your-dealership-plan',
  templateUrl: './preview-your-dealership-plan.component.html',
  styleUrls: ['./preview-your-dealership-plan.component.css']
})
export class PreviewYourDealershipPlanComponent implements OnInit {
  
  subscriptionName:string="";
  subscriptionAutoRenewDate:string = "";
  subscriptionAmount:string = "";
  profileData: any = {};
  membershipType:string = "";
  subscriptionStatus:string = "";
  getDealerId:string="";
  getPlanDetails:any;

  title: string = 'Your Plan';  
  breadcrumbs: any[] = [{ page: 'Home', link: '/web' }, { page: 'Your Plan', link: '' }]

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private commonUtilsService:CommonUtilsService, private userAuthService: UserAuthService) { }

  ngOnInit() {
    this.profileData = JSON.parse(localStorage.getItem('loggedinUser'));
    this.membershipType = this.profileData.membership_type;
    this.subscriptionStatus = this.profileData.subscription_status;
    this.getDealerId = this.profileData._id;
    this.getAllPlans();
  }


  /**
  * Get All Plan Details From Zoho Subscription.
  */
  private getAllPlans(){
    // get All Plans From Zoho Using
    this.commonUtilsService.showPageLoader();
    this.userAuthService.getAllPlanDetails()      
    .subscribe(
    (response) => {
      
      this.getPlanDetails = response.plans;
      //console.log('getPlanDetails', this.getPlanDetails);
      if(this.membershipType != "free"){ this.getSubscriptionDetails(); } // get dealer current plan status
      this.commonUtilsService.hidePageLoader();      
    },
    error => {
      this.commonUtilsService.onError(error);
      //console.log(error);      
    });
  }


  /**
  * Get Dealer Current Plan Details From Zoho.
  */
  private getSubscriptionDetails(){
    this.commonUtilsService.showPageLoader();
    // get Subscription Details From Zoho Using HostPageId
    let postedData = {id:localStorage.getItem('loggedinUserId')}
    this.userAuthService.getSubscriptionDetails(postedData)      
    .subscribe(
    (response) => {
      
      if(response){
        this.subscriptionAutoRenewDate = response.data.subscription.current_term_ends_at;
        this.subscriptionName = response.data.subscription.plan.name;
        this.subscriptionAmount = response.data.subscription.plan.price;
      } 
      this.commonUtilsService.hidePageLoader(); 
    },
    error => {
      //console.log(error);  
      this.commonUtilsService.onError(error);    
    });
  }

}
