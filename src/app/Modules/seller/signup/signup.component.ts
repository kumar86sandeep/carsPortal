import { Component, OnInit, ElementRef, ViewChild, NgZone } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from "@angular/router";
import { AbstractControl, FormGroup, FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { of, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ToastrManager } from 'ng6-toastr-notifications';//toaster class
import { untilDestroyed } from 'ngx-take-until-destroy';// unsubscribe from observables when the  component destroyed
declare let $;

//import Lodash
import * as _ from 'lodash';

//import services

//shared services
import { AlertService, PageLoaderService } from '../../../shared/_services'

//modules core services
import { UserAuthService, TitleService, CognitoUserService, CommonUtilsService } from '../../../core/_services'

//import custom validators
import { CustomValidators } from '../../../core/custom-validators';


import { environment } from '../../../../environments/environment'

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  @ViewChild("otpSection") otpSection: ElementRef;

  //define default emails and phones formArrayName 
  data = {
    phones: [
      {
        phone: "",
        default: true,
        country_code: [environment.DEFAULT_COUNTRY_CODE]
      }
    ],
    emails: [
      {
        email: "",
        default: true
      }
    ]
  }

  private _sellerLocation:any = {}
  cities:any =[]
  title: string = 'Create Account';
  showOtpForm: boolean = false;
  breadcrumbs: any[] = [{ page: 'Home', link: '' }, { page: 'Create Account', link: '' }]
  signupForm: FormGroup;
  otpVerificationForm: FormGroup;
  submitted: boolean = false;
  otpFormsubmitted: boolean = false;
  registeredSellerid: string;

  constructor(private commonUtilsService: CommonUtilsService, private zone: NgZone, private cognitoUserService: CognitoUserService, private location: Location, private alertService: AlertService, private userAuthService: UserAuthService, private pageLoaderService: PageLoaderService, private formBuilder: FormBuilder, private titleService: TitleService, private toastr: ToastrManager, private router: Router) {

    this.buildSignupForm();    //form building calling function
    this.otpVerifyForm();


    let zipcodeFormControl = this.signupForm.controls.location.get('zipcode');
    zipcodeFormControl.valueChanges    
    .subscribe(zipcode => {  
      this.signupForm.controls.location.get('state').patchValue(''); 
      this.signupForm.controls.location.get('city').patchValue(''); 
      (zipcode && zipcode.length==5)?this.fetchCityStateOfZipcode(zipcode):''
    });
    
  }

  /**
   * private function to fetch city and state information of entered zipcode
   * @param zipcode number(entered zipcode from clientside)
   * @return  void
  */
 private fetchCityStateOfZipcode(zipcode):void{
  this.commonUtilsService.fetchCityStateOfZipcode(zipcode)
    .subscribe(
    (response) => { 
      console.log(!_.has(response[0],['status']))
      if(!_.has(response[0],['status'])){
        //console.log(response)
        this.cities = response[0]['city_states'];
        let cityState = response[0]['city_states'][0]        
        cityState['coordinates'] = [response[0]['zipcodes'][0]['longitude'],response[0]['zipcodes'][0]['latitude']]    
        
        //console.log('cityState', cityState);
        this.sellerLocation =  cityState    
      }else{
        this.signupForm.controls.location.get('zipcode').patchValue(''); 
        this.commonUtilsService.onError('Could not fetch city, state data for zip code.');
      }       
    },
    error => {        
      this.signupForm.controls.location.get('zipcode').patchValue(''); 
      this.commonUtilsService.onError('Could not fetch city, state data for zip code.');
    });  
}

/**
  * get vehicle to be picked up value.
  * @return  any
  */
 get sellerLocation(): any {
  return this._sellerLocation;
}

/**
* set vehicle to be picked up value.
* @param vehicleLocation  object of key:value
*/
set sellerLocation(sellerLocation: any){
  this._sellerLocation = sellerLocation;  
  this.signupForm.get('location').patchValue(this._sellerLocation); 
  //console.log('form value location',this.signupForm.get('location').value)
}



  private otpVerifyForm() {
    this.otpVerificationForm = this.formBuilder.group({
      ConfirmationCode: [null, Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern('^[0-9 ]*$')])],
      ClientId: [environment.AWS.COGNITO.ClientId],
      Username: [null]
    })
  }
  //Signup form building 
  private buildSignupForm() {
    this.signupForm = this.formBuilder.group({
      //sellerId:[null],
      username: [null],
      name: this.formBuilder.group({
        prefix: [''],
        first_name: [null, Validators.compose([Validators.required,Validators.minLength(2),Validators.maxLength(50),Validators.pattern('^[a-zA-Z ]*$')])],
        last_name: [null, Validators.compose([Validators.required,Validators.minLength(2),Validators.maxLength(50),Validators.pattern('^[a-zA-Z ]*$')])],

      }),
      location:this.formBuilder.group({
        zipcode: [null, Validators.compose([Validators.required,Validators.pattern('^[0-9]{5}$')])],
        state: [null],
        state_abbreviation: [null],        
        city: [null],
        coordinates:[null]
      }),   
      phones: this.formBuilder.array([], Validators.required),
      emails: this.formBuilder.array([], Validators.required),
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
      verified: [false],
      active: [true],

    },
      {
        // check whether our password and confirm password match
        validators: CustomValidators.passwordMatchValidator
      }
    );
  }
  ngOnInit() {

    //if seller/dealer loggedin then redirect
    this.userAuthService.checkLoginAndRedirect();

    //setting the page title
    this.titleService.setTitle();

    this.setPhones();
    this.setEmails();
     this.signupForm.patchValue({name:
      {first_name:localStorage.getItem('firstName'),last_name:localStorage.getItem('lastName')}
    
    });
    var formArray = this.signupForm.get("emails") as FormArray;
    formArray.at(0)["controls"]["email"].patchValue(localStorage.getItem('email'));
    //remove the localstorage value which store when login using social media
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName')
    localStorage.removeItem('email')

  }

  /*
   Email and phone uniqueness funcitons
  */
  //check the unique email on change

  private isEmailUnique(control: AbstractControl): Promise<{ [key: string]: any } | null>
    | Observable<{ [key: string]: any } | null> {

    return this.userAuthService.sellerEmailExist({ email: control.value })
      .pipe(
        map(data => ({ emailTaken: true })),
        catchError(error => of(null))
      );
    return of(null);
  }

  //check the unique phone number on change
  private isPhoneNumberUnique(control: AbstractControl): Promise<{ [key: string]: any } | null>
    | Observable<{ [key: string]: any } | null> {
    return this.userAuthService.sellerPhoneNumberExist({ phone: control.value })
      .pipe(
        map(data => ({ phoneNumberTaken: true })),
        catchError(error => of(null))
      );
    return of(null);
  }
  /*
  Set phone and email clone object only single time
  */
  private setEmails() {
    let control = <FormArray>this.signupForm.controls.emails;
    this.data.emails.forEach(x => {
      control.push(this.formBuilder.group({
        email: [null, [Validators.email, Validators.required], this.isEmailUnique.bind(this)],
        default: [true],
      })
      )
    })
  }

  private setPhones() {
    let control = <FormArray>this.signupForm.controls.phones;
    this.data.phones.forEach(x => {
      control.push(this.formBuilder.group({
        phone: [null, Validators.compose([
          Validators.required,
          // check whether the entered password has a special character
          CustomValidators.patternValidator(
            /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
            {
              validPhone: true
            }
          ),
        ]),
          this.isPhoneNumberUnique.bind(this)
        ],
        country_code: [environment.DEFAULT_COUNTRY_CODE],
        default: [true],
      })
      )
    })
  }



  goBack() {
    this.location.back();
  }

  // //submit the signup form
  onSubmit() {

    this.submitted = true;

    // stop here if form is invalid
    if (this.signupForm.invalid) {
      return;
    }

    this.pageLoaderService.pageLoader(true);//start showing page loader
    this.pageLoaderService.setLoaderText('Registering seller...');//setting loader text
   
    //saving the seller at aws user pool
    /*this.cognitoUserService.signup(this.signupForm.value)     
      .pipe(untilDestroyed(this))
      .subscribe(
        (response) => {
          console.log('username', response['username'])
          this.showPopup(); //open verification popup

          this.pageLoaderService.pageLoader(false);//hide page loader       
          this.signupForm.controls['username'].setValue(response['username']);

          this.otpVerificationForm.controls['Username'].setValue(response['username']);
          console.log('otpVerificationForm', this.otpVerificationForm.value)
          this.pageLoaderService.setLoaderText('Registered...');//setting loader text       
          this.toastr.successToastr(environment.MESSAGES.VERIFICATION_PENDING, 'Success!');//showing success toaster

        },
        error => {

          this.pageLoaderService.setLoaderText(environment.MESSAGES.ERROR_TEXT_LOADER);//setting loader text
          this.pageLoaderService.pageLoader(false);//hide page loader
          this.toastr.errorToastr(error, 'Oops!');//showing error toaster message

        });*/
  }

  private showPopup() {
    this.showOtpForm = true;
    $(this.otpSection.nativeElement).modal({ backdrop: 'static', keyboard: false, show: true });
  }
  // hide POpup
  private hidePopup() {
    this.showOtpForm = false;
    $(this.otpSection.nativeElement).modal('hide');
  }

  onSubmitOtp() {
    this.otpFormsubmitted = true;
    // stop here if form is invalid
    if (this.otpVerificationForm.invalid) {
      return;
    }
    console.log('onsubmitotp', this.otpVerificationForm.value)
    //confirm seller OTP code
    this.cognitoUserService.confirmSignupOtp(this.otpVerificationForm.value)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response) => {

          this.saveSeller();
          //this.activateVerifySeller();


        },
        error => {
          console.log('error otp');
          this.otpVerificationForm.controls['ConfirmationCode'].setValue('');
          this.toastr.errorToastr(error, 'Oops!');//showing error toaster message
        });
  }

  //save seller infor into our local db
  saveSeller() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.signupForm.invalid) {
      return;
    }

    console.log('signup', this.signupForm.value)
    //generate user name from email and set in the signup form  
    let username = this.commonUtilsService.getUsername(this.signupForm.value.emails[0].email);
    this.signupForm.controls.username.setValue(username);
    this.userAuthService.sellerSignup(this.signupForm.value)
      .subscribe(
        (response) => {
          this.hidePopup() //hide popup

          this.pageLoaderService.setLoaderText('Registered...');//setting loader text
          this.pageLoaderService.pageLoader(false);//hide page loader

          this.toastr.successToastr('The account verification link has been sent to your email id. Kindly verify!', 'Success!');//showing success toaster
          this.router.navigate(['/seller/verification-pending']);
          this.signupForm.reset();
          this.otpVerificationForm.reset();
        },
        error => {

          this.hidePopup() //hide popup
          // Delete User from AWS Congnito too..
          this.deleteDealerFromAWSCognito(this.otpVerificationForm.controls['Username'].value);

          this.pageLoaderService.setLoaderText(environment.MESSAGES.ERROR_TEXT_LOADER);//setting loader text
          this.pageLoaderService.pageLoader(false);//hide page loader
          //this.alertService.setAlert('error', error);
          this.toastr.errorToastr(environment.MESSAGES.FAILED_TO_REGISTER, 'Oops!');//showing error toaster message
          this.router.navigate(['/seller/signup']);

        }
      );
  }
  private deleteDealerFromAWSCognito(u) {
    this.cognitoUserService.deleteUser(u)
      .pipe()
      .subscribe(
        (response) => { },
        error => { });
  }



  //update seller as activate and verified seller for login process
  /*private activateVerifySeller(){
    this.userAuthService.verifyActivateSeller( { id:this.signupForm.controls['sellerId'].value })
    .pipe(untilDestroyed(this))
    .subscribe(
      (response) => { 
        console.log('seller local db:',response);             
       // this.registeredSellerid = response._id;
        //console.log('registeredSellerid',this.registeredSellerid);
      },
      error => {
   
      }
    );
  }*/

  resendOTP() {
    //confirm seller OTP code
    this.pageLoaderService.setLoaderText(environment.MESSAGES.GENERATING_OTP);//setting loader text
    this.pageLoaderService.pageLoader(true);//show page loader

    this.cognitoUserService.resendSignupOTP()
      .subscribe(
        (response) => {
          this.pageLoaderService.pageLoader(false);//hide page loader
          this.toastr.successToastr(environment.MESSAGES.OTP_RESEND, 'Success!'); //showing success toaster          


        },
        error => {
          console.log('error otp');
          //this.toastr.errorToastr(error, 'Oops!');//showing error toaster message
          this.toastr.errorToastr(environment.MESSAGES.OTP_FAILED_RESEND, 'Oops!');//showing error toaster message
        });
  }

  // This method must be present, even if empty.
  ngOnDestroy() {
    // To protect you, we'll throw an error if it doesn't exist.
  }

}