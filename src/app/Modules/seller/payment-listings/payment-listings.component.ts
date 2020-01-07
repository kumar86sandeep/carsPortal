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

@Component({
  selector: 'app-payment-listings',
  templateUrl: './payment-listings.component.html',
  styleUrls: ['./payment-listings.component.css']
})
export class PaymentListingsComponent implements OnInit {

  constructor(private commonUtilsService:CommonUtilsService, private alertService: AlertService, private userAuthService: UserAuthService, private pageLoaderService: PageLoaderService, private formBuilder: FormBuilder, private titleService: TitleService, private toastr: ToastrManager, private router: Router) {

    

  }

  ngOnInit() {
  }

}
