import { Injectable ,Output,EventEmitter} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { Router, ActivatedRoute } from "@angular/router";
@Injectable({
  providedIn: 'root'
})
export class UserAuthService {
 
  public loggedIn: Subject<any> = new Subject<any>();
  public profileUpdatedStatus: Subject<any> = new Subject<any>();

  constructor(private httpClient: HttpClient, private router: Router) { }

  isLoggedIn(value: boolean, userType: String) {
    this.loggedIn.next({ isLoggedIn: value, userType: userType });
  }
  checkLoggedinStatus(): Observable<any> {
    return this.loggedIn.asObservable();
  }

  isProfileUpdated(value: boolean) {
    this.profileUpdatedStatus.next(value);
  }
  getUpdatedProfileStatus(): Observable<any> {
    return this.profileUpdatedStatus.asObservable();
  }

  /*
    Seller Funtions
  */
  isSellerLoggedin(){
    if (JSON.parse(localStorage.getItem("loggedinSellerUser"))) {
      // logged in so return true
      return true;
    }
    return false
  }
  fetchSellerData(postedData): Observable<any> {

    return this.httpClient
      .post('seller/fetchData', postedData)
      .map((response: Response) => {
        return response;
      })

  }

  sellerLogin(postedData): Observable<any> {

    return this.httpClient
      .post('auth/seller/login', postedData, { observe: 'response' })
      .map((response: any) => {
        return response;
      })

  }
  sellerSignup(postedData): Observable<any> {

    return this.httpClient
      .post('auth/seller/signup', postedData)
      .map((response: Response) => {
        return response;
      })

  }
  verifyDealerEmail(postedData): Observable<any> {

    return this.httpClient
      .post('auth/dealer/verifyEmail', postedData)
      .map((response:any) => {
        return response;
      })

  }

  verifySellerToken(postedData): Observable<any> {

    return this.httpClient
      .post('seller/verifyToken', postedData)
      .map((response:any) => {
        return response;
      })

  }

  verifyDealerToken(postedData): Observable<any> {

    return this.httpClient
      .post('dealer/verifyToken', postedData)
      .map((response:any) => {
        return response;
      })

  }

  

  verifyEmail(postedData): Observable<any> {

    return this.httpClient
      .post('auth/seller/verifyEmail', postedData)
      .map((response:any) => {
        return response;
      })

  }
  sendDealerVerificationLink(postedData): Observable<any> {

    return this.httpClient
      .post('auth/dealer/sendVerificationLink', postedData)
      .map((response:any) => {
        return response;
      })

  }



  


  sendSellerVerificationLink(postedData): Observable<any> {

    return this.httpClient
      .post('auth/seller/sendVerificationLink', postedData)
      .map((response:any) => {
        return response;
      })

  }

  
  setMFA(postedData): Observable<any> {

    return this.httpClient
      .post('auth/seller/setMFA', postedData)
      .map((response:any) => {
        return response;
      })

  }
  setDealerMFA(postedData): Observable<any> {

    return this.httpClient
      .post('auth/dealer/setMFA', postedData)
      .map((response:any) => {
        return response;
      })

  }
  sellerProfile(postedData): Observable<any> {

    return this.httpClient
      .post('seller/profile', postedData)
      .map((response: Response) => {
        return response;
      })

  }
  sellerForgotPassword(postedData): Observable<any> {

    return this.httpClient
      .post('seller/forgotPassword', postedData)
      .map((response: Response) => {
        return response;
      })
  }
  sellerEmailExist(postedData): Observable<any> {

    return this.httpClient
      .post('seller/emailExist', postedData)
      .map((response: Response) => {
        return response;
      })
  }
  sellerPhoneNumberExist(postedData): Observable<any> {

    return this.httpClient
      .post('seller/phoneNumberExist', postedData)
      .map((response: Response) => {
        return response;
      })
  }



  /*
    Dealer Funtions
  */
  
  
  isDealerLoggedin(){
    if (JSON.parse(localStorage.getItem("loggedinDealerUser"))) {
      // logged in so return true
      return true;
    }
    return false
  }
  verifyActivateDealer(postedData){
    return this.httpClient
      .post('dealer/verifyActivateDealer', postedData)
      .map((response: Response) => {
        return response;
      })
  }
  updatePassword(postedData): Observable<any> {
    console.log('postedData',postedData);
    return this.httpClient
      .post('seller/updatePassword', postedData)
      .map((response: Response) => {
        return response;
      })

  }
  
  fetchDealerData(postedData): Observable<any> {

    return this.httpClient
      .post('dealer/fetchDealerData', postedData)
      .map((response: Response) => {
        return response;
      })

  }

  

  dealerLogin(postedData): Observable<any> {

    return this.httpClient
      .post('auth/dealer/login', postedData, { observe: 'response' })
      .map((response: any) => {
        return response;
      })

  }


  dealerSignup(postedData): Observable<any> {

    return this.httpClient
      .post('auth/dealer/signup', postedData)
      .map((response: Response) => {
        return response;
      })

  }


  dealerProfile(postedData): Observable<any> {

    return this.httpClient
      .post('dealer/profile', postedData)
      .map((response: Response) => {
        return response;
      })

  }


  updateHostPageId(postedData): Observable<any> {

    return this.httpClient
      .post('dealer/updateHostPageId', postedData)
      .map((response: Response) => {
        return response;
      })

  }

  cancelSubscription(postedData): Observable<any> {

    return this.httpClient
      .post('dealer/cancelSubscription', postedData)
      .map((response: Response) => {
        return response;
      })

  }

  updateSubscription(postedData): Observable<any> {

    return this.httpClient
      .post('dealer/updateSubscription', postedData)
      .map((response: Response) => {
        return response;
      })

  }

  getAllPlanDetails(): Observable<any> {

    return this.httpClient
      .post('dealer/getAllPlanDetails',{})
      .map((response: Response) => {
        return response;
      })

  }

  getSubscriptionDetails(postedData): Observable<any> {

    return this.httpClient
      .post('dealer/getSubscriptionDetails', postedData)
      .map((response: Response) => {
        return response;
      })

  }


  getSubscriptionDetailsByHostPageID(postedData): Observable<any> {

    return this.httpClient
      .post('dealer/getSubscriptionDetailsByHostPageID', postedData)
      .map((response: Response) => {
        return response;
      })

  }

  fetchDealerDetailsForUpgradingSubscription(postedData): Observable<any> {

    return this.httpClient
      .post('dealer/fetchDealerDetailsForUpgradingSubscription', postedData)
      .map((response: Response) => {
        return response;
      })

  }

  checkSubscriptionExpired(postedData): Observable<any> {

    return this.httpClient
      .post('dealer/checkSubscriptionExpired', postedData)
      .map((response: Response) => {
        return response;
      })

  }



  dealerForgotPassword(postedData): Observable<any> {

    return this.httpClient
      .post('dealer/forgotPassword', postedData)
      .map((response: Response) => {
        return response;
      })
  }
  dealerEmailExist(postedData): Observable<any> {

    return this.httpClient
      .post('dealer/emailExist', postedData)
      .map((response: Response) => {
        return response;
      })
  }


  dealerPhoneNumberExist(postedData): Observable<any> {

    return this.httpClient
      .post('dealer/phoneNumberExist', postedData)
      .map((response: Response) => {
        return response;
      })
  }


  

  dealerIsPasswordCorrect(postedData): Observable<any> {
     postedData['id']=localStorage.getItem('loggedinUserId');
    return this.httpClient
      .post('dealer/PasswordCorrect', postedData)
      .map((response: Response) => {
        return response;
      })
  }
  


  sellerIsPasswordCorrect(postedData): Observable<any> {
    postedData['id']=localStorage.getItem('loggedinUserId');
   return this.httpClient
     .post('seller/PasswordCorrect', postedData)
     .map((response: Response) => {
       return response;
     })
   }


  updateDealerPassword(postedData): Observable<any> {
    //console.log('postedData',postedData);
    return this.httpClient
      .post('dealer/updatePassword', postedData)
      .map((response: Response) => {
        return response;
      })

  }


  //if seller/dealer loggedin then redirect
  checkLoginAndRedirect(){
    console.log('checkLoginAndRedirect');
    //checking and redirecting to seller dashboard page
    if(this.isSellerLoggedin())
      this.router.navigate(['/seller/home']);

    //checking and redirecting to dealer dashboard page
    if(this.isDealerLoggedin())
      this.router.navigate(['/dealer/dashboard']);
  }


  changePassword(postedData): Observable<any> {
    let url ='seller/changePassword';

    if (JSON.parse(localStorage.getItem("loggedinSellerUser"))) {
      url = 'seller/changePassword';
    } else if (JSON.parse(localStorage.getItem("loggedinDealerUser"))) {
      url = 'dealer/changePassword'
    }
    return this.httpClient
      .post(url, postedData)
      .map((response: Response) => {
        return response;
      })

  }

  contactUs(postedData): Observable<any> {
    //console.log('postedData',postedData);
    return this.httpClient
      .post('auth/contactUs', postedData)
      .map((response: Response) => {
        return response;
      })

  }

  dealerOTPVerification(postedData): Observable<any> {
    console.log('postedData',postedData);
    return this.httpClient
      .post('auth/dealer/OTPVerification', postedData)
      .map((response: Response) => {
        return response;
      })

  }

  sellerOTPVerification(postedData): Observable<any> {
    console.log('postedData',postedData);
    return this.httpClient
      .post('auth/seller/OTPVerification', postedData)
      .map((response: Response) => {
        return response;
      })

  }

  sellerResendOTP(postedData): Observable<any> {
    console.log('postedData',postedData);
    return this.httpClient
      .post('auth/seller/resendCode', postedData)
      .map((response: Response) => {
        return response;
      })
  }

  dealerResendOTP(postedData): Observable<any> {
    console.log('postedData',postedData);
    return this.httpClient
      .post('auth/dealer/resendCode', postedData)
      .map((response: Response) => {
        return response;
      })
  }
}