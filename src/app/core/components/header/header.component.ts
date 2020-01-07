import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from "@angular/router";
import { Subscription } from 'rxjs/Subscription';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { ToastrManager } from 'ng6-toastr-notifications';//toaster class
declare var $: any;
//import core services
import { UserAuthService, SellerService, DealerService, NotificationService, RealUpdateService, CommonUtilsService } from '../../_services/'

import { environment } from '../../../../environments/environment'
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  subscription: Subscription;
  profileSubscription: Subscription;
  isLoggedin: boolean = false;
  isProfileUpdated: boolean = false;
  loggedinUserType: String = '';
  profileData: any = {};
  notifications: any;
  myImgUrl: string = 'assets/images/default-user.png';

  trialDate: Date;
  calculateTrialDaysLeft: any;
  calculateExpiredDaysLeft: any;
  isFreeTrialEnabled: boolean = false;
  showPlanWillExpired: boolean = false;
  getDealerId: string = "";
  subscriptionId: string = '';
  subscriptionStatus: string = '';
  //idle handle
  idleState = 'Not started.';
  timedOut = false;
  lastPing?: Date = null;

  constructor(private idle: Idle, private keepalive: Keepalive, private realTimeUpdateService: RealUpdateService, private notificationService: NotificationService, private sellerService: SellerService, private dealerService: DealerService, private router: Router, private userAuthService: UserAuthService, private toastr: ToastrManager, private commonUtilsService: CommonUtilsService) {



    //idle 

    // sets an idle timeout of 5 seconds, for testing purposes.
    idle.setIdle(60);
    // sets a timeout period of 5 seconds. after 10 seconds of inactivity, the user will be considered timed out.
    idle.setTimeout(60);
    // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    idle.onIdleEnd.subscribe(() => this.idleState = 'No longer idle.');
    idle.onTimeout.subscribe(() => {
      this.idleState = 'Timed out!';
      if(localStorage.getItem('loggedinSellerUser') || localStorage.getItem('loggedinDealerUser') )
      this.logout()
      this.timedOut = true;
    });
    idle.onIdleStart.subscribe(() => {
      this.idleState = 'You\'ve gone idle!'
       console.log('You have gone idle')
    });
    idle.onTimeoutWarning.subscribe((countdown) => this.idleState = 'You will time out in ' + countdown + ' seconds!');

    // sets the ping interval to 15 seconds
    keepalive.interval(15);

    keepalive.onPing.subscribe(() => this.lastPing = new Date());

    this.reset();


    //idle impleementation

    this.subscription = this.userAuthService.checkLoggedinStatus().subscribe((loginStatus) => {
      this.isLoggedin = loginStatus.isLoggedIn;
      this.loggedinUserType = loginStatus.userType;
      if (localStorage.getItem('loggedinUser')) {
        console.log('the user is',localStorage.getItem('loggedinUser'))
        this.reset()//reset idale watcher
        this.profileData = JSON.parse(localStorage.getItem('loggedinUser'));
        const defaultPath = environment.WEB_ENDPOINT + '/' + environment.DEFAULT_PROFILE
        this.profileData.profile_pic = (this.profileData.profile_pic) ? this.profileData.profile_pic : defaultPath;



        // Check Dealer Subscription
        if (JSON.parse(localStorage.getItem("loggedinDealerUser"))) {


          this.getDealerId = this.profileData._id;

          this.checkSubscriptionExpired(this.getDealerId); // check Subscription Expired or Not
          if (this.profileData.membership_type == "free") {
            this.trialDate = new Date(this.profileData.created_at)

            var newdate = new Date(this.trialDate);
            newdate.setDate(newdate.getDate() + 90);

            this.calculateTrialDaysLeft = this.calculateDaysLeft(newdate);
            this.isFreeTrialEnabled = true;
          } else {

            this.isFreeTrialEnabled = false;
            this.subscriptionId = this.profileData.subscription_id; this.subscriptionStatus = this.profileData.subscription_status;
            // get Subscription Details From Zoho Using HostPageId
            this.getSubscriptionDetails();
          }


        }


      } else {
        this.isFreeTrialEnabled = false;
        this.showPlanWillExpired = false;
      }
    });


    this.realTimeUpdateService.haveNewMessage().subscribe(res => {
      this.reloadNotifications();
    })

    this.profileSubscription = this.userAuthService.getUpdatedProfileStatus().subscribe((profileStatus) => {
      this.isProfileUpdated = profileStatus.profileUpdatedStatus;
      this.profileData = JSON.parse(localStorage.getItem('loggedinUser'));
      const defaultPath = environment.WEB_ENDPOINT + '/' + environment.DEFAULT_PROFILE
      this.profileData.profile_pic = (this.profileData.profile_pic) ? this.profileData.profile_pic : defaultPath;

      // Check Dealer Subscription
      if (JSON.parse(localStorage.getItem("loggedinDealerUser"))) {

        //console.log('profileData', this.profileData);
        this.getDealerId = this.profileData._id;
        this.checkSubscriptionExpired(this.getDealerId); // check Subscription Expired or Not

        if (this.profileData.membership_type == "free") {
          this.trialDate = new Date(this.profileData.created_at)

          var newdate = new Date(this.trialDate);
          newdate.setDate(newdate.getDate() + 90);

          //console.log('calculateDaysLeft', this.calculateDaysLeft(this.trialDate, newdate))
          this.calculateTrialDaysLeft = this.calculateDaysLeft(newdate);

          this.isFreeTrialEnabled = true;
        } else {

          this.isFreeTrialEnabled = false;
          this.subscriptionId = this.profileData.subscription_id;
          this.subscriptionStatus = this.profileData.subscription_status;
          // get Subscription Details From Zoho Using HostPageId
          this.getSubscriptionDetails();
        }


      } else {
        this.isFreeTrialEnabled = false;
        this.showPlanWillExpired = false;
      }


    });

  }

  ngOnInit() {

    // Page Refresh     
    if (localStorage.getItem('loggedinUser')) {
      this.isLoggedin = true;
      this.profileData = JSON.parse(localStorage.getItem('loggedinUser'));
      const defaultPath = environment.WEB_ENDPOINT + '/' + environment.DEFAULT_PROFILE
      this.profileData.profile_pic = (this.profileData.profile_pic) ? this.profileData.profile_pic : defaultPath;

      if (JSON.parse(localStorage.getItem("loggedinSellerUser"))) {
        this.loggedinUserType = 'Seller';
        this.getSellerNotifications();
      } else if (JSON.parse(localStorage.getItem("loggedinDealerUser"))) {

        this.loggedinUserType = 'Dealer';
        this.getDealerNotifications();


        this.getDealerId = this.profileData._id;

        // check Subscription Expired or Not
        this.checkSubscriptionExpired(this.getDealerId);


        if (this.profileData.membership_type == "free") {
          this.trialDate = new Date(this.profileData.created_at)

          var newdate = new Date(this.trialDate);

          newdate.setDate(newdate.getDate() + 90);

          //console.log('newdate', newdate)
          this.calculateTrialDaysLeft = this.calculateDaysLeft(newdate);
          this.isFreeTrialEnabled = true;
        } else {
          this.isFreeTrialEnabled = false;
          this.subscriptionId = this.profileData.subscription_id;
          this.subscriptionStatus = this.profileData.subscription_status;

          // get Subscription Details From Zoho Using HostPageId
          this.getSubscriptionDetails();
        }


      }
    } else {
      this.showPlanWillExpired = false;   // disable Top Bar
      this.isFreeTrialEnabled = false;   // disable Top Bar
    }


    this.notificationService.reload.subscribe(val => {
      if (!$.isEmptyObject(val)) {
        this.reloadNotifications();
      }
    })
  }

  /**
   * will be invoked when ever someone send message
   */
  reloadNotifications() {
    if (this.loggedinUserType == 'Dealer') {
      this.getDealerNotifications();
    } else if (this.loggedinUserType == 'Seller') {
      this.getSellerNotifications();
    }
  }

  private calculateDaysLeft(date) {
    //our custom function with two parameters, each for a selected date

    let diffc = date.getTime() - new Date().getTime();
    //getTime() function used to convert a date into milliseconds. This is needed in order to perform calculations.   
    let days = Math.round(Math.abs(diffc / (1000 * 60 * 60 * 24)));
    //this is the actual equation that calculates the number of days.

    return days;
  }


  ngAfterViewInit() {

    //console.log('js has been loaded!');



    /* $('#filter_toggle_btn').click(function(e){
       
       e.stopPropagation();
       
       $('.msg_notification').toggleClass('open');
     });*/

    $('body').click(function () {
      $('.msg_notification').removeClass('open');
    });

    $('.msg_notification').click(function (e) {
      e.stopPropagation();
    });






  }

  chatIconClick() {
    $('.msg_notification').toggleClass('open');
    this.notificationService.isChatHistoryWindowOpen(true);

    if (JSON.parse(localStorage.getItem("loggedinSellerUser"))) {
      this.router.navigate(['/' + 'seller/car-dashboard']);
    } else if (JSON.parse(localStorage.getItem("loggedinDealerUser"))) {
      this.router.navigate(['/' + 'dealer/dashboard']);
    }
  }
  async cancelYourSubscription() {
    if (await this.commonUtilsService.isCancelYourSubscriptionConfirmed()) {
      this.commonUtilsService.showPageLoader();
      let postedData = { id: localStorage.getItem('loggedinUserId') }
      this.userAuthService.cancelSubscription(postedData)
        .subscribe(
          (response) => {
            // console.log('response', response);

            localStorage.setItem('loggedinUser', JSON.stringify(response))//setting updated user data to localstorage

            this.userAuthService.isProfileUpdated(true);//trigeering the profile updated observable

            this.commonUtilsService.onSuccess("Your subscription will be cancelled at the end of this term.")
            //this.commonUtilsService.hidePageLoader();
          },
          error => {
            this.commonUtilsService.onError(error);
          });
    }
  }

  private getSubscriptionDetails() {
    // get Subscription Details From Zoho Using HostPageId
    let postedData = { id: localStorage.getItem('loggedinUserId') }
    this.userAuthService.getSubscriptionDetails(postedData)
      .subscribe(
        (response) => {
          //console.log('response', response);     
          //let subscription_status = response.data.subscription.status;  

          // show when subscription is about to expired.
          if (this.subscriptionStatus == "non_renewing") {
            this.showPlanWillExpired = true;
            var expired_date = new Date(response.data.subscription.current_term_ends_at);
            this.calculateExpiredDaysLeft = this.calculateDaysLeft(expired_date);
          } else {
            this.showPlanWillExpired = false;
          }

        },
        error => {
          console.log(error);
        });
  }

  private checkSubscriptionExpired(getDealerId) {
    let postedData = { id: getDealerId }
    this.userAuthService.checkSubscriptionExpired(postedData)
      .subscribe(
        (response) => {
          console.log('response', response);
          // logout when subscription is expired.
          if (response) {
            localStorage.removeItem('loggedinUser');
            localStorage.clear();
            this.userAuthService.isLoggedIn(false, '');
          }

        },
        error => {
          console.log(error);
        });
  }

  logout() {
    this.toastr.successToastr(environment.MESSAGES.LOGOUT_SUCCESS, 'Success!');//showing success toaster
    const redirectUrl = (this.loggedinUserType).toLowerCase() + '/login';
    localStorage.removeItem('loggedinUser');
    localStorage.clear();

    this.showPlanWillExpired = false;   // disable Top Bar
    this.isFreeTrialEnabled = false;   // disable Top Bar

    this.userAuthService.isLoggedIn(false, '');
    this.router.navigate(['/' + redirectUrl]);
    return false;
  }



  //getNotification
  private getSellerNotifications() {
    this.sellerService.getAllMessageNotifications().subscribe(res => {
      this.notifications = res;
      //console.log('the getSellerNotifications are ',this.notifications)
      this.notificationService.setUser({});
    })
  }



  //getNotification
  private getDealerNotifications() {
    this.dealerService.getAllMessageNotifications().subscribe(res => {
      this.notifications = res;
      //console.log('the notifications are ',this.notifications)
      this.notificationService.setUser({});
    })
  }


  /**
   * 
   * @param user is the seller whom dealer want to chat with
   */
  openDealerChat(user: any) {
    console.log('user', user);
    if (this.router.url.includes('dealer/dashboard')) {
      this.notificationService.setUser(user);
      $(".msg_notification").slideToggle(300);
    } else {
      this.notificationService.setUser(user);
      $(".msg_notification").slideToggle(300);
      this.router.navigate(['/dealer/dashboard']);
    }

  }


  /**
 * 
 * @param user is the dealer whom seller want to chat with
 */
  openSellerChat(user: any) {
    if (this.router.url.includes('seller/car-dashboard')) {
      this.notificationService.setUser(user);
      $(".msg_notification").slideToggle(300);
    } else {
      this.notificationService.setUser(user);
      $(".msg_notification").slideToggle(300);
      this.router.navigate(['/seller/car-dashboard']);
    }

  }


  reset() {
    this.idle.watch();
    this.idleState = 'Started.';
    this.timedOut = false;
  }
}
