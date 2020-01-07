import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule, HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { NgxMaskModule } from 'ngx-mask'

import { PrivatePolicyComponent } from './private-policy.component';
import { SharedModule } from '../../../core/shared.module';



const routes: Routes = [
  { path: '', component:PrivatePolicyComponent, pathMatch: 'full' },

];



@NgModule({
  declarations: [PrivatePolicyComponent ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes)    
  ]
})
export class PrivacyModule { }
