import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation, NgZone } from '@angular/core';
import { Location } from '@angular/common';
//import { TranslateService } from '@ngx-translate/core';
import { AbstractControl, FormBuilder, FormArray, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from "@angular/router";
import { Subscription } from 'rxjs/Subscription';
import { of, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MovingDirection } from 'angular-archwizard';
import { ToastrManager } from 'ng6-toastr-notifications';//toaster class
import { untilDestroyed } from 'ngx-take-until-destroy';// unsubscribe from observables when the  component destroyed
import { DropzoneComponent, DropzoneDirective, DropzoneConfigInterface } from 'ngx-dropzone-wrapper';

//import shared services
import { AlertService, PageLoaderService } from '../../../shared/_services'

//import core services
import { UserAuthService, TitleService, CognitoUserService, CommonUtilsService } from '../../../core/_services';

//import core services
import { CustomValidators } from '../../../core/custom-validators';

import { environment } from '../../../../environments/environment'

//import Lodash
import * as _ from 'lodash';


declare let jQuery: any;
declare let $: any;
declare let POTENZA: any;
declare let ZFWidget: any;


export class MyItems {
  legalcoroporationname: string;
  dealershipnumber: string;
  reseller_permit_number: string;
  mainaddressline1: string;
  mainaddressline2: string;
  state: string;
  city: string;
  zip: string;
  constructor(legalcoroporationname: string, dealershipnumber: string, reseller_permit_number: string, mainaddressline1: string, mainaddressline2: string, state: string, city: string, zip: string) {
    this.legalcoroporationname = legalcoroporationname;
    this.dealershipnumber = dealershipnumber;
    this.reseller_permit_number = reseller_permit_number;
    this.mainaddressline1 = mainaddressline1;
    this.mainaddressline2 = mainaddressline2;
    this.state = state;
    this.city = city;
    this.zip = zip;
  }
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SignupComponent implements OnInit {
  // OTP Popup
  @ViewChild("otpSection") otpSection: ElementRef;


  // Array where we are going to do CRUD operations
  dealershipsItems: MyItems[] = new Array();

  // Other variables for CRUD operations
  IsForUpdate: boolean = false;
  updatedItem;
  dealershipList: any = [];

  // Redirect To Form
  @ViewChild("contentSection") contentSection: ElementRef;

  title: string = 'Create Account';
  breadcrumbs: any = [{ page: 'Home', link: '' }, { page: 'Create Account', link: '' }]

  // TimePicker
  time = { hour: 13, minute: 30, second: 0 };
  spinners = true;
  meridian = false;
  private _dealerLocation:any = {}
  private _dealershipLocation:any = {}


  // SignUp Form
  dealershipTypeWizard: FormGroup;
  accountOwnerWizard: FormGroup;
  signUpFormStep2: FormGroup;
  signUpFormStep3: FormGroup;

  step3submitted: boolean = false;
  step2submitted: boolean = false;
  step1submitted: boolean = false;
  isdealershipTypeWizardSubmitted: boolean = false;

  isIndependentSelected:boolean = false;
  base64StringFile:any;
  disabled= false;
  signupSubscription: Subscription;
  usPhonePattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$";
  

  // two factor Authentication
  showOtpForm: boolean = false;
  otpVerificationForm: FormGroup;
  otpFormsubmitted: boolean = false;
  registeredSellerid: string;
  cities:any = []
  dealershipCities:any = []
  //define default emails and phones formArrayName 
  step1data = {
    phones: [
      {
        phone: "",
        country_code: "+91",
        default: true
      }
    ],
    emails: [
      {
        email: "",
        default: true
      }
    ]
  }

  goForProEnabled:boolean = false;
  membershipType:string = 'free';

  // Declare DropZone Variables  
  dropzoneUpload: boolean = false;
  public dealerBondDocumentsConfiguration:DropzoneConfigInterface;
  public dealerResaleNumberConfiguration:DropzoneConfigInterface;
  public dealerRetailDMVLicenseConfiguration:DropzoneConfigInterface;

  // Reset Dropzone
  @ViewChild(DropzoneComponent) componentRef?: DropzoneComponent;
  @ViewChild(DropzoneDirective) directiveRef?: DropzoneDirective; 

  constructor(private zone: NgZone,private commonUtilService:CommonUtilsService, private cognitoUserService: CognitoUserService, private location: Location, private alertService: AlertService, private userAuthService: UserAuthService, private pageLoaderService: PageLoaderService, private formBuilder: FormBuilder, private titleService: TitleService, private toastr: ToastrManager, private router: Router) {
    this.buildSignupForm();    //Sign Up Wizard
    this.otpVerifyForm();
    this.dealerBondDocumentsDropzoneInit();
    this.dealerRetailDMVLicenseDropzoneInit();
    this.dealerResaleNumberDropzoneInit();
    let zipcodeFormControl = this.accountOwnerWizard.controls.location.get('zipcode');
    zipcodeFormControl.valueChanges    
    .subscribe(zipcode => {  
      this.accountOwnerWizard.controls.location.get('state').patchValue(''); 
      this.accountOwnerWizard.controls.location.get('city').patchValue(''); 
      this.resetDealerCities();
      ((zipcode) && (zipcode.length==5))?this.fetchCityStateOfZipcode(zipcode):''
    });


   

  }

/**
* Reset dealer cities
*/
resetDealerCities():void{
  this.cities = [];
}

/**
* Reset dealership cities
*/
resetDealershipCities():void{
  this.dealershipCities = [];  
}
/**
 * private function to fetch city and state information of entered zipcode
 * @param zipcode number(entered zipcode from clientside)
 * @return  void
*/
 private fetchCityStateOfZipcode(zipcode):void{
  this.commonUtilService.fetchCityStateOfZipcode(zipcode)
    .subscribe(
    (response) => { 
      console.log(!_.has(response[0],['status']))
      if(!_.has(response[0],['status'])){
        console.log(response)
        this.cities = response[0]['city_states'];
        let cityState = response[0]['city_states'][0]       
        cityState['coordinates'] = [response[0]['zipcodes'][0]['longitude'],response[0]['zipcodes'][0]['latitude']]            
        this.dealerLocation =  cityState

      }else{
        this.accountOwnerWizard.controls.location.get('zipcode').patchValue(''); 
        this.commonUtilService.onError('Could not fetch city, state data for zip code.');
      }       
    },
    error => {        
      this.accountOwnerWizard.controls.location.get('zipcode').patchValue(''); 
      this.commonUtilService.onError('Could not fetch city, state data for zip code.');
    });  
}

fetchCityState(zipcode){
    
  if((zipcode) && zipcode.length==5){
    this.signUpFormStep2.get('dealerships').get('location').get('state').patchValue(''); 
      this.signUpFormStep2.get('dealerships').get('location').get('city').patchValue(''); 
      this.resetDealershipCities();
      (zipcode.length==5)?this.fetchCityStateOfDealershipZipcode(zipcode):''
  }
    
 
}

/**
  * Initialize Dropzone Library(Image Upload).
  */
 private dealerRetailDMVLicenseDropzoneInit(){
  const componentObj = this;
  this.dealerRetailDMVLicenseConfiguration = {       
  clickable: true,
  paramName: "file",
  uploadMultiple: false,
  url: environment.API_ENDPOINT + "/api/common/imageUploadtoBucket",
  maxFiles: 1,
  autoReset: null,
  errorReset: null,
  cancelReset: null,
  acceptedFiles: '.jpg, .png, .jpeg, .pdf',
  maxFilesize: 2, // MB,
  dictDefaultMessage: '<span class="button red">Retail DMV License</span>',  
  addRemoveLinks: true,  
  dictInvalidFileType: 'Only valid jpeg, jpg, png and pdf file is accepted.',
  dictFileTooBig: 'Maximum upload file size limit is 2MB',
  dictCancelUpload: '<i class="fa fa-times" aria-hidden="true"></i>',
  dictRemoveFile: '<i class="fa fa-times" aria-hidden="true"></i>',
  headers: {
    'Cache-Control': null,
    'X-Requested-With': null,
  },  

    accept: function(file, done) {        
        

        if((componentObj.retailDMVLicenseImagesArray.length +1) > 1){
            componentObj.commonUtilService.onError('You cannot upload any more files.');
            this.removeFile(file);
            return false;
        }

        const reader = new FileReader();
        const _this = this
        reader.onload = function(event) {  
                     
            let base64String = reader.result      
            let fileExtension = (file.name).split('.').pop();

            componentObj.base64StringFile = reader.result;
            if(fileExtension == "pdf"){
              componentObj.base64StringFile = componentObj.base64StringFile.replace('data:application/pdf;base64,', '');
            }
            
            
           const isValidFile = componentObj.commonUtilService.isFileCorrupted(base64String,_.toLower(fileExtension))              
            if(!isValidFile){
              done('File is corrupted or invalid.');
              _this.removeFile(file);
              return false;
            }
           

            componentObj.pageLoaderService.pageLoader(true);//start showing page loader
            done();             
                     
        };
        reader.readAsDataURL(file); 
    },    
    init: function() { 
              
      
      this.on('sending', function(file, xhr, formData){     
           
        formData.append('folder', 'OfferInHands');
        formData.append('fileType', file.type);
        formData.append('base64StringFile', componentObj.base64StringFile);
      });
      

      this.on("totaluploadprogress",function(progress){          
        componentObj.pageLoaderService.pageLoader(true);//start showing page loader
        componentObj.pageLoaderService.setLoaderText('Uploading file '+parseInt(progress)+'%');//setting loader text
        if(progress>=100){
          componentObj.pageLoaderService.pageLoader(false); //hide page loader
        }
      })
     
      this.on("success", function(file, serverResponse) {  
        
        
        componentObj.zone.run(() => { 
          componentObj.retailDMVLicenseImagesArray.push(new FormControl({file_path : serverResponse.fileLocation, file_name : serverResponse.fileName, file_key : serverResponse.fileKey, file_mimetype : serverResponse.fileMimeType, file_category : 'dealership_retail_DMV_documents'}));
        });

        this.removeFile(file);

        componentObj.pageLoaderService.pageLoader(false); //hide page loader
      });

      this.on("error", function(file, serverResponse) { 
        this.removeFile(file);              
        componentObj.pageLoaderService.pageLoader(false);//hide page loader  
        componentObj.toastr.errorToastr(serverResponse, 'Oops!');         
      });

    }     
  };
}


/**
  * Initialize Dropzone Library(Image Upload).
  */
 private dealerResaleNumberDropzoneInit(){
  const componentObj = this;
  this.dealerResaleNumberConfiguration = {       
  clickable: true,
  paramName: "file",
  uploadMultiple: false,
  url: environment.API_ENDPOINT + "/api/common/imageUploadtoBucket",
  maxFiles: 1,
  autoReset: null,
  errorReset: null,
  cancelReset: null,
  acceptedFiles: '.jpg, .png, .jpeg, .pdf',
  maxFilesize: 2, // MB,
  dictDefaultMessage: '<span class="button red">Resale Number</span>',  
  addRemoveLinks: true,  
  dictInvalidFileType: 'Only valid jpeg, jpg, png and pdf file is accepted.',
  dictFileTooBig: 'Maximum upload file size limit is 2MB',
  dictCancelUpload: '<i class="fa fa-times" aria-hidden="true"></i>',
  dictRemoveFile: '<i class="fa fa-times" aria-hidden="true"></i>',
  headers: {
    'Cache-Control': null,
    'X-Requested-With': null,
  },  

    accept: function(file, done) {        
        

        if((componentObj.resaleNumberImagesArray.length +1) > 1){
            componentObj.commonUtilService.onError('You cannot upload any more files.');
            this.removeFile(file);
            return false;
        }

        const reader = new FileReader();
        const _this = this
        reader.onload = function(event) {  
                     
            let base64String = reader.result      
            let fileExtension = (file.name).split('.').pop();

            componentObj.base64StringFile = reader.result;
            if(fileExtension == "pdf"){
              componentObj.base64StringFile = componentObj.base64StringFile.replace('data:application/pdf;base64,', '');
            }
            
            
           const isValidFile = componentObj.commonUtilService.isFileCorrupted(base64String,_.toLower(fileExtension))              
            if(!isValidFile){
              done('File is corrupted or invalid.');
              _this.removeFile(file);
              return false;
            }
           

            componentObj.pageLoaderService.pageLoader(true);//start showing page loader
            done();             
                     
        };
        reader.readAsDataURL(file); 
    },    
    init: function() { 
              
      
      this.on('sending', function(file, xhr, formData){     
           
        formData.append('folder', 'OfferInHands');
        formData.append('fileType', file.type);
        formData.append('base64StringFile', componentObj.base64StringFile);
      });
      

      this.on("totaluploadprogress",function(progress){          
        componentObj.pageLoaderService.pageLoader(true);//start showing page loader
        componentObj.pageLoaderService.setLoaderText('Uploading file '+parseInt(progress)+'%');//setting loader text
        if(progress>=100){
          componentObj.pageLoaderService.pageLoader(false); //hide page loader
        }
      })
     
      this.on("success", function(file, serverResponse) {  
        
        
        componentObj.zone.run(() => { 
          componentObj.resaleNumberImagesArray.push(new FormControl({file_path : serverResponse.fileLocation, file_name : serverResponse.fileName, file_key : serverResponse.fileKey, file_mimetype : serverResponse.fileMimeType, file_category : 'dealership_resale_number_documents'}));
        });

        this.removeFile(file);

        componentObj.pageLoaderService.pageLoader(false); //hide page loader
      });

      this.on("error", function(file, serverResponse) { 
        this.removeFile(file);              
        componentObj.pageLoaderService.pageLoader(false);//hide page loader  
        componentObj.toastr.errorToastr(serverResponse, 'Oops!');         
      });

    }     
  };
}

/**
  * Initialize Dropzone Library(Image Upload).
  */
 private dealerBondDocumentsDropzoneInit(){
  const componentObj = this;
  this.dealerBondDocumentsConfiguration = {       
  clickable: true,
  paramName: "file",
  uploadMultiple: false,
  url: environment.API_ENDPOINT + "/api/common/imageUploadtoBucket",
  maxFiles: 1,
  autoReset: null,
  errorReset: null,
  cancelReset: null,
  acceptedFiles: '.jpg, .png, .jpeg, .pdf',
  maxFilesize: 2, // MB,
  dictDefaultMessage: '<span class="button red">Dealer Bond</span>',  
  addRemoveLinks: true,  
  dictInvalidFileType: 'Only valid jpeg, jpg, png and pdf file is accepted.',
  dictFileTooBig: 'Maximum upload file size limit is 2MB',
  dictCancelUpload: '<i class="fa fa-times" aria-hidden="true"></i>',
  dictRemoveFile: '<i class="fa fa-times" aria-hidden="true"></i>',
  headers: {
    'Cache-Control': null,
    'X-Requested-With': null,
  },  

    accept: function(file, done) {        
        

        if((componentObj.bondDocumentImagesArray.length +1) > 1){
            componentObj.commonUtilService.onError('You cannot upload any more files.');
            this.removeFile(file);
            return false;
        }

        const reader = new FileReader();
        const _this = this
        reader.onload = function(event) {  
                     
            let base64String = reader.result      
            let fileExtension = (file.name).split('.').pop();

            componentObj.base64StringFile = reader.result;
            if(fileExtension == "pdf"){
              componentObj.base64StringFile = componentObj.base64StringFile.replace('data:application/pdf;base64,', '');
            }
            
            
           const isValidFile = componentObj.commonUtilService.isFileCorrupted(base64String,_.toLower(fileExtension))              
            if(!isValidFile){
              done('File is corrupted or invalid.');
              _this.removeFile(file);
              return false;
            }
           

            componentObj.pageLoaderService.pageLoader(true);//start showing page loader
            done();             
                     
        };
        reader.readAsDataURL(file); 
    },    
    init: function() { 
              
      
      this.on('sending', function(file, xhr, formData){     
           
        formData.append('folder', 'OfferInHands');
        formData.append('fileType', file.type);
        formData.append('base64StringFile', componentObj.base64StringFile);
      });
      

      this.on("totaluploadprogress",function(progress){          
        componentObj.pageLoaderService.pageLoader(true);//start showing page loader
        componentObj.pageLoaderService.setLoaderText('Uploading file '+parseInt(progress)+'%');//setting loader text
        if(progress>=100){
          componentObj.pageLoaderService.pageLoader(false); //hide page loader
        }
      })
     
      this.on("success", function(file, serverResponse) {  
        
        
        componentObj.zone.run(() => { 
          componentObj.bondDocumentImagesArray.push(new FormControl({file_path : serverResponse.fileLocation, file_name : serverResponse.fileName, file_key : serverResponse.fileKey, file_mimetype : serverResponse.fileMimeType, file_category : 'dealer_bond_documents'}));
        });

        this.removeFile(file);

        componentObj.pageLoaderService.pageLoader(false); //hide page loader
      });

      this.on("error", function(file, serverResponse) { 
        this.removeFile(file);              
        componentObj.pageLoaderService.pageLoader(false);//hide page loader  
        componentObj.toastr.errorToastr(serverResponse, 'Oops!');         
      });

    }     
  };
}

/**
   * remove Vehicle Image
   * @param index index of the image array
   * @return  boolean
   */
  removeImage(index, file_category, file_key): void {
    if(file_category == 'bondocument'){ this.bondDocumentImagesArray.removeAt(index); } 
    if(file_category == 'resaleNumberDocument'){ this.resaleNumberImagesArray.removeAt(index); } 
    if(file_category == 'retailDMVLicenseDocument'){ this.retailDMVLicenseImagesArray.removeAt(index); } 
    this.removeImageFromBucket(file_key);
  }

  /**
   * remove image from AWS Bucket
   * @param imagePath image url
   * @param bucket s3 bucket name
   */
  removeImageFromBucket(file_key){    
    this.commonUtilService.showPageLoader('Removing File...');

    const params = { fileKey : file_key }

    this.commonUtilService.removeImageFromBucket(params)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response) => {
          this.commonUtilService.onSuccess('File has been removed successfully.');                 
        },
        error => {
          this.commonUtilService.onError(error);
        });
  }


/**
 * private function to fetch city and state information of entered zipcode
 * @param zipcode number(entered zipcode from clientside)
 * @return  void
*/
private fetchCityStateOfDealershipZipcode(zipcode):void{
  this.commonUtilService.fetchCityStateOfZipcode(zipcode)
    .subscribe(
    (response) => { 
      console.log(!_.has(response[0],['status']))
      if(!_.has(response[0],['status'])){
        console.log(response)
        this.dealershipCities = response[0]['city_states'];
        console.log('dealershipCities',this.dealershipCities);
        let cityState = response[0]['city_states'][0]       
        cityState['coordinates'] = [response[0]['zipcodes'][0]['longitude'],response[0]['zipcodes'][0]['latitude']]            
        this.dealershipLocation =  cityState

      }else{
        this.signUpFormStep2.get('dealerships').get('location').get('zipcode').patchValue(''); 
        this.commonUtilService.onError('Could not fetch city, state data for zip code.');
      }       
    },
    error => {        
      this.signUpFormStep2.get('dealerships').get('location').get('zipcode').patchValue(''); 
      this.commonUtilService.onError('Could not fetch city, state data for zip code.');
    });  
}

/**
  * get vehicle to be picked up value.
  * @return  any
  */
 get dealerLocation(): any {
  return this._dealerLocation;
}

/**
* set vehicle to be picked up value.
* @param dealerLocation  object of key:value
*/
set dealerLocation(dealerLocation: any){
  this._dealerLocation = dealerLocation;  
  this.accountOwnerWizard.get('location').patchValue(this._dealerLocation); 
  console.log('form value location',this.accountOwnerWizard.get('location').value)
}


/**
  * get vehicle to be picked up value.
  * @return  any
  */
 get dealershipLocation(): any {
  return this._dealershipLocation;
}

/**
* set vehicle to be picked up value.
* @param dealershipLocation  object of key:value
*/
set dealershipLocation(dealershipLocation: any){
  this._dealershipLocation = dealershipLocation;  
  this.signUpFormStep2.get('dealerships').get('location').patchValue(this._dealershipLocation); 
  //console.log('form value location',this.signUpFormStep2.get('dealerships').get('location').value)
}


  // Signup WIZARD
  private buildSignupForm() {

    this.dealershipTypeWizard = this.formBuilder.group({
      membership_type:['free'],
      dealership_type: ['Franchise', Validators.compose([Validators.required])],
      dealership_bond:this.formBuilder.group({
        dealership_bond_explanation: [''],     
        dealership_bond_documents: this.formBuilder.array([]),       
        dealership_resale_number_documents: this.formBuilder.array([]),       
        dealership_retail_DMV_documents: this.formBuilder.array([]),       
      }) 
    });

    this.accountOwnerWizard = this.formBuilder.group({
      username: [null],
      name: this.formBuilder.group({
        prefix: [''],
        first_name: [null, Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern('^[a-zA-Z ]*$')])],
        last_name: [null, Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern('^[a-zA-Z ]*$')])],

      }),
      phones: this.formBuilder.array([], Validators.required),
      emails: this.formBuilder.array([], Validators.required),
      title: ['', [Validators.required]],
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
          )
        ])
      ],
      repassword: [null, Validators.compose([Validators.minLength(10),Validators.maxLength(50),Validators.required])],
      location:this.formBuilder.group({
        zipcode: [null, Validators.compose([Validators.required,Validators.pattern('^[0-9]{5}$')])],
        state: [''],
        city: [''],
        coordinates:[null]
      }), 
      is_approved_by_admin: [false],
      active: [true],     
    },{
      // check whether our password and confirm password match
      validators: CustomValidators.passwordMatchValidator
    });

    this.signUpFormStep2 = this.formBuilder.group({
      dealerships: this.formBuilder.group({
        legalcoroporationname: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
        dealershipnumber: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
        reseller_permit_number: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
        mainaddressline1: ['', [Validators.required]],
        mainaddressline2: [''],
        location:this.formBuilder.group({
          zipcode: [null, Validators.compose([Validators.required,Validators.pattern('^[0-9]{5}$')])],
          state: [''],
          city: [''],
          coordinates:[null]
        })
      })
    });

    //console.log(this.signUpFormStep2)
    this.signUpFormStep3 = this.formBuilder.group({
      availabilitydate: ['', [Validators.required]],
      time: [this.time, Validators.required],
      timezone: ['', [Validators.required]],
      language: ['', [Validators.required]]
    });
  }

  // OTP VERIFY FORM
  private otpVerifyForm() {
    this.otpVerificationForm = this.formBuilder.group({
      ConfirmationCode: [null, Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern('^[0-9 ]*$')])],
      ClientId: [environment.AWS.COGNITO.ClientId],
      Username: [null]
    })
  }


  //check the unique email on change

  isEmailUnique(control: AbstractControl): Promise<{ [key: string]: any } | null>
    | Observable<{ [key: string]: any } | null> {

    return this.userAuthService.dealerEmailExist({ email: control.value })
      .pipe(
        map(data => ({ emailTaken: true })),
        catchError(error => of(null))
      );
    return of(null);
  }
  //check the unique phone number on change
  isPhoneNumberUnique(control: AbstractControl): Promise<{ [key: string]: any } | null>
    | Observable<{ [key: string]: any } | null> {
    return this.userAuthService.dealerPhoneNumberExist({ phone: control.value })
      .pipe(
        map(data => ({ phoneNumberTaken: true })),
        catchError(error => of(null))
      );
    return of(null);
  }


  setEmails() {
    let control = <FormArray>this.accountOwnerWizard.controls.emails;
    this.step1data.emails.forEach(x => {
      control.push(this.formBuilder.group({
        email: ['', [Validators.email, Validators.required], this.isEmailUnique.bind(this)],
        default: [true],
      })
      )
    })
    console.log('control', control)
  }

  setPhones() {
    let control = <FormArray>this.accountOwnerWizard.controls.phones;
    this.step1data.phones.forEach(x => {
      control.push(this.formBuilder.group({
        phone: ['', Validators.compose([
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
        default: [true],
        country_code: [environment.DEFAULT_COUNTRY_CODE],
      })
      )
    })
  }

  moveDirection = (validityStatus, direction) => {
    if (direction === MovingDirection.Backwards) {
      return true;
    }
    return validityStatus;
  };

  scrollToSpecificDiv(direction: MovingDirection): void {
    this.contentSection.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }


  ngOnInit() {    

    //if seller/dealer loggedin then redirect
    this.userAuthService.checkLoginAndRedirect();

    //setting the page title
    this.titleService.setTitle();

    this.contentSection.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });
    this.setPhones();
    this.setEmails();

    this.accountOwnerWizard.patchValue({name:
      {first_name:localStorage.getItem('firstName'),last_name:localStorage.getItem('lastName')}
    
    });
    var formArray = this.accountOwnerWizard.get("emails") as FormArray;
    formArray.at(0)["controls"]["email"].patchValue(localStorage.getItem('email'));
    //remove the localstorage value which store when login using social media
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName')
    localStorage.removeItem('email')

  }

  private loadZohoScript(): void {

      var buttonOptions = {
        id: 'zf-widget-root-id',
        template: 'button_8',
        product_id: '2-bfaf7e3bedf40dea5c4004bbe4aab456081517f57a6d574cf3fe14627291a6bf835f31393a9e099258bcad6fd428a6fd57a2ee87bc4643460b00f51473f23b3d',
        plan_code: 'DEALERSHIP295',
        addons: [
          
        ],
        theme: {
          color: '#db2d2e'
        },
        button_text: 'Subscribe',
        product_url: 'https://subscriptions.zoho.com'
    };
    ZFWidget.init('zf-subscribe-button', buttonOptions);

  }




  finishFunction() {


    this.step3submitted = true;
    // stop here if form is invalid
    if (this.signUpFormStep3.invalid) {
      return;
    }
    //set username  before signup
    let username = this.commonUtilService.getUsername(this.accountOwnerWizard.value.emails[0].email);
    //console.log('the user name afer signup is ',username);
    this.accountOwnerWizard.controls.username.setValue(username);

    this.pageLoaderService.pageLoader(true);//start showing page loader
    this.pageLoaderService.setLoaderText(environment.MESSAGES.SAVING_INFO_LOADER_TEXT);//setting loader text

    this.dealershipList['dealerships'] = this.dealershipsItems;

    var merged = Object.assign(this.dealershipTypeWizard.value, this.accountOwnerWizard.value, this.dealershipList, this.signUpFormStep3.value);

    console.log('merged object is '+merged);

    this.pageLoaderService.pageLoader(true);

    this.signupSubscription = this.userAuthService.dealerSignup(merged)
      .subscribe(
        (response) => {

          //hidePopup
          this.hidePopup();


          this.pageLoaderService.setLoaderText(environment.MESSAGES.SUCCESS_REGISTER);//setting loader text
          this.pageLoaderService.pageLoader(false);//hide page loader

          this.pageLoaderService.pageLoader(false);
          
          this.toastr.successToastr('The account verification link has been sent to your email id. Kindly verify!', 'Success!');//showing success toaster
          
          // setTimeout(function(){
          this.router.navigate(['/dealer/login']);
          // },4000)
        },
        error => {

          this.pageLoaderService.setLoaderText(environment.MESSAGES.ERROR_TEXT_LOADER);//setting loader text
          this.pageLoaderService.pageLoader(false);//hide page loader
          this.toastr.errorToastr(environment.MESSAGES.FAILED_TO_REGISTER, 'Oops!');//showing error toaster message

        });

  }


  /**
   * check go For Pro Enabled
   *  
   */
  goForPro(event): void{

    let membershipTypeControl = this.dealershipTypeWizard.controls.membership_type;  
    if(event.target.checked){    
      this.goForProEnabled = true;
      this.membershipType = "pro";
      membershipTypeControl.patchValue("pro");
      //this.loadZohoScript();
    }else{    
      this.goForProEnabled = false;
      this.membershipType = "free";
      membershipTypeControl.patchValue("free");
    }
  }


  // finishFunction(){


  //   this.step3submitted = true;

  //   // stop here if form is invalid
  //   if (this.signUpFormStep3.invalid) {
  //       return;
  //   }


  //   this.pageLoaderService.pageLoader(true);//start showing page loader
  //   this.pageLoaderService.setLoaderText(environment.MESSAGES.SAVING_INFO_LOADER_TEXT);//setting loader text

  //   //saving the seller at aws user pool
  //   this.cognitoUserService.signup(this.accountOwnerWizard.value)     
  //   .pipe(untilDestroyed(this))
  //   .subscribe(
  //     (response) => {          
  //       //console.log('username',response['username'])
  //       this.verificationPopup(); //open verification popup
  //       this.pageLoaderService.setLoaderText(environment.MESSAGES.SUCCESS_REGISTER);//setting loader text 
  //       this.pageLoaderService.pageLoader(false);//hide page loader       
  //       this.accountOwnerWizard.controls['username'].setValue(response['username']);   

  //       this.otpVerificationForm.controls['Username'].setValue(response['username']);  
  //      // console.log('otpVerificationForm',this.otpVerificationForm.value)


  //       this.toastr.successToastr(environment.MESSAGES.VERIFICATION_PENDING, 'Success!');//showing success toaster

  //     },
  //     error => {

  //       this.pageLoaderService.setLoaderText(environment.MESSAGES.ERROR_TEXT_LOADER);//setting loader text
  //       this.pageLoaderService.pageLoader(false);//hide page loader
  //       this.toastr.errorToastr(environment.MESSAGES.FAILED_TO_REGISTER, 'Oops!');//showing error toaster message

  //   });

  // }


  /**
   * validate Vehicle Images Wizard and move to about Vehicle  Wizard.   
   */
  validateDealershipTypeWizard() : void { 
    
    this.isdealershipTypeWizardSubmitted = true;   

    if(this.dealershipTypeWizard.invalid) {
      return;
    } 


  }

  checkFormValidity() {
    this.step1submitted = true;
    console.log(this.accountOwnerWizard)
    if (this.accountOwnerWizard.invalid) {
      return;
    }
    console.log('the form1 after fisrt step is ',this.accountOwnerWizard.value)
  }


  checkStep2FormValidity(index) {

    this.step2submitted = true;
    if (this.signUpFormStep2.invalid) {
      if (this.dealershipsItems.length == 0) {
        return;
      }
    } else {
      this.dealershipsItems.push(
        this.signUpFormStep2.value.dealerships
      );
    }
    this.step2submitted = false;
    this.signUpFormStep2.reset();



    //step 3 moved here
    let username = this.commonUtilService.getUsername(this.accountOwnerWizard.value.emails[0].email);
    //console.log('the user name afer signup is ',username);
    this.accountOwnerWizard.controls.username.setValue(username);

    this.pageLoaderService.pageLoader(true);//start showing page loader
    this.pageLoaderService.setLoaderText(environment.MESSAGES.SAVING_INFO_LOADER_TEXT);//setting loader text

    this.dealershipList['dealerships'] = this.dealershipsItems;

    var merged = Object.assign(this.dealershipTypeWizard.value, this.accountOwnerWizard.value, this.dealershipList);

    //console.log('merged object is '+merged);

    this.pageLoaderService.pageLoader(true);

    this.signupSubscription = this.userAuthService.dealerSignup(merged)
      .subscribe(
        (response) => {

          //hidePopup
          this.hidePopup();


          this.pageLoaderService.setLoaderText(environment.MESSAGES.SUCCESS_REGISTER);//setting loader text
          this.pageLoaderService.pageLoader(false);//hide page loader

          this.pageLoaderService.pageLoader(false);
          
          this.toastr.successToastr('The account verification link has been sent to your email id. Kindly verify!', 'Success!');//showing success toaster
          
          // setTimeout(function(){
          this.router.navigate(['/dealer/verification-pending']);
          // },4000)
        },
        error => {

          this.pageLoaderService.setLoaderText(environment.MESSAGES.ERROR_TEXT_LOADER);//setting loader text
          this.pageLoaderService.pageLoader(false);//hide page loader
          this.toastr.errorToastr(environment.MESSAGES.FAILED_TO_REGISTER, 'Oops!');//showing error toaster message

        });



  }

  /**
   * check Dealership Type
   * @param dealershipType
   */
  toggleDealershipType(dealershipType): void {   
    let dealershipBondExplanation = this.dealershipTypeWizard.controls.dealership_bond.get('dealership_bond_explanation');   
    
    let dealershipTypeControl = this.dealershipTypeWizard.controls.dealership_type; 
    
    dealershipBondExplanation.patchValue('');
    while (this.bondDocumentImagesArray.length) {
      this.bondDocumentImagesArray.removeAt(this.bondDocumentImagesArray.length-1);
    }

    while (this.resaleNumberImagesArray.length) {
      this.resaleNumberImagesArray.removeAt(this.resaleNumberImagesArray.length-1);
    }

    while (this.retailDMVLicenseImagesArray.length) {
      this.retailDMVLicenseImagesArray.removeAt(this.retailDMVLicenseImagesArray.length-1);
    }

    if( dealershipType == "Independent" ){

      dealershipTypeControl.patchValue('Independent');
      this.isIndependentSelected = true;
      dealershipBondExplanation.setValidators(Validators.compose([Validators.minLength(10),Validators.maxLength(200)]));      
      dealershipBondExplanation.updateValueAndValidity();
     
    }else{ 
      dealershipTypeControl.patchValue('Franchise');
      this.isIndependentSelected = false;
      dealershipBondExplanation.clearValidators();
      dealershipBondExplanation.updateValueAndValidity();
      
    }     
  }

  get bondDocumentImagesArray(): FormArray{
	  return this.dealershipTypeWizard.controls.dealership_bond.get('dealership_bond_documents') as FormArray;
  }

  get resaleNumberImagesArray(): FormArray{
	  return this.dealershipTypeWizard.controls.dealership_bond.get('dealership_resale_number_documents') as FormArray;
  }


  get retailDMVLicenseImagesArray(): FormArray{
	  return this.dealershipTypeWizard.controls.dealership_bond.get('dealership_retail_DMV_documents') as FormArray;
  }

  // To add new item in array    
  AddDealership() {
    this.step2submitted = true;
    if (this.signUpFormStep2.invalid) {
      return;
    }
    this.dealershipsItems.push(
      this.signUpFormStep2.value.dealerships
    );
    //console.log(this.dealershipsItems);
    this.step2submitted = false;
    this.resetDealershipCities();
    this.signUpFormStep2.reset();

  }

  // When dealer selects edit option  
  EditDealership(i) {
    //console.log(this.dealershipsItems[i]);
    this.signUpFormStep2.controls['dealerships'].patchValue(this.dealershipsItems[i]) //binding the user data with signup form   
    this.updatedItem = i;
    this.IsForUpdate = true;
  }

  // When dealer clicks on update button to submit updated value  
  UpdateDealership() {

    this.step2submitted = true;
    if (this.signUpFormStep2.invalid) {
      return;
    }
    let i = this.updatedItem;
    this.dealershipsItems[i] = this.signUpFormStep2.value.dealerships;
    this.IsForUpdate = false;
    this.step2submitted = false;
    this.signUpFormStep2.reset();
  }

  // To delete specific item  
  DeleteDealership(i) {
    var pulled = _.pullAt(this.dealershipsItems, [i]);
  }


  // OTP Verification
  verificationPopup() {
    this.showOtpForm = true;
    $(this.otpSection.nativeElement).modal({ backdrop: 'static', keyboard: false, show: true });
  }

  // hide POpup
  hidePopup() {
    this.showOtpForm = false;
    $(this.otpSection.nativeElement).modal('hide');
  }

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
          this.pageLoaderService.pageLoader(false);//hide page loader  
          this.toastr.errorToastr(environment.MESSAGES.OTP_FAILED_RESEND, 'Oops!');//showing error toaster message
        });
  }

  onSubmitOtp() {
    this.otpFormsubmitted = true;
    // stop here if form is invalid
    if (this.otpVerificationForm.invalid) {
      return;
    }


    //confirm dealer OTP code
    this.cognitoUserService.confirmSignupOtp(this.otpVerificationForm.value)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response) => {

          this.dealershipList['dealerships'] = this.dealershipsItems;

          var merged = Object.assign(this.accountOwnerWizard.value, this.dealershipList, this.signUpFormStep3.value);

          //console.log(merged);

          this.pageLoaderService.pageLoader(true);

          this.signupSubscription = this.userAuthService.dealerSignup(merged)
            .subscribe(
              (response) => {

                //hidePopup
                this.hidePopup();


                this.pageLoaderService.setLoaderText(environment.MESSAGES.SUCCESS_REGISTER);//setting loader text
                this.pageLoaderService.pageLoader(false);//hide page loader

                this.pageLoaderService.pageLoader(false);
                this.toastr.successToastr(environment.MESSAGES.SIGNUP_SUCCESS, 'Success!');//showing success toaster
                this.router.navigate(['/dealer/login']);

              },
              error => {

                //hidePopup
                this.hidePopup();

                // Delete User from AWS Congnito too..
                this.deleteDealerFromAWSCognito(this.otpVerificationForm.controls['Username'].value);

                this.pageLoaderService.setLoaderText(environment.MESSAGES.ERROR_TEXT_LOADER);//setting loader text
                this.pageLoaderService.pageLoader(false);//hide page loader
                //this.alertService.setAlert('error', error);
                this.toastr.errorToastr(environment.MESSAGES.FAILED_TO_REGISTER, 'Oops!');//showing error toaster message
                this.router.navigate(['/dealer/signup']);
              });




        },
        error => {
          //console.log('error otp'); 
          this.pageLoaderService.pageLoader(false);//hide page loader
          this.otpVerificationForm.controls['ConfirmationCode'].setValue('');
          this.toastr.errorToastr(error, 'Oops!');//showing error toaster message
        });
  }

/**
* set check object array length.
* @param object
*  @return number
*/
public checkObjectLength(object): number{
  return Object.keys(object).length;
}

/*private loadScripts() {
  // You can load multiple scripts by just providing the key as argument into load method of the service
  this.dynamicScriptLoader.load('zf-widget','subscribe-button').then(data => {
    // Script Loaded Successfully
  }).catch(error => console.log(error));
} */

private deleteDealerFromAWSCognito(u) {
  this.cognitoUserService.deleteUser(u)
    .pipe()
    .subscribe(
      (response) => { },
      error => { });
}

// This method must be present, even if empty.
ngOnDestroy() {
  // To protect you, we'll throw an error if it doesn't exist.
}


}
