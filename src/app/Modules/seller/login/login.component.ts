import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { CookieService } from 'ngx-cookie-service';
import * as Msal from 'msal';
import { ToastrManager } from 'ng6-toastr-notifications';//toaster class
import { untilDestroyed } from 'ngx-take-until-destroy';// unsubscribe from observables when the component destroyed
//social login
/*import { AuthService } from 'angularx-social-login';
import { SocialUser } from 'angularx-social-login';
import { GoogleLoginProvider, FacebookLoginProvider, LinkedInLoginProvider } from 'angularx-social-login';*/
import {
  AuthService as AuthS,
  FacebookLoginProvider,
  GoogleLoginProvider
} from 'angular-6-social-login';

//import services

//shared services
import { AlertService, PageLoaderService } from '../../../shared/_services'

//modules core services
import { UserAuthService, TitleService, CognitoUserService, AuthService, NotificationService } from '../../../core/_services'

import { environment } from '../../../../environments/environment'

declare var $;
declare const gapi: any;
declare var FB: any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @ViewChild("otpSection") otpSection: ElementRef;

  title: string = 'Seller Sign In';
  breadcrumbs: any[] = [{ page: 'Home', link: '' }, { page: 'Sign In', link: '' }]
  loginForm: FormGroup;
  loginOTPForm: FormGroup;
  submitted: boolean = false;
  showOtpForm: boolean = false;
  otpFormsubmitted: boolean = false;
  element: any;
  public auth2: any;
  userResponse: any;
  userData;
  userAgentApplication;
  msalInstance: any;
  constructor(private authService: AuthS, private cookieService:CookieService ,/*private authService: AuthService */ private notificationService: NotificationService, private route: ActivatedRoute, private cognitoUserService: CognitoUserService, private alertService: AlertService, private userAuthService: UserAuthService, private pageLoaderService: PageLoaderService, private formBuilder: FormBuilder, private router: Router, private titleService: TitleService, private toastr: ToastrManager) {

    this.sellerLoginForm()
    this.topVerifyForm();
    //   var msalConfig = {
    //     auth: {
    //         clientId: environment.SOCIAL_LOGINS.MICROSOFT.clientId
    //     }
    // };
    // this.userAgentApplication = new Msal.UserAgentApplication(msalConfig);
    var msalConfig = {
      auth: {
        clientId: environment.SOCIAL_LOGINS.MICROSOFT.clientId
      }
    };
    this.msalInstance = new Msal.UserAgentApplication(msalConfig);

    this.msalInstance.handleRedirectCallback((error, response) => {
      // handle redirect response or error
      console.log('the redirect response is' + response)
    });
  }



  public tokenReceivedCallback(errorDesc, token, error, tokenType) {
    if (token) {
      this.userData = token;

      console.log("Token: " + token)
    } else {
      console.log(error + ":" + errorDesc);
    }
  }

  public microsoftSignIn() {
    let self = this;
    var loginRequest = {
      scopes: ["user.read", "mail.send"] // optional Array<string>
    };

    this.msalInstance.loginPopup(loginRequest)
      .then(response => {
        // handle response

        // if the user is already logged in you can acquire a token
        if (this.msalInstance.getAccount()) {
          var tokenRequest = {
            scopes: ["user.read", "mail.send"]
          };
          this.msalInstance.acquireTokenSilent(tokenRequest)
            .then(response => {
              // get access token from response
              // response.accessToken
              console.log('the access FFtoken is' + JSON.stringify(response));


              localStorage.setItem('email', response.account.userName)
              localStorage.setItem('firstName', response.account.name.split(" ")[0]);
              localStorage.setItem('lastName', response.account.name.split(" ")[1]);
              self.router.navigate(['/seller/signup']);
            })
            .catch(err => {
              // could also check if err instance of InteractionRequiredAuthError if you can import the class.
              if (err.name === "InteractionRequiredAuthError") {
                return this.msalInstance.acquireTokenPopup(tokenRequest)
                  .then(response => {
                    // get access token from response
                    // response.accessToken
                    console.log('the access token is' + response.accessToken)
                  })
                  .catch(err => {
                    // handle error
                  });
              }
            });
        } else {
          // user is not logged in, you will need to log them in to acquire a token
        }


      })
      .catch(err => {
        // handle error
      });
    // var graphScopes = ["user.read", "mail.send"];
    // let that = this;

    // that.userAgentApplication.loginPopup(graphScopes).then(function(idToken) {
    //     //Login Success
    //     that.userAgentApplication.acquireTokenSilent(graphScopes).then(function(accessToken) {

    //         console.log(accessToken)
    //         //AcquireTokenSilent Success
    //         var headers = new Headers();
    //         var bearer = "Bearer " + accessToken;
    //         headers.append("Authorization", bearer);
    //         var options = {
    //             method: "GET",
    //             headers: headers
    //         };
    //         var graphEndpoint = "https://graph.microsoft.com/v1.0/me";

    //         fetch(graphEndpoint, options)
    //             .then(function(response) {

    //                 response.json().then(function(data) {
    //                     that.userData = data;
    //                     console.log('theuser is'+data)
    //                     console.log(data)
    //                 })
    //             })
    //     }, function(error) {
    //         //AcquireTokenSilent Failure, send an interactive request.
    //         that.userAgentApplication.acquireTokenPopup(graphScopes).then(function(accessToken) {
    //             //updateUI();
    //         }, function(error) {
    //             console.log(error);
    //         });
    //     })
    // }, function(error) {
    //     //login failure
    //     console.log(error);
    // });
  }


  ngOnInit() {


    this.element = document.getElementById('googleBtn');
    //if seller/dealer loggedin then redirect
    this.userAuthService.checkLoginAndRedirect();

    //setting the page title
    this.titleService.setTitle();
    if (this.cookieService.get('seller_email')) {
      this.loginForm.patchValue({
        email: this.cookieService.get('seller_email')
      })
    }

  }




  //social logins methods
  signInWithGoogle(): void {
    let self = this;
    let socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
    this.authService.signIn(socialPlatformProvider).then(
      (userData: any) => {
        localStorage.setItem('email', userData.email)
        localStorage.setItem('firstName', userData.name.split(" ")[0]);
        localStorage.setItem('lastName', userData.name.split(" ")[1]);
        self.router.navigate(['/seller/signup']);

      }
    );

  }



  signInWithFB(): void {

    let self = this;

    let socialPlatformProvider = FacebookLoginProvider.PROVIDER_ID;
    this.authService.signIn(socialPlatformProvider).then(
      (userData: any) => {
        console.log(" sign in data : ", userData.email);
        // Now sign-in with userDat
        localStorage.setItem('email', userData.email)
        localStorage.setItem('firstName', userData.name.split(" ")[0])
        localStorage.setItem('lastName', userData.name.split(" ")[1]);
        self.router.navigate(['/seller/signup']);
        // ...

      }
    );

  }

  private sellerLoginForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.email, Validators.required]],
      password: [null, [Validators.required]],
      remember_me: [null]
    });
  }

  private topVerifyForm() {
    this.loginOTPForm = this.formBuilder.group({
      id: [null],
      code: [null, Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern('^[0-9 ]*$')])]
    })
  }

  //on login form submit
  loginByOtp() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.showOtpForm = true
    $(this.otpSection.nativeElement).modal({ backdrop: 'static', keyboard: false, show: true });
    this.toastr.successToastr(environment.MESSAGES.OTP_RESEND, 'Success!'); //showing success toaster


    /*this.pageLoaderService.pageLoader(true);//show loader
    this.pageLoaderService.setLoaderText('Checking authorisation');//setting loader text

    this.cognitoUserService.login(this.loginForm.value)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response) => {
          console.log('response', response);
          this.pageLoaderService.pageLoader(false); //hide page loader
          this.showOtpForm = response.mfaRequired;
          this.pageLoaderService.pageLoader(false);//hide page loader
          $(this.otpSection.nativeElement).modal({ backdrop: 'static', keyboard: false, show: response.mfaRequired });
          this.toastr.successToastr(environment.MESSAGES.OTP_RESEND, 'Success!'); //showing success toaster          

        },
        error => {
          this.pageLoaderService.pageLoader(false);//hide page loader      
          this.toastr.errorToastr(error, 'Oops!');//showing error toaster message
        });*/
  }

  resendOTP() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
    this.pageLoaderService.pageLoader(true);//show loader
    this.pageLoaderService.setLoaderText('Checking authorisation');//setting loader text

    this.userAuthService.sellerResendOTP({ id: this.userResponse.body._id })
      .pipe(untilDestroyed(this))
      .subscribe(
        (response) => {
          //console.log('response',response);
          this.pageLoaderService.pageLoader(false); //hide page loader
          this.showOtpForm = true;
          this.pageLoaderService.pageLoader(false);//hide page loader

          this.toastr.successToastr(environment.MESSAGES.OTP_RESEND, 'Success!'); //showing success toaster          

        },
        error => {
          this.pageLoaderService.pageLoader(false);//hide page loader      
          this.toastr.errorToastr(error, 'Oops!');//showing error toaster message
        });
  }

  //call on OTP form submit
  public onSubmitOtp() {
    this.otpFormsubmitted = true;

    // stop here if form is invalid
    if (this.loginOTPForm.invalid) {
      return;
    }
    this.loginOTPForm.patchValue({
      id: this.userResponse.body._id
    })

    //confirm seller OTP code
    //this.cognitoUserService.confirmLoginOtp(this.loginOTPForm)
    this.userAuthService.sellerOTPVerification(this.loginOTPForm.value)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response) => {

          // localStorage.setItem('aws-loggedinUser', JSON.stringify(response))
          this.pageLoaderService.pageLoader(false);//hide page loader

          /* Hide OTP Form */
          this.showOtpForm = false;
          $(this.otpSection.nativeElement).modal('hide');
          localStorage.setItem('loggedinUser', JSON.stringify(this.userResponse.body))
          localStorage.setItem('loggedinUserId', this.userResponse.body._id)
          localStorage.setItem('loggedinSellerUser', JSON.stringify(true))
          localStorage.setItem('x-auth-token', this.userResponse.headers.get('x-auth-token'))

          this.userAuthService.isLoggedIn(true, 'Seller');//trigger loggedin observable 
          this.notificationService.setReload({ reload: true });//set service for reloading notification after getting chat

          this.router.navigate(['/seller/addnewcar'])



        },
        error => {
          console.log('error otp');
          this.loginOTPForm.reset();
          this.toastr.errorToastr(error, 'Oops!');//showing error toaster message
        });
  }

  //check login at our local system
  onSubmit() {

    if (this.loginForm.invalid) {
      return
    }
    if (this.loginForm.controls.remember_me)
       this.cookieService.set('seller_email', this.loginForm.controls.email.value)
     this.userAuthService.sellerLogin(this.loginForm.value)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response) => {

          if (response.body.is_email_verified == false) {
            this.router.navigate(['/seller/account-verify/' + response.body._id]);
          }
          // else if(!response.body.verified){
          //   this.router.navigate(['/seller/verify-email/'+response.headers.get('x-auth-token')])
          //   }
          else if (response.body.is_multifactor_authorized) {
            this.userResponse = response;
            this.loginByOtp();
          } else if (response.body.carCount == 0) {
            this.toastr.successToastr(environment.MESSAGES.LOGIN_SUCCESS, 'Success!');//showing success toaster message
            console.log('x-auth-token:' + response.headers.get('x-auth-token'))
            //save to local storage
            localStorage.setItem('loggedinUser', JSON.stringify(response.body))
            localStorage.setItem('loggedinUserId', response.body._id)
            localStorage.setItem('loggedinSellerUser', JSON.stringify(true))
            localStorage.setItem('x-auth-token', response.headers.get('x-auth-token'))

            this.userAuthService.isLoggedIn(true, 'Seller');//trigger loggedin observable 
            this.notificationService.setReload({ reload: true });//set service for reloading notification after getting chat

            this.router.navigate(['/seller/addnewcar'])
          }

          else {
            this.toastr.successToastr(environment.MESSAGES.LOGIN_SUCCESS, 'Success!');//showing success toaster message
            console.log('x-auth-token:' + response.headers.get('x-auth-token'))
            //save to local storage
            localStorage.setItem('loggedinUser', JSON.stringify(response.body))
            localStorage.setItem('loggedinUserId', response.body._id)
            localStorage.setItem('loggedinSellerUser', JSON.stringify(true))
            localStorage.setItem('x-auth-token', response.headers.get('x-auth-token'))

            this.userAuthService.isLoggedIn(true, 'Seller');//trigger loggedin observable         
            this.notificationService.setReload({ reload: true });//set service for reloading notification after getting chat

            this.router.navigate(['/seller/home']);
          }

        },
        error => {
          this.toastr.errorToastr(error, 'Oops!');//showing error toaster message
        });
  }



  // This method must be present, even if empty.
  ngOnDestroy() {
    // To protect you, we'll throw an error if it doesn't exist.
  }

}
