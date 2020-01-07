import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { ToastrManager } from 'ng6-toastr-notifications';//toaster class
import { untilDestroyed } from 'ngx-take-until-destroy';// unsubscribe from observables when the  component destroyed

//modules core services
import { UserAuthService } from '../../../core/_services';
import { environment } from '../../../../environments/environment'

@Component({
  selector: 'app-account-verify',
  templateUrl: './account-verify.component.html',
  styleUrls: ['./account-verify.component.css']
})
export class AccountVerifyComponent implements OnInit {
   
  userId: any;
  title: string = 'Seller Email Verification';
  constructor(private authService: UserAuthService, private activatedRoute: ActivatedRoute, private toasterService: ToastrManager, private router: Router) { }

  ngOnInit() {

    this.activatedRoute.params.subscribe((params) => {
      this.userId = params['id'];
    })

  }

  reSendVerificationLink() {
    this.authService.sendDealerVerificationLink({ userId: this.userId })
      .pipe(untilDestroyed(this))
      .subscribe((response: any) => {
        this.toasterService.successToastr(environment.MESSAGES.RESEND_VERIFICATION_SUCCESS,'Success')
      }, (error) => {       
        this.toasterService.errorToastr(error, 'Oops!');//showing error toaster message
      })

  }

  // This method must be present, even if empty.
  ngOnDestroy() {
    // To protect you, we'll throw an error if it doesn't exist.
  }
}
