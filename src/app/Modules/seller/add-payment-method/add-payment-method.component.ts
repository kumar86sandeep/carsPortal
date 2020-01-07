import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AbstractControl, FormBuilder, FormArray, FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { of, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MovingDirection } from 'angular-archwizard';
import { ToastrManager } from 'ng6-toastr-notifications';//toaster class
import { untilDestroyed } from 'ngx-take-until-destroy';// unsubscribe from observables when the  component destroyed

import { CreditCardValidator } from 'angular-cc-library';
//import core services
import { UserAuthService, TitleService, CommonUtilsService } from '../../../core/_services';
//import shared services
import { AlertService, PageLoaderService } from '../../../shared/_services'
import { environment } from '../../../../environments/environment'
import { bool } from 'aws-sdk/clients/signer';
//import custom validators
import { CustomValidators } from '../../../core/custom-validators';



@Component({
  selector: 'app-add-payment-method',
  templateUrl: './add-payment-method.component.html',
  styleUrls: ['./add-payment-method.component.css']
})
export class AddPaymentMethodComponent implements OnInit {

  //title and breadcrumbs
  readonly title: string = 'Add Payment Method'
  readonly breadcrumbs: any[] = [{ page: 'Home', link: '/seller/home' }, { page: 'Add Payment Method', link: '' }];

  addPaymentWizard: FormGroup;
  payment_details: FormArray;

  submitted = false;
  showSelectedPaymentMethod:boolean = false;
  isPaymentDetailsSubmitted:boolean = false;
  addPaymentSubscription:Subscription;
  isStandardOptionsSubmitted:boolean =false;
  months= [{name: "Jan", value: "01"}, {name: "Feb", value: "02"}, {name: "Mar", value: "03"}, {name: "Apr", value: "04"}, {name: "May", value: "05"}, {name: "Jun", value: "06"}, {name: "Jul", value: "07"}, {name: "Aug", value: "08"}, {name: "Sep", value: "09"}, {name: "Oct", value: "10"}, {name: "Nov", value: "11"}, {name: "Dec", value: "12"}];

  yearRange:any = [];
  currentYear: number = new Date().getFullYear();   // get Current Year
  maxYear: number = 2030;
  minYear: number = this.currentYear;

  

  constructor(private commonUtilsService:CommonUtilsService, private alertService: AlertService, private userAuthService: UserAuthService, private pageLoaderService: PageLoaderService, private formBuilder: FormBuilder, private titleService: TitleService, private toastr: ToastrManager, private router: Router) {

    this.addPaymentForm();    //Payment Wizard      

  }

  /**
  * Initialize Payment Detail Fields.
  */
  private addPaymentForm() {
    this.addPaymentWizard = this.formBuilder.group({  
      seller_id: [localStorage.getItem('loggedinUserId')],      
      payment_details:this.formBuilder.group({
        credit_card_name : ['', Validators.compose([Validators.required,Validators.minLength(2),Validators.maxLength(50),Validators.pattern('^[a-zA-Z ]*$')])],
        credit_card_number : ['', [Validators.compose([Validators.required]),CreditCardValidator.validateCCNumber]],
        expiry_month : ['', [Validators.compose([Validators.required])]],
        expiry_year : ['', [Validators.compose([Validators.required])]],
        cvc_number : ['', Validators.compose([Validators.required, Validators.min(1),Validators.minLength(3),Validators.maxLength(4),Validators.pattern(/^-?(0|[1-9]\d*)?$/)])],
        default_card : [true]
      },
      {
        // check whether our password and confirm password match
        validators: CustomValidators.creditCardExpiryValidator
      })
    });
  }  

  /**
  * Validate Payment Method.
  */
  validateAddPaymentMethodWizard(){

    //console.log('addPaymentWizard', this.addPaymentWizard)
    
    this.isPaymentDetailsSubmitted = true;

    // stop here if form is invalid
    if (this.addPaymentWizard.invalid) {
      return;
    }

    this.commonUtilsService.showPageLoader(environment.MESSAGES.ADD_PAYMENT_METHOD);

    this.addPaymentSubscription = this.commonUtilsService.addPaymentMethod(this.addPaymentWizard.value)
      .subscribe(
      (response) => {   
        this.router.navigate(['/seller/saved-card-listings']);  
          this.commonUtilsService.onSuccess(response.success);
      },
      error => {  
        this.commonUtilsService.onError(error);
      });
   
  }

  getYearRange(){
    for (let i = 0; i < 15; i++) {
      this.yearRange.push({        
        value: this.currentYear + i
      });
    }
  }


  ngOnInit() {}

  ngAfterViewInit(){
    this.getYearRange();
  }

  // This method must be present, even if empty.
  ngOnDestroy() {
    // To protect you, we'll throw an error if it doesn't exist.
  }

}
