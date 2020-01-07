import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule, HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { NgxMaskModule } from 'ngx-mask'
import { SharedModule } from '../../../core/shared.module';
import { AboutComponent } from './about.component';



const routes: Routes = [
  { path: '', component:AboutComponent, pathMatch: 'full' },

];



@NgModule({
  declarations: [AboutComponent ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes)    
  ]
})
export class AboutModule { }
