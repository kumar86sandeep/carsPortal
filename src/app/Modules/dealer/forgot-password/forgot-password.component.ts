import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Router } from "@angular/router";
import 'rxjs/add/operator/catch';
import { ToastrManager } from 'ng6-toastr-notifications';//toaster class
import { untilDestroyed } from 'ngx-take-until-destroy';// unsubscribe from observables when the  component destroyed

//import services
  //import shared 
  import { AlertService, PageLoaderService } from '../../../shared/_services'

 //modules core services
 import { UserAuthService, TitleService, CognitoUserService } from '../../../core/_services'

import { environment } from '../../../../environments/environment'

//import custom validators
import { CustomValidators } from '../../../core/custom-validators';
import { log } from 'util';

declare var $;

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  @ViewChild("otpSection") otpSection: ElementRef;


  //define the component properties
  title: string = 'Password Reset';
  breadcrumbs: any[] = [{ page: 'Home', link: '' }, { page: 'Login', link: '/dealer/login' }, { page: 'Password Reset', link: '' }]
  forgotPasswordForm: FormGroup;
  submitted: boolean = false;
  forgotPasswordSubscription: Subscription;
  otpVerificationForm:FormGroup;
  showOtpForm: boolean = false;
  otpFormsubmitted: boolean = false;
  
  constructor(private alertService: AlertService, private userAuthService: UserAuthService, private pageLoaderService: PageLoaderService, private formBuilder: FormBuilder, private titleService: TitleService, private router: Router, private cognitoUserService:CognitoUserService, private toastr: ToastrManager) {

    this.initForgotPasswordForm();
    this.initOTPVerifyForm();
  }

  ngOnInit() {
   //if seller/dealer loggedin then redirect
   this.userAuthService.checkLoginAndRedirect();

   //setting the page title
   this.titleService.setTitle();
  }


  //otp verification form
  private initOTPVerifyForm(){
    this.otpVerificationForm = this.formBuilder.group({
      ConfirmationCode: [null, Validators.compose([Validators.required,Validators.minLength(6),Validators.maxLength(6),Validators.pattern('^[0-9 ]*$')])],
      ClientId:[environment.AWS.COGNITO.ClientId],
      password: [
        null,
        Validators.compose([
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(50),
          // check whether the entered password has a number
          CustomValidators.patternValidator(/\d/, {
            hasNumber: true
          }),
          // check whether the entered password has upper case letter
          CustomValidators.patternValidator(/[A-Z]/, {
            hasCapitalCase: true
          }),
          // check whether the entered password has a lower case letter
          CustomValidators.patternValidator(/[a-z]/, {
            hasSmallCase: true
          }),
          // check whether the entered password has a special character
          CustomValidators.patternValidator(
            /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
            {
              hasSpecialCharacters: true
            }
          ),
          Validators.minLength(10)
        ])
      ], 
      repassword: [null, Validators.compose([Validators.minLength(10),Validators.maxLength(50),Validators.required])],
    },
    {
      // check whether our password and confirm password match
      validators: CustomValidators.passwordMatchValidator
    })
  }
  //forgot password form
  private initForgotPasswordForm(){
    this.forgotPasswordForm = this.formBuilder.group({
      email: [null, [Validators.email, Validators.required]],
      password:[null]     
    }
    );
  }

/**
 * willbe invoked to forget the password
 */
  onSubmit():void {
    this.submitted = true;

    // stop here if form is invalid
    if (this.forgotPasswordForm.invalid) {
      return;
    }
    this.pageLoaderService.pageLoader(true);
    this.pageLoaderService.setLoaderText(environment.MESSAGES.CHECKING_INFO_LOADER_TEXT);//setting loader text
    
    //saving the dealer at aws user pool
    this.userAuthService.dealerForgotPassword(this.forgotPasswordForm.value)     
      .pipe(untilDestroyed(this))
      .subscribe(
        (response) => {          
          console.log('response',response)
          this.submitted = false;
          this.pageLoaderService.pageLoader(false);//hide page loader       
  
          //console.log('otpVerificationForm',this.otpVerificationForm.value)
          //this.pageLoaderService.setLoaderText('Registered...');//setting loader text  
         this.forgotPasswordForm.reset();
          this.toastr.successToastr(environment.MESSAGES.FORGOT_PASSWORD_SUCCESS, 'Success!');//showing success toaster
          
        },
        error => {
          this.submitted = false;
          this.pageLoaderService.setLoaderText(environment.MESSAGES.ERROR_TEXT_LOADER);//setting loader text
          this.pageLoaderService.pageLoader(false);//hide page loader
          this.toastr.errorToastr(error, 'Oops!');//showing error toaster message

        });
  }

  onSubmitOtp(){
    this.otpFormsubmitted = true;
    // stop here if form is invalid
    if (this.otpVerificationForm.invalid) {
      return;
    }   
    console.log('onsubmitotp',this.otpVerificationForm.value)
    //confirm dealer OTP code
    this.cognitoUserService.confirmForgotPasswordOtp(this.otpVerificationForm)     
      .pipe(untilDestroyed(this))      
      .subscribe(
        (response) => {  

          this.forgotPasswordForm.controls['password'].setValue(this.otpVerificationForm.controls['password'].value); 
          this.updatePassword();   

        },
        error => { 

          //console.log('error otp'); 
          this.otpVerificationForm.controls['ConfirmationCode'].setValue(''); 
          this.toastr.errorToastr(error, 'Oops!');//showing error toaster message

        });
  }


  // Resend OTP
  resendOTP(){
    this.submitted = true;

    // stop here if form is invalid
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.pageLoaderService.pageLoader(true);//show loader
    this.pageLoaderService.setLoaderText(environment.MESSAGES.PLS_WAIT_TEXT);//setting loader text
    
    this.cognitoUserService.forgotPassword(this.forgotPasswordForm.value)     
      .pipe(untilDestroyed(this))
      .subscribe(
        (response) => {    
          this.pageLoaderService.pageLoader(false);//hide page loader 
          this.toastr.successToastr(environment.MESSAGES.OTP_RESEND, 'Success!');//showing success toaster          
        },
        error => {
          //this.pageLoaderService.setLoaderText(environment.MESSAGES.ERROR_TEXT_LOADER);//setting loader text
          this.pageLoaderService.pageLoader(false);//hide page loader
          this.toastr.errorToastr(error, 'Oops!');//showing error toaster message
        });
  }

  //save dealer infor into our local db
  private updatePassword(){
    //console.log('dealer',this.signupForm.value);
    
    this.userAuthService.updateDealerPassword(this.forgotPasswordForm.value)  
    .subscribe(
      (response) => { 
        this.showOtpForm = false;
        $(this.otpSection.nativeElement).modal('hide'); 
              
        // this.pageLoaderService.setLoaderText('Registered...');//setting loader text
        this.pageLoaderService.pageLoader(false);//hide page loader
    
        this.toastr.successToastr(environment.MESSAGES.PASSWORD_RESET_SUCCESS, 'Success!');//showing success toaster
        //this.router.navigate(['/dealer/login']);
        this.forgotPasswordForm.reset();
        this.otpVerificationForm.reset();   
        this.router.navigate(['/dealer/login']);     
      },
      error => {
        //console.log('error', error);  
        this.toastr.errorToastr(environment.MESSAGES.SYSTEM_ERROR, 'Oops!');//showing error toaster message
      }
    );
  }

  verificationPopup(){
    this.showOtpForm = true;
    $(this.otpSection.nativeElement).modal({ backdrop: 'static', keyboard: false, show: true });
  }


  // This method must be present, even if empty.
  ngOnDestroy() {
    // To protect you, we'll throw an error if it doesn't exist.
  }


}
