import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule, HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { NgxMaskModule } from 'ngx-mask'

import { ContactComponent } from './contact.component';
import { SharedModule } from '../../../core/shared.module';


const routes: Routes = [
  { path: '', component:ContactComponent, pathMatch: 'full' },

];



@NgModule({
  declarations: [ContactComponent ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes)    
  ]
})
export class ContactModule { }
