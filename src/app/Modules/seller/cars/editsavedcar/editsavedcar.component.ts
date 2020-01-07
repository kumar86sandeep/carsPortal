import { Component, OnInit,  ViewChild, ElementRef, ViewEncapsulation, NgZone } from '@angular/core';
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
import { UserAuthService, TitleService, VehicleService, CommonUtilsService } from '../../../../core/_services'

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
  selector: 'app-editsavedcar',
  templateUrl: './editsavedcar.component.html',
  styleUrls: ['./editsavedcar.component.css'],
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
export class EditSavedCarComponent implements OnInit {
  

  // Define Page Title and Breadcrumbs
  title:string = 'Edit Car Details'; 
  breadcrumbs:any = [{page:'Home',link:'/seller/home'},{ page: "Car Listing", link: '/seller/car-listing' },{page:'Edit Car Details',link:''}]

  // Smooth Scroll To Add Car Form Wizard
  @ViewChild("editSavedCarSection") editSavedCarSection: ElementRef;

  // Array where we are going to do CRUD operations
  //vehicleImagesArray:any = [{Interior: []}, {Exterior: []}];
  vehicleImages:any = [];
  interiorImagesArray:any = [];
  exteriorImagesArray:any = [];  
  getVehicleYear:string = "";
  disabled:boolean=false;
  file_default:boolean=false;
  defaultVehicleImageKeyIndex:number = 0;

  // editSavedCar Form Group Wizard
  vehicleDetails: FormGroup;
  standardOptionsWizard: FormGroup;
  uploadVehicleImagesWizard: FormGroup;
  aboutVehicleWizard: FormGroup;
  vehicleConditionWizard: FormGroup;
  financeDetailsWizard: FormGroup;

  

  isStandardOptionsSubmitted:boolean = false;
  isVehicleImagesSubmitted:boolean = false;
  isAboutVehicleSubmitted:boolean = false;
  isVehicleConditionSubmitted:boolean = false;
  isFinanceDetailsSubmitted:boolean = false;
  isVehicleDetailsSubmitted:boolean = false;
  onlyPickUpNote:boolean = false;
  isMyCarFound:boolean = false;
  isAllVehicleDetailsSelected:boolean=false;
  
  
  isStandardOptionsFieldsVisible:boolean = true;  
  isMoreSelected:boolean = false;
  isThisYourCar:boolean = false;
 
  isVinSelected:boolean = false;
  isYearSelected:boolean = false;  
  isVehicleAftermarketSelected:boolean = false;
  isVehicleCleanTitleSelected:boolean = true;
  isWillingToDriveSelected:boolean = false;
  isVehicleHasMinSellingPriceSelected:boolean = false;
  isVehicleHasPayoffBalanceSelected:boolean = false;
  isVehicleHasOfferInHandSelected:boolean = false;
  isOtherSelected:boolean = false;
  isSalvageSelected:boolean = false;
  isTMUSelected:boolean = false;
  isLemonLawSelected:boolean = false;
  isVehicleConditionSelected:boolean = false;
  isYearEnabled:boolean = true;
  isSkipSubmit:boolean = false;
  isOtherInteriorColorSelected:boolean = false;
  isOtherExteriorColorSelected:boolean = false;

  vehicleImageCategory:string = "Exterior";
  exteriorColor:string = "Black";
  interiorColor:string = "Black";
  vehicleImageCategoryOnSummary:string = "all";
  base64StringFile:any;
  

  addVehicleSubscription: Subscription;

  private setVehicleReferenceDefaultValue: string = "VIN";    // set Default Vehicle Reference Radio Button Value

  cities:any =[]
  makes = [];  
  models = [];
  trims = [];
  vehicleOptions = [];
  vehicleSpecifications = [];
  removeFileArray = [];
  standardEquipmentsArray:any = [];
  entertainmentsArray:any = [];
  wheelsArray:any = [];
  accessoryPackagesArray:any = [];
  vehicleOwnershipArray:any = [];
  
  filteredStandardEquipmentsArray = []; 
  filteredEntertainmentsArray = []; 
  filteredWheelsArray = []; 
  filteredAccessoryPackagesArray = []; 
  filteredVehicleOwnershipArray = [];

  interiorMaterials= [{name: "Leather"}, {name: "Cloth"}, {name: "Nylon"}];
  standardOptionsDetails= {model_doors: "", model_engine_cyl: "", model_transmission_type: "", model_engine_fuel: "", model_drive: "", model_body: ""};


  vehicleMakeLabel ="";
  vehicleModelLabel ="";
  vehicleYearLabel ="";
  vehicleTrimLabel ="";
  vehicleVINLabel ="";
  vehicleLicensePlateLabel="";
 

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
  private _vehicleConditionValue:string = 'Excellent';
  private _cleanTitle:boolean= true;
  private _willingToDrive:string= '50 miles';
  private _vehicleHasMinSellingPrice:boolean = false;
  private _vehicleHasPayoffBalance:boolean = false;
  private _vehicleHasOfferInHand:boolean = false;
  private _vehiclePickedUp:boolean = false;
  private _vehicleLocation:any = {}

  yearRange:any = [];
  colors:any = [];

  currentYear: number = new Date().getFullYear();   // get Current Year

  minYear: number = 2000;
  maxYear: number = this.currentYear;



constructor( private zone:NgZone, private location: Location, private alertService: AlertService, private vehicleService: VehicleService, private userAuthService: UserAuthService, private pageLoaderService: PageLoaderService, private formBuilder: FormBuilder, private titleService: TitleService, private commonUtilsService: CommonUtilsService, private activatedRoute: ActivatedRoute, private toastr: ToastrManager, private router: Router) { 


  this.colors = [{label:'Beige',value:'#F5F5DC'},{label:'Black',value:'#252627'},{label:'Brown',value:'#672E10'},{label:'Burgundy',value:'#75141C'},{label:'Charcoal Grey',value:'#757776'},{label:'Dark Blue',value:'#172356'},{label:'Dark Green',value:'#316241'},{label:'Gold',value:'#D6C17F'},{label:'Grey',value:'#808080'},{label:'Light Blue',value:'#5F7DC5'},{label:'Light Green',value:'#8E9F87'},{label:'Orange',value:'#FF9200'},{label:'Purple',value:'#6A4574'},{label:'Red',value:'#E32F43'},{label:'Silver',value:'#D4D9DC'},{label:'Tan',value:'#D2B48C'},{label:'White',value:'#F2F6F9'},{label:'Yellow',value:'#F8E81C'}];

  this.selectvehicleDetails(); // Initialize Vehicle Option Fields 
  this.standardOptions();          // Initialize Basic Info Wizard Fields 
  this.uploadVehicleImages(); // Initialize Vehicle Images Wizard Fields
  this.aboutVehicle();       // Initialize About Vehicle Wizard Fields
  this.vehicleCondition();   // Initialize Vehicle Condition Wizard Fields
  this.financeDetails();     // Initialize Pickup Location Wizard Fields
  

  this.vehicleImagesDropzoneInit()        //initalize dropzone library
  this.vehicleAfterMarketDropzoneInit(); //initalize dropzone library
  this.vehicleAfterConditionDropzoneInit(); //initalize dropzone library
  this.offerInHandsDropzoneInit(); //initalize dropzone library 

  
}
  

  /**
  * Initialize Basic Info Wizard Fields.
  */
  private selectvehicleDetails(){
    this.vehicleDetails = this.formBuilder.group({
      _id: [this.activatedRoute.snapshot.params._id],
      seller_id: [localStorage.getItem('loggedinUserId')],
      vin_number: ['', Validators.compose([Validators.required,Validators.minLength(17),Validators.maxLength(17)])],              
      license_plate: ['', Validators.compose([Validators.required,Validators.minLength(1),Validators.maxLength(8)])],              
      vehicle_year: [''],   
      vehicle_make: [''],
      vehicle_model: [''],
      vehicle_transmission_style: [''],
      vehicle_engine_cylinders: [''],
      vehicle_engine_model: [''],
      vehicle_trim: ['', Validators.compose([Validators.required, Validators.minLength(1),Validators.maxLength(50)])],        
     /* vehicle_location:this.formBuilder.group({
        zipcode: ['', Validators.compose([Validators.required,Validators.pattern('^[0-9]{5}$')])],     
        state: [''],
        city: [''],
        coordinates:[null]
      }) */     
    });
  }

  /**
  * Initialize Basic Info Wizard Fields.
  */
  private standardOptions(){
    this.standardOptionsWizard = this.formBuilder.group({ 
      vehicle_mileage: ['', Validators.compose([Validators.required, Validators.min(1),Validators.minLength(1),Validators.maxLength(6),Validators.pattern(/^-?(0|[1-9]\d*)?$/)])],    
      standard_equipments_checkbox: [false],
      entertainment_checkbox: [false],
      wheel_checkbox: [false],
      accessory_package_checkbox: [false],
      standard_equipments: this.formBuilder.array([]),
      additional_options: this.formBuilder.group({
        entertainments: this.formBuilder.array([]), 
        wheels: this.formBuilder.array([]), 
        accessory_packages: this.formBuilder.array([]), 
      }),      
      basic_info:this.formBuilder.group({         
        vehicle_interior_color: ['Black', Validators.compose([Validators.required])],
        vehicle_other_interior_color: [''],
        vehicle_exterior_color: ['Black', Validators.compose([Validators.required])],
        vehicle_other_exterior_color: [''],
        vehicle_interior_material: ['', Validators.compose([Validators.required])]                     
      })
    });
  }

  /**
  * Initialize Basic Info Wizard Fields.
  */
  private uploadVehicleImages(){
    this.uploadVehicleImagesWizard = this.formBuilder.group({  
      vehicle_image_category_name: ['Exterior'],    
      vehicle_image_default_value:[true],             
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
        vehicle_clean_title : [true],
        vehicle_ownership_value : this.formBuilder.array([]),
        vehicle_ownership_description : ['']            
      }),
      vehicle_to_be_picked_up:  [false],       
      willing_to_drive_how_many_miles: ['50 miles', Validators.compose([Validators.required])],
      
      
    }); 
  }

  /**
  * Initialize Vehicle Condition Wizard Fields.
  */
  private vehicleCondition(){
    this.vehicleConditionWizard = this.formBuilder.group({      
      vehicle_comments: ['', Validators.compose([Validators.minLength(10),Validators.maxLength(200)])],    
      vehicle_condition:this.formBuilder.group({    
        vehicle_condition_value: ['Excellent'],
        vehicle_condition_description: [''],
        vehicle_condition_images: this.formBuilder.array([]),
      })
    }); 
  }

  /**
  * Initialize Pickup Location Wizard Fields.
  */
  private financeDetails(){     
    this.financeDetailsWizard = this.formBuilder.group({ 
      vehicle_finance_details:this.formBuilder.group({
        vehicle_finance_bank: [''],
        vehicle_min_selling_price: [0, Validators.compose([Validators.required, Validators.min(1)])],     vehicle_has_min_selling_price: [false],   
        vehicle_has_payoff_balance:[false], 
        vehicle_pay_off: [0],  
        vehicle_has_offer_in_hand:[false],     
        vehicle_offer_in_hands_price : [0],
        vehicle_proof_image: this.formBuilder.array([]), 
      })                            
    });
  }

  
  get standardEquipments() {
    return this.standardOptionsWizard.get('standard_equipments') as FormArray;
  }

  get entertainments() {
    return this.standardOptionsWizard.controls.additional_options.get('entertainments') as FormArray;    
  }

  get wheels() {
    return this.standardOptionsWizard.controls.additional_options.get('wheels') as FormArray;
    
  }

  get accessory_packages() {
    return this.standardOptionsWizard.controls.additional_options.get('accessory_packages') as FormArray; 
  }

  get vehicleOwnershipValue() {
    return this.aboutVehicleWizard.controls.vehicle_ownership.get('vehicle_ownership_value') as FormArray; 
  }

  

  /**
   * save Car in DB  
   */
  onSubmitEditSavedCar(): void {


    this.standardEquipmentsArray.forEach(equipment => {        

        this.standardEquipments.push(new FormControl(equipment));       
      
    }); 

    this.entertainmentsArray.forEach(entertainment => {        

        this.entertainments.push(new FormControl(entertainment));       
      
    });


    this.wheelsArray.forEach(wheel => {        

        this.wheels.push(new FormControl(wheel));       
      
    });


    this.accessoryPackagesArray.forEach(accessory => {        

      this.accessory_packages.push(new FormControl(accessory));       
    
    });
   
    

    if(this.financeDetailsWizard.controls.vehicle_finance_details.get('vehicle_offer_in_hands_price').value == null || this.financeDetailsWizard.controls.vehicle_finance_details.get('vehicle_offer_in_hands_price').value == ""){
      this.financeDetailsWizard.controls.vehicle_finance_details.get('vehicle_offer_in_hands_price').setValue(0);
    }
    
    if(this.financeDetailsWizard.controls.vehicle_finance_details.get('vehicle_pay_off').value == null || this.financeDetailsWizard.controls.vehicle_finance_details.get('vehicle_pay_off').value == ""){
      this.financeDetailsWizard.controls.vehicle_finance_details.get('vehicle_pay_off').setValue(0);
    }

    if(this.financeDetailsWizard.controls.vehicle_finance_details.get('vehicle_min_selling_price').value == null || this.financeDetailsWizard.controls.vehicle_finance_details.get('vehicle_min_selling_price').value == ""){
      this.financeDetailsWizard.controls.vehicle_finance_details.get('vehicle_min_selling_price').setValue(0);
    }


    // Remove Old File From Vehicle Details 
    if(this.removeFileArray.length > 0){
      this.removeFileArray.forEach(file => {
          this.removeImageFromBucket(file.file_key);  
      }); 
    }

    // Merge Category Image Array    
    this.vehicleImages = [...this.interiorImagesArray, ...this.exteriorImagesArray];

    this.vehicleImages.forEach(vehicleImage => {
          this.vehicleImagesArray.push(new FormControl({file_path : vehicleImage.file_path, file_name : vehicleImage.file_name, file_default : vehicleImage.file_default, file_key : vehicleImage.file_key, file_category : vehicleImage.file_category}))
    });
    

    // Vehicle Ownership
    this.vehicleOwnershipArray.forEach(vehicle_ownership => { 
      this.vehicleOwnershipValue.push(new FormControl(vehicle_ownership));           
    }); 

    // set Default Vin Number
    //this.vehicleDetails.controls.vin_number.setValue('1C6RR7GT1ES223950');

    var mergeVehicleData = Object.assign(this.vehicleDetails.value, this.standardOptionsWizard.value, this.uploadVehicleImagesWizard.value, this.aboutVehicleWizard.value, this.vehicleConditionWizard.value, this.financeDetailsWizard.value);

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
    dictInvalidFileType: 'Only valid jpeg, jpg, png and pdf file is accepted.',
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
              componentObj.interiorImagesArray.push({file_path : serverResponse.fileLocation, file_key : serverResponse.fileKey, file_default:componentObj.file_default, file_name : serverResponse.fileName, file_category : componentObj.getVehicleImageCategory().toLowerCase()});              

            }else{

              componentObj.exteriorImagesArray.length == 0?componentObj.file_default=true:componentObj.file_default=false;


              componentObj.exteriorImagesArray.push({file_path : serverResponse.fileLocation, file_key : serverResponse.fileKey, file_default:componentObj.file_default, file_name : serverResponse.fileName, file_category : componentObj.getVehicleImageCategory().toLowerCase()});
            }            

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
    
    if(file_category == 'condition'){ this.vehicleConditionImagesArray.removeAt(index); }
    if(file_category == 'aftermarket'){ this.afterMarketImagesArray.removeAt(index);  }
    if(file_category == 'offer_in_hands'){ this.offerInHandsImagesArray.removeAt(index); }  
    


    if(file_category == 'exterior'){
       _.pullAt(this.exteriorImagesArray, [index]); 
      
      if(this.defaultVehicleImageKeyIndex == index){

        if(this.exteriorImagesArray.length > 0){
          this.defaultVehicleImageKeyIndex = 0;
          this.exteriorImagesArray[0].file_default = true;
        }
        
      }else{

        this.defaultVehicleImageKeyIndex = this.exteriorImagesArray.findIndex(function(image) {
          return image.file_default == true;
        })

      }
    }

    this.removeFileArray.push({file_key:file_key});

    this.commonUtilsService.onSuccess('File has been removed successfully.'); 

    //this.removeImageFromBucket(file_key);
  }

  /**
   * set Vehicle Default Image
   * @param index index of the image array  
   * @return  boolean
   */
  checkDefaultVehicleImageValue(index): void {
    this.exteriorImagesArray[this.defaultVehicleImageKeyIndex].file_default = false;
    this.exteriorImagesArray[index].file_default = true;
    this.defaultVehicleImageKeyIndex = index;

    //console.log(this.defaultVehicleImageKeyIndex);
    //console.log(this.exteriorImagesArray);
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
  * get vehicle Image Category.
  * @return     string(vehicle image category)
  */
  private getVehicleImageCategory(){
    return this.uploadVehicleImagesWizard.controls.vehicle_image_category_name.value;
  }


  /**
   * validate VIN Details.   
   * @return  array(vehicle details)   
   */
  validateVINNumber(modelName){

    this.isVehicleDetailsSubmitted = true;   

    if(this.vehicleDetails.invalid) {
      this.isThisYourCar = false;
      return;
    }
    this.setVehicleOptionsAndSpecifications();
    this.isThisYourCar = true;
    
   
      
    
  }


  /**
   * set Vehicle Options and Specifications
   *  
   */
  setVehicleOptionsAndSpecifications(): void{     
    this.standardEquipmentsArray.forEach(equipment => {      
      if(this.vehicleOptions.find(x => x.car_option_name == equipment.name)){
        let index = this.standardEquipmentsArray.findIndex(x => x.name == equipment.name);
        this.standardEquipmentsArray[index].selected = true;          
      }  
    });

    this.entertainmentsArray.forEach(entertainment => {      
      if(this.vehicleOptions.find(x => x.car_option_name == entertainment.name)){
        let index = this.entertainmentsArray.findIndex(x => x.name == entertainment.name);
        this.entertainmentsArray[index].selected = true;          
      }  
    });

    this.accessoryPackagesArray.forEach(accessory => {      
      if(this.vehicleOptions.find(x => x.car_option_name == accessory.name)){
        let index = this.accessoryPackagesArray.findIndex(x => x.name == accessory.name);
        this.accessoryPackagesArray[index].selected = true;          
      }  
    });

    this.wheelsArray.forEach(wheel => {      
      if(this.vehicleOptions.find(x => x.car_option_name == wheel.name)){
        let index = this.wheelsArray.findIndex(x => x.name == wheel.name);
        this.wheelsArray[index].selected = true;          
      }  
    });
   
  }

  /**
   * set Vehicle Options and Specifications Checkbox Value
   *  
   */
  updateVehicleOptionsValue(index, array_name, event): void{
    console.log('event', event.target.checked);
    console.log('index', index);

    if(array_name == 'equipment'){
      this.standardEquipmentsArray[index].selected = event.target.checked;
           
    }  
    if(array_name == 'entertainment'){
      this.entertainmentsArray[index].selected = event.target.checked;
    }
    if(array_name == 'accessory'){
      this.accessoryPackagesArray[index].selected = event.target.checked;
    }
    if(array_name == 'wheel'){
      this.wheelsArray[index].selected = event.target.checked;
    }

    
  }


  /**
   * show/hide Submit Buttons
   * event 
   */
  onSelectTrim(event): void{     
    let selectedTrim = event.target;
    let trimId = selectedTrim.options[selectedTrim.selectedIndex].getAttribute('data-modelId');


    this.commonUtilsService.showPageLoader('Please wait...');

    (selectedTrim.value == "") ? this.isAllVehicleDetailsSelected = false: this.isAllVehicleDetailsSelected = true;

    this.vehicleTrimLabel = selectedTrim.value;
    // get Trim Details by Make and Model
    this.vehicleService.getVehicleDetailsByTrimId({trim_id:trimId})
    .subscribe(
    (response) => { 

      this.vehicleOptions = response.vehicle_options;
      this.vehicleSpecifications = response.vehicle_specifications;
      //console.log(response);
      this.commonUtilsService.hidePageLoader();
      
    },
    error => {
      //console.log(error);
      this.commonUtilsService.onError(environment.MESSAGES.NO_RECORDS_FOUND);     
      this.commonUtilsService.hidePageLoader();  

    });
    // get Trim Details by Make and Model



  }
 

  

  /**
   * validate Basic Info Wizard and move to Upload Images Wizard.   
   */
  validateStandardOptionsWizard() : void {    

    let filteredSelectedArray = [true];

    this.filteredStandardEquipmentsArray = this.standardEquipmentsArray.filter(function(equipment){
      return filteredSelectedArray.indexOf(equipment.selected) !== -1;
    });

    this.filteredEntertainmentsArray = this.entertainmentsArray.filter(function(equipment){
      return filteredSelectedArray.indexOf(equipment.selected) !== -1;
    });


    this.filteredWheelsArray = this.wheelsArray.filter(function(equipment){
      return filteredSelectedArray.indexOf(equipment.selected) !== -1;
    });


    this.filteredAccessoryPackagesArray = this.accessoryPackagesArray.filter(function(equipment){
      return filteredSelectedArray.indexOf(equipment.selected) !== -1;
    });

    

    this.isStandardOptionsSubmitted = true;   

    if(this.standardOptionsWizard.invalid) {
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

    let filteredSelectedArray = [true];

    this.filteredVehicleOwnershipArray = this.vehicleOwnershipArray.filter(function(value){
      return filteredSelectedArray.indexOf(value.selected) !== -1;
    });
    
    this.isAboutVehicleSubmitted = true;   

    if(this.aboutVehicleWizard.invalid) {
      return;
    }

      
   // console.log(this.aboutVehicleWizard.value);

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
  validateFinanceDetailsWizard() : void {
    
    this.isFinanceDetailsSubmitted = true;   

    if(this.financeDetailsWizard.invalid) {
      return;
    }  

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
	  return this.financeDetailsWizard.controls.vehicle_finance_details.get('vehicle_proof_image') as FormArray;
  }

  get vehicleImagesArray(): FormArray{
	  return this.uploadVehicleImagesWizard.controls.vehicle_images as FormArray;
  }

  
  /**
   * check exterior color
   * @param value color 
   */
  setExteriorColor(value: string): void {
    
    const vehicleExteriorColorIfOtherSelected = this.standardOptionsWizard.controls.basic_info.get('vehicle_other_exterior_color');
   
    
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
    const vehicleInteriorColorIfOtherSelected = this.standardOptionsWizard.controls.basic_info.get('vehicle_other_interior_color');
    
    
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
    
    //let vehicleOwnershipValue = this.aboutVehicleWizard.controls.vehicle_ownership.get('vehicle_ownership_value');

    vehicleOwnershipDescription.patchValue('');    

    if ( event.target.checked ) {      
      this.isVehicleCleanTitleSelected = true;            
      this.cleanTitle = true

    }else{
      this.isVehicleCleanTitleSelected = false; 
      this.cleanTitle = false
      
    }

    /* Vehicle Ownership Array */
    this.isOtherSelected = false; 
    vehicleOwnershipDescription.clearValidators();        
    vehicleOwnershipDescription.updateValueAndValidity();

    this.filteredVehicleOwnershipArray = []; 

    this.vehicleOwnershipArray.forEach((vehicle_ownership, index) => {        
      this.vehicleOwnershipArray[index].selected = false;        
    });

    while (this.vehicleOwnershipValue.length) {
      this.vehicleOwnershipValue.removeAt(this.vehicleOwnershipValue.length-1);
    }
    /* Vehicle Ownership Array */
   
    
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
   * @param vehicleOwnership values
   */
  checkVehicleOwnershipRadioValue(index, vehicleOwnership, event): void { 

    let vehicleOwnershipDescription = this.aboutVehicleWizard.controls.vehicle_ownership.get('vehicle_ownership_description');
    this.vehicleOwnershipArray[index].selected = event.target.checked;
      
    let checkVehicleOwnershipArray = this.vehicleOwnershipArray.filter((l) => (l.selected)).map((l) => l);
    
    let checkIfOtherSelectedInArray = checkVehicleOwnershipArray.filter((l) => (l.name == 'Other')).map((l) => l);

    if(event.target.checked){
      this.isOtherSelected = true;    
      
      if(checkIfOtherSelectedInArray.length > 0){
        vehicleOwnershipDescription.setValidators(Validators.compose([Validators.required,Validators.minLength(10),Validators.maxLength(200)])); 
      }else{
        vehicleOwnershipDescription.setValidators(Validators.compose([Validators.minLength(10),Validators.maxLength(200)])); 
      }
              
      vehicleOwnershipDescription.updateValueAndValidity();
    }else{

      
      if(checkVehicleOwnershipArray.length > 0){
        
        this.isOtherSelected = true; 

        if(checkIfOtherSelectedInArray.length > 0){
          vehicleOwnershipDescription.setValidators(Validators.compose([Validators.required,Validators.minLength(10),Validators.maxLength(200)])); 
        }else{
          vehicleOwnershipDescription.setValidators(Validators.compose([Validators.minLength(10),Validators.maxLength(200)])); 
        }

        vehicleOwnershipDescription.updateValueAndValidity();

      }else{
        this.isOtherSelected = false;     
        vehicleOwnershipDescription.patchValue('');   
        vehicleOwnershipDescription.clearValidators();        
        vehicleOwnershipDescription.updateValueAndValidity();
      }

    }
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
   * check willing to drive value
   * @param willingToDriveHowManyMiles values
   */
  checkWillingToDriveHowManyMiles(willingToDriveHowManyMiles: string): void { 
    if(willingToDriveHowManyMiles == "onlypickup"){
      this.onlyPickUpNote = true;
      this.willingToDrive = "Pickup Only";
    }else{
      this.onlyPickUpNote = false;
      this.willingToDrive = willingToDriveHowManyMiles;
    }
  }
  

  /**
  * get vehicle aftermarket option value.
  * @return  boolean (on/off) .
  */
  get willingToDrive(): string {
    return this._willingToDrive;
  }

  /**
  * set vehicle aftermarket key value.
  * @param $willingToDrive  boolean(on/off).
  */
  set willingToDrive($willingToDrive: string) {
    this._willingToDrive = $willingToDrive; 
    //this.financeDetailsWizard.controls['willing_to_drive'].patchValue(this._willingToDrive);   
  }


  /**
   * check Define your minimum selling price has switched on/off
   * @param event object
   */
  toggleVehicleHasMinSellingPrice(event): void {   
    let vehicleMinSellingPrice = this.financeDetailsWizard.controls.vehicle_finance_details.get('vehicle_min_selling_price');

    vehicleMinSellingPrice.patchValue(0);
    if( event.target.checked ){

      this.isVehicleHasMinSellingPriceSelected = true;
      vehicleMinSellingPrice.setValidators(Validators.compose([Validators.required, Validators.min(1)])); 
      vehicleMinSellingPrice.updateValueAndValidity();
      this.vehicleHasMinSellingPrice = true;

    }else{ 

      this.isVehicleHasMinSellingPriceSelected = false;
      vehicleMinSellingPrice.clearValidators();
      vehicleMinSellingPrice.updateValueAndValidity();
      this.vehicleHasMinSellingPrice = false;

    } 

  }

  /**
  * get minimum selling price value.
  * @return  boolean (on/off) .
  */
  get vehicleHasMinSellingPrice(): boolean {
    return this._vehicleHasMinSellingPrice;
  }

  /**
  * set minimum selling price key value.
  * @param $vehicleHasMinSellingPrice  boolean(on/off).
  */
  set vehicleHasMinSellingPrice($vehicleHasMinSellingPrice: boolean) {
    this._vehicleHasMinSellingPrice = $vehicleHasMinSellingPrice; 
      
  }


  /**
   * check Define your minimum selling price has switched on/off
   * @param event object
   */
  toggleVehicleHasPayoffBalance(event): void {   
      let vehiclePayOff = this.financeDetailsWizard.controls.vehicle_finance_details.get('vehicle_pay_off');        
      let vehicleFinanceBank = this.financeDetailsWizard.controls.vehicle_finance_details.get('vehicle_finance_bank');      
      vehiclePayOff.patchValue(0);
      vehicleFinanceBank.patchValue('');

      if( event.target.checked ){
        this.isVehicleHasPayoffBalanceSelected = true;


        vehiclePayOff.setValidators(Validators.compose([Validators.required, Validators.min(1)]));      
        vehiclePayOff.updateValueAndValidity();

        vehicleFinanceBank.setValidators(Validators.compose([Validators.required,Validators.minLength(2),Validators.maxLength(50)]));    
        vehicleFinanceBank.updateValueAndValidity();


        this.vehicleHasPayoffBalance = true;
      }else{ 
        this.isVehicleHasPayoffBalanceSelected = false;

        vehiclePayOff.clearValidators();
        vehiclePayOff.updateValueAndValidity();

        vehicleFinanceBank.clearValidators();
        vehicleFinanceBank.updateValueAndValidity();

        this.vehicleHasPayoffBalance = false;
      } 
      
     // console.log('vehicleHasPayoffBalance', this.vehicleHasPayoffBalance);
    }


    /**
    * get minimum selling price value.
    * @return  boolean (on/off) .
    */
  get vehicleHasPayoffBalance(): boolean {
      return this._vehicleHasPayoffBalance;
    }

    /**
    * set minimum selling price key value.
    * @param $vehicleHasPayoffBalance  boolean(on/off).
    */
    set vehicleHasPayoffBalance($vehicleHasPayoffBalance: boolean) {
      this._vehicleHasPayoffBalance = $vehicleHasPayoffBalance; 
        
    }


  /**
   * check vehicle has offer in hand switched on/off
   * @param event object
   */
  toggleVehicleHasOfferInHand(event): void {   
    let vehicleOfferInHandPrice = this.financeDetailsWizard.controls.vehicle_finance_details.get('vehicle_offer_in_hands_price');        
       
    
    vehicleOfferInHandPrice.patchValue(0);
    if(this.offerInHandsImagesArray.length > 0){
      while (this.offerInHandsImagesArray.length) {
        this.offerInHandsImagesArray.removeAt(this.offerInHandsImagesArray.length-1);
      }
    }

    if( event.target.checked ){
      this.isVehicleHasOfferInHandSelected = true;


      vehicleOfferInHandPrice.setValidators(Validators.compose([Validators.required, Validators.min(1)]));      
      vehicleOfferInHandPrice.updateValueAndValidity();

      


      this.vehicleHasOfferInHand = true;
    }else{ 
      this.isVehicleHasOfferInHandSelected = false;

      vehicleOfferInHandPrice.clearValidators();
      vehicleOfferInHandPrice.updateValueAndValidity();
      

      this.vehicleHasOfferInHand = false;
    }     
  }


  /**
  * get minimum selling price value.
  * @return  boolean (on/off) .
  */
  get vehicleHasOfferInHand(): boolean {
    return this._vehicleHasOfferInHand;
  }

  /**
  * set minimum selling price key value.
  * @param $vehicleHasOfferInHand  boolean(on/off).
  */
  set vehicleHasOfferInHand($vehicleHasOfferInHand: boolean) {
    this._vehicleHasOfferInHand = $vehicleHasOfferInHand; 
       
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
    //this.financeDetailsWizard.controls['vehicle_to_be_picked_up'].patchValue(this._vehiclePickedUp);  
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
      if(!_.has(response[0],['status'])){
        console.log(response)
        this.cities = response[0]['city_states'];
        let cityState = response[0]['city_states'][0]        
        cityState['coordinates'] = [response[0]['zipcodes'][0]['longitude'],response[0]['zipcodes'][0]['latitude']]            
        this.vehicleLocation =  cityState    
      }else{
        this.vehicleDetails.controls.vehicle_location.get('zipcode').patchValue('');                  
        this.commonUtilsService.onError('Could not fetch city, state data for zipcode.');
      }       
    },
    error => {        
      this.vehicleDetails.controls.vehicle_location.get('zipcode').patchValue(''); 
      this.commonUtilsService.onError('Could not fetch city, state data for zipcode.');
    });  
}

 /**
  * get vehicle to be picked up value.
  * @return  any
  */
 get vehicleLocation(): any {
  return this._vehicleLocation;
}

/**
* set vehicle to be picked up value.
* @param vehicleLocation  object of key:value
*/
set vehicleLocation(vehicleLocation: any){  
  this._vehicleLocation = vehicleLocation;  
  this.vehicleDetails.get('vehicle_location').patchValue(this._vehicleLocation);  
}

/**
* Reset Vehicle Location Control
*/
resetVehicleLocationControl():void{
  this.cities = [];
  this.vehicleDetails.get('vehicle_location').patchValue('');
}

/**
* Reset Vehicle Location Control
*/
resetVINControl():void{  
  this.isMyCarFound = false;
  this.isAllVehicleDetailsSelected = false;
  this.commonUtilsService.onError("Please try again with another VIN Number or License Plate.");
  this.vehicleDetails.get('vin_number').patchValue('');
}

/**
* empty basic Info Fields.
*/
emptyStandardOptionsFields():void{

  this.vehicleService.getAllVehicleDetails(this.standardOptionsDetails).subscribe(
    (response) => {      
      this.standardOptionsWizard.controls.basic_info.patchValue(response);
    
    },error => { });
}

/**
* Reset Trim Control
*/
resetTrimControl():void{
  let vehicleTrimControl = this.standardOptionsWizard.controls.basic_info.get('vehicle_trim');
  vehicleTrimControl.disable(); vehicleTrimControl.setValue('');  this.trims = [];
}

/**
* Reset Trim Control
*/
resetModelControl():void{
  let vehicleModelControl = this.standardOptionsWizard.controls.basic_info.get('vehicle_model');
  vehicleModelControl.disable(); vehicleModelControl.setValue('');  this.models = [];
}

fetchCityState(zipcode){
    
  if((zipcode) && zipcode.length==5){

      this.vehicleDetails.controls.vehicle_location.get('state').patchValue(''); 
      this.vehicleDetails.controls.vehicle_location.get('city').patchValue('');      
      (zipcode.length==5)?this.fetchCityStateOfZipcode(zipcode):this.resetVehicleLocationControl()
  }   
 
}


/**
   * check Define your minimum selling price has switched on/off
   * @param hasMinSellingPrice boolean
   */
  fetchVehicleHasMinSellingPrice(hasMinSellingPrice): void {   
    let vehicleMinSellingPrice = this.financeDetailsWizard.controls.vehicle_finance_details.get('vehicle_min_selling_price');

    
    if( hasMinSellingPrice ){

      this.isVehicleHasMinSellingPriceSelected = true;
      vehicleMinSellingPrice.setValidators(Validators.compose([Validators.required, Validators.min(1)])); 
      vehicleMinSellingPrice.updateValueAndValidity();
      this.vehicleHasMinSellingPrice = true;

    }else{ 

      this.isVehicleHasMinSellingPriceSelected = false;
      vehicleMinSellingPrice.clearValidators();
      vehicleMinSellingPrice.updateValueAndValidity();
      this.vehicleHasMinSellingPrice = false;

    } 

  }

  /**
   * check vehicle clean has switched on/off
   * @param vehicleCleanTitle boolean   
   */
  fetchVehicleCleanTitle(vehicleCleanTitle): void {  

    let vehicleOwnershipDescription = this.aboutVehicleWizard.controls.vehicle_ownership.get('vehicle_ownership_description');
    
    //let vehicleOwnershipValue = this.aboutVehicleWizard.controls.vehicle_ownership.get('vehicle_ownership_value');

    vehicleOwnershipDescription.patchValue('');    

    if ( vehicleCleanTitle ) {      
      this.isVehicleCleanTitleSelected = true;            
      this.cleanTitle = true

    }else{
      this.isVehicleCleanTitleSelected = false; 
      this.cleanTitle = false
      
    }

    /* Vehicle Ownership Array */
    this.isOtherSelected = false; 
    vehicleOwnershipDescription.clearValidators();        
    vehicleOwnershipDescription.updateValueAndValidity();

    this.filteredVehicleOwnershipArray = []; 

    this.vehicleOwnershipArray.forEach((vehicle_ownership, index) => {        
      this.vehicleOwnershipArray[index].selected = false;        
    });

    while (this.vehicleOwnershipValue.length) {
      this.vehicleOwnershipValue.removeAt(this.vehicleOwnershipValue.length-1);
    }
    /* Vehicle Ownership Array */
    
  }

  /**
   * check vehicle clean has switched on/off
   * @param vehicleOwnershipDetails boolean   
   */
  fetchVehicleOwnershipDetails(vehicleOwnershipDetails): void {  
    
    let vehicleOwnershipDescription = this.aboutVehicleWizard.controls.vehicle_ownership.get('vehicle_ownership_description');    

    // Vehicle Ownership
    this.aboutVehicleWizard.controls.vehicle_ownership.patchValue(vehicleOwnershipDetails);
    
    vehicleOwnershipDetails.vehicle_ownership_value.forEach(vehicle_ownership => { 
      this.vehicleOwnershipArray.push(vehicle_ownership); 


      if(vehicle_ownership.selected){
        this.isOtherSelected = true;

        if(vehicle_ownership.name == "Other"){
          vehicleOwnershipDescription.setValidators(Validators.compose([Validators.required,Validators.minLength(10),Validators.maxLength(200)])); 
        }else{
          vehicleOwnershipDescription.setValidators(Validators.compose([Validators.minLength(10),Validators.maxLength(200)])); 
        }

        vehicleOwnershipDescription.patchValue(vehicleOwnershipDetails.vehicle_ownership_description);

      }        
      
    });
  }


 /**
  * Fetch Vehicle Data by ID.
  */
  private fetchVehicleDetails(){
    //hit api to fetch data
    this.commonUtilsService.showPageLoader();

    this.vehicleService.fetchCarDetails({ id: this.activatedRoute.snapshot.params._id }).subscribe(

      //case success
      (response) => {
        //console.log('response', response);
        this.vehicleDetails.controls.vehicle_year.patchValue(response.vehicle_year);
        this.vehicleDetails.controls.vehicle_make.patchValue(response.vehicle_make);
        this.vehicleDetails.controls.vehicle_model.patchValue(response.vehicle_model);
        this.vehicleDetails.controls.vehicle_trim.patchValue(response.vehicle_trim);
        this.vehicleDetails.controls.vin_number.patchValue(response.vin_number);
        this.vehicleDetails.controls.license_plate.patchValue(response.license_plate);


        this.vehicleMakeLabel = response.vehicle_make;
        this.vehicleModelLabel = response.vehicle_model;
        this.vehicleYearLabel = response.vehicle_year;
        this.vehicleTrimLabel = response.vehicle_trim;
        this.vehicleVINLabel = response.vin_number;
        this.vehicleLicensePlateLabel = response.license_plate;

        response.standard_equipments.forEach(equipment => {  
            this.standardEquipmentsArray.push(equipment);           
        });

        response.additional_options.entertainments.forEach(entertainment => {  
            this.entertainmentsArray.push(entertainment);           
        });

        response.additional_options.wheels.forEach(wheel => {  
            this.wheelsArray.push(wheel);           
        });

        response.additional_options.accessory_packages.forEach(accessory_package => {  
            this.accessoryPackagesArray.push(accessory_package);           
        });

        
  
        // Basic Info Wizard

        this.standardOptionsWizard.controls.vehicle_mileage.patchValue(response.vehicle_mileage);

        this.standardOptionsWizard.controls.basic_info.patchValue(response.basic_info);
        this.setInteriorColor(response.basic_info.vehicle_interior_color);
        this.setExteriorColor(response.basic_info.vehicle_exterior_color);
         
  
        // Vehicle Images Wizard
         if(response.vehicle_images.length > 0) {
           response.vehicle_images.forEach(vehicleImage => {
              if(vehicleImage.file_category == "interior"){
                this.interiorImagesArray.push({file_path : vehicleImage.file_path, file_key : vehicleImage.file_key, file_default : vehicleImage.file_default, file_name : vehicleImage.file_name, file_category : vehicleImage.file_category});
              }else{
                this.exteriorImagesArray.push({file_path : vehicleImage.file_path, file_key : vehicleImage.file_key, file_default : vehicleImage.file_default, file_name : vehicleImage.file_name, file_category : vehicleImage.file_category});
              }
              
            }); 
          }


          this.defaultVehicleImageKeyIndex = this.exteriorImagesArray.findIndex(x => x.file_default === true);
          //console.log(this.defaultVehicleImageKeyIndex);

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

          // Vehicle Ownership Array
            this.fetchVehicleOwnershipDetails(response.vehicle_ownership);        
          // Vehicle Ownership Array

           // Vehicle Condition Wizard
           this.vehicleConditionWizard.controls.vehicle_comments.patchValue(response.vehicle_comments);
           this.vehicleConditionWizard.controls.vehicle_condition.patchValue(response.vehicle_condition); 
           if(response.vehicle_condition.vehicle_condition_images.length > 0) {
            response.vehicle_condition.vehicle_condition_images.forEach(vehicleConditionImage => {             
                
                this.vehicleConditionImagesArray.push(new FormControl({file_path : vehicleConditionImage.file_path, file_key : vehicleConditionImage.file_key, file_name : vehicleConditionImage.file_name, file_category : vehicleConditionImage.file_category}));
               
             }); 
           }
  
           
           let vehicleConditionDescription = this.vehicleConditionWizard.controls.vehicle_condition.get('vehicle_condition_description'); 
  
          if(response.vehicle_condition.vehicle_condition_value == "Excellent"){
  
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
          this.aboutVehicleWizard.controls.vehicle_to_be_picked_up.patchValue(response.vehicle_to_be_picked_up);
          this.vehiclePickedUp = response.vehicle_to_be_picked_up;
          
          this.aboutVehicleWizard.controls.willing_to_drive_how_many_miles.patchValue(response.willing_to_drive_how_many_miles);
          this.willingToDrive = response.willing_to_drive_how_many_miles;
          if(this.willingToDrive == "Pickup Only"){
            this.onlyPickUpNote = true;
          }
  
          //Finance Details



          this.financeDetailsWizard.controls.vehicle_finance_details.patchValue(response.vehicle_finance_details);

          this.fetchVehicleHasMinSellingPrice(response.vehicle_finance_details.vehicle_has_min_selling_price); // check vehicle has min selling price (true or false)

          this.fetchVehicleHasOfferInHand(response.vehicle_finance_details.vehicle_has_offer_in_hand); // check Offer In Hand Option (true or false)

          this.fetchVehicleHasPayoffBalance(response.vehicle_finance_details.vehicle_has_payoff_balance); // check pay off balance Option (true or false)

          /*if(response.vehicle_finance_details.vehicle_offer_in_hands_price == 0){
            this.financeDetailsWizard.controls.vehicle_finance_details.get('vehicle_offer_in_hands_price').patchValue('');
          }

          if(response.vehicle_finance_details.vehicle_pay_off == 0){
            this.financeDetailsWizard.controls.vehicle_finance_details.get('vehicle_pay_off').patchValue('');
          } */

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
   * check Define your minimum selling price has switched on/off
   * @param event object
   */
  fetchVehicleHasPayoffBalance(payOffBalance): void {   
    let vehiclePayOff = this.financeDetailsWizard.controls.vehicle_finance_details.get('vehicle_pay_off');        
    let vehicleFinanceBank = this.financeDetailsWizard.controls.vehicle_finance_details.get('vehicle_finance_bank');      

    if( payOffBalance ){
      this.isVehicleHasPayoffBalanceSelected = payOffBalance;


      vehiclePayOff.setValidators(Validators.compose([Validators.required, Validators.min(1)]));      
      vehiclePayOff.updateValueAndValidity();

      vehicleFinanceBank.setValidators(Validators.compose([Validators.required,Validators.minLength(2),Validators.maxLength(50)]));    
      vehicleFinanceBank.updateValueAndValidity();


      this.vehicleHasPayoffBalance = payOffBalance;
    }else{ 
      this.isVehicleHasPayoffBalanceSelected = payOffBalance;

      vehiclePayOff.clearValidators();
      vehiclePayOff.updateValueAndValidity();

      vehicleFinanceBank.clearValidators();
      vehicleFinanceBank.updateValueAndValidity();

      this.vehicleHasPayoffBalance = payOffBalance;
    } 
    
    //console.log('vehicleHasPayoffBalance', this.vehicleHasPayoffBalance);
  }


  /**
   * check vehicle has offer in hand switched on/off
   * @param event object
   */
  fetchVehicleHasOfferInHand(offerInHand): void {   
    let vehicleOfferInHandPrice = this.financeDetailsWizard.controls.vehicle_finance_details.get('vehicle_offer_in_hands_price');        
         

    if( offerInHand ){
      this.isVehicleHasOfferInHandSelected = offerInHand;
      vehicleOfferInHandPrice.setValidators(Validators.compose([Validators.required, Validators.min(1)]));      
      vehicleOfferInHandPrice.updateValueAndValidity();
      this.vehicleHasOfferInHand = offerInHand;
    }else{ 
      this.isVehicleHasOfferInHandSelected = offerInHand;

      vehicleOfferInHandPrice.clearValidators();
      vehicleOfferInHandPrice.updateValueAndValidity();

      this.vehicleHasOfferInHand = offerInHand;
    }     
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
    this.editSavedCarSection.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" }); 
  }

  ngOnInit() {  

    this.fetchVehicleDetails(); //fetch vehcile details

    this.editSavedCarSection.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });  
    
    
    const userData = JSON.parse(localStorage.getItem('loggedinUser'));//parsing the local store data
    //this.vehicleDetails.controls.vehicle_location.patchValue(userData.location);
  }

  ngAfterViewInit(){    
    //years range
    for (let i = 0; i < 15; i++) {
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