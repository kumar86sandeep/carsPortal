import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//importing components
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { AccountPendingComponent } from './account-pending/account-pending.component';
//cars management components
import { ListingComponent as CarsGridListComponent } from './cars/grid-list-view/listing.component';
import { ListComponent as CarsTableComponent } from './cars/table-view/list.component';
import { CarDetailPageComponent } from './cars/car-detail-page/car-detail-page.component';
import { AddCarComponent } from './cars/addcar/addcar.component';
import { AddNewCarComponent } from './cars/addnewcar/addnewcar.component';
import { CarBidsComponent } from './cars/car-bids/car-bids.component';
import { RateReviewComponent } from './rate-review/rate-review.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { AccountVerifyComponent } from './account-verify/account-verify.component';
import { EditCarComponent } from './cars/editcar/editcar.component';
import { EditSavedCarComponent } from './cars/editsavedcar/editsavedcar.component';
import {ChangePasswordComponent} from  './change-password/change-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AddPaymentMethodComponent } from './add-payment-method/add-payment-method.component';
import { DisputeComponent } from './dispute/dispute.component';
import { DisputeDetailComponent } from './dispute-detail/dispute-detail.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { PaymentMethodsComponent } from './payment-methods/payment-methods.component';

//importing guards
import { SellerAuthGuardService } from '../../core/guards/seller-auth-guard.service';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
    data: { title: 'Seller Login' }
  },
  {
    path: 'signup',
    component: SignupComponent,
    data: { title: 'Seller Signup' }
  },
  {
    path: 'verification-pending',
    component: AccountPendingComponent,
    data: { title: 'Seller Verification' }
  },
  
  {
    path: 'verify-email',
    component: VerifyEmailComponent,
    data: { title: 'Seller Email Verify' }
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    data: { title: 'Seller Reset Pasword' }
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    data: { title: 'Seller Forgot Pasword' }
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent    ,
    data: { title: 'Seller change Pasword' }
      },
  {
    path: 'home',
    component: CarsGridListComponent,
    data: { title: "Seller's Cars listing" },
    canActivate: [SellerAuthGuardService]
  },
  {
    path: 'seller-profile',
    component: ProfileComponent,
    data: { title: 'Seller Profile' },
    canActivate: [SellerAuthGuardService]
  },
  {
    path: 'car-dashboard',
    component: CarsTableComponent,
    data: { title: "Car Listing" },
    canActivate: [SellerAuthGuardService]
  },
  {
    path: 'disputes',
    component: DisputeComponent,
    data: { title: "Dispute Listing" },
    canActivate: [SellerAuthGuardService]
  },
  
  {
    path: 'car-listing',
    component: CarsGridListComponent,
    data: { title: "Car Listing" },
    canActivate: [SellerAuthGuardService]
  },
  {
    path: 'car-listing/:type',
    component: CarsGridListComponent,
    data: { title: "Car Listing" },
    canActivate: [SellerAuthGuardService]
  },
  {
    path: 'car-detail/:_id/:type',
    component: CarDetailPageComponent,
    data: { title: "Car Details" },
    canActivate: [SellerAuthGuardService]
  },
  {
    path: 'car-detail/:_id',
    component: CarDetailPageComponent,
    data: { title: "Car Details" },
    canActivate: [SellerAuthGuardService]
  },

  {
    path: 'addcar',
    component: AddCarComponent,
    data: { title: 'Seller AddCar' },
    canActivate: [SellerAuthGuardService]
  }, 

  {
    path: 'addnewcar',
    component: AddNewCarComponent,
    data: { title: 'Seller AddCar' },
    canActivate: [SellerAuthGuardService]
  },
  {
    path: 'editcar/:_id',
    component: EditSavedCarComponent,
    data: { title: 'Seller EditCar' },
    canActivate: [SellerAuthGuardService]
  } ,
  {
    path: 'dispute-detail/:id',
    component: DisputeDetailComponent,
    data: { title: 'Dispute Detail' },
    canActivate: [SellerAuthGuardService]
  } ,
  
  {
    path: 'editcar/:_id/:type',
    component: EditSavedCarComponent,
    data: { title: 'Seller EditCar' },
    canActivate: [SellerAuthGuardService]
  },
  {
    path: 'addnewcar/:type',
    component: AddNewCarComponent,
    data: { title: 'Seller AddCar' },
    canActivate: [SellerAuthGuardService]
  },
  {
    path: 'addcar/:type',
    component: AddCarComponent,
    data: { title: 'Seller AddCar' },
    canActivate: [SellerAuthGuardService]
  },
  {
    path: 'add-payment-method',
    component: AddPaymentMethodComponent,
    data: { title: 'Add Payment' },
    canActivate: [SellerAuthGuardService]
  },
  {
    path: 'saved-card-listings',
    component: PaymentMethodsComponent,
    data: { title: 'Saved Card Listing' },
    canActivate: [SellerAuthGuardService]
  },
  {
    path: 'account-verify/:id',
    component: AccountVerifyComponent,
    data: { title: 'Seller AddCar' }
  },
  {
    path: 'car-bids/:id',
    component: CarBidsComponent,
    data: { title: 'Seller Car Bids' }
  }
  ,
  {
    path: 'rate-review',
    component: RateReviewComponent,
    data: { title: 'Seller Rate and Reviews' }
  },
  {
    path:"transactions",
    component:TransactionsComponent,
    data:{title:"Seller Transactions"},
    canActivate: [SellerAuthGuardService]
  },
 /* ,
  {

    path: 'editcar/:_id',
    component: EditCarComponent,
    data: { title: 'Seller EditCar' }
  }
  ,

  {
    path: 'editcar/:_id/:type',
    component: EditCarComponent,
    data: { title: 'Seller EditCar' }
  } */
];

@NgModule({
  imports: [RouterModule.forChild(routes)],

  exports: [RouterModule]
})
export class SellerRoutingModule { }
