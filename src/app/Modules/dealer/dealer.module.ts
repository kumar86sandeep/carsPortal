import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule, HttpClient } from '@angular/common/http';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask'
import { NgbModule, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { CurrencyMaskModule } from "ng2-currency-mask";

import { ArchwizardModule } from 'angular-archwizard';
import {
  DropzoneModule, DropzoneConfigInterface,
  DROPZONE_CONFIG
} from 'ngx-dropzone-wrapper';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxGalleryModule } from 'ngx-gallery';


//import social login modules
import { SocialLoginModule } from 'angularx-social-login';
import { AuthServiceConfig, GoogleLoginProvider, FacebookLoginProvider } from 'angularx-social-login';
//import microsoft module
import { AdalService, AdalGuard, AdalInterceptor } from 'adal-angular4';


//import enviorment file
import { environment } from '../../../environments/environment';
//import dealer routing 
import { DealerRoutingModule } from './dealer-routing.module';
//import shared module
import { SharedModule } from '../../core/shared.module';

import { CustomNgbDateParserFormatter } from '../../core/custom-ngbDateParserFormatter'


//import components
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';


//dealerships management components
import { ListComponent as DealershipsListComponent } from './dealerships/table-view/list.component';
import { ContactViewComponent } from './dealerships/contact-view/contact-view.component';
import { DealershipViewComponent } from './dealerships/dealership-view/dealership-view.component';
import { CreateDealershipComponent } from './dealerships/create-dealership/create-dealership.component';
import { CreateContactComponent } from './dealerships/create-contact/create-contact.component';
import { PurchasesListComponent } from './purchases/purchases-list/purchases-list.component';
import {RateReviewComponent} from './rate-review/rate-review.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { AccountVerifyComponent } from './account-verify/account-verify.component';
import {ChangePasswordComponent} from  './change-password/change-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
//cars management components
import { ListingComponent as CarsGridListComponent } from './cars/grid-list-view/listing.component';
import { CarDetailPageComponent } from './cars/car-detail-page/car-detail-page.component';
import { ContactRequestComponent } from './cars/contact-request/contact-request.component';


//bids management components
import { FilterComponent } from './bids/filter/filter.component';
import { SortComponent } from './bids/sort/sort.component';
import { ListingComponent as BidsListingComponent} from './bids/listing/listing.component';
import { DateFilterComponent } from './bids/date-filter/date-filter.component';
import { CarBidsPopupComponent } from './bids/car-bids-popup/car-bids-popup.component';
import { CarPaymentsPopupComponent } from './bids/car-payments-popup/car-payments-popup.component';
import { NgxPayPalModule } from 'ngx-paypal';
import {NgxPrintModule} from 'ngx-print';
import { MsalModule ,MsalInterceptor} from '@azure/msal-angular';
import { InvoiceComponent } from './bids/invoice/invoice.component';
import { PurchaseDealershipComponent } from './purchase-dealership/purchase-dealership.component';
import { PurchaseDealershipSuccessComponent } from './purchase-dealership-success/purchase-dealership-success.component';
import { CancelDealershipComponent } from './cancel-dealership/cancel-dealership.component';
import { PreviewYourDealershipPlanComponent } from './preview-your-dealership-plan/preview-your-dealership-plan.component';
import { UpgradeYourDealershipPlanComponent } from './upgrade-your-dealership-plan/upgrade-your-dealership-plan.component';
import { PlaceBidComponent } from './bids/place-bid/place-bid.component';
import { AccountPendingComponent } from './account-pending/account-pending.component';
import { DisputeComponent } from './dispute/dispute.component';
import { DisputeDetailComponent } from './dispute-detail/dispute-detail.component';
import { ListingComponent } from './invoices/listing/listing.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { IncreaseBidComponent } from './bids/increase-bid/increase-bid.component';
import {TrumbowygModule} from 'ng2-lazy-trumbowyg';
import {AddPaymentMethodComponent} from './add-payment-method/add-payment-method.component';
import {PaymentMethodsComponent} from './payment-methods/payment-methods.component';
import { CookieService } from 'ngx-cookie-service';
import { PaymentMethodAlertComponent } from './payment-method-alert/payment-method-alert.component';
//facebook, google authentication configuration
/*const fbLoginOptions: LoginOpt = {
  scope: 'email',
  return_scopes: true,
  enable_profile_selector: true
}; // https://developers.facebook.com/docs/reference/javascript/FB.login/v2.11
 
const googleLoginOptions: LoginOpt = {
  scope: 'profile email'
}; // https://developers.google.com/api-client-library/javascript/reference/referencedocs#gapiauth2clientconfig
 
*/

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  acceptedFiles: '.jpg, .png, .jpeg',
  createImageThumbnails: true
};

export function provideConfig() {
  return config;
}

let config = new AuthServiceConfig([
  // {
  //   id: GoogleLoginProvider.PROVIDER_ID,
  //   provider: new GoogleLoginProvider(environment.SOCIAL_LOGINS.GOOGLE.GOOGLE_0AUTH_CLIENT_ID)
  // },
  // {
  //   id: FacebookLoginProvider.PROVIDER_ID,
  //   provider: new FacebookLoginProvider(environment.SOCIAL_LOGINS.FACEBOOK.FACEBOOK_APP_ID)
  // }
]);


@NgModule({
  declarations: [
    LoginComponent,
    HomeComponent,
    SignupComponent,
    ProfileComponent,
    ForgotPasswordComponent,
    DealershipsListComponent,
    ContactViewComponent,
    DealershipViewComponent,
    CreateDealershipComponent,
    CreateContactComponent,
    PurchasesListComponent,
    VerifyEmailComponent,
    AccountVerifyComponent  ,  
    CarsGridListComponent,
    CarDetailPageComponent,
    ContactRequestComponent,
    FilterComponent,
    SortComponent,
    BidsListingComponent,
    DateFilterComponent,
    ResetPasswordComponent,
    RateReviewComponent,
    ChangePasswordComponent,
    CarBidsPopupComponent,
    CarPaymentsPopupComponent,
    InvoiceComponent,
    PurchaseDealershipComponent,
    PurchaseDealershipSuccessComponent,
    CancelDealershipComponent,
    PreviewYourDealershipPlanComponent,
    UpgradeYourDealershipPlanComponent,
    PlaceBidComponent,
    AccountPendingComponent,
    ListingComponent,
    TransactionsComponent,
    DisputeComponent,
    DisputeDetailComponent,
    ListingComponent,
    IncreaseBidComponent,
    AddPaymentMethodComponent,
    PaymentMethodsComponent,
    PaymentMethodAlertComponent
  ],
  imports: [
    CommonModule,
  
    DealerRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SocialLoginModule, 
    SharedModule,
    DropzoneModule,
    NgxMaskModule.forRoot(),
    NgbModule,
    ArchwizardModule,
    NgScrollbarModule,
    NgxDatatableModule,
    NgxPaginationModule,
    NgxPayPalModule,
    NgxPrintModule,
    CurrencyMaskModule,
    NgxGalleryModule,
    TrumbowygModule.forRoot({plugins: ['colors', 'noembed', 'preformatted', 'pasteimage', 'upload'], version: '2.8.0'}), //Optional config : plug-ins and version
    MsalModule.forRoot({
      clientID: "97598d97-5226-4286-bbf9-2a111f89af9d"
  })
  ],
  providers: [
    CookieService,
     {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
  },
    AdalService,   
    AdalGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AdalInterceptor, multi: true
    },
    {
      provide: AuthServiceConfig,
      useFactory: provideConfig
    },
    {
      provide: NgbDateParserFormatter, 
      useFactory: () => new CustomNgbDateParserFormatter('longDate')
    }
  ],
})
export class DealerModule { }
