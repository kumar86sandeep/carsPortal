import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule, HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { NgxMaskModule } from 'ngx-mask'
import { SharedModule } from '../../../core/shared.module';
import { HelpSupportComponent } from './help-support.component';



const routes: Routes = [
  { path: '', component:HelpSupportComponent, pathMatch: 'full' },

];



@NgModule({
  declarations: [HelpSupportComponent ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes)    
  ]
})
export class HelpModule { }
