import { Component, OnInit,  ViewChild, ElementRef, ViewEncapsulation, NgZone } from '@angular/core';
import { Location } from '@angular/common';
//import { TranslateService } from '@ngx-translate/core';
import { AbstractControl,  FormBuilder, FormArray,  FormGroup,  FormControl, Validators } from '@angular/forms';
import { Router} from "@angular/router";
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
import { UserAuthService, TitleService, CognitoUserService, VehicleService, CommonUtilsService } from '../../../../core/_services'

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
  selector: 'app-addnewcar',
  templateUrl: './addnewcar.component.html',
  styleUrls: ['./addnewcar.component.css'],
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
export class AddNewCarComponent implements OnInit {
  // Offer In Hands Popup
  @ViewChild("offerInHandsSection") offerInHandsSection: ElementRef;

  // Define Page Title and Breadcrumbs
  title:string = 'Get your car listed'; 
  breadcrumbs:any = [{page:'Home',link:'/seller/home'},{ page: "Car Listing", link: '/seller/car-listing' },{page:'Add New Car',link:''}]

  // Smooth Scroll To Add Car Form Wizard
  @ViewChild("addNewCarSection") addNewCarSection: ElementRef;

  // Array where we are going to do CRUD operations
  //vehicleImagesArray:any = [{Interior: []}, {Exterior: []}];
  vehicleImages:any = [];
  interiorImagesArray:any = [];
  exteriorImagesArray:any = [];  
  getVehicleYear:string = "";
  file_default:boolean=false;
  defaultVehicleImageKeyIndex:number = 0;
  stateAbbreviation:string="";

  
  isVINSelected:boolean = true;
  showVehicleTrimTextBox:boolean = false;
  showVehicleTrimSelectBox:boolean = false;

  // AddNewCar Form Group Wizard
  vehicleDetails: FormGroup;
  standardOptionsWizard: FormGroup;
  uploadVehicleImagesWizard: FormGroup;
  aboutVehicleWizard: FormGroup;
  vehicleConditionWizard: FormGroup;
  financeDetailsWizard: FormGroup;
  offerInHands: FormGroup;
  

  isStandardOptionsSubmitted:boolean = false;
  isVehicleImagesSubmitted:boolean = false;
  isAboutVehicleSubmitted:boolean = false;
  isVehicleConditionSubmitted:boolean = false;
  isFinanceDetailsSubmitted:boolean = false;
  isVehicleDetailsSubmitted:boolean = false;
  isOfferInHandsSubmitted:boolean = false;
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
  isVehicleHasPayoffBalanceSelected:boolean = false;
  isVehicleHasMinSellingPriceSelected:boolean = false;
  isVehicleHasOfferInHandSelected:boolean = false;
  isOtherSelected:boolean = false;  
  isVehicleConditionSelected:boolean = false;
  isYearEnabled:boolean = true;
  isSkipSubmit:boolean = false;
  isOtherInteriorColorSelected:boolean = false;
  isOtherExteriorColorSelected:boolean = false;
  onlyPickUpNote:boolean = false;

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

  standardEquipmentsArray = [
    { id: '1', name: 'Automatic, CVT',  selected: false },    
    { id: '2', name: 'FWD',  selected: false },
    { id: '3', name: '4-CYL, Hybrid, 1.8 Liter',  selected: false },
    { id: '4', name: 'Traction control',  selected: false },
    { id: '5', name: 'Stability Control',  selected: false },
    { id: '6', name: 'ABS, 4 Wheel',  selected: false },
    { id: '7', name: 'Anti-Theft System',  selected: false },
    { id: '8', name: 'Keyless Entry',  selected: false },
    { id: '9', name: 'Keyless Start',  selected: false },
    { id: '10', name: 'Air Conditioning',  selected: false },
    { id: '11', name: 'Power Windows',  selected: false },
    { id: '12', name: 'Power Door Locks',  selected: false },
    { id: '13', name: 'Cruise Control',  selected: false },
    { id: '14', name: 'Power steering',  selected: false },
    { id: '15', name: 'Tilt & Telescoping Wheel',  selected: false },
    { id: '16', name: 'AM/FM Stereo',  selected: false },
    { id: '17', name: 'CD/MP3 (Single Disc)',  selected: false },
    { id: '18', name: 'Bluetooth Wireless',  selected: false },
    { id: '19', name: 'Dual Airbags',  selected: false },
    { id: '20', name: 'Side Airbags',  selected: false },
    { id: '21', name: 'F&R Head Curtain Air Bags',  selected: false },
    { id: '22', name: 'Daytime Running Lights',  selected: false },
    { id: '23', name: 'Rear Spoiler',  selected: false } 
  ];

  entertainmentsArray = [
    { id: '24', name: 'Premium Sound',  selected: false },
    { id: '25', name: 'SiriusXM Satellite',  selected: false },
    { id: '26', name: 'DVD System',  selected: false }
  ];

  wheelsArray = [
    { id: '27', name: 'Alloy wheels',  selected: false },
    { id: '28', name: 'Premium Wheels',  selected: false },
    { id: '29', name: 'Premium Wheels 19+',  selected: false }
  ];

  accessoryPackagesArray = [
    { id: '30', name: 'Plus Performance Pkg',  selected: false }
  ];

  vehicleOwnershipArray = [
    { id: '1', name: 'Salvage',  selected: false },
    { id: '2', name: 'TMU',  selected: false },
    { id: '3', name: 'Lemon Law',  selected: false },
    { id: '4', name: 'Other',  selected: false }
  ];

  
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
  vehicleTransmissionStyleLabel = "";
  vehicleEngineCylindersLabel = "";
  vehicleEngineModelLabel = "";
  vehicleMileageLabel = "";

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



constructor( private zone:NgZone, private cognitoUserService:CognitoUserService, private location: Location, private alertService: AlertService, private vehicleService: VehicleService, private userAuthService: UserAuthService, private pageLoaderService: PageLoaderService, private formBuilder: FormBuilder, private titleService: TitleService, private commonUtilsService: CommonUtilsService, private toastr: ToastrManager, private router: Router) { 

  this.selectvehicleDetails(); // Initialize Vehicle Option Fields 
  this.standardOptions();          // Initialize Basic Info Wizard Fields 
  this.uploadVehicleImages(); // Initialize Vehicle Images Wizard Fields
  this.aboutVehicle();       // Initialize About Vehicle Wizard Fields
  this.vehicleCondition();   // Initialize Vehicle Condition Wizard Fields
  this.financeDetails();     // Initialize Pickup Location Wizard Fields
  this.offerInHandsPopUp();  //

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
      _id: [null],
      seller_id: [localStorage.getItem('loggedinUserId')],
      vehicle_option: ['VIN'],       
      vin_number: [''],       
      license_plate: [''],       
      vehicle_year: [''],   
      vehicle_make: [''],
      vehicle_model: [''],
      vehicle_transmission_style: [''],
      vehicle_engine_cylinders: [''],
      vehicle_engine_model: [''],
      vehicle_trim: ['', Validators.compose([Validators.required, Validators.minLength(1),Validators.maxLength(50)])], 
      vehicle_mileage: ['', Validators.compose([Validators.required, Validators.min(1),Validators.minLength(1),Validators.maxLength(6),Validators.pattern(/^-?(0|[1-9]\d*)?$/)])],
      vehicle_location:this.formBuilder.group({
        zipcode: ['', Validators.compose([Validators.required,Validators.pattern('^[0-9]{5}$')])],     
        state: [''],
        city: [''],
        coordinates:[null]
      })      
    });
  }
  

  /**
  * Initialize Basic Info Wizard Fields.
  */
  private standardOptions(){
    this.standardOptionsWizard = this.formBuilder.group({ 
         
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
        vehicle_interior_color: ['', Validators.compose([Validators.required])],
        vehicle_other_interior_color: [''],
        vehicle_exterior_color: ['', Validators.compose([Validators.required])],
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
      //vehicle_to_be_picked_up:  [false],             
      //willing_to_drive_how_many_miles: ['50 Miles', Validators.compose([Validators.required, Validators.min(1),Validators.minLength(1),Validators.maxLength(3),Validators.pattern(/^-?(0|[1-9]\d*)?$/)])],
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
        vehicle_has_min_selling_price: [false],           
        vehicle_min_selling_price: [0],
        vehicle_has_payoff_balance:[false], 
        vehicle_pay_off: [0],  
        vehicle_has_offer_in_hand:[false],     
        vehicle_offer_in_hands_price : [0],
        vehicle_proof_image: this.formBuilder.array([]), 
      })                            
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
  onSubmitAddNewCar(): void {


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
   
    

    if(this.financeDetailsWizard.controls.vehicle_finance_details.get('vehicle_offer_in_hands_price').value == null || this.financeDetailsWizard.controls.vehicle_finance_details.get('vehicle_offer_in_hands_price').value == "" ){
      this.financeDetailsWizard.controls.vehicle_finance_details.get('vehicle_offer_in_hands_price').setValue(0);
    }
    
    if(this.financeDetailsWizard.controls.vehicle_finance_details.get('vehicle_pay_off').value == null || this.financeDetailsWizard.controls.vehicle_finance_details.get('vehicle_pay_off').value == ""){
      this.financeDetailsWizard.controls.vehicle_finance_details.get('vehicle_pay_off').setValue(0);
    }

    if(this.financeDetailsWizard.controls.vehicle_finance_details.get('vehicle_min_selling_price').value == null || this.financeDetailsWizard.controls.vehicle_finance_details.get('vehicle_min_selling_price').value == ""){
      this.financeDetailsWizard.controls.vehicle_finance_details.get('vehicle_min_selling_price').setValue(0);
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

    this.addVehicleSubscription = this.vehicleService.addYourVehicle(mergeVehicleData)
      .subscribe(
      (response) => { 
        this.router.navigate(['/seller/car-listing']);

        this.commonUtilsService.onSuccess('Vehicle has been added successfully.');
      },
      error => {
        
        // Clean Vehicle Ownership Form Control
        while (this.vehicleOwnershipValue.length) {
          this.vehicleOwnershipValue.removeAt(this.vehicleOwnershipValue.length-1);
        }

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
    
    if(file_category == 'interior'){ _.pullAt(this.interiorImagesArray, [index]); }
   
    if(file_category == 'condition'){ this.vehicleConditionImagesArray.removeAt(index); }
    if(file_category == 'aftermarket'){ this.afterMarketImagesArray.removeAt(index);  }
    if(file_category == 'offer_in_hands'){ this.offerInHandsImagesArray.removeAt(index); }    

    if(file_category == 'exterior'){ 

      _.pullAt(this.exteriorImagesArray, [index]); 
      // set First Image of array as default Image
      
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

      /*console.log('index',index);
      console.log('defaultVehicleImageKeyIndex', this.defaultVehicleImageKeyIndex)
      console.log(this.exteriorImagesArray);*/

    }


    this.removeImageFromBucket(file_key);
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

    /*console.log('index',index);
    console.log('defaultVehicleImageKeyIndex', this.defaultVehicleImageKeyIndex)*/
  }

  /**
   * remove image from AWS Bucket
   * @param imagePath image url
   * @param bucket s3 bucket name
   */
  removeImageFromBucket(file_key){    
    this.commonUtilsService.showPageLoader('Removing File...');

    const params = { fileKey : file_key }

    this.commonUtilsService.removeImageFromBucket(params)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response) => {
          this.commonUtilsService.onSuccess('File has been removed successfully.');                 
        },
        error => {
          this.commonUtilsService.onError(error);
        });
  }  


  /**
   * check which vehicle option is selected
   * @param value vehicle refrence value 
   */
  setVehicleOptionValue(value: string): void {    
    
    let vehicleVIN = this.vehicleDetails.controls.vin_number;
    let vehicleLicensePlate = this.vehicleDetails.controls.license_plate;

    // Reset All Fields
    this.isMyCarFound = false;
    this.vehicleVINLabel = "";
    this.vehicleLicensePlateLabel = "";
    this.vehicleMakeLabel = "";
    this.vehicleModelLabel = "";
    this.vehicleYearLabel = "";
    this.vehicleTransmissionStyleLabel = "";
    this.vehicleEngineCylindersLabel = "";
    this.vehicleEngineModelLabel = "";
    this.vehicleTrimLabel = "";  
    this.vehicleMileageLabel = "";

    let vehicleYearControl = this.vehicleDetails.controls.vehicle_year;
    let vehicleMakeControl = this.vehicleDetails.controls.vehicle_make;
    let vehicleModelControl = this.vehicleDetails.controls.vehicle_model;
    let vehicleTransmissionStyleControl = this.vehicleDetails.controls.vehicle_transmission_style;
    let vehicleEngineCylindersControl = this.vehicleDetails.controls.vehicle_engine_cylinders;
    let vehicleEngineModelControl = this.vehicleDetails.controls.vehicle_engine_model;
    let vehicleTrimControl = this.vehicleDetails.controls.vehicle_trim;
    let vehicleMileageControl = this.vehicleDetails.controls.vehicle_mileage;
    

    vehicleYearControl.patchValue('');
    vehicleMakeControl.patchValue('');
    vehicleModelControl.patchValue('');
    vehicleEngineCylindersControl.patchValue('');
    vehicleEngineModelControl.patchValue('');
    vehicleTransmissionStyleControl.patchValue('');
    vehicleTrimControl.patchValue('');
    vehicleMileageControl.patchValue('');
      
      

      if(value == "LicencePlate"){    
        vehicleVIN.patchValue('');       
        this.isVINSelected = false;        
        vehicleVIN.clearValidators();
        vehicleVIN.updateValueAndValidity();

        vehicleLicensePlate.setValidators([Validators.compose([Validators.required,Validators.minLength(1),Validators.maxLength(8)])]);        
        vehicleLicensePlate.updateValueAndValidity();
        
      }

      if(value == "VIN"){  
        vehicleLicensePlate.patchValue('');    
        this.isVINSelected = true;
        vehicleVIN.setValidators([Validators.compose([Validators.required,Validators.minLength(17),Validators.maxLength(17)])]);        
        vehicleVIN.updateValueAndValidity();

        vehicleLicensePlate.clearValidators();
        vehicleLicensePlate.updateValueAndValidity();
        
      }

      this.setVehicleReferenceDefaultValue = name;  

  }
  

  /**
  * Show confirmation popup before going to previous step.
  * @return any
  */
  async isPreviousClicked() {
    if(! await this.commonUtilsService.isPreviousConfirmed()) { 
      this.isThisYourCar = true;        
    }else{ 

      this.isMyCarFound = false; 
      //this.isVehicleDetailsSubmitted = false; 
      this.vehicleDetails.reset();
      this.selectvehicleDetails();


      const userData = JSON.parse(localStorage.getItem('loggedinUser'));//parsing the local store data
      this.vehicleDetails.controls.vehicle_location.patchValue(userData.location);

      this.standardOptionsWizard.reset(); 
      this.standardOptions();          // Initialize Basic Info Wizard Fields 
      
      this.uploadVehicleImagesWizard.reset();
      this.uploadVehicleImages();      
      this.interiorImagesArray = [];
      this.exteriorImagesArray = [];


      this.filteredStandardEquipmentsArray = []; 
      this.filteredEntertainmentsArray = []; 
      this.filteredWheelsArray = []; 
      this.filteredAccessoryPackagesArray = []; 
      

      this.standardEquipmentsArray.forEach((equipment, index) => {        
        this.standardEquipmentsArray[index].selected = false;        
      });

      this.wheelsArray.forEach((equipment, index) => {        
        this.wheelsArray[index].selected = false;        
      });

      this.entertainmentsArray.forEach((equipment, index) => {        
        this.entertainmentsArray[index].selected = false;        
      });

      this.accessoryPackagesArray.forEach((equipment, index) => {        
        this.accessoryPackagesArray[index].selected = false;        
      });

      while (this.standardEquipments.length) {
        this.standardEquipments.removeAt(this.standardEquipments.length-1);
      }

      while (this.entertainments.length) {
        this.entertainments.removeAt(this.entertainments.length-1);
      }

      while (this.wheels.length) {
        this.wheels.removeAt(this.wheels.length-1);
      }

      while (this.accessory_packages.length) {
        this.accessory_packages.removeAt(this.accessory_packages.length-1);
      }





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

      /* Vehicle Ownership Array */
      this.filteredVehicleOwnershipArray = []; 

      this.vehicleOwnershipArray.forEach((vehicle_ownership, index) => {        
        this.vehicleOwnershipArray[index].selected = false;        
      });

      while (this.vehicleOwnershipValue.length) {
        this.vehicleOwnershipValue.removeAt(this.vehicleOwnershipValue.length-1);
      }
      /* Vehicle Ownership Array */

      while (this.vehicleConditionImagesArray.length) {
        this.vehicleConditionImagesArray.removeAt(this.vehicleConditionImagesArray.length-1);
      }

      this.financeDetailsWizard.reset();
      this.financeDetails();     // Initialize Pickup Location Wizard Fields

      



      this.isVehicleAftermarketSelected = false;      
      this.isWillingToDriveSelected = false;
      this.isOtherSelected = false;      
      this.isVehicleConditionSelected = false;      
      this.isSkipSubmit = false;
      this.isOtherInteriorColorSelected = false;
      this.isOtherExteriorColorSelected = false;
      this.isVehicleCleanTitleSelected = true;
      this.isWillingToDriveSelected = false; 
      this.isVehicleHasPayoffBalanceSelected = false;
      this.isVehicleHasOfferInHandSelected = false;

      this.isThisYourCar = false; 
      
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
    
    this.vehicleTrimLabel = this.vehicleDetails.controls.vehicle_trim.value;  
    this.vehicleMileageLabel = this.vehicleDetails.controls.vehicle_mileage.value;

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
    //console.log('event', event.target.checked);
    //console.log('index', index);

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

    //(selectedTrim.value == "") ? this.isAllVehicleDetailsSelected = false: this.isAllVehicleDetailsSelected = true;

    
    // get Trim Details by Make and Model
    this.vehicleService.getVehicleDetailsByTrimId({trim_id:trimId})
    .subscribe(
    (response) => { 

      this.vehicleOptions = response.vehicle_options;
      this.vehicleSpecifications = response.vehicle_specifications;

      //console.log(response.vehicle_options);

      response.vehicle_options.forEach(option => {
      if (option.car_option_name.match(/power steering.*/) || option.car_option_name.match(/Power Steering.*/)) {
        let index = this.standardEquipmentsArray.findIndex(x => x.id === '14'); 
        this.standardEquipmentsArray[index].selected = true
      }

      if (option.car_option_name.match(/Dual Airbags.*/) || option.car_option_name.match(/dual airbags.*/)) {
        let index = this.standardEquipmentsArray.findIndex(x => x.id === '19'); 
        this.standardEquipmentsArray[index].selected = true
      }

      if (option.car_option_name.match(/Side airbags.*/) || option.car_option_name.match(/side airbags.*/)) {
        let index = this.standardEquipmentsArray.findIndex(x => x.id === '20'); 
        this.standardEquipmentsArray[index].selected = true
      }

      if (option.car_option_name.match(/Air Conditioning.*/) || option.car_option_name.match(/air conditioning.*/)) {
        let index = this.standardEquipmentsArray.findIndex(x => x.id === '10'); 
        this.standardEquipmentsArray[index].selected = true
      }

      if (option.car_option_name.match(/Power Windows.*/) || option.car_option_name.match(/power windows.*/)) {
        let index = this.standardEquipmentsArray.findIndex(x => x.id === '11'); 
        this.standardEquipmentsArray[index].selected = true
      }

      if (option.car_option_name.match(/Bluetooth.*/) || option.car_option_name.match(/bluetooth.*/)) {
        let index = this.standardEquipmentsArray.findIndex(x => x.id === '18'); 
        this.standardEquipmentsArray[index].selected = true
      }

      if (option.car_option_name.match(/Anti-theft.*/) || option.car_option_name.match(/anti-theft.*/)) {
        let index = this.standardEquipmentsArray.findIndex(x => x.id === '7'); 
        this.standardEquipmentsArray[index].selected = true
      }

      if (option.car_option_name.match(/Keyless entry.*/) || option.car_option_name.match(/keyless entry.*/)) {
        let index = this.standardEquipmentsArray.findIndex(x => x.id === '8'); 
        this.standardEquipmentsArray[index].selected = true
      }

      //if (option.car_option_name.match(/keyless.*/)) {
       // let index = this.standardEquipmentsArray.findIndex(x => x.id === '9'); 
       // this.standardEquipmentsArray[index].selected = true
     // } 

      if (option.car_option_name.match(/MP3.*/)) {
        let index = this.standardEquipmentsArray.findIndex(x => x.id === '17'); 
        this.standardEquipmentsArray[index].selected = true
      }

      if (option.car_option_name.match(/Traction control.*/) || option.car_option_name.match(/traction control.*/)) {
        let index = this.standardEquipmentsArray.findIndex(x => x.id === '4'); 
        this.standardEquipmentsArray[index].selected = true
      }

      if (option.car_option_name.match(/stability control.*/) || option.car_option_name.match(/Stability Control.*/)) {
        let index = this.standardEquipmentsArray.findIndex(x => x.id === '5'); 
        this.standardEquipmentsArray[index].selected = true
      }

      if (option.car_option_name.match(/Cruise control.*/) || option.car_option_name.match(/cruise control.*/)) {
        let index = this.standardEquipmentsArray.findIndex(x => x.id === '13'); 
        this.standardEquipmentsArray[index].selected = true
      }

      if (option.car_option_name.match(/ABS.*/)) {
        let index = this.standardEquipmentsArray.findIndex(x => x.id === '6'); 
        this.standardEquipmentsArray[index].selected = true
      }

      if (option.car_option_name.match(/FM.*/)) {
        let index = this.standardEquipmentsArray.findIndex(x => x.id === '16'); 
        this.standardEquipmentsArray[index].selected = true
      }

      if (option.car_option_name.match(/Alloy wheels.*/) || option.car_option_name.match(/alloy wheels.*/)) {
        let index = this.wheelsArray.findIndex(x => x.id === '27'); 
        this.wheelsArray[index].selected = true
      }


      });


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
   * get Vehicles(Makes, Models, Trim...) By Year
   * @param year selected year from dropdown
   * @return  array(vehicle details)
   */
  getVehicleStatisticsByYear(year){

    let vehicleMakeControl = this.standardOptionsWizard.controls.basic_info.get('vehicle_make');
    let vehicleModelControl = this.standardOptionsWizard.controls.basic_info.get('vehicle_model');
    let vehicleTrimControl = this.standardOptionsWizard.controls.basic_info.get('vehicle_trim');

    if(year == ''){ 
      vehicleMakeControl.disable(); this.makes = [];
      vehicleModelControl.disable(); this.models = [];
      vehicleTrimControl.disable(); this.trims = [];

      this.emptyStandardOptionsFields();

      return;
    }

    this.commonUtilsService.showPageLoader();

    //manually create a data object which have the car unique id and seller id 
    const data = { year:year }
    const _this = this;
    //hit api to fetch data

    $.getJSON("https://www.carqueryapi.com/api/0.3/?callback=?", {cmd:"getMakes", year:year}, function(response) {
           
        
        if(response.Makes.length > 0){

          _this.isThisYourCar = true;
          _this.makes = response.Makes;
          vehicleMakeControl.enable();
          vehicleModelControl.disable(); _this.models = [];
          vehicleTrimControl.disable(); _this.trims = []; 
          
          _this.emptyStandardOptionsFields();
          
  
        }else{
          _this.isThisYourCar = false;
          _this.commonUtilsService.onError(environment.MESSAGES.NO_RECORDS_FOUND);
        } 

        _this.commonUtilsService.hidePageLoader();

        //console.log('makes',response.Makes)
    });    
  }

  /**
   * validate Basic Info Wizard and move to Upload Images Wizard.   
   */
  validateStandardOptionsWizard() : void {    

    let filteredSelectedArray = [true];

    this.filteredStandardEquipmentsArray = this.standardEquipmentsArray.filter(function(value){
      return filteredSelectedArray.indexOf(value.selected) !== -1;
    });

    this.filteredEntertainmentsArray = this.entertainmentsArray.filter(function(value){
      return filteredSelectedArray.indexOf(value.selected) !== -1;
    });


    this.filteredWheelsArray = this.wheelsArray.filter(function(value){
      return filteredSelectedArray.indexOf(value.selected) !== -1;
    });


    this.filteredAccessoryPackagesArray = this.accessoryPackagesArray.filter(function(value){
      return filteredSelectedArray.indexOf(value.selected) !== -1;
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
  validateFinanceDetailsWizard() : void {
    
    this.isFinanceDetailsSubmitted = true;   

    if(this.financeDetailsWizard.invalid) {
      return;
    }  

  }

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
   * show Offer In Hands Popup.   
   */
  showOfferInHands() : void{
    $(this.offerInHandsSection.nativeElement).modal({backdrop: 'static', keyboard: false});
  }


  /**
   * check exterior color
   * @param value color 
   */
  setExteriorColor(value: string): void {
    
    const vehicleExteriorColorIfOtherSelected = this.standardOptionsWizard.controls.basic_info.get('vehicle_other_exterior_color');
    vehicleExteriorColorIfOtherSelected.patchValue('');
    
    if(value == "Other"){
      this.isOtherExteriorColorSelected = true;
      vehicleExteriorColorIfOtherSelected.setValidators(Validators.compose([Validators.required,Validators.minLength(2),Validators.maxLength(20), Validators.pattern('^[a-zA-Z ]*$')] ));
      vehicleExteriorColorIfOtherSelected.updateValueAndValidity();
    }else{ 
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
    vehicleInteriorColorIfOtherSelected.patchValue('');
    
    if(value == "Other"){
      this.isOtherInteriorColorSelected = true;
      vehicleInteriorColorIfOtherSelected.setValidators(Validators.compose([Validators.required,Validators.minLength(2),Validators.maxLength(20), Validators.pattern('^[a-zA-Z ]*$')]));
      vehicleInteriorColorIfOtherSelected.updateValueAndValidity();
    }else{ 
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
    
    console.log('vehicleHasPayoffBalance', this.vehicleHasPayoffBalance);
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
   * get Vehicle Details By VIN
  */
  getVehicleDetailsByVIN(vin_number){
    const _this = this;
    _this.commonUtilsService.showPageLoader();
    let vehicleTrimControl = _this.vehicleDetails.controls.vehicle_trim;
    _this.vehicleVINLabel = vin_number;
    _this.vehicleTrimLabel = '';
    vehicleTrimControl.patchValue('');
    // get Trim Details by Make and Model
    _this.vehicleService.checkVINAlreadyExist({vin_number:vin_number})
    .subscribe(
    (response) => { 
        if(response){
          //console.log('Found', response)
          _this.isMyCarFound = false;
          _this.commonUtilsService.onError(environment.MESSAGES.VIN_ALREADY_EXIST);
          //console.log(error); 
          _this.commonUtilsService.hidePageLoader();
        }else{
          $.ajax({

            url: "https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvaluesextended/"+vin_number+"?format=json",
            type: "GET",
            dataType: "json",
            success: function(response)
            {
              //console.log('result', response);
              if(response.Results[0].Make == "" || response.Count == 0){

                _this.commonUtilsService.onError(environment.MESSAGES.NO_RECORDS_FOUND);
                _this.commonUtilsService.hidePageLoader();

              }else{


                let vehicleYearControl = _this.vehicleDetails.controls.vehicle_year;
                let vehicleMakeControl = _this.vehicleDetails.controls.vehicle_make;
                let vehicleModelControl = _this.vehicleDetails.controls.vehicle_model;
                let vehicleTransmissionStyleControl = _this.vehicleDetails.controls.vehicle_transmission_style;
                let vehicleEngineCylindersControl = _this.vehicleDetails.controls.vehicle_engine_cylinders;
                let vehicleEngineModelControl = _this.vehicleDetails.controls.vehicle_engine_model;
                

                vehicleYearControl.patchValue(response.Results[0].ModelYear);
                vehicleMakeControl.patchValue(response.Results[0].Make.toLowerCase());
                vehicleModelControl.patchValue(response.Results[0].Model.toLowerCase());
                vehicleEngineCylindersControl.patchValue(response.Results[0].EngineCylinders);
                vehicleEngineModelControl.patchValue(response.Results[0].EngineModel);
                vehicleTransmissionStyleControl.patchValue(response.Results[0].TransmissionStyle);
                
                _this.vehicleMakeLabel = response.Results[0].Make;
                _this.vehicleModelLabel = response.Results[0].Model;
                _this.vehicleYearLabel = response.Results[0].ModelYear;
                _this.vehicleTransmissionStyleLabel = response.Results[0].TransmissionStyle;
                _this.vehicleEngineCylindersLabel = response.Results[0].EngineCylinders;
                _this.vehicleEngineModelLabel = response.Results[0].EngineModel;

                let ABSindex = _this.standardEquipmentsArray.findIndex(x => x.id === '6'); //ABS
                
                let Tractionindex = _this.standardEquipmentsArray.findIndex(x => x.id === '4'); //Traction Control
                let Cruiseindex = _this.standardEquipmentsArray.findIndex(x => x.id === '13'); //Cruise Control
                let Daytimeindex = _this.standardEquipmentsArray.findIndex(x => x.id === '22'); //Daytime Running Lights
                let Stabilityindex = _this.standardEquipmentsArray.findIndex(x => x.id === '5'); //Stability Control
                let CVTindex = _this.standardEquipmentsArray.findIndex(x => x.id === '1'); //Stability Control

                (response.Results[0].TractionControl == "Standard") ? _this.standardEquipmentsArray[ABSindex].selected = true : _this.standardEquipmentsArray[ABSindex].selected = false;   //ABS                

                (response.Results[0].TractionControl == "Standard") ? _this.standardEquipmentsArray[Tractionindex].selected = true : _this.standardEquipmentsArray[Tractionindex].selected = false;  //Traction Control

                (response.Results[0].AdaptiveCruiseControl == "Standard") ? _this.standardEquipmentsArray[Cruiseindex].selected = true : _this.standardEquipmentsArray[Cruiseindex].selected = false;  //Cruise Control

                (response.Results[0].DaytimeRunningLight == "Standard") ? _this.standardEquipmentsArray[Daytimeindex].selected = true : _this.standardEquipmentsArray[Daytimeindex].selected = false;  //Daytime Running Lights

                (response.Results[0].ESC == "Standard") ? _this.standardEquipmentsArray[Stabilityindex].selected = true : _this.standardEquipmentsArray[Stabilityindex].selected = false;  //Stability Control

                (response.Results[0].TransmissionStyle == "Automatic") ? _this.standardEquipmentsArray[CVTindex].selected = true : _this.standardEquipmentsArray[CVTindex].selected = false;  //CVT


                //console.log('vehicleMakeLabel',_this.vehicleMakeLabel)
                //console.log('vehicleModelLabel',_this.vehicleModelLabel)
               // console.log('vehicleYearLabel',_this.vehicleYearLabel)

                // check trim is null or not from API
                if(response.Results[0].Trim == ""){
                    
                    // get Trim Details by Make and Model
                    _this.vehicleService.getTrimsByMakeName({make_name:response.Results[0].Make, model_name:response.Results[0].Model})
                    .subscribe(
                    (response) => { 
                      //console.log('trims',response)

                      if(response.length > 0) {

                        _this.isMyCarFound = true;
                        _this.showVehicleTrimSelectBox = true;
                        _this.showVehicleTrimTextBox = false;
                        
                        _this.trims = response;

                      }else{
                       
                        _this.isMyCarFound = true;
                        _this.showVehicleTrimTextBox = true;
                        _this.showVehicleTrimSelectBox = false;
                        
                        //_this.commonUtilsService.onError(environment.MESSAGES.NO_RECORDS_FOUND);
                       
                        

                      }
                      
                      _this.isAllVehicleDetailsSelected = true; //Show "Yes this is my car" Button
                      //console.log(response);
                      _this.commonUtilsService.hidePageLoader();
                      
                    },
                    error => {
                      
                      _this.isMyCarFound = false;
                      _this.showVehicleTrimSelectBox = false;
                      _this.showVehicleTrimTextBox = false;
                      _this.commonUtilsService.onError(environment.MESSAGES.NO_RECORDS_FOUND);
                      //console.log(error); 
                      _this.commonUtilsService.hidePageLoader();  

                    });
                    // get Trim Details by Make and Model

                    


                }else{
                  _this.isMyCarFound = true;
                  _this.showVehicleTrimTextBox = false;
                  _this.showVehicleTrimSelectBox = false;
                  _this.isAllVehicleDetailsSelected = true;
                  
                   
                   vehicleTrimControl.patchValue(response.Results[0].Trim);
                  _this.vehicleTrimLabel = response.Results[0].Trim;
                  _this.commonUtilsService.hidePageLoader();

                }

              }
              
              
            },
            error: function(xhr, ajaxOptions, thrownError)
            {
              _this.isMyCarFound = false; 
              _this.showVehicleTrimSelectBox = false;
              _this.showVehicleTrimTextBox = false;             
              _this.commonUtilsService.onError(environment.MESSAGES.NO_RECORDS_FOUND);
              _this.commonUtilsService.hidePageLoader();
              console.log(xhr.status);
              console.log(thrownError);
            }

          });
        }  

      },
      error => {
        _this.isMyCarFound = false;
        _this.showVehicleTrimSelectBox = false;
        _this.showVehicleTrimTextBox = false;
        _this.commonUtilsService.onError(environment.MESSAGES.NO_RECORDS_FOUND);
        //console.log(error); 
        _this.commonUtilsService.hidePageLoader();  

      });    
   
  }


  /**
   * get Vehicle Details By VIN
  */
 getVehicleDetailsByLicensePlate(license_plate){
  const _this = this;

  _this.commonUtilsService.showPageLoader();
  let vehicleTrimControl = _this.vehicleDetails.controls.vehicle_trim;
  let vehicleYearControl = _this.vehicleDetails.controls.vehicle_year;
  let vehicleMakeControl = _this.vehicleDetails.controls.vehicle_make;
  let vehicleModelControl = _this.vehicleDetails.controls.vehicle_model;
  
  _this.vehicleTrimLabel = '';
  vehicleTrimControl.patchValue('');

  _this.vehicleLicensePlateLabel = license_plate;
  _this.vehicleService.checkLicensePlateAlreadyExist({license_plate:license_plate, state:this.stateAbbreviation})
    .subscribe(
    (response) => {
      if(response){
        //console.log('Found', response)
        _this.isMyCarFound = false;
        _this.commonUtilsService.onError(environment.MESSAGES.LICENSEPLATE_ALREADY_EXIST);
        //console.log(error); 
        _this.commonUtilsService.hidePageLoader();
      }else{
          // get Vehicle Details by License Plate API
          _this.vehicleService.getDetailsByLicensePlateAPI({license_plate:license_plate, state:this.stateAbbreviation})
          .subscribe(
          (response) => { 
              
              //console.log('Found', response)     
                            
                    
                if(response.vehicle_details[0].make == ""){

                  _this.commonUtilsService.onError(environment.MESSAGES.NO_RECORDS_FOUND);
                  _this.commonUtilsService.hidePageLoader();

                }else{



                  vehicleYearControl.patchValue(response.vehicle_details[0].year);
                  vehicleMakeControl.patchValue(response.vehicle_details[0].make.toLowerCase());
                  vehicleModelControl.patchValue(response.vehicle_details[0].model.toLowerCase());
                  
                  
                  _this.vehicleMakeLabel = response.vehicle_details[0].make;
                  _this.vehicleModelLabel = response.vehicle_details[0].model;
                  _this.vehicleYearLabel = response.vehicle_details[0].year;
                
                  
                      
                  // get Trim Details by Make and Model
                  _this.vehicleService.getTrimsByMakeName({make_name:response.vehicle_details[0].make, model_name:response.vehicle_details[0].model})
                  .subscribe(
                  (response) => { 
                    //console.log('trims',response)

                    if(response.length > 0) {

                      _this.isMyCarFound = true;
                      _this.showVehicleTrimSelectBox = true;
                      _this.showVehicleTrimTextBox = false;
                      
                      _this.trims = response;

                    }else{
                    
                      _this.isMyCarFound = true;
                      _this.showVehicleTrimTextBox = true;
                      _this.showVehicleTrimSelectBox = false;
                      
                      //_this.commonUtilsService.onError(environment.MESSAGES.NO_RECORDS_FOUND);

                    }
                    
                    _this.isAllVehicleDetailsSelected = true; //Show "Yes this is my car" Button
                    //console.log(response);
                    _this.commonUtilsService.hidePageLoader();
                    
                  },
                  error => {
                    
                    _this.isMyCarFound = false;
                    _this.showVehicleTrimSelectBox = false;
                    _this.showVehicleTrimTextBox = false;
                    _this.commonUtilsService.onError(environment.MESSAGES.NO_RECORDS_FOUND);
                    //console.log(error); 
                    _this.commonUtilsService.hidePageLoader();  

                  });
                  // get Trim Details by Make and Model

                }
              
              },
              error => {
                _this.isMyCarFound = false;
                _this.showVehicleTrimSelectBox = false;
                _this.showVehicleTrimTextBox = false;
                _this.commonUtilsService.onError(environment.MESSAGES.NO_RECORDS_FOUND);
                //console.log(error); 
                _this.commonUtilsService.hidePageLoader();  

              });
        }    
    },
    error => {
      _this.isMyCarFound = false;
      _this.showVehicleTrimSelectBox = false;
      _this.showVehicleTrimTextBox = false;
      _this.commonUtilsService.onError(environment.MESSAGES.NO_RECORDS_FOUND);
      //console.log(error); 
      _this.commonUtilsService.hidePageLoader();  

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
      if(!_.has(response[0],['status'])){
        console.log(response)
        this.cities = response[0]['city_states'];
        let cityState = response[0]['city_states'][0]        
        cityState['coordinates'] = [response[0]['zipcodes'][0]['longitude'],response[0]['zipcodes'][0]['latitude']]            
        this.vehicleLocation =  cityState   
        
        
        this.stateAbbreviation = response[0]['city_states'][0].state_abbreviation;
        
      }else{
        this.vehicleDetails.controls.vehicle_location.get('zipcode').patchValue('');                  
        this.commonUtilsService.onError('Could not fetch city, state data for zip code.');
      }       
    },
    error => {        
      this.vehicleDetails.controls.vehicle_location.get('zipcode').patchValue(''); 
      this.commonUtilsService.onError('Could not fetch city, state data for zip code.');
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
  

  // Reset All Fields
  this.isMyCarFound = false;
  this.vehicleVINLabel = "";
  this.vehicleLicensePlateLabel = "";
  this.vehicleMakeLabel = "";
  this.vehicleModelLabel = "";
  this.vehicleYearLabel = "";
  this.vehicleTransmissionStyleLabel = "";
  this.vehicleEngineCylindersLabel = "";
  this.vehicleEngineModelLabel = "";
  this.vehicleTrimLabel = "";  
  this.vehicleMileageLabel = "";

  let vehicleVIN = this.vehicleDetails.controls.vin_number;
  let vehicleLicensePlate = this.vehicleDetails.controls.license_plate;
  let vehicleYearControl = this.vehicleDetails.controls.vehicle_year;
  let vehicleMakeControl = this.vehicleDetails.controls.vehicle_make;
  let vehicleModelControl = this.vehicleDetails.controls.vehicle_model;
  let vehicleTransmissionStyleControl = this.vehicleDetails.controls.vehicle_transmission_style;
  let vehicleEngineCylindersControl = this.vehicleDetails.controls.vehicle_engine_cylinders;
  let vehicleEngineModelControl = this.vehicleDetails.controls.vehicle_engine_model;
  let vehicleTrimControl = this.vehicleDetails.controls.vehicle_trim;
  let vehicleMileageControl = this.vehicleDetails.controls.vehicle_mileage;
  
  vehicleVIN.patchValue('');
  vehicleLicensePlate.patchValue('');
  vehicleYearControl.patchValue('');
  vehicleMakeControl.patchValue('');
  vehicleModelControl.patchValue('');
  vehicleEngineCylindersControl.patchValue('');
  vehicleEngineModelControl.patchValue('');
  vehicleTransmissionStyleControl.patchValue('');
  vehicleTrimControl.patchValue('');
  vehicleMileageControl.patchValue('');
      
  this.isAllVehicleDetailsSelected = false;
  this.commonUtilsService.onError("Please try again with another VIN Number or License Plate.");
  
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
    
  this.vehicleDetails.controls.vehicle_location.get('state').patchValue(''); 
  this.vehicleDetails.controls.vehicle_location.get('city').patchValue('');
  if((zipcode) && zipcode.length==5){            
      (zipcode.length==5)?this.fetchCityStateOfZipcode(zipcode):this.resetVehicleLocationControl()
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
    this.addNewCarSection.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" }); 
  }

  ngOnInit() {  
    this.addNewCarSection.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });  
    
    
    const userData = JSON.parse(localStorage.getItem('loggedinUser'));//parsing the local store data
    this.vehicleDetails.controls.vehicle_location.patchValue(userData.location);

    // set State Abbrevation
    this.stateAbbreviation = userData.location.state_abbreviation;
    
  }

  ngAfterViewInit(){    
    //this.yearRange = this.commonUtilsService.createYearRange();  
    this.colors = [{label:'Beige',value:'#F5F5DC'},{label:'Black',value:'#252627'},{label:'Brown',value:'#672E10'},{label:'Burgundy',value:'#75141C'},{label:'Charcoal Grey',value:'#757776'},{label:'Dark Blue',value:'#172356'},{label:'Dark Green',value:'#316241'},{label:'Gold',value:'#D6C17F'},{label:'Grey',value:'#808080'},{label:'Light Blue',value:'#5F7DC5'},{label:'Light Green',value:'#8E9F87'},{label:'Orange',value:'#FF9200'},{label:'Purple',value:'#6A4574'},{label:'Red',value:'#E32F43'},{label:'Silver',value:'#D4D9DC'},{label:'Tan',value:'#D2B48C'},{label:'White',value:'#F2F6F9'},{label:'Yellow',value:'#F8E81C'}];
    

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