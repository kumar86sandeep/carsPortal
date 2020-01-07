import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule, HttpClient } from '@angular/common/http';
import { SocialLoginModule } from 'angularx-social-login';
import { AuthServiceConfig, GoogleLoginProvider, FacebookLoginProvider } from 'angularx-social-login';
import { NgbModule, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { NgxMaskModule } from 'ngx-mask'
import { DropzoneModule, DropzoneConfigInterface, DROPZONE_CONFIG } from 'ngx-dropzone-wrapper';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxPaginationModule } from 'ngx-pagination'; 
import { ArchwizardModule } from 'angular-archwizard';
import { CurrencyMaskModule } from "ng2-currency-mask";
import { NgxGalleryModule } from 'ngx-gallery';
import { CreditCardDirectivesModule } from 'angular-cc-library';

//import enviorment file
import { environment } from '../../../environments/environment';

import { CustomNgbDateParserFormatter } from '../../core/custom-ngbDateParserFormatter'

//importing components
import { SellerRoutingModule } from './seller-routing.module';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { SharedModule } from '../../core/shared.module';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

import { AccountPendingComponent } from './account-pending/account-pending.component';
//cars management components
import { ListingComponent as CarsGridListComponent } from './cars/grid-list-view/listing.component';
import { ListComponent as CarsTableComponent } from './cars/table-view/list.component';
import { AddCarComponent } from './cars/addcar/addcar.component';
import { CarDetailPageComponent } from './cars/car-detail-page/car-detail-page.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { AccountVerifyComponent } from './account-verify/account-verify.component';
import { ContactRequestComponent } from './cars/contact-request/contact-request.component';
import { CarBidsComponent } from './cars/car-bids/car-bids.component';
import { RateReviewComponent } from './rate-review/rate-review.component';
import {ChangePasswordComponent} from  './change-password/change-password.component';
import { AddNewCarComponent } from './cars/addnewcar/addnewcar.component';
import {CarBidsPopupComponent} from './cars/car-bids-popup/car-bids-popup.component';
//loader components
import { EditCarComponent } from './cars/editcar/editcar.component';
import { EditSavedCarComponent } from './cars/editsavedcar/editsavedcar.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { EditLocationPopupComponent } from './cars/edit-location-popup/edit-location-popup.component';
import { AddPaymentMethodComponent } from './add-payment-method/add-payment-method.component';
import { DisputeComponent } from './dispute/dispute.component';
import { DisputeDetailComponent } from './dispute-detail/dispute-detail.component';
import { TrumbowygModule } from 'ng2-lazy-trumbowyg';
import { PaymentListingsComponent } from './payment-listings/payment-listings.component';

import { TransactionsComponent } from './transactions/transactions.component';
import { PaymentMethodsComponent } from './payment-methods/payment-methods.component';
import { CookieService } from 'ngx-cookie-service';
const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  acceptedFiles: '.jpg, .png, .jpeg',
  createImageThumbnails: true
};

export function provideConfig() {
  return config;
}

let config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider(environment.SOCIAL_LOGINS.GOOGLE.GOOGLE_0AUTH_CLIENT_ID)
  },
  {
    id: FacebookLoginProvider.PROVIDER_ID,
    provider: new FacebookLoginProvider(environment.SOCIAL_LOGINS.FACEBOOK.FACEBOOK_APP_ID)
  }
]);

@NgModule({
  declarations: [
    LoginComponent, 
    SignupComponent, 
    HomeComponent, 
    ProfileComponent, 
    ForgotPasswordComponent,
    AddCarComponent,
    EditCarComponent,
    CarsTableComponent,
    CarsGridListComponent,
    CarDetailPageComponent,
    AddCarComponent,
    AddNewCarComponent,
    ContactRequestComponent,
    CarBidsComponent,
    RateReviewComponent,
    VerifyEmailComponent,
    AccountVerifyComponent,
    EditSavedCarComponent,
    ContactRequestComponent,
    ResetPasswordComponent,
    ChangePasswordComponent,
    CarBidsPopupComponent,
    EditLocationPopupComponent,
    AccountPendingComponent,
    AddPaymentMethodComponent,
    DisputeComponent,
    DisputeDetailComponent,
    TransactionsComponent,
    PaymentListingsComponent,
    PaymentMethodsComponent
  ],
  
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SellerRoutingModule,
    SocialLoginModule,
    SharedModule,
    NgbModule,
    DropzoneModule,
    NgxMaskModule.forRoot(),
    NgScrollbarModule,
    NgxDatatableModule,
    NgxPaginationModule,
    CurrencyMaskModule,
    ArchwizardModule,
    NgxGalleryModule,
    TrumbowygModule.forRoot({plugins: ['colors', 'noembed', 'preformatted', 'pasteimage', 'upload'], version: '2.8.0'}), //Optional config : plug-ins and version
    CreditCardDirectivesModule,
    NgxGalleryModule

  ],

  providers: [
    CookieService,
    {
      provide: AuthServiceConfig,
      useFactory: provideConfig
    },
    {
      provide: DROPZONE_CONFIG,
      useValue: DEFAULT_DROPZONE_CONFIG
    },
    {
      provide: NgbDateParserFormatter, 
      useFactory: () => new CustomNgbDateParserFormatter('longDate')
    }
  ],
})
export class SellerModule { }
