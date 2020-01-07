import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Router, ActivatedRoute } from "@angular/router";
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
import { error } from '@angular/compiler/src/util';

declare var $;
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  @ViewChild("otpSection") otpSection: ElementRef;


  //define the component properties
  title: string = 'User Password Reset';
  breadcrumbs: any[] = [{ page: 'Home', link: '#' }, { page: 'Login', link: '/seller/login' }, { page: 'Forgot password', link: '' }]
  submitted: boolean = false;
  resetPasswordForm:FormGroup;
  resetFormsubmitted: boolean = false;
  authToken:any;
  email:any;
  constructor(private activatedRoute:ActivatedRoute, private alertService: AlertService, private userAuthService: UserAuthService, private pageLoaderService: PageLoaderService, private formBuilder: FormBuilder, private titleService: TitleService, private router: Router, private cognitoUserService:CognitoUserService, private toastr: ToastrManager) {

   
  }

  ngOnInit() {
    this.initResetForm();
   //if seller/dealer loggedin then redirect
   let self = this;
   this.userAuthService.checkLoginAndRedirect();

   this.activatedRoute.queryParams.subscribe((params) => {
    this.authToken = params['token'];
    this.userAuthService.verifySellerToken({token:this.authToken}).subscribe(response=>{
      self.email = response.email;
      // console.log('the email is ',response)

     
    },error=>{

    })
   })

   //setting the page title
   this.titleService.setTitle();
  }
  //otp verification form
  private initResetForm(){
    this.resetPasswordForm = this.formBuilder.group({
      email:[this.email],
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
 
 

  
 
    //save seller infor into our local db
 updatePassword(){
      this.resetFormsubmitted = true;
      console.log('seller',this.resetPasswordForm.value);
      this.resetPasswordForm.patchValue({
        email:this.email
      })
      if(this.resetPasswordForm.invalid)
          return
      this.userAuthService.updatePassword(this.resetPasswordForm.value)  
      .subscribe(
        (response) => { 
                
         // this.pageLoaderService.setLoaderText('Registered...');//setting loader text
          this.pageLoaderService.pageLoader(false);//hide page loader
      
          this.toastr.successToastr(environment.MESSAGES.PASSWORD_RESET_SUCCESS, 'Success!');//showing success toaster
          //this.router.navigate(['/seller/login']);
          this.resetPasswordForm.reset();
          // this.otpVerificationForm.reset();   
          this.router.navigate(['/seller/login']);     
        },
        error => {
          console.log('error otp');  
          this.toastr.errorToastr(environment.MESSAGES.SYSTEM_ERROR, 'Oops!');//showing error toaster message
        }
      );
    }

 


  // This method must be present, even if empty.
  ngOnDestroy() {
    // To protect you, we'll throw an error if it doesn't exist.
  }



}
