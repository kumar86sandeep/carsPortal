import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription } from 'rxjs/Subscription';
import { ToastrManager } from 'ng6-toastr-notifications';//toaster class
import { untilDestroyed } from 'ngx-take-until-destroy';// unsubscribe from observables when the component destroyed

//import core services
import { CustomValidators } from '../../../core/custom-validators';


//modules core services
import { UserAuthService, CommonUtilsService, TitleService} from '../../../core/_services'

import { environment } from '../../../../environments/environment'

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {

  title: string = 'Contact Us';
  contactForm: FormGroup;
  submitted: boolean = false;
  breadcrumbs: any[] = [{ page: 'Home', link: '/web/' }, { page: 'Contact Us', link: '' }]
  constructor(private userAuthService:UserAuthService, private formBuilder: FormBuilder, private commonUtilsService:CommonUtilsService, private titleService:TitleService) { 
    this.contactForm = this.formBuilder.group({
      name: [null, Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern('^[a-zA-Z ]*$')])],
      email: ['', [Validators.email, Validators.required]],
      country_code: [environment.DEFAULT_COUNTRY_CODE],
      phone: ['', Validators.compose([
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
      comment: [null, [Validators.required, Validators.minLength(10)]],
    });
  }
  onSubmit(){ 

    // stop here if form is invalid
    if (this.contactForm.invalid) {
      this.submitted = true;
      return;
    }

   
    this.commonUtilsService.showPageLoader('');
  

    this.userAuthService.contactUs(this.contactForm.value)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response) => {
          this.commonUtilsService.hidePageLoader();
          this.commonUtilsService.onSuccess(environment.MESSAGES.CONTACT_REQUEST_SEND)    
          this.contactForm.reset();
        },
        error => {
          this.commonUtilsService.onError(error);
        });

  }
  


  ngOnInit() {
    this.titleService.setTitle();//setting page title 
  }
  // This method must be present, even if empty.
  ngOnDestroy() {
    // To protect you, we'll throw an error if it doesn't exist.
  }

}
