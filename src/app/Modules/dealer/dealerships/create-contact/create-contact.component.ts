import { Component,  SimpleChanges, OnInit, Output, EventEmitter, ViewChild, AfterViewInit, ViewEncapsulation, ElementRef, Input, NgZone } from '@angular/core';
import { AbstractControl, FormGroup, FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { of, Observable } from 'rxjs';
import { Router, ActivatedRoute } from "@angular/router";
import { map, catchError } from 'rxjs/operators';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { untilDestroyed } from 'ngx-take-until-destroy';// unsubscribe from observables when the  component destroyed
import { DropzoneComponent, DropzoneDirective, DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
//import services

  //shared services
  import { AlertService, PageLoaderService } from '../../../../shared/_services'
  //modules core services
  import { TitleService, DealershipService, CommonUtilsService  } from '../../../../core/_services'

//import custom validators
import { CustomValidators } from '../../../../core/custom-validators';

//import models
import { PagedData, Dealership, Page } from "../../../../core/_models";

import { environment } from '../../../../../environments/environment'


declare let $: any;
import * as Dropzone from 'dropzone';
import * as _ from 'lodash';


@Component({
  selector: 'app-create-contact',
  templateUrl: './create-contact.component.html',
  styleUrls: ['./create-contact.component.css'],
  providers: [ DealershipService ],
})
export class CreateContactComponent implements OnInit {
  @Input() isOpen: any;  
  @Input() legalContactItems: any;  
  @Input() dealershipId: any;  
  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();
  
  @ViewChild('contentSection') contentSection :ElementRef;  
  @ViewChild('addedContentSection') addedContentSection :ElementRef;
  updatedLegalContactItem:any='';
  submitted= false;
  states:any=[]
  IsForUpdateContact: boolean = false; 
  newLegalContactForm: FormGroup;
  public lconfig:DropzoneConfigInterface;
  private _dealerLocation:any = {}
  cities:any=[];

  //define default emails and phones formArrayName 
  data: any = {
    phones: [
      {
        phone: "",
        default_phone: false,
        country_code:environment.DEFAULT_COUNTRY_CODE
      }
    ],
    emails: [
      {
        email: "",
        default_email: false
      }
    ],
    // faxs: [
    //   {
    //     number: "",
    //     default_fax: false,
    //     country_code:environment.DEFAULT_COUNTRY_CODE
    //   }
    // ]
  }
  
  constructor(private pageLoaderService:PageLoaderService, private titleService:TitleService, private commonUtilsService:CommonUtilsService, private dealershipService: DealershipService,  private formBuilder: FormBuilder, private zone: NgZone,private router: Router) {

    //fetching us states
    //this.fetchStates();
    
    //this.newLegalContactForm.get('name').get('prefix').setValue('Mr.')
    
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
        console.log(response)
        this.cities = response[0]['city_states'];
        let cityState = response[0]['city_states'][0]       
        cityState['coordinates'] = [response[0]['zipcodes'][0]['longitude'],response[0]['zipcodes'][0]['latitude']]            
        this.dealerLocation =  cityState

      }else{
        // this.newLegalContactForm.controls.location.get('zipcode').patchValue(''); 
        this.commonUtilsService.onError('Could not fetch city, state data for zipcode.');
      }       
    },
    error => {        
      // this.newLegalContactForm.controls.location.get('zipcode').patchValue(''); 
      this.commonUtilsService.onError('Could not fetch city, state data for zipcode.');
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
  // this.newLegalContactForm.get('location').patchValue(this._dealerLocation); 
  console.log('form value location',this.newLegalContactForm.get('location').value)
}

  ngOnChanges(changes: SimpleChanges) {
    //setting the page title
    this.titleService.setTitle();
    
    if(this.isOpen){  
      this.submitted = false;   
      this.resetForm();
      $(this.contentSection.nativeElement).modal({backdrop: 'static', keyboard: false, show: true}); 
    }     

  }

  close() {
    this.isOpen = false
    this.onClose.emit(false);    
  } 

  ngOnInit() {   

    //initalize new legal contact form
    this.initalizeNewLegalContactForm();    

    // let zipcodeFormControl = this.newLegalContactForm.controls.location.get('zipcode');
    // zipcodeFormControl.valueChanges    
    // .subscribe(zipcode => {  
    //   this.newLegalContactForm.controls.location.get('state').patchValue(''); 
    //   this.newLegalContactForm.controls.location.get('city').patchValue(''); 
    //   ((zipcode) && zipcode.length==5)?this.fetchCityStateOfZipcode(zipcode):''
    // });



    this.legalContactDropzoneInit() //initalize dropzone library for legal contact    
    this.setPhones();
    this.setEmails();
    // this.setFaxs()
    this.checkingDefault();   
  }
  private legalContactDropzoneInit() { 
    const componentObj = this;
    this.lconfig = {      
      clickable: true,
      paramName: "file",
      uploadMultiple: false,
      url: environment.FILE_UPLOAD_API,
      maxFiles: 1,
      autoReset: null,
      errorReset: null,
      cancelReset: null,
      acceptedFiles: '.jpg, .png, .jpeg',
      maxFilesize: 2, // MB,
      dictDefaultMessage: 'Change Logo',
      previewsContainer: "#legalContactPreview",  
      resizeWidth: 125,
      resizeHeight: 125,
      //createImageThumbnails:false,
      dictInvalidFileType: 'Only valid jpeg, jpg, png file is accepted.',
      dictFileTooBig: 'Maximum upload file size limit is 2MB',
      headers: {
        'Cache-Control': null,
        'X-Requested-With': null,
      },  
      accept: function(file, done) {
        
        console.log('in accept event');
          const reader = new FileReader();
          const _this = this
          reader.onload = function(event) {
              
              // event.target.result contains base64 encoded image     
              var base64String = reader.result      
              const fileExtension = (file.name).split('.').pop();
              const isValidFile = componentObj.commonUtilsService.isFileCorrupted(base64String,_.toLower(fileExtension))   
              if(!isValidFile){
                //componentObj.toastr.errorToastr('File is corrupted or invalid.', 'Oops!');//showing error toaster 
                done('File is corrupted or invalid.');
                _this.removeFile(file);
                return false;
              }              
              componentObj.commonUtilsService.showPageLoader();
              done();             
                       
          };
          reader.readAsDataURL(file); 
      },    
      init: function() {
        const profilePath = componentObj.newLegalContactForm.controls['profile_pic'].value
        
        const defaultPath = environment.WEB_ENDPOINT + '/' + environment.DEFAULT_DEALERSHIP_PROFILE
        this.profilePic = (profilePath) ? profilePath : defaultPath;
  
        // Create the mock file:
        const mockFile = { };
  
        // Call the default addedfile event handler
        this.emit("addedfile", mockFile);
  
        // And optionally show the thumbnail of the file:
        this.emit("thumbnail", mockFile, this.profilePic);
       
        this.emit("complete", mockFile);
  
  
        this.on("totaluploadprogress",function(progress){          
            componentObj.commonUtilsService.showPageLoader('Uploading file '+progress+'%');
          if(progress>=100){
            componentObj.commonUtilsService.hidePageLoader();
          }
        })
        this.on('sending', function(file, xhr, formData){
          formData.append('folder', 'Legal_contacts');
        });
       
        this.on("success", function(file, response) {
          // Called after the file successfully uploaded.         
          
          componentObj.newLegalContactForm.controls['profile_pic'].setValue(response.fileLocation);        
          componentObj.zone.run(() => { 
            $(".dz-image img").attr('src', response.fileLocation);
          });
          this.removeFile(file);  
          componentObj.commonUtilsService.hidePageLoader();
        });
        this.on("error", function(file, error) {    

          componentObj.commonUtilsService.onError(error);
        });
      }     
    };
  }
  private initalizeNewLegalContactForm(){
      //define the profile form and its controls
      this.newLegalContactForm = this.formBuilder.group({
        //dealer_id: [localStorage.getItem('loggedinUserId')],
        name: this.formBuilder.group({
          prefix: [''],
          first_name: [null, Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern('^[a-zA-Z ]*$')])],
          last_name: [null, Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern('^[a-zA-Z ]*$')])],
  
        }),
        // title: [null, Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern('^[a-zA-Z ]*$')])],
        phones: this.formBuilder.array([], Validators.required),
        default_phone: [null],
        emails: this.formBuilder.array([], Validators.required),
        default_email: [null],
        // faxs: this.formBuilder.array([]),
        // default_fax: [null],
        profile_pic: [null],
        /*state: [null, Validators.compose([Validators.required,Validators.minLength(2),Validators.maxLength(50),Validators.pattern('^[a-zA-Z ]*$')])],
        city: [null, Validators.compose([Validators.required,Validators.minLength(2),Validators.maxLength(50),Validators.pattern('^[a-zA-Z ]*$')])],
        zip: [null, Validators.compose([Validators.required,Validators.pattern('^[0-9]{5}$')])],*/
        // address_1 : [null, Validators.compose([Validators.required])],
        // address_2 : [null],
        // location:this.formBuilder.group({
        //   zipcode: [null, Validators.compose([Validators.required,Validators.pattern('^[0-9]{5}$')])],
        //   state: ['', [Validators.required]],
        //   city: ['', [Validators.required]],
  
        // }), 
        default_legal_contact:[false],
        _id: [null],
      })      
    }




    fetchCityState(zipcode){
    
      // if((zipcode) && zipcode.length==5){
      //   this.newLegalContactForm.controls.location.get('state').patchValue(''); 
      //   this.newLegalContactForm.controls.location.get('city').patchValue(''); 
      //   this.fetchCityStateOfZipcode(zipcode);
      // }
        
     
    }



  private resetForm(){   
    this.zone.run(() => { 
      $(".dz-image img").attr('src', environment.WEB_ENDPOINT + '/' + environment.DEFAULT_DEALERSHIP_PROFILE);
      
    });
    
    this.newLegalContactForm.reset(); 
    this.data = {
      phones: [
        {
          phone: "",
          default_phone: false,
          country_code:environment.DEFAULT_COUNTRY_CODE
        }
      ],
      emails: [
        {
          email: "",
          default_email: false
        }
      ],
      faxs: [
        {
          number: "",
          default_fax: false
        }
      ]
    } 
    this.initalizeNewLegalContactForm();
    this.setPhones();
    this.setEmails();
    // this.setFaxs()
    console.log('updatd newLegalContactForm',this.newLegalContactForm);
   
    

    
   
  }

  //function to check default phone, email or fax is checked or not
  private checkingDefault(){
    this.newLegalContactForm.get('phones').valueChanges.subscribe(
      data => {
        let selectedDefaultPhones = data.filter((l) => l.default).map((l) => l);
        if (selectedDefaultPhones.length <= 0) {
          this.newLegalContactForm.get('default_phone').setErrors({ 'defaultPhoneNotSelected': true });
        } else if (selectedDefaultPhones.length > 1) {
          this.newLegalContactForm.get('default_phone').setErrors({ 'defaultPhoneMaxSelected': true });
        } else {
          this.newLegalContactForm.get('default_phone').setErrors(null);
        }
      }
    );

    this.newLegalContactForm.get('emails').valueChanges.subscribe(
      data => {

        let selectedDefaultEmails = data.filter((l) => l.default).map((l) => l);
        if (selectedDefaultEmails.length <= 0) {
          this.newLegalContactForm.get('default_email').setErrors({ 'defaultEmailNotSelected': true });
        } else if (selectedDefaultEmails.length > 1) {
          this.newLegalContactForm.get('default_email').setErrors({ 'defaultEmailMaxSelected': true });
        } else {
          this.newLegalContactForm.get('default_email').setErrors(null);
        }
      }
    );
    // this.newLegalContactForm.get('faxs').valueChanges.subscribe(
    //   data => {
    //     let selectedDefaultFaxs = data.filter((l) => l.default).map((l) => l);
    //     if (selectedDefaultFaxs.length <= 0) {
    //       this.newLegalContactForm.get('default_fax').setErrors({ 'defaultFaxNotSelected': true });
    //     } else if (selectedDefaultFaxs.length > 1) {
    //       this.newLegalContactForm.get('default_fax').setErrors({ 'defaultFaxMaxSelected': true });
    //     } else {
    //       this.newLegalContactForm.get('default_fax').setErrors(null);
    //     }
    //   }
    // );
  }

  /*
   Email Cloning and removing
  */
 cloneEmail() {
  let control = <FormArray>this.newLegalContactForm.controls.emails;
  control.push(
    this.formBuilder.group({
      email: [null, [Validators.email, Validators.required]],
      default: [false],
    })
  )
}
removeEmail(index) {
  let control = <FormArray>this.newLegalContactForm.controls.emails;
  control.removeAt(index)
}
private setEmails() {
  console.log('setemails');
  let control = <FormArray>this.newLegalContactForm.controls.emails;
  this.data.emails.forEach(x => {
    control.push(this.formBuilder.group({
      email: [null, [Validators.email, Validators.required]],
      default: [false],
    })
    )
  })
}

/*
 Phone Cloning and removing
*/
private setPhones() {
  let control = <FormArray>this.newLegalContactForm.controls.phones;
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
      ])
      ],      
      default: [true],
      country_code:[environment.DEFAULT_COUNTRY_CODE]
    })
    )
  })
}


clonePhone() {
  let control = <FormArray>this.newLegalContactForm.controls.phones;
  control.push(
    this.formBuilder.group({
      phone: [null, Validators.compose([
        Validators.required,
        // check whether the entered password has a special character
        CustomValidators.patternValidator(
          /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
          {
            validPhone: true
          }
        ),
      ])
      ],
      default: [true],
      country_code:[environment.DEFAULT_COUNTRY_CODE]
      
    })
  )
}
removePhone(index) {
  let control = <FormArray>this.newLegalContactForm.controls.phones;
  control.removeAt(index)
}


/*
 Fax Cloning and removing
*/
private setFaxs() {
  let control = <FormArray>this.newLegalContactForm.controls.faxs;
  this.data.faxs.forEach(x => {
    control.push(this.formBuilder.group({
      number: [null, Validators.compose([
        
        // check whether the entered password has a special character
        CustomValidators.patternValidator(
          /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
          {
            validFax: true
          }
        ),
      ])
      ],      
      default: [false],
      country_code:[environment.DEFAULT_COUNTRY_CODE]      
    })
    )
  })
}






cloneFax() {
  let control = <FormArray>this.newLegalContactForm.controls.faxs;
  control.push(
    this.formBuilder.group({
      number: [null, Validators.compose([
        // check whether the entered password has a special character
        CustomValidators.patternValidator(
          /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
          {
            validFax: true
          }
        ),
      ])
      ],
      default: [false],
      country_code:[environment.DEFAULT_COUNTRY_CODE]     
      
    })
  )
}
removeFax(index) {
  let control = <FormArray>this.newLegalContactForm.controls.faxs;
  control.removeAt(index)
}

// push new item 
pushLegalContact() {   
     console.log('the rrrrr is',this.newLegalContactForm.invalid)
  if(this.newLegalContactForm.invalid) {
    this.submitted = true;
    return;
  }   
  this.legalContactItems.push(
    this.newLegalContactForm.value
  );   
  this.submitted = false;
  this.commonUtilsService.onSuccess(environment.MESSAGES.RECORD_PUSHED);  
  
  this.addedContentSection.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });      
  console.log('legalContactItems',this.legalContactItems);
  this.resetForm();    
}
// edit newely added dealership
editNewLegalContact(index) {  

  this.IsForUpdateContact = true
  this.updatedLegalContactItem = index; 
  this.zone.run(() => { 
    let profilePic = (this.legalContactItems[index]['profile_pic'])?this.legalContactItems[index]['profile_pic']:environment.WEB_ENDPOINT + '/' + environment.DEFAULT_DEALERSHIP_PROFILE;
    $(".dz-image img").attr('src', profilePic); 
    
    this.newLegalContactForm.patchValue(this.legalContactItems[index]) 
    console.log('first patch',this.newLegalContactForm.value);
  //setting & cloning emails
   let emailControl = <FormArray>this.newLegalContactForm.controls.emails;
   emailControl.removeAt(0);
    (this.legalContactItems[index]['emails']).forEach(x => {
      emailControl.push(this.formBuilder.group({
        email: [x.email, [Validators.email, Validators.required]],
        default: [x.default],
      })
      )
    })

    //setting & cloning phones
   let phoneControl = <FormArray>this.newLegalContactForm.controls.phones;
   phoneControl.removeAt(0);
    (this.legalContactItems[index]['phones']).forEach(x => {
      phoneControl.push(this.formBuilder.group({
        phone: [x.phone, Validators.compose([
          Validators.required,
          // check whether the entered password has a special character
          CustomValidators.patternValidator(
            /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
            {
              validPhone: true
            }
          ),
        ])
        ],      
        default: [x.default],
        country_code:[x.country_code]
      })
      )
    })



    //setting & cloning faxs
   let faxControl = <FormArray>this.newLegalContactForm.controls.faxs;
   faxControl.removeAt(0);
    (this.legalContactItems[index]['faxs']).forEach(x => {
      faxControl.push(this.formBuilder.group({
        number: [x.number, Validators.compose([         
          // check whether the entered password has a special character
          CustomValidators.patternValidator(
            /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
            {
              validPhone: true
            }
          ),
        ])
        ],      
        default: [x.default],
        country_code:[x.country_code]
      })
      )
    })
  }); 
  
}

// update content of newely added dealership
updateNewLegalContact() { 
  

  if(this.newLegalContactForm.invalid) { 
    this.submitted = true;  
    return;
  } 
  this.legalContactItems[this.updatedLegalContactItem] = this.newLegalContactForm.value;   
  this.IsForUpdateContact = false;
  this.addedContentSection.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" }); 
  this.commonUtilsService.onSuccess(environment.MESSAGES.RECORD_PUSHED_UPDATED); 
  this.resetForm(); 
} 

// To delete specific dealership  
async deleteNewLegalContact(index) { 
  //confirm before deleting car
  if(! await this.commonUtilsService.isDeleteConfirmed()) {
    return;
  } 
  var pulled = _.pullAt(this.legalContactItems, [index]);
}

onCreateLegalContact() {   
 
  let defaultLegalContact = this.legalContactItems.filter((l) => l.default_legal_contact).map((l) => l);
 console.log('legalContactItems',this.legalContactItems.length)
 console.log('defaultLegalContact',defaultLegalContact.length)
  if(defaultLegalContact.length == 0){
    this.submitted = true;    
    this.commonUtilsService.onError(environment.MESSAGES.ATLEAST_ONE_CONTACT);  
    return;
  }else if(defaultLegalContact.length>1){  
    this.commonUtilsService.onError(environment.MESSAGES.MAXIMUM_PRIMARY_CONTACT);  
    return;
  }else if(defaultLegalContact.length<=0){
    this.commonUtilsService.onError(environment.MESSAGES.SELECT_PRIMARY);   
    return;
  }else{
    
    //saving the seller at aws user pool
    let data = { id:this.dealershipId, contacts:this.legalContactItems }
    this.dealershipService.newLegalContact(data)     
    .pipe(untilDestroyed(this))
    .subscribe(
      (response) => {  
        //this.viewedpages = [];
        this.resetForm();
        this.legalContactItems = [];   
        
        //this.isLoading = false;
        
        $(this.contentSection.nativeElement).modal('hide');
        this.commonUtilsService.onSuccess(environment.MESSAGES.CONTACT_ADDED);       
        this.pageLoaderService.refreshPage(true) 
       // this.setPage(this.defaultPagination);
        
      },error => {

        this.commonUtilsService.onError(error);
        
      });

      //console.log('dealerships',this.newDealershipForm.value)
       
  }      
}


//fetching all states
private fetchStates(){
  this.commonUtilsService.getStates().subscribe(
    (response) => {  

    this.states = response;

  },error => {    

    this.commonUtilsService.onError(error);

  });
  }
  // This method must be present, even if empty.
ngOnDestroy() {
  // To protect you, we'll throw an error if it doesn't exist.
}

}
