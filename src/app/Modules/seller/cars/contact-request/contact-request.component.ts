import { Component,  ViewChild, Input, Output, ElementRef, EventEmitter } from '@angular/core';
import { AbstractControl, FormGroup, FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { untilDestroyed } from 'ngx-take-until-destroy';// unsubscribe from observables when the  component destroyed

//import services

  //shared services
  import { AlertService, PageLoaderService } from '../../../../shared/_services'
  //modules core services
  import { CommonUtilsService, CarService  } from '../../../../core/_services'


//import custom validators
import { CustomValidators } from '../../../../core/custom-validators';
import { environment } from '../../../../../environments/environment'

declare let $: any;
@Component({
  selector: 'app-contact-request',
  templateUrl: './contact-request.component.html',
  styleUrls: ['./contact-request.component.css']
})
export class ContactRequestComponent{

  @Input() isOpen: any;
  @ViewChild('contentSection') contentSection :ElementRef;
  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();
  contactRequestForm: FormGroup;
  submitted:boolean = false;
  /**
  * component life cycle default method, runs when input value named 'isOpen' gets change
  * @return void
  */
 constructor(private carService:CarService, private commonUtilsService:CommonUtilsService, private pageLoaderService: PageLoaderService, private formBuilder: FormBuilder) {

 }

  ngOnChanges():void{

    this.initalizeContactRequestForm();
    //to show the modal popup
    if(this.isOpen) 
      $(this.contentSection.nativeElement).modal({backdrop: 'static', keyboard: false, show:true}); 
    
  }

  private initalizeContactRequestForm(){
    //define the profile form and its controls
    this.contactRequestForm = this.formBuilder.group({
      //dealer_id: [localStorage.getItem('loggedinUserId')],
      name: [null, Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
      email: [null, [Validators.email, Validators.required]],
      preference:['email', [Validators.required]],
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
      country_code:[environment.DEFAULT_COUNTRY_CODE],    
      message: [null, Validators.compose([Validators.minLength(2), Validators.maxLength(500), Validators.pattern('^[a-zA-Z ]*$')])],
      
    })      
  }


  onSubmit() {    

    // stop here if form is invalid
    if (this.contactRequestForm.invalid) {
      this.submitted = true;
      return;
    }
    this.commonUtilsService.showPageLoader(environment.MESSAGES.PLS_WAIT_TEXT);   
    this.carService.contactRequest(this.contactRequestForm.value)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response) => {
          $(this.contentSection.nativeElement).modal('hide');   
          this.commonUtilsService.onSuccess(environment.MESSAGES.CONTACT_REQUEST_SEND);
          this.isOpen = false
          this.onClose.emit(false);
          this.contactRequestForm.reset(); 
          this.contactRequestForm.controls['preference'].setValue('email');      
          
         
        },
        error => {        
          this.commonUtilsService.onError(error); 
        });
  }

  close() {
    this.isOpen = false
    this.onClose.emit(false);    
  } 

  // This method must be present, even if empty.
  ngOnDestroy() {
    // To protect you, we'll throw an error if it doesn't exist.
  }

}
