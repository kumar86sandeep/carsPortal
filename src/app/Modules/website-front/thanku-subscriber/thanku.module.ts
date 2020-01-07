import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule, HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { NgxMaskModule } from 'ngx-mask'

import { ThankuSubscriberComponent } from './thanku-subscriber.component';

import { SharedModule } from '../../../core/shared.module';

const routes: Routes = [
  { path: '', component:ThankuSubscriberComponent, pathMatch: 'full' },

];



@NgModule({
  declarations: [ThankuSubscriberComponent,ThankuSubscriberComponent ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes)    
  ]
})
export class ThankYouModule { }
