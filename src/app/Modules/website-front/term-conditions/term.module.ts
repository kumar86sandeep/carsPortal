import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule, HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { NgxMaskModule } from 'ngx-mask'

import { TermConditionsComponent } from './term-conditions.component';


import { SharedModule } from '../../../core/shared.module';

const routes: Routes = [
  { path: '', component:TermConditionsComponent, pathMatch: 'full' },

];



@NgModule({
  declarations: [TermConditionsComponent ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes)    
  ]
})
export class TermConditionModule { }
