import { Component, OnInit,  ViewChild, ElementRef, ViewEncapsulation, NgZone, ChangeDetectorRef } from '@angular/core';
import { Location } from '@angular/common';
//import { TranslateService } from '@ngx-translate/core';
import { AbstractControl,  FormBuilder, FormArray,  FormGroup,  FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute} from "@angular/router";
import { Subscription } from 'rxjs/Subscription';
import { of, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {MovingDirection} from 'angular-archwizard';
import { ToastrManager } from 'ng6-toastr-notifications';//toaster class
import { untilDestroyed } from 'ngx-take-until-destroy';// unsubscribe from observables when the  component destroyed
import { DropzoneComponent, DropzoneDirective, DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { trigger, state, style, animate, transition } from '@angular/animations';
 //shared services
import { AlertService, PageLoaderService } from '../../../../shared/_services'
import Swal from 'sweetalert2';

 


//import core services
import { UserAuthService, TitleService, CognitoUserService, VehicleService, CommonUtilsService, CarService } from '../../../../core/_services'

//import core services
import { CustomValidators } from '../../../../core/custom-validators';

import { environment } from '../../../../../environments/environment'

//import Lodash
import * as _ from 'lodash';

// Fine Uploader s3
import * as AWS from 'aws-sdk/global';
import * as S3 from 'aws-sdk/clients/s3';
import * as Dropzone from 'dropzone';
import { bool } from 'aws-sdk/clients/signer';

declare let jQuery:any;
declare let $:any;
declare let POTENZA:any;


@Component({
  selector: 'app-editcar',
  templateUrl: './editcar.component.html',
  styleUrls: ['./editcar.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('AnimateList', [
      transition(':enter', [  
        style({opacity: 0, transform: 'translateX(75%)'}),
        animate('1s 500ms ease')
      ])
    ])
   ]
})
export class EditCarComponent implements OnInit {
  // Offer In Hands Popup
  @ViewChild("offerInHandsSection") offerInHandsSection: ElementRef;

  // Define Page Title and Breadcrumbs
  title:string = 'Edit Car';
  breadcrumbs: any = [{ page: 'Home', link: '' }, { page: 'Car Listing', link: '/seller/car-listing' }, { page: 'Edit Car', link: '' }]




  // Smooth Scroll To Add Car Form Wizard
  @ViewChild("editCarSection") editCarSection: ElementRef;

  // Array where we are going to do CRUD operations
  //vehicleImagesArray:any = [{Interior: []}, {Exterior: []}];
  vehicleImages:any = [];
  interiorImagesArray:any = [];
  exteriorImagesArray:any = [];  
  getVehicleYear:string = "";
  

  // EditCar Form Group Wizard
  vehicleOption: FormGroup;
  basicInfoWizard: FormGroup;
  uploadVehicleImagesWizard: FormGroup;
  aboutVehicleWizard: FormGroup;
  vehicleConditionWizard: FormGroup;
  pickupLocationWizard: FormGroup;
  offerInHands: FormGroup;
  

  isBasicInfoSubmitted:boolean = false;
  isVehicleImagesSubmitted:boolean = false;
  isAboutVehicleSubmitted:boolean = false;
  isVehicleConditionSubmitted:boolean = false;
  isPickupLocationSubmitted:boolean = false;
  isVehicleOptionSubmitted:boolean = false;
  isOfferInHandsSubmitted:boolean = false;
  disabled:boolean=false
  
  isBasicInfoFieldsVisible:boolean = true;  
  isMoreSelected:boolean = false;
  isVehicleOptionSelected:boolean = false;
 
  isVinSelected:boolean = false;
  isYearSelected:boolean = false;  
  isVehicleAftermarketSelected:boolean = false;
  isVehicleCleanTitleSelected:boolean = false;
  isWillingToDriveSelected:boolean = false;
  isOtherSelected:boolean = false;
  isVehicleConditionSelected:boolean = false;
  isYearEnabled:boolean = true;
  isSkipSubmit:boolean = false;
  isOtherInteriorColorSelected:boolean = false;
  isOtherExteriorColorSelected:boolean = false;

  vehicleImageCategory:string = "Interior";
  exteriorColor:string = "Black";
  interiorColor:string = "Black";
  vehicleImageCategoryOnSummary:string = "all";
  base64StringFile:any;

  addVehicleSubscription: Subscription;

  private setVehicleReferenceDefaultValue: string = "VIN";    // set Default Vehicle Reference Radio Button Value
  makes = [];  
  models = [];
  trims = [];
  removeFileArray = [];
  bodyStyles= [{name: "2 Door Convertible"}, {name: "2 Door Coupe"}, {name: "4 Door Sedan"}];
  engines= [{name: "4 cylindrical"}, {name: "2 cylindrical"}];
  transmissions= [{name: "Automated-Manual"}, {name: "Continuously Variable Transmission"}, {name: "Dual-Clutch Transmission"}]; 
  doors= [{name: "4 doors"},{name: "2 doors"}];  
  fuelTypes= [{name: "Gasoline"}, {name: "Diesel"}, {name: "Petrol"}];
  driveTypes= [{name: "AWD"}, {name: "FWD"}, {name: "4WD"}];
  interiorColors= [{name: "Black"}, {name: "Blue"}, {name: "Brown"}, {name: "Grey"}, {name: "Red"}, {name: "Silver"}];
  exteriorColors= [{name: "Black"}, {name: "Blue"}, {name: "Brown"}, {name: "Grey"}, {name: "Red"}, {name: "Silver"}];
  interiorMaterials= [{name: "Faux Leather"}, {name: "Brushed Nylon"}, {name: "Nylon Fabric"}];
  basicInfoDetails= {model_doors: "", model_engine_cyl: "", model_transmission_type: "", model_engine_fuel: "", model_drive: "", model_body: ""};
 

  // Declare DropZone Variables  
  dropzoneUpload: boolean = false;
  public vehicleImagesConfiguration:DropzoneConfigInterface;
  public vehicleAftermarketConfiguration:DropzoneConfigInterface;
  public vehicleConditionConfiguration: DropzoneConfigInterface;  
  public offerInHandsConfiguration: DropzoneConfigInterface;  
  vehicleImageArray = [];

  // Reset Dropzone
  @ViewChild(DropzoneComponent) componentRef?: DropzoneComponent;
  @ViewChild(DropzoneDirective) directiveRef?: DropzoneDirective;  

  
  getMakeByYearArray:any = [];
  getModelByMakeIdArray:any = [];  
  private _secondKey:boolean= false;
  private _vehicleAftermarket:boolean= false;
  private _vehicleOwnership:string = '';
  private _vehicleConditionValue:string = 'Ready For Resale Without Any Reconditioning';
  private _cleanTitle:boolean= false;
  private _willingToDrive:boolean= false;
  private _vehiclePickedUp:boolean = false;
  yearRange:any = [];
  colors:any = [];

  currentYear: number = new Date().getFullYear();   // get Current Year

  minYear: number = 2000;
  maxYear: number = this.currentYear;



constructor( private zone:NgZone, private cognitoUserService:CognitoUserService, private location: Location, private alertService: AlertService, private vehicleService: VehicleService, private userAuthService: UserAuthService, private pageLoaderService: PageLoaderService, private formBuilder: FormBuilder, private titleService: TitleService, private commonUtilsService: CommonUtilsService, private toastr: ToastrManager, private router: Router, private activatedRoute: ActivatedRoute, private carService: CarService, private ref: ChangeDetectorRef) { 


  this.colors = [{label:'Beige',value:'#F5F5DC'},{label:'Black',value:'#252627'},{label:'Brown',value:'#672E10'},{label:'Burgundy',value:'#75141C'},{label:'Charcoal Grey',value:'#757776'},{label:'Dark Blue',value:'#172356'},{label:'Dark Green',value:'#316241'},{label:'Gold',value:'#D6C17F'},{label:'Grey',value:'#808080'},{label:'Light Blue',value:'#5F7DC5'},{label:'Light Green',value:'#8E9F87'},{label:'Orange',value:'#FF9200'},{label:'Purple',value:'#6A4574'},{label:'Red',value:'#E32F43'},{label:'Silver',value:'#D4D9DC'},{label:'Tan',value:'#D2B48C'},{label:'White',value:'#F2F6F9'},{label:'Yellow',value:'#F8E81C'}];

  this.selectVehicleOption(); // Initialize Vehicle Option Fields 
  this.basicInfo();          // Initialize Basic Info Wizard Fields 
  this.uploadVehicleImages(); // Initialize Vehicle Images Wizard Fields
  this.aboutVehicle();       // Initialize About Vehicle Wizard Fields
  this.vehicleCondition();   // Initialize Vehicle Condition Wizard Fields
  this.pickUpLocation();     // Initialize Pickup Location Wizard Fields
  this.offerInHandsPopUp();  //

  this.vehicleImagesDropzoneInit()        //initalize dropzone library
  this.vehicleAfterMarketDropzoneInit(); //initalize dropzone library
  this.vehicleAfterConditionDropzoneInit(); //initalize dropzone library
  this.offerInHandsDropzoneInit(); //initalize dropzone library 

  //checking the type to change breadcrumbs
  if ('type' in this.activatedRoute.snapshot.params) {
    this.breadcrumbs = [{ page: 'Home', link: '' }, { page: "Dashboard", link: '/seller/car-dashboard' }, { page: 'Edit Car', link: '' }]
  }
 

}

  /**
  * Initialize Basic Info Wizard Fields.
  */
  private selectVehicleOption(){
    this.vehicleOption = this.formBuilder.group({
      _id: [this.activatedRoute.snapshot.params._id],
      vin_number: [''],
      seller_id: [localStorage.getItem('loggedinUserId')],
      vehicle_year: [''],
      vehicle_year_value: [''],
      existing_vehicle: [''],
    });
  }

  /**
  * Initialize Basic Info Wizard Fields.
  */
  private basicInfo(){
    this.basicInfoWizard = this.formBuilder.group({      
        basic_info:this.formBuilder.group({             
          vehicle_zip: ['', Validators.compose([Validators.required,Validators.pattern('^[0-9]{5}$')])],
          vehicle_make: [{value: '', disabled: true}, Validators.compose([Validators.required])],
          vehicle_model: [{value: '', disabled: true}, Validators.compose([Validators.required])],
          vehicle_mileage: ['', Validators.compose([Validators.required,Validators.minLength(1),Validators.maxLength(6),Validators.pattern(/^-?(0|[1-9]\d*)?$/)])],
          vehicle_body_type: ['', Validators.compose([Validators.required])],
          vehicle_trim: [{value: '', disabled: true}, Validators.compose([Validators.required])],
          vehicle_doors: ['', Validators.compose([Validators.required])],
          vehicle_engine: ['', Validators.compose([Validators.required])],
          vehicle_transmission: ['', Validators.compose([Validators.required])],
          vehicle_fuel_type: ['', Validators.compose([Validators.required])],
          vehicle_drive_type: ['', Validators.compose([Validators.required])],
          vehicle_interior_color: ['Black', Validators.compose([Validators.required])],
          vehicle_other_interior_color: [''],
          vehicle_exterior_color: ['Black', Validators.compose([Validators.required])],
          vehicle_other_exterior_color: [''],
          vehicle_interior_material: ['', Validators.compose([Validators.required])],                
        }),    
    });
  }

  /**
  * Initialize Basic Info Wizard Fields.
  */
  private uploadVehicleImages(){
    this.uploadVehicleImagesWizard = this.formBuilder.group({  
      vehicle_image_category_name: ['Interior'],                
      vehicle_images: this.formBuilder.array([])
    });
  }  

  /**
  * Initialize about Vehicle Wizard Fields.
  */
  private aboutVehicle(){
    this.aboutVehicleWizard = this.formBuilder.group({  
      vehicle_has_second_key: [false], 
      is_vehicle_aftermarket: [false],  
      vehicle_aftermarket:this.formBuilder.group({        
        vehicle_aftermarket_description: [''],
        vehicle_aftermarket_images: this.formBuilder.array([]),
      }),      
      vehicle_ownership:this.formBuilder.group({        
        vehicle_clean_title : [false],
        vehicle_ownership_value : ['', Validators.compose([Validators.required])],
        vehicle_ownership_description : ['']
            
      })
      
    }); 
  }

  /**
  * Initialize Vehicle Condition Wizard Fields.
  */
  private vehicleCondition(){
    this.vehicleConditionWizard = this.formBuilder.group({      
      vehicle_comments: ['', Validators.compose([Validators.minLength(10),Validators.maxLength(200)])],    
      vehicle_condition:this.formBuilder.group({    
        vehicle_condition_value: ['Ready For Resale Without Any Reconditioning'],
        vehicle_condition_description: [''],
        vehicle_condition_images: this.formBuilder.array([]),
      })
    }); 
  }

  /**
  * Initialize Pickup Location Wizard Fields.
  */
  private pickUpLocation(){     
    this.pickupLocationWizard = this.formBuilder.group({      
      vehicle_to_be_picked_up:  [false],             
      willing_to_drive : [false],
      willing_to_drive_how_many_miles: [0]                      
    });
  }

  /**
  * Initialize Offer In Hands Fields.
  */
  private offerInHandsPopUp(){
    this.offerInHands = this.formBuilder.group({ 
      vehicle_finance_details:this.formBuilder.group({
        vehicle_finance_bank: ['', Validators.compose([Validators.minLength(2),Validators.maxLength(50)])],
        vehicle_estimated_price: [0, Validators.compose([Validators.required, Validators.min(1)])],       
        vehicle_pay_off: [0],       
        vehicle_offer_in_hands_price : [0],
        vehicle_proof_image: this.formBuilder.array([]), 
      })      
    })
  }

  

  /**
   * save Car in DB  
   */
  onSubmitEditCar(): void {



    //check Vehicle Year Value
    const vehicleYear = this.vehicleOption.controls.vehicle_year;
    if(vehicleYear.value == "more"){
      vehicleYear.setValue(this.vehicleOption.controls.vehicle_year_value.value);
    }

   /* if(this.isSkipSubmit){
      this.offerInHands.controls.vehicle_finance_details.get('vehicle_offer_in_hands_price').setValue(0);
      while (this.offerInHandsImagesArray.length) {
        this.offerInHandsImagesArray.removeAt(this.offerInHandsImagesArray.length-1);
      }
    } */
    
    if(this.offerInHands.controls.vehicle_finance_details.get('vehicle_offer_in_hands_price').value == null){
      this.offerInHands.controls.vehicle_finance_details.get('vehicle_offer_in_hands_price').setValue(0);
    }
    if(this.offerInHands.controls.vehicle_finance_details.get('vehicle_pay_off').value == null){
      this.offerInHands.controls.vehicle_finance_details.get('vehicle_pay_off').setValue(0);
    }

    // Merge Category Image Array    
    this.vehicleImages = [...this.interiorImagesArray, ...this.exteriorImagesArray];

    this.vehicleImages.forEach(vehicleImage => {
          this.vehicleImagesArray.push(new FormControl({file_path : vehicleImage.file_path, file_name : vehicleImage.file_name, file_key : vehicleImage.file_key, file_category : vehicleImage.file_category}))
    }); 

    // set Default Vin Number
    //this.vehicleOption.controls.vin_number.setValue('1C6RR7GT1ES223950');



    // Remove Old File From Vehicle Details 
    if(this.removeFileArray.length > 0){
      this.removeFileArray.forEach(file => {
          this.removeImageFromBucket(file.file_key);  
      }); 
    }


    var mergeVehicleData = Object.assign(this.vehicleOption.value, this.basicInfoWizard.value, this.uploadVehicleImagesWizard.value, this.aboutVehicleWizard.value, this.vehicleConditionWizard.value, this.pickupLocationWizard.value, this.offerInHands.value);

    //console.log(mergeVehicleData);

    this.commonUtilsService.showPageLoader('Saving Your Car...');

    this.addVehicleSubscription = this.vehicleService.editYourVehicle(mergeVehicleData)
      .subscribe(
      (response) => { 
        this.router.navigate(['/seller/car-listing']);

        this.commonUtilsService.onSuccess('Vehicle has been updated successfully.');
      },
      error => {
        
        this.commonUtilsService.onError(error);
      });
    
  }

  /**
  * Initialize Dropzone Library(Image Upload).
  */
  private offerInHandsDropzoneInit(){
    const componentObj = this;
    this.offerInHandsConfiguration = {       
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
    dictDefaultMessage: '<span class="button red">Upload Proof</span>',
    //previewsContainer: "#offerInHandsPreview",
    addRemoveLinks: true,
    //resizeWidth: 125,
    //resizeHeight: 125,
    //createImageThumbnails:false,
    dictInvalidFileType: 'Only valid jpeg, jpg, png file is accepted.',
    dictFileTooBig: 'Maximum upload file size limit is 2MB',
    dictCancelUpload: '<i class="fa fa-times" aria-hidden="true"></i>',
    dictRemoveFile: '<i class="fa fa-times" aria-hidden="true"></i>',
    headers: {
      'Cache-Control': null,
      'X-Requested-With': null,
    },  
  
      accept: function(file, done) {        
          

          if((componentObj.offerInHandsImagesArray.length +1) > 1){
              componentObj.commonUtilsService.onError('You cannot upload any more files.');
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
              
              
             const isValidFile = componentObj.commonUtilsService.isFileCorrupted(base64String,_.toLower(fileExtension))              
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
            componentObj.offerInHandsImagesArray.push(new FormControl({file_path : serverResponse.fileLocation, file_name : serverResponse.fileName, file_key : serverResponse.fileKey, file_mimetype : serverResponse.fileMimeType, file_category : 'offer_in_hands'}));
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
 private vehicleAfterMarketDropzoneInit(){
  const componentObj = this;
  
  this.vehicleAftermarketConfiguration = {      
    clickable: true,
    paramName: "file",
    uploadMultiple: false,
    url: environment.API_ENDPOINT + "/api/common/imageUploadtoBucket",
    maxFiles: 50,
    autoReset: null,
    errorReset: null,
    cancelReset: null,
    acceptedFiles: '.jpg, .png, .jpeg',
    maxFilesize: 2, // MB,
    dictDefaultMessage: 'Click or Drag Images Here to Upload',
    //previewsContainer: "#vehicleAfterMarketPreview",
    addRemoveLinks: true,
    //resizeWidth: 125,
    //resizeHeight: 125,
    //createImageThumbnails:false,
    dictInvalidFileType: 'Only valid jpeg, jpg, png file is accepted.',
    dictFileTooBig: 'Maximum upload file size limit is 2MB',
    dictCancelUpload: '<i class="fa fa-times" aria-hidden="true"></i>',
    dictRemoveFile: '<i class="fa fa-times" aria-hidden="true"></i>',
    headers: {
      'Cache-Control': null,
      'X-Requested-With': null,
    },  
    accept: function(file, done) { 
      
      
        if((componentObj.afterMarketImagesArray.length +1) > 50){
            componentObj.commonUtilsService.onError('You cannot upload any more files.');
            this.removeFile(file);
            return false;
        }
     
        const reader = new FileReader();
        const _this = this
        reader.onload = function(event) {             
            let base64String = reader.result      
            const fileExtension = (file.name).split('.').pop();
            const isValidFile = componentObj.commonUtilsService.isFileCorrupted(base64String,_.toLower(fileExtension))              
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
        formData.append('folder', 'Aftermarket');
      });

      /* this.on("maxfilesexceeded", function(file){
          console.log("Max Image Upload Reached!");
          this.removeFile(file);
      }); */

      this.on("totaluploadprogress",function(progress){          
        componentObj.pageLoaderService.pageLoader(true);//start showing page loader
        componentObj.pageLoaderService.setLoaderText('Uploading file '+parseInt(progress)+'%');//setting loader text
        if(progress>=100){
          componentObj.pageLoaderService.pageLoader(false); //hide page loader
        }
      })
     
      this.on("success", function(file, serverResponse) {           
         
        
        componentObj.zone.run(() => { 
          componentObj.afterMarketImagesArray.push(new FormControl({file_path : serverResponse.fileLocation, file_name : serverResponse.fileName, file_key : serverResponse.fileKey, file_category : 'aftermarket'}));
          
        });
        this.removeFile(file);
        
        componentObj.pageLoaderService.pageLoader(false); //hide page loader
      });

      this.on("error", function(file, serverResponse) {  
        this.removeFile(file);             
        componentObj.pageLoaderService.pageLoader(false);//hide page loader  
        componentObj.toastr.errorToastr(serverResponse, 'Oops!');         
      });

      /*this.on("removedfile", function(file) {      
        this.removeFile(file);  
      // componentObj.removeImageFromBucket(file.xhr.response, 'aftermarket');              
      });*/
    }     
  };
}

  /**
  * Initialize Dropzone Library(Image Upload).
  */
  private vehicleAfterConditionDropzoneInit(){
    const componentObj = this;
    this.vehicleConditionConfiguration = {      
      clickable: true,
      paramName: "file",
      uploadMultiple: false,
      url: environment.API_ENDPOINT + "/api/common/imageUploadtoBucket",
      maxFiles: 50,
      autoReset: null,
      errorReset: null,
      cancelReset: null,
      acceptedFiles: '.jpg, .png, .jpeg',
      maxFilesize: 2, // MB,
      dictDefaultMessage: 'Click or Drag Images Here to Upload',
      //previewsContainer: "#vehicleConditionPreview",
      addRemoveLinks: true,
      //resizeWidth: 125,
      //resizeHeight: 125,
      //createImageThumbnails:false,
      dictInvalidFileType: 'Only valid jpeg, jpg, png file is accepted.',
      dictFileTooBig: 'Maximum upload file size limit is 2MB',
      dictCancelUpload: '<i class="fa fa-times" aria-hidden="true"></i>',
      dictRemoveFile: '<i class="fa fa-times" aria-hidden="true"></i>',
      headers: {
        'Cache-Control': null,
        'X-Requested-With': null,
      },  
      accept: function(file, done) {  
        
          if((componentObj.vehicleConditionImagesArray.length +1) > 50){
              componentObj.commonUtilsService.onError('You cannot upload any more files.');
              this.removeFile(file);
              return false;
          }
       
          const reader = new FileReader();
          const _this = this
          reader.onload = function(event) {             
              let base64String = reader.result      
              const fileExtension = (file.name).split('.').pop();
              const isValidFile = componentObj.commonUtilsService.isFileCorrupted(base64String,_.toLower(fileExtension))              
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
          formData.append('folder', 'Condition');
        });

        /* this.on("maxfilesexceeded", function(file){
            console.log("Max Image Upload Reached!");
            this.removeFile(file);
        }); */

        this.on("totaluploadprogress",function(progress){          
          componentObj.pageLoaderService.pageLoader(true);//start showing page loader
          componentObj.pageLoaderService.setLoaderText('Uploading file '+parseInt(progress)+'%');//setting loader text
          if(progress>=100){
            componentObj.pageLoaderService.pageLoader(false); //hide page loader
          }
        })
       
        this.on("success", function(file, serverResponse) { 

          

          componentObj.zone.run(() => { 
            componentObj.vehicleConditionImagesArray.push(new FormControl({file_path : serverResponse.fileLocation, file_key : serverResponse.fileKey, file_name : serverResponse.fileName, file_category : 'condition'}));
          });
          this.removeFile(file); 
                 
          componentObj.pageLoaderService.pageLoader(false); //hide page loader
        });

        this.on("error", function(file, serverResponse) {  
          this.removeFile(file);             
          componentObj.pageLoaderService.pageLoader(false);//hide page loader  
          componentObj.toastr.errorToastr(serverResponse, 'Oops!');         
        });

        /*this.on("removedfile", function(file) {                 
         // componentObj.removeImageFromBucket(file.xhr.response, 'aftermarket');              
        }); */
      }     
    };
  }
 
  /**
  * Initialize Dropzone Library(Image Upload).
  */
  private vehicleImagesDropzoneInit() { 
    const componentObj = this;
    this.vehicleImagesConfiguration = {      
      clickable: true,
      paramName: "file",
      uploadMultiple: false,
      url: environment.API_ENDPOINT + "/api/common/imageUploadtoBucket",
      maxFiles: 50,
      autoReset: null,
      errorReset: null,
      cancelReset: null,
      acceptedFiles: '.jpg, .png, .jpeg',
      maxFilesize: 2, // MB,
      dictDefaultMessage: 'Click or Drag Images Here to Upload',
     // previewsContainer: "#vehicleImagesPreview",      
      addRemoveLinks: true,
      //resizeWidth: 125,
      //resizeHeight: 125,
      //createImageThumbnails:false,
      dictInvalidFileType: 'Only valid jpeg, jpg, png file is accepted.',
      dictFileTooBig: 'Maximum upload file size limit is 2MB',
      dictCancelUpload: 'Delete Pic',
      dictRemoveFile: 'Delete Pic',
      headers: {
        'Cache-Control': null,
        'X-Requested-With': null,
      },  
      accept: function(file, done) {            
        
          
          if((componentObj.interiorImagesArray.length +1) > 25 && componentObj.getVehicleImageCategory() == "Interior"){
              componentObj.commonUtilsService.onError('You cannot upload any more files.');
              this.removeFile(file);
              return false;
          }

          if((componentObj.exteriorImagesArray.length +1) > 25 && componentObj.getVehicleImageCategory() == "Exterior"){
              componentObj.commonUtilsService.onError('You cannot upload any more files.');
              this.removeFile(file);
              return false;
          }


       
          const reader = new FileReader();
          const _this = this
         
          
          reader.onload = function(event) {             
              let base64String = reader.result      
              const fileExtension = (file.name).split('.').pop();

              const isValidFile = componentObj.commonUtilsService.isFileCorrupted(base64String,_.toLower(fileExtension))              
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
                  
          formData.append('folder', componentObj.getVehicleImageCategory());         
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
            if(componentObj.getVehicleImageCategory() == "Interior"){
              componentObj.interiorImagesArray.push({file_path : serverResponse.fileLocation, file_key : serverResponse.fileKey, file_name : serverResponse.fileName, file_category : componentObj.getVehicleImageCategory().toLowerCase()});              

            }else{
              componentObj.exteriorImagesArray.push({file_path : serverResponse.fileLocation, file_key : serverResponse.fileKey, file_name : serverResponse.fileName, file_category : componentObj.getVehicleImageCategory().toLowerCase()});
            }

            //componentObj.vehicleImagesArray.push(new FormControl({file_path : serverResponse.fileLocation, file_key : serverResponse.fileKey, file_name : serverResponse.fileName, file_category : componentObj.getVehicleImageCategory().toLowerCase()}));

          });

          //console.log(componentObj.interiorImagesArray);
          this.removeFile(file);
          componentObj.pageLoaderService.pageLoader(false); //hide page loader

        });       

        this.on("error", function(file, serverResponse) {                           
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

    this.commonUtilsService.showPageLoader('Removing File...');
    
    if(file_category == 'interior'){ _.pullAt(this.interiorImagesArray, [index]); }
    if(file_category == 'exterior'){ _.pullAt(this.exteriorImagesArray, [index]); }
    if(file_category == 'condition'){ this.vehicleConditionImagesArray.removeAt(index); }
    if(file_category == 'aftermarket'){ this.afterMarketImagesArray.removeAt(index);  }
    if(file_category == 'offer_in_hands'){ this.offerInHandsImagesArray.removeAt(index); }    

    this.removeFileArray.push({file_key:file_key});

    this.commonUtilsService.onSuccess('File has been removed successfully.'); 

    //this.removeImageFromBucket(file_key);
  }

  /**
   * remove image from AWS Bucket
   * @param imagePath image url
   * @param bucket s3 bucket name
   */
  removeImageFromBucket(file_key){  

    const params = { fileKey : file_key }

    this.commonUtilsService.removeImageFromBucket(params)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response) => {
          console.log(response);          
        },
        error => {
          //this.commonUtilsService.onError(error);
          console.log(error);
        });
  }  
  

  /**
  * Show confirmation popup before going to previous step.
  * @return any
  */
  async isPreviousClicked() {
    if(! await this.commonUtilsService.isPreviousConfirmed()) { 
      this.isVehicleOptionSelected = true;        
    }else{ 

      this.vehicleOption.reset();
      this.selectVehicleOption();

      this.basicInfoWizard.reset(); 
      this.basicInfo();          // Initialize Basic Info Wizard Fields 
      
      this.uploadVehicleImagesWizard.reset();
      this.uploadVehicleImages();      
      this.interiorImagesArray = [];
      this.exteriorImagesArray = [];

      while (this.vehicleImagesArray.length) {
        this.vehicleImagesArray.removeAt(this.vehicleImagesArray.length-1);
      }

      this.aboutVehicleWizard.reset();
      this.aboutVehicle();       // Initialize About Vehicle Wizard Fields

      while (this.afterMarketImagesArray.length) {
        this.afterMarketImagesArray.removeAt(this.afterMarketImagesArray.length-1);
      }

      this.vehicleConditionWizard.reset();
      this.vehicleCondition();   // Initialize Vehicle Condition Wizard Fields

      while (this.vehicleConditionImagesArray.length) {
        this.vehicleConditionImagesArray.removeAt(this.vehicleConditionImagesArray.length-1);
      }

      this.pickupLocationWizard.reset();
      this.pickUpLocation();     // Initialize Pickup Location Wizard Fields

      this.offerInHands.reset();
      this.offerInHandsPopUp(); 



      this.isVehicleAftermarketSelected = false;
      this.isVehicleCleanTitleSelected = false;
      this.isWillingToDriveSelected = false;
      this.isOtherSelected = false;
      this.isVehicleConditionSelected = false;      
      this.isSkipSubmit = false;
      this.isOtherInteriorColorSelected = false;
      this.isOtherExteriorColorSelected = false;

      this.isVehicleOptionSelected = false; 
      
      this.scrollToSpecificDiv();
      
    }
  }

  /**
  * get vehicle Image Category.
  * @return     string(vehicle image category)
  */
  private getVehicleImageCategory(){
    return this.uploadVehicleImagesWizard.controls.vehicle_image_category_name.value;
  }



  /**
  * Fetch Vehicle Data by ID.
  */
 private fetchVehicleDetails(){
  //hit api to fetch data
  this.commonUtilsService.showPageLoader();
  this.carService.fetchCarDetails({ id: this.activatedRoute.snapshot.params._id }).subscribe(

    //case success
    (response) => {
      //console.log('response', response);       
             
      this.getVehicleStatisticsByYear(response.vehicle_year, response.basic_info.vehicle_make, response.basic_info.vehicle_model);      


      this.vehicleOption.controls.vehicle_year.patchValue(response.vehicle_year);

      // Basic Info Wizard
      this.basicInfoWizard.controls.basic_info.patchValue(response.basic_info);
      this.setInteriorColor(response.basic_info.vehicle_interior_color);
      this.setExteriorColor(response.basic_info.vehicle_exterior_color);
       

      // Vehicle Images Wizard
       if(response.vehicle_images.length > 0) {
         response.vehicle_images.forEach(vehicleImage => {
            if(vehicleImage.file_category == "interior"){
              this.interiorImagesArray.push({file_path : vehicleImage.file_path, file_key : vehicleImage.file_key, file_name : vehicleImage.file_name, file_category : vehicleImage.file_category});
            }else{
              this.exteriorImagesArray.push({file_path : vehicleImage.file_path, file_key : vehicleImage.file_key, file_name : vehicleImage.file_name, file_category : vehicleImage.file_category});
            }
            
          }); 
        }

        // About Vehicle Wizard
        this.aboutVehicleWizard.controls.vehicle_has_second_key.patchValue(response.vehicle_has_second_key);
        this.secondKey = response.vehicle_has_second_key;
        this.aboutVehicleWizard.controls.is_vehicle_aftermarket.patchValue(response.is_vehicle_aftermarket);
        this.isVehicleAftermarketSelected = response.is_vehicle_aftermarket; // check aftermarket option (true or false)
        this.vehicleAftermarket = response.is_vehicle_aftermarket; // check aftermarket option (true or false)
        this.fetchVehicleCleanTitle(response.vehicle_ownership.vehicle_clean_title); // check cleantitle option (true or false)
        this.aboutVehicleWizard.controls.vehicle_aftermarket.patchValue(response.vehicle_aftermarket);
        if(response.vehicle_aftermarket.vehicle_aftermarket_images.length > 0) {
          response.vehicle_aftermarket.vehicle_aftermarket_images.forEach(vehicleAfterMarketImage => {             
              
              this.afterMarketImagesArray.push(new FormControl({file_path : vehicleAfterMarketImage.file_path, file_key : vehicleAfterMarketImage.file_key, file_name : vehicleAfterMarketImage.file_name, file_category : vehicleAfterMarketImage.file_category}));
             
           }); 
         }
         this.aboutVehicleWizard.controls.vehicle_ownership.patchValue(response.vehicle_ownership);
         this.checkVehicleOwnershipRadioValue(response.vehicle_ownership.vehicle_ownership_value, response.vehicle_ownership.vehicle_clean_title);

         // Vehicle Condition Wizard
         this.vehicleConditionWizard.controls.vehicle_comments.patchValue(response.vehicle_comments);
         this.vehicleConditionWizard.controls.vehicle_condition.patchValue(response.vehicle_condition); 
         if(response.vehicle_condition.vehicle_condition_images.length > 0) {
          response.vehicle_condition.vehicle_condition_images.forEach(vehicleConditionImage => {             
              
              this.vehicleConditionImagesArray.push(new FormControl({file_path : vehicleConditionImage.file_path, file_key : vehicleConditionImage.file_key, file_name : vehicleConditionImage.file_name, file_category : vehicleConditionImage.file_category}));
             
           }); 
         }

         
         let vehicleConditionDescription = this.vehicleConditionWizard.controls.vehicle_condition.get('vehicle_condition_description'); 

        if(response.vehicle_condition.vehicle_condition_value == "Ready For Resale Without Any Reconditioning"){

          this.isVehicleConditionSelected = false; 
                 
          vehicleConditionDescription.clearValidators();        
          vehicleConditionDescription.updateValueAndValidity();
          
        }else{
          this.isVehicleConditionSelected = true;  
             
          vehicleConditionDescription.setValidators(Validators.compose([Validators.required,Validators.minLength(10),Validators.maxLength(200)]));        
          vehicleConditionDescription.updateValueAndValidity();
        }

        this.vehicleConditionValue = response.vehicle_condition.vehicle_condition_value;

        //Pickup Location Wizard
        this.pickupLocationWizard.controls.vehicle_to_be_picked_up.patchValue(response.vehicle_to_be_picked_up);
        this.vehiclePickedUp = response.vehicle_to_be_picked_up;
        this.pickupLocationWizard.controls.willing_to_drive.patchValue(response.willing_to_drive);
        this.isWillingToDriveSelected = response.willing_to_drive;
        this.willingToDrive = response.willing_to_drive;
        this.pickupLocationWizard.controls.willing_to_drive_how_many_miles.patchValue(response.willing_to_drive_how_many_miles);

        //Offer In Hands Popup
        this.offerInHands.controls.vehicle_finance_details.patchValue(response.vehicle_finance_details);
        if(response.vehicle_finance_details.vehicle_proof_image.length > 0) {
          response.vehicle_finance_details.vehicle_proof_image.forEach(vehicleProofImage => {             
              
              this.offerInHandsImagesArray.push(new FormControl({file_path : vehicleProofImage.file_path, file_key : vehicleProofImage.file_key, file_name : vehicleProofImage.file_name, file_category : vehicleProofImage.file_category, file_mimetype : vehicleProofImage.file_mimetype}));
             
           }); 
         }
       
      
      this.commonUtilsService.hidePageLoader();

      //case error 
    }, error => {
      this.commonUtilsService.onError(error);
    }
  );
}


  /**
   * get Models By Make Name
   * @param makeName selected make name from dropdown
   * @return  array(models)
   */
  getModelsByMake(makeName){ 

    const _this = this;    
    
    _this.getVehicleYear = _this.vehicleOption.controls.vehicle_year.value;
    

    let vehicleModelControl = _this.basicInfoWizard.controls.basic_info.get('vehicle_model');
    let vehicleTrimControl = _this.basicInfoWizard.controls.basic_info.get('vehicle_trim');

    vehicleModelControl.setValue(''); 
    _this.resetTrimControl();
    _this.emptyBasicInfoFields();

    if(makeName == ""){ 
      _this.resetModelControl();
      _this.resetTrimControl();
      return;
    }else{ 
      vehicleModelControl.enable(); 
    }  

    $.getJSON("https://www.carqueryapi.com/api/0.3/?callback=?", {cmd:"getModels", year:_this.getVehicleYear, make:makeName}, function(response) {
        //The 'data' variable contains all response data.    
        //console.log('models',response);

        if(response.Models.length > 0){
          
          vehicleModelControl.enable(); 
          _this.models = response.Models;          
  
        }else{
         
          _this.resetModelControl();
          _this.resetTrimControl();
          _this.emptyBasicInfoFields();
          
        }

    });
    
   

    //this.models = this.makes.find(x => x.name === makeName).models;     
  }

  /**
   * get Models By Make Name
   * @param makeName selected make name from dropdown
   * @return  array(models)
   */
  fetchModelsByMake(makeName, year){ 
    const _this = this;
    

    let vehicleModelControl = _this.basicInfoWizard.controls.basic_info.get('vehicle_model');
    let vehicleTrimControl = _this.basicInfoWizard.controls.basic_info.get('vehicle_trim');    

    if(makeName == ""){ 
      _this.resetModelControl();
      _this.resetTrimControl();
      _this.emptyBasicInfoFields();
      return;
    }else{ 
      vehicleModelControl.enable(); 
    }  

    $.getJSON("https://www.carqueryapi.com/api/0.3/?callback=?", {cmd:"getModels", year:year, make:makeName}, function(response) {
        //The 'data' variable contains all response data.    
        //console.log('models',response);

        if(response.Models.length > 0){
          
          vehicleModelControl.enable(); 
          _this.models = response.Models;          
  
        }else{
         
          _this.resetModelControl();
          _this.resetTrimControl();
          _this.emptyBasicInfoFields();
          
        }

    });
    
   

    //this.models = this.makes.find(x => x.name === makeName).models;     
  }

  /**
   * get Trims array By Model Name
   * @param makeName selected make name from dropdown
   * @return  array(trim)
   */
  getTrimsByModel(modelName, year=""){  

    const _this = this;
    let vehicleTrimControl = _this.basicInfoWizard.controls.basic_info.get('vehicle_trim'); 
    
    if(year == ""){
       vehicleTrimControl.setValue('');
       _this.emptyBasicInfoFields();
      _this.getVehicleYear = _this.vehicleOption.controls.vehicle_year.value;
    }else{
      _this.getVehicleYear = year;
    }

     
    if(modelName == ""){      
      _this.resetTrimControl();
      _this.emptyBasicInfoFields();
      return;
    }else{
      vehicleTrimControl.enable();
    }    

    $.getJSON("https://www.carqueryapi.com/api/0.3/?callback=?", {cmd:"getTrims", year:_this.getVehicleYear, model:modelName}, function(response) {
        //The 'data' variable contains all response data.    
        console.log('response', response);
        if(response.Trims.length > 0){
          
          vehicleTrimControl.enable(); 
          _this.trims = response.Trims;                
  
        }else{         
          _this.resetTrimControl(); 
          _this.emptyBasicInfoFields();         
        }

    });

    //this.trims = this.models.find(x => x.name === modelName).trims;  
  }

  /**
   * get All VehicleDetails By Model ID
   * @return  array(vehicleDetails)
   */
  getAllVehicleDetails(event){
    const _this = this; 
    const selectedTrim = event.target;
    const modelId = selectedTrim.options[selectedTrim.selectedIndex].getAttribute('data-modelId');


    if(selectedTrim.value == ""){
      _this.emptyBasicInfoFields();
    }

    
    $.getJSON("https://www.carqueryapi.com/api/0.3/?callback=?", {cmd:"getModel", model:modelId}, function(response) {
        //The 'data' variable contains all response data.    
        //console.log('response', response);
          if(response.length > 0){                                

              _this.vehicleService.getAllVehicleDetails(response[0])              
              .subscribe(

              (response) => {      
                _this.basicInfoWizard.controls.basic_info.patchValue(response);
              
              },error => { });
          }
    });
   
    
  }


  /**
   * validate Year Option.   
   * @return  array(vehicle details)   
   */
  validateYearOption(){
    this.isVehicleOptionSubmitted = true;   

    if(this.vehicleOption.invalid) {
      this.isVehicleOptionSelected = false;
      return;
    }

    const vehicleYear = this.vehicleOption.controls.vehicle_year;
    if(vehicleYear.value == "more"){
      this.getVehicleYear = this.vehicleOption.controls.vehicle_year_value.value;
    }else{
      this.getVehicleYear = vehicleYear.value;
    }
      
    this.getVehicleStatisticsByYear(this.getVehicleYear);
  }

  /**
   * get Vehicles(Makes, Models, Trim...) By Year
   * @param year selected year from dropdown
   * @return  array(vehicle details)
   */
  /* getVehicleStatisticsByYear(year){

    let vehicleMakeControl = this.basicInfoWizard.controls.basic_info.get('vehicle_make');
    let vehicleModelControl = this.basicInfoWizard.controls.basic_info.get('vehicle_model');
    let vehicleTrimControl = this.basicInfoWizard.controls.basic_info.get('vehicle_trim');

    if(year == ''){ 
      vehicleMakeControl.disable(); this.makes = [];
      vehicleModelControl.disable(); this.models = [];
      vehicleTrimControl.disable(); this.trims = [];
      return;
    }

    this.commonUtilsService.showPageLoader();

    //manually create a data object which have the car unique id and seller id 
    const data = { year:year }

    //hit api to fetch data
    this.commonUtilsService.getVehicleStatisticsByYear(data)
    .pipe(untilDestroyed(this))
    .subscribe(

      //case success
    (response) => {      
      
      if(response == null){
        
        this.isVehicleOptionSelected = false;
        this.commonUtilsService.onError(environment.MESSAGES.NO_RECORDS_FOUND);

      }else{
        this.isVehicleOptionSelected = true;
        this.makes = response.makes;
        vehicleMakeControl.enable();
        vehicleModelControl.disable(); this.models = [];
        vehicleTrimControl.disable(); this.trims = [];
      } 

      this.commonUtilsService.hidePageLoader();
    
    //case error 
    },error => {

      this.isVehicleOptionSelected = false;  

      vehicleMakeControl.disable(); this.makes = [];
      vehicleModelControl.disable(); this.models = [];
      vehicleTrimControl.disable(); this.trims = [];

      this.commonUtilsService.hidePageLoader();
      this.commonUtilsService.onError(error);

    });
  } */


  /**
   * get Vehicles(Makes, Models, Trim...) By Year
   * @param year selected year from dropdown
   * @return  array(vehicle details)
   */
  getVehicleStatisticsByYear(year, make='', model=''){

    const _this = this;

    let vehicleMakeControl = _this.basicInfoWizard.controls.basic_info.get('vehicle_make');
    let vehicleModelControl = _this.basicInfoWizard.controls.basic_info.get('vehicle_model');
    let vehicleTrimControl = _this.basicInfoWizard.controls.basic_info.get('vehicle_trim');

    if(year == ''){ 
      vehicleMakeControl.disable(); _this.makes = [];
      vehicleModelControl.disable(); _this.models = [];
      vehicleTrimControl.disable(); _this.trims = [];
      _this.emptyBasicInfoFields();
      return;
    }

    _this.commonUtilsService.showPageLoader();

    //manually create a data object which have the car unique id and seller id 
    const data = { year:year }
    


    $.getJSON("https://www.carqueryapi.com/api/0.3/?callback=?", {cmd:"getMakes", year:year}, function(response) {
        //The 'data' variable contains all response data.    
        
        if(response.Makes.length > 0){

          _this.isVehicleOptionSelected = true;         
          _this.makes = response.Makes; // set makes in array

          vehicleMakeControl.enable();

          if(make === ''){
            _this.resetModelControl();
            _this.resetTrimControl();
            _this.emptyBasicInfoFields();
          }else{
            vehicleModelControl.enable();
            _this.fetchModelsByMake(make, year);
          }

          if(model === ''){
            _this.resetTrimControl();
            _this.emptyBasicInfoFields();
          }else{
            vehicleTrimControl.enable(); 
            _this.getTrimsByModel(model, year);
          } 
          
          
          
  
        }else{
          _this.isVehicleOptionSelected = false;  

          vehicleMakeControl.disable(); _this.makes = [];
          vehicleModelControl.disable(); _this.models = [];
          vehicleTrimControl.disable(); _this.trims = []; 
          _this.emptyBasicInfoFields(); 

          _this.commonUtilsService.onError(environment.MESSAGES.NO_RECORDS_FOUND);
        } 

        _this.commonUtilsService.hidePageLoader();

        //console.log('makes',response.Makes)
    });

    //hit api to fetch data
    /*this.commonUtilsService.getVehicleStatisticsByYear(data)
    .pipe(untilDestroyed(this))
    .subscribe(

      //case success
      response => { 
      //console.log('hjh', response);     
      
      if(response == null){
        
        this.isVehicleOptionSelected = false;        
        this.commonUtilsService.onError(environment.MESSAGES.NO_RECORDS_FOUND);

      }else{
        this.isVehicleOptionSelected = true;         
        this.makes = response.makes; // set makes in array

        vehicleMakeControl.enable();

        if(make === ''){
          vehicleModelControl.disable(); vehicleModelControl.setValue(''); this.models = [];
          vehicleTrimControl.disable(); vehicleTrimControl.setValue(''); this.trims = [];
        }else{
          vehicleModelControl.enable();
          this.fetchModelsByMake(make);
        }

        if(model === ''){
          vehicleTrimControl.disable(); this.trims = [];
        }else{
          vehicleTrimControl.enable(); this.getTrimsByModel(model);
        }
        
      
      } 

      this.commonUtilsService.hidePageLoader();
    
    //case error 
    },error => {

      this.isVehicleOptionSelected = false;  

      vehicleMakeControl.disable(); this.makes = [];
      vehicleModelControl.disable(); this.models = [];
      vehicleTrimControl.disable(); this.trims = [];

      this.commonUtilsService.hidePageLoader();
      this.commonUtilsService.onError(error);

    }); */
   

  }

  

  /**
   * validate Basic Info Wizard and move to Upload Images Wizard.   
   */
  validateBasicInfoWizard() : void {    

    this.isBasicInfoSubmitted = true;   

    if(this.basicInfoWizard.invalid) {
      return;
    }

    

  }

  /**
   * validate Vehicle Images Wizard and move to about Vehicle  Wizard.   
   */
  validateVehicleImagesWizard() : void { 
    
    this.isVehicleImagesSubmitted = true;   

    if(this.uploadVehicleImagesWizard.invalid) {
      return;
    }


  }

  /**
   * validate About Vehicle Wizard and move to Vehicle Condition Wizard.   
   */
  validateAboutVehicleWizard() : void { 
    
    this.isAboutVehicleSubmitted = true;   

    if(this.aboutVehicleWizard.invalid) {
      return;
    }

      
   // console.log(this.aboutVehicleWizard.value);

  }

  /**
   * validate offer in hands popup.   
   */
  validateOfferInHands() : void { 
    this.isOfferInHandsSubmitted = true;   
    this.isSkipSubmit = false;
    if(this.offerInHands.invalid) {
      return;
    }  

    $(this.offerInHandsSection.nativeElement).modal('hide');
  } 

  /**
   * skip offer in hands.   
   */
  skipOfferInHands() : void { 
    this.isSkipSubmit = true;

    this.offerInHands.controls.vehicle_finance_details.get('vehicle_offer_in_hands_price').setValue(0);
    while (this.offerInHandsImagesArray.length) {
      this.offerInHandsImagesArray.removeAt(this.offerInHandsImagesArray.length-1);
    }

    $(this.offerInHandsSection.nativeElement).modal('hide');
  } 

  /**
   * show vehicle Images by Catgeory.   
    * @param category vehicle image catgeory 
   */
  showVehicleImagesOnSummary(category): void{
    this.vehicleImageCategoryOnSummary = category;
  }

  /**
   * validate About Condition Wizard and move to Pickup Location Wizard.   
   */
  validateVehicleConditionWizard() : void { 
    
    this.isVehicleConditionSubmitted = true;   

    if(this.vehicleConditionWizard.invalid) {
      return;
    }

   // console.log(this.vehicleConditionWizard.value);

  }

  /**
   * validate Pickup Location Wizard and open offer in hands Popup.   
   */
  validatePickupLocationWizard() : void {
    
    this.isPickupLocationSubmitted = true;   

    if(this.pickupLocationWizard.invalid) {
      return;
    }

    // this.offerInHands.reset(); 
    $(this.offerInHandsSection.nativeElement).modal({backdrop: 'static', keyboard: false});
    

  }

  /**
   * show Offer In Hands Popup.   
   */
  get afterMarketImagesArray(): FormArray{
	  return this.aboutVehicleWizard.controls.vehicle_aftermarket.get('vehicle_aftermarket_images') as FormArray;
  }

  get vehicleConditionImagesArray(): FormArray{
	  return this.vehicleConditionWizard.controls.vehicle_condition.get('vehicle_condition_images') as FormArray;
  }

  get offerInHandsImagesArray(): FormArray{
	  return this.offerInHands.controls.vehicle_finance_details.get('vehicle_proof_image') as FormArray;
  }

  get vehicleImagesArray(): FormArray{
	  return this.uploadVehicleImagesWizard.controls.vehicle_images as FormArray;
  }

  /**
   * show Offer In Hands Popup.   
   */
  showOfferInHands() : void{
    $(this.offerInHandsSection.nativeElement).modal({backdrop: 'static', keyboard: false});
  }

  

  /**
   * check vehicle year if more selected
   * @param value if more selected 
   */
  setVehicleYear(value: string): void {
    const vehicleYearValue = this.vehicleOption.controls.vehicle_year_value;
    if(value == "more"){
      this.isMoreSelected = true;
      vehicleYearValue.setValidators(Validators.compose([Validators.required,Validators.min(this.minYear), Validators.max(this.maxYear)]));
      vehicleYearValue.updateValueAndValidity();
    }else{
      this.isMoreSelected = false;
      vehicleYearValue.clearValidators();
      vehicleYearValue.updateValueAndValidity();
    }   
  }

  /**
   * check exterior color
   * @param value color 
   */
  setExteriorColor(value: string): void {
    
    const vehicleExteriorColorIfOtherSelected = this.basicInfoWizard.controls.basic_info.get('vehicle_other_exterior_color');
   
    
    if(value == "Other"){
      this.isOtherExteriorColorSelected = true;
      vehicleExteriorColorIfOtherSelected.setValidators(Validators.compose([Validators.required,Validators.minLength(2),Validators.maxLength(20), Validators.pattern('^[a-zA-Z ]*$')] ));
      vehicleExteriorColorIfOtherSelected.updateValueAndValidity();
    }else{ 
      vehicleExteriorColorIfOtherSelected.patchValue('');
      this.isOtherExteriorColorSelected = false;
      vehicleExteriorColorIfOtherSelected.clearValidators();
      vehicleExteriorColorIfOtherSelected.updateValueAndValidity();
    } 

    this.exteriorColor = value;
  }

  /**
   * check interior color
   * @param value color 
   */
  setInteriorColor(value: string): void {
    const vehicleInteriorColorIfOtherSelected = this.basicInfoWizard.controls.basic_info.get('vehicle_other_interior_color');
    
    
    if(value == "Other"){
      this.isOtherInteriorColorSelected = true;
      vehicleInteriorColorIfOtherSelected.setValidators(Validators.compose([Validators.required,Validators.minLength(2),Validators.maxLength(20), Validators.pattern('^[a-zA-Z ]*$')]));
      vehicleInteriorColorIfOtherSelected.updateValueAndValidity();
    }else{ 
      vehicleInteriorColorIfOtherSelected.patchValue('');
      this.isOtherInteriorColorSelected = false;
      vehicleInteriorColorIfOtherSelected.clearValidators();
      vehicleInteriorColorIfOtherSelected.updateValueAndValidity();
    } 
    this.interiorColor = value; 
  }
  
  /**
   * check which vehicle option is selected
   * @param value vehicle refrence value 
   */
  setVehicleOptionValue(value: string): void {    
    const vehicleYear = this.vehicleOption.controls.vehicle_year;
    const vehicleVIN = this.vehicleOption.controls.vin_number;
    const existingVehicle = this.vehicleOption.controls.existing_vehicle;

      if(value == "Year"){    
        vehicleYear.setValidators([Validators.required]);
        vehicleYear.updateValueAndValidity();
        vehicleVIN.clearValidators();
        vehicleVIN.updateValueAndValidity();
        existingVehicle.clearValidators();
        existingVehicle.updateValueAndValidity();
      }

      if(value == "Existing"){
        existingVehicle.setValidators([Validators.required]);
        existingVehicle.updateValueAndValidity();
        vehicleVIN.clearValidators();
        vehicleVIN.updateValueAndValidity();
        vehicleYear.clearValidators();
        vehicleYear.updateValueAndValidity();
      }

      if(value == "VIN"){
        vehicleVIN.setValidators([Validators.required]);        
        vehicleVIN.updateValueAndValidity();
        vehicleYear.clearValidators();
        vehicleYear.updateValueAndValidity();
        existingVehicle.clearValidators();
        existingVehicle.updateValueAndValidity();
      }

      this.setVehicleReferenceDefaultValue = name;  

  } 

  /**
   * check vehicle Image Category is selected
   * @param  vehicleCategory refrence value 
   */
  checkVehicleImageCatgeory(vehicleCategory: string): void {
    this.vehicleImageCategory = vehicleCategory;  
    
  }

  /**
   * check vehicle reference is selected
   * @param name vehicle refrence value
   * @return  boolean
   */
  isVehicleReferenceSelected(name: string): boolean{ 
      if (!this.setVehicleReferenceDefaultValue) { 
          return false;  
        }  
      return (this.setVehicleReferenceDefaultValue === name); 
  }

  

  /**
   * check vehicle aftermarket key has switched on/off
   * @param event object
   * @return  string
   */
  toggleVehicleAfterMarket(event){   
    let vehicleAfterMarketDescription = this.aboutVehicleWizard.controls.vehicle_aftermarket.get('vehicle_aftermarket_description');   
    
    vehicleAfterMarketDescription.patchValue('');
    while (this.afterMarketImagesArray.length) {
      this.afterMarketImagesArray.removeAt(this.afterMarketImagesArray.length-1);
    }

    if( event.target.checked ){
      this.isVehicleAftermarketSelected = true;
      vehicleAfterMarketDescription.setValidators(Validators.compose([Validators.required,Validators.minLength(10),Validators.maxLength(200)]));
      vehicleAfterMarketDescription.updateValueAndValidity();

      this.vehicleAftermarket = true;
    }else{ 
      this.isVehicleAftermarketSelected = false;
      vehicleAfterMarketDescription.clearValidators();
      vehicleAfterMarketDescription.updateValueAndValidity();

      this.vehicleAftermarket = false;
    }         
  }

  /**
  * get vehicle aftermarket option value.
  * @return  boolean .
  */
  get vehicleAftermarket(): boolean {
    return this._vehicleAftermarket;
  }

  /**
  * set vehicle aftermarket key value.
  * @param vehicleAftermarket  boolean.
  */
  set vehicleAftermarket(vehicleAftermarket: boolean) {
    this._vehicleAftermarket = vehicleAftermarket;    
  }


  /**
   * check vehicle second key has switched on/off
   * @param event object
   * @return  string
   */
  toggleVehicleSecondKey(event): void {    
    ( event.target.checked ) ? this.secondKey = true : this.secondKey = false;     
  }

  /**
  * get vehicle second key option value.
  * @return  string(on/off) .
  */
  get secondKey(): boolean {
    return this._secondKey;
  }

  /**
  * set vehicle second key value.
  * @param secondKey  string(on/off).
  */
  set secondKey(secondKey: boolean) {
    this._secondKey = secondKey; 
        
  }

  /**
   * check vehicle clean has switched on/off
   * @param event object   
   */
  toggleVehicleCleanTitle(event): void {  
    let vehicleOwnershipDescription = this.aboutVehicleWizard.controls.vehicle_ownership.get('vehicle_ownership_description');
    let vehicleOwnershipValue = this.aboutVehicleWizard.controls.vehicle_ownership.get('vehicle_ownership_value');
    vehicleOwnershipDescription.patchValue('');
    if ( event.target.checked ) {      
      this.isVehicleCleanTitleSelected = true; 
           
      this.cleanTitle = true

      this.isOtherSelected=false; 
      
      vehicleOwnershipDescription.clearValidators();        
      vehicleOwnershipDescription.updateValueAndValidity(); 
      vehicleOwnershipValue.clearValidators();        
      vehicleOwnershipValue.updateValueAndValidity();

    }else{
      this.isVehicleCleanTitleSelected = false; 

      this.cleanTitle = false

      if(this.vehicleOwnership == "Other"){
        this.isOtherSelected = true;        
        vehicleOwnershipDescription.setValidators(Validators.compose([Validators.required,Validators.minLength(10),Validators.maxLength(200)]));        
        vehicleOwnershipDescription.updateValueAndValidity();
      }else{
        this.isOtherSelected = false;        
        vehicleOwnershipDescription.clearValidators();        
        vehicleOwnershipDescription.updateValueAndValidity();
      } 
      
      vehicleOwnershipValue.setValidators(Validators.compose([Validators.required]));        
      vehicleOwnershipValue.updateValueAndValidity();
    }
    //console.log(this.isOtherSelected);
    
  }


  /**
   * check vehicle clean has switched on/off
   * @param vehicleCleanTitle boolean   
   */
  fetchVehicleCleanTitle(vehicleCleanTitle): void {  
    let vehicleOwnershipDescription = this.aboutVehicleWizard.controls.vehicle_ownership.get('vehicle_ownership_description');
    let vehicleOwnershipValue = this.aboutVehicleWizard.controls.vehicle_ownership.get('vehicle_ownership_value');
    vehicleOwnershipDescription.patchValue('');
    if ( vehicleCleanTitle ) {      
      this.isVehicleCleanTitleSelected = true; 
           
      this.cleanTitle = true

      this.isOtherSelected=false; 
      
      vehicleOwnershipDescription.clearValidators();        
      vehicleOwnershipDescription.updateValueAndValidity(); 
      vehicleOwnershipValue.clearValidators();        
      vehicleOwnershipValue.updateValueAndValidity();

    }else{
      this.isVehicleCleanTitleSelected = false; 

      this.cleanTitle = false

      if(this.vehicleOwnership == "Other"){
        this.isOtherSelected = true;        
        vehicleOwnershipDescription.setValidators(Validators.compose([Validators.required,Validators.minLength(10),Validators.maxLength(200)]));        
        vehicleOwnershipDescription.updateValueAndValidity();
      }else{
        this.isOtherSelected = false;        
        vehicleOwnershipDescription.clearValidators();        
        vehicleOwnershipDescription.updateValueAndValidity();
      } 
      
      vehicleOwnershipValue.setValidators(Validators.compose([Validators.required]));        
      vehicleOwnershipValue.updateValueAndValidity();
    }
    //console.log('isOtherSelected', this.isOtherSelected);
    
  }


  /**
  * get vehicle clean title option value.
  * @return  boolean .
  */
  get cleanTitle(): boolean {
    return this._cleanTitle;
  }

  /**
  * set vehicle clean title value.
  * @param cleanTitle  boolean.
  */
  set cleanTitle(cleanTitle: boolean) {
    this._cleanTitle = cleanTitle;    
  }

  /**
    * get vehicle ownership option value.
    * @return  string .
    */
  get vehicleOwnership(): string {
    return this._vehicleOwnership;
  }

  /**
  * set Vehicle Ownership value.
  * @param $vehicleOwnership  string.
  */
  set vehicleOwnership($vehicleOwnership: string) {
    this._vehicleOwnership = $vehicleOwnership;    
  }


  /**
   * check vehicle ownership value
   * @param vehicleCleanTitle values
   * @param vehicleOwnership values
   */
  checkVehicleOwnershipRadioValue(vehicleOwnership: string, vehicleCleanTitle): void { 

    let vehicleOwnershipDescription = this.aboutVehicleWizard.controls.vehicle_ownership.get('vehicle_ownership_description');
    
    if(vehicleOwnership == "Other"){
        (vehicleCleanTitle)?this.isOtherSelected = false: this.isOtherSelected = true;         
        vehicleOwnershipDescription.setValidators(Validators.compose([Validators.required,Validators.minLength(10),Validators.maxLength(200)]));        
        vehicleOwnershipDescription.updateValueAndValidity();
      }else{
        vehicleOwnershipDescription.patchValue('');  
        this.isOtherSelected = false;        
        vehicleOwnershipDescription.clearValidators();        
        vehicleOwnershipDescription.updateValueAndValidity();
      }    
      this.vehicleOwnership = vehicleOwnership;  
  }
  
  /**
   * check vehicle condition value
   * @param event object
   * @param vehicleCondition values
   */
  checkVehicleConditionRadioValue(event, vehicleCondition: string): void { 
    let vehicleConditionDescription = this.vehicleConditionWizard.controls.vehicle_condition.get('vehicle_condition_description');    
    vehicleConditionDescription.patchValue(''); 

    while (this.vehicleConditionImagesArray.length) {
      this.vehicleConditionImagesArray.removeAt(this.vehicleConditionImagesArray.length-1);
    }

    if(vehicleCondition == "reconditioning" || vehicleCondition == "functional" || vehicleCondition == "parts"){
      this.isVehicleConditionSelected = true;  
         
      vehicleConditionDescription.setValidators(Validators.compose([Validators.required,Validators.minLength(10),Validators.maxLength(200)]));        
      vehicleConditionDescription.updateValueAndValidity();
    }else{
      this.isVehicleConditionSelected = false; 
             
      vehicleConditionDescription.clearValidators();        
      vehicleConditionDescription.updateValueAndValidity();
    }
    this.vehicleConditionValue = event.target.value;
    
  }

  /**
    * get vehicle ownership option value.
    * @return  string .
    */
   get vehicleConditionValue(): string {
    return this._vehicleConditionValue;
  }

  /**
  * set Vehicle Ownership value.
  * @param $vehicleConditionValue  string.
  */
  set vehicleConditionValue($vehicleConditionValue: string) {
    this._vehicleConditionValue = $vehicleConditionValue;    
  }


  /**
   * check willing to drive key has switched on/off
   * @param event object
   */
  toggleWillingToDrive(event): void {   
    let willingToDriveHowManyMiles = this.pickupLocationWizard.controls['willing_to_drive_how_many_miles'];  
    willingToDriveHowManyMiles.patchValue(0);      
    if( event.target.checked ){
      this.isWillingToDriveSelected = true;
      willingToDriveHowManyMiles.setValidators(Validators.compose([Validators.required,Validators.minLength(1),Validators.maxLength(3),Validators.pattern(/^-?(0|[1-9]\d*)?$/)]));
      
      willingToDriveHowManyMiles.updateValueAndValidity();
      this.willingToDrive = true;
    }else{ 
      this.isWillingToDriveSelected = false;
      willingToDriveHowManyMiles.clearValidators();
      willingToDriveHowManyMiles.updateValueAndValidity();
      this.willingToDrive = false;
    }     
  }

  /**
  * get vehicle aftermarket option value.
  * @return  boolean (on/off) .
  */
  get willingToDrive(): boolean {
    return this._willingToDrive;
  }

  /**
  * set vehicle aftermarket key value.
  * @param $willingToDrive  boolean(on/off).
  */
  set willingToDrive($willingToDrive: boolean) {
    this._willingToDrive = $willingToDrive; 
    //this.pickupLocationWizard.controls['willing_to_drive'].patchValue(this._willingToDrive);   
  }

  /**
   * check vehicle to be pciked up has switched on/off
   * @param event object   
   */
  toggleVehiclePickedUp(event): void {    
    ( event.target.checked ) ? this.vehiclePickedUp = true : this.vehiclePickedUp = false;     
  }

  
  /**
  * get vehicle to be picked up value.
  * @return  boolean(on/off) .
  */
  get vehiclePickedUp(): boolean {
    return this._vehiclePickedUp;
  }

  /**
  * set vehicle to be picked up value.
  * @param vehiclePickedUp  boolean(on/off).
  */
  set vehiclePickedUp(vehiclePickedUp: boolean) {
    this._vehiclePickedUp = vehiclePickedUp;  
    //this.pickupLocationWizard.controls['vehicle_to_be_picked_up'].patchValue(this._vehiclePickedUp);  
  }

  /**
  * empty basic Info Fields.
  */
  emptyBasicInfoFields():void{

    this.vehicleService.getAllVehicleDetails(this.basicInfoDetails).subscribe(
      (response) => {      
        this.basicInfoWizard.controls.basic_info.patchValue(response);
      
      },error => { });
  }

  /**
  * Reset Trim Control
  */
  resetTrimControl():void{
    let vehicleTrimControl = this.basicInfoWizard.controls.basic_info.get('vehicle_trim');
    vehicleTrimControl.disable(); vehicleTrimControl.setValue('');  this.trims = [];
  }

  /**
  * Reset Trim Control
  */
  resetModelControl():void{
    let vehicleModelControl = this.basicInfoWizard.controls.basic_info.get('vehicle_model');
    vehicleModelControl.disable(); vehicleModelControl.setValue('');  this.models = [];
  }

  /**
  * set check object array length.
  * @param object
  *  @return number
  */

  public checkObjectLength(object): number{
    return Object.keys(object).length;
  }


  /**
   * validate wizard and move to either direction. 
   * @param validityStatus boolean(form validation status)
   * @param direction boolean(wizard direction)
   * @return  boolean
   */
  moveDirection = (validityStatus, direction) => {      
      if (direction === MovingDirection.Backwards) {       
          return true;
      }      
      return validityStatus;
  }; 

  /**
   * smooth scroll to specific div*   
   */
  scrollToSpecificDiv(): void {   
    this.editCarSection.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" }); 
  }

  ngOnInit() {  
    this.fetchVehicleDetails(); //fetch vehcile details
    this.editCarSection.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });     
  }

  ngAfterViewInit(){  
    //years range
    for (let i = 0; i < 2; i++) {
      this.yearRange.push({
        label: this.currentYear - i,
        value: this.currentYear - i
      });
    }
  }

  

  // This method must be present, even if empty.
  ngOnDestroy() {
    // To protect you, we'll throw an error if it doesn't exist.
  }

  
  
 



}
