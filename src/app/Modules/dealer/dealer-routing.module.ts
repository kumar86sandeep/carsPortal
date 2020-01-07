import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//importing components
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ProfileComponent } from './profile/profile.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { RateReviewComponent } from './rate-review/rate-review.component';
import { PurchasesListComponent } from './purchases/purchases-list/purchases-list.component';
//cars management components
// import { ListComponent as CarsListComponent } from './cars/list/list.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { AccountVerifyComponent } from './account-verify/account-verify.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import {AddPaymentMethodComponent} from './add-payment-method/add-payment-method.component';
//cars management components


//dealerships management components
import { ListComponent as DealershipsListComponent } from './dealerships/table-view/list.component';

//cars management components
import { ListingComponent as CarsGridListComponent } from './cars/grid-list-view/listing.component';
import { CarDetailPageComponent } from './cars/car-detail-page/car-detail-page.component';

//bids management components
import { ListingComponent as BidsListingComponent } from './bids/listing/listing.component';
import { PurchaseDealershipComponent } from './purchase-dealership/purchase-dealership.component';
import { PurchaseDealershipSuccessComponent } from './purchase-dealership-success/purchase-dealership-success.component';
import { CancelDealershipComponent } from './cancel-dealership/cancel-dealership.component';
import { PreviewYourDealershipPlanComponent } from './preview-your-dealership-plan/preview-your-dealership-plan.component';
import { UpgradeYourDealershipPlanComponent } from './upgrade-your-dealership-plan/upgrade-your-dealership-plan.component';
import { AccountPendingComponent } from './account-pending/account-pending.component';
import { ListingComponent } from './invoices/listing/listing.component';
import { TransactionsComponent } from './transactions/transactions.component';

//importing guards
import { DealerAuthGuardService } from '../../core/guards/dealer-auth-guard.service'
import { DisputeComponent } from './dispute/dispute.component';
import { DisputeDetailComponent } from './dispute-detail/dispute-detail.component';
import {PaymentMethodsComponent} from './payment-methods/payment-methods.component';
const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
    data: { title: 'Dealer Login' }

  },
  {
    path: 'signup',
    component: SignupComponent,
    data: { title: 'Dealer Signup' }
  },
  {
    path: 'verification-pending',
    component: AccountPendingComponent,
    data: { title: 'Dealer Verification' }
  },
  
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    data: { title: 'Dealer Forgot Pasword' }
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
    data: { title: 'Dealer Change Pasword' }
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    data: { title: 'Dealer Reset Pasword' }
  },

  {
    path: 'verify-email',
    component: VerifyEmailComponent,
    data: { title: 'Dealer Verify Email' }
  },
  {
    path: 'home',
    component: CarsGridListComponent,
    data: { title: "Dealer's Cars listing" },
    canActivate: [DealerAuthGuardService]
  },
  {
    path: 'dealer-profile',
    component: ProfileComponent,
    data: { title: 'Dealer Profile' },
    canActivate: [DealerAuthGuardService]
  },
  {
    path: 'disputes',
    component: DisputeComponent,
    data: { title: 'Dispute' },
    canActivate: [DealerAuthGuardService]
  },
  
  {
    path: 'dealership-listing',
    component: DealershipsListComponent,
    data: { title: 'Dealerships listing' },
    canActivate: [DealerAuthGuardService]
  },

  {
    path: 'purchase-dealership/:plan_code/:dealer_id',
    component: PurchaseDealershipComponent,
    data: { title: 'Purchase Dealership' },
    //canActivate: [DealerAuthGuardService]
  },

  {
    path: 'success',
    component: PurchaseDealershipSuccessComponent,
    data: { title: 'Dealership Purchased Successfully' }
  },

  {
    path: 'cancel-dealership',
    component: CancelDealershipComponent,
    data: { title: 'Cancel Dealership' },
    canActivate: [DealerAuthGuardService]
  },

  {
    path: 'your-plan',
    component: PreviewYourDealershipPlanComponent,
    data: { title: 'Preview Your Plan' },
    canActivate: [DealerAuthGuardService]
  },

  {
    path: 'upgrade-your-plan/:id',
    component: UpgradeYourDealershipPlanComponent,
    data: { title: 'Upgrade Your Plan' }
  },

  {
    path: 'car-listing',
    component: CarsGridListComponent,
    data: { title: "Dealer's Cars listing" },    
    canActivate: [DealerAuthGuardService]
  },
  {
    path: 'car-listing/:type',
    component: CarsGridListComponent,
    data: { title: "Dealer's Cars listing" },    
    canActivate: [DealerAuthGuardService]
  },
  {
    path: 'car-detail/:_id/:type',
    component: CarDetailPageComponent,
    data: { title: "Car Details" },
    canActivate: [DealerAuthGuardService]
  },
  {
    path: 'car-detail/:_id',
    component: CarDetailPageComponent,
    data: { title: "Car Details" },
    canActivate: [DealerAuthGuardService]
  },  
  {
    path: 'purchases',
    component: PurchasesListComponent,
    data: { title: 'My Purchases' },
  }, {
    path: 'dealerships-list',
    component: DealershipsListComponent,
    data: { title: 'Dealerships listing' },
    canActivate: [DealerAuthGuardService]
  },
  {
    path: 'account-verify/:id',
    component: AccountVerifyComponent,
    data: { title: 'Account verify' },
  }, {
    path: 'dashboard',
    component: BidsListingComponent,
    data: { title: "Dealer Dashboard" },
    canActivate: [DealerAuthGuardService]
  },
  {
    path: 'rate-review',
    component: RateReviewComponent,
    data: { title: 'Dealer Rate and Review' }
  },
  {
    path:"invoices",
    component:ListingComponent,
    data:{title:'Dealer Invoices'}
  },
  {
    path:"transactions",
    component:TransactionsComponent,
    data:{title:"Dealer Transactions"}
  },
  {
    path:"dispute-detail/:id",
    component:DisputeDetailComponent,
    data:{title:'Dispute Detail'}
  }
  ,
  {
    path: 'add-payment-method',
    component: AddPaymentMethodComponent,
    data: { title: 'Add Payment' },
    canActivate: [DealerAuthGuardService]
  },
  {
    path: 'saved-card-listings',
    component: PaymentMethodsComponent,
    data: { title: 'Saved Card Listing' },
    canActivate: [DealerAuthGuardService]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],

  exports: [RouterModule]
})
export class DealerRoutingModule { }

