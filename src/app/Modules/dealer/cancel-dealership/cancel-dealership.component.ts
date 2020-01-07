import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';// unsubscribe from observables when the component destroyed
//import core services
import { UserAuthService, TitleService, CommonUtilsService } from '../../../core/_services';
@Component({
  selector: 'app-cancel-dealership',
  templateUrl: './cancel-dealership.component.html',
  styleUrls: ['./cancel-dealership.component.css']
})
export class CancelDealershipComponent implements OnInit {

  title: string = 'Cancel Dealership';  
  breadcrumbs: any[] = [{ page: 'Home', link: '/web' }, { page: 'Cancel Dealership', link: '' }]
  subscriptionName:string="";
  subscriptionAutoRenewDate:string = "";
  subscriptionAmount:string = "";
  profileData: any = {};

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private commonUtilsService:CommonUtilsService, private userAuthService: UserAuthService) { }

  ngOnInit() {

    // Check Dealer Subscription Status
    if (JSON.parse(localStorage.getItem("loggedinDealerUser"))) { 
      this.profileData = JSON.parse(localStorage.getItem('loggedinUser'));
      if(this.profileData.subscription_status == "non_renewing"){
        this.router.navigate(['/dealer/your-plan/']);
      }
    }

    this.getSubscriptionDetails();
  }

  private getSubscriptionDetails(){
    this.commonUtilsService.showPageLoader();
    // get Subscription Details From Zoho Using HostPageId
    let postedData = {id:localStorage.getItem('loggedinUserId')}
    this.userAuthService.getSubscriptionDetails(postedData)      
    .subscribe(
    (response) => {
      //console.log(response);
      this.subscriptionAutoRenewDate = response.data.subscription.current_term_ends_at;
      this.subscriptionName = response.data.subscription.plan.name;
      this.subscriptionAmount = response.data.subscription.currency_symbol+response.data.subscription.plan.price;
      this.commonUtilsService.hidePageLoader();
    },
    error => {
      console.log(error);     
      this.commonUtilsService.hidePageLoader(); 
    });
  }

  async cancelYourSubscription() {
    if(await this.commonUtilsService.isCancelYourSubscriptionConfirmed()) {
      this.commonUtilsService.showPageLoader();
      let postedData = {id:localStorage.getItem('loggedinUserId')}
      this.userAuthService.cancelSubscription(postedData)      
        .subscribe(
          (response) => {
            //console.log('response', response);

            localStorage.setItem('loggedinUser', JSON.stringify(response))//setting updated user data to localstorage

            this.userAuthService.isProfileUpdated(true);//trigeering the profile updated observable

            this.router.navigate(['/dealer/your-plan/']);

            this.commonUtilsService.onSuccess("Your dealerhsip plan has been cancelled successfully.")
            //this.commonUtilsService.hidePageLoader();
          },
          error => {
            this.commonUtilsService.onError(error);
          });
    }
  }

}
