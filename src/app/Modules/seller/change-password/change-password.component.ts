import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Router } from "@angular/router";
import 'rxjs/add/operator/catch';
import { ToastrManager } from 'ng6-toastr-notifications';//toaster class
import { untilDestroyed } from 'ngx-take-until-destroy';// unsubscribe from observables when the  component destroyed
import { of, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
//import services
//import shared 
import { AlertService, PageLoaderService } from '../../../shared/_services'

//modules core services
import { UserAuthService, TitleService, CognitoUserService } from '../../../core/_services'

import { environment } from '../../../../environments/environment'

//import custom validators
import { CustomValidators } from '../../../core/custom-validators';

declare var $;


@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  @ViewChild("otpSection") otpSection: ElementRef;


  //define the component properties
  title: string = 'User Password Change';
  breadcrumbs: any[] = [{ page: 'Home', link: '/seller/home' }, { page: 'Profile', link: '/seller/seller-profile' }, { page: 'Change password', link: '' }]
  changePasswordForm: FormGroup;
  submitted: boolean = false;
  otpVerificationForm: FormGroup;
  showOtpForm: boolean = false;
  otpFormsubmitted: boolean = false;

  constructor(private alertService: AlertService, private userAuthService: UserAuthService, private pageLoaderService: PageLoaderService, private formBuilder: FormBuilder, private titleService: TitleService, private router: Router, private cognitoUserService: CognitoUserService, private toastr: ToastrManager) {

    this.initForgotPasswordForm();
  }

  ngOnInit() {

    this.titleService.setTitle();//setting page title 
  }


  //change password form
  private initForgotPasswordForm() {
    this.changePasswordForm = this.formBuilder.group({
      id: [localStorage.getItem('loggedinUserId')],
      previous_password: [
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
        ]), this.isPasswordCorrect.bind(this)
      ],
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
      repassword: [null, Validators.compose([Validators.minLength(10), Validators.maxLength(50), Validators.required])],
    },
      {
        // check whether our password and confirm password match
        validators: CustomValidators.passwordMatchValidator
      }
    );
  }




  //check the unique password on change

  isPasswordCorrect(control: AbstractControl): Promise<{ [key: string]: any } | null>
    | Observable<{ [key: string]: any } | null> {

    return this.userAuthService.sellerIsPasswordCorrect({ previous_password: control.value })
      .pipe(
        map(data => ({ isPasswordCorrect: true })),
        catchError(error => of(null))
      );
    return of(null);
  }

  //change password seller into our local db
  public onSubmit() {
    if (this.changePasswordForm.invalid) {
      return
    }

    this.userAuthService.changePassword(this.changePasswordForm.value)
      .subscribe(
        (response) => {

          this.pageLoaderService.pageLoader(false);//hide page loader

          this.toastr.successToastr(environment.MESSAGES.PASSWORD_RESET_SUCCESS, 'Success!');//showing success toaster
          this.changePasswordForm.reset();
          this._logout();
          this.router.navigate(['/seller/login']);
        },
        error => {
          console.log('error otp');
          this.toastr.errorToastr(environment.MESSAGES.SYSTEM_ERROR, 'Oops!');//showing error toaster message
        }
      );
  }



  private _logout() {

    localStorage.removeItem('loggedinUser');
    localStorage.clear();
    this.userAuthService.isLoggedIn(false, '');
    this.router.navigate(['/seller/login']);
    return false;
  }
  // This method must be present, even if empty.
  ngOnDestroy() {
    // To protect you, we'll throw an error if it doesn't exist.
  }


}
