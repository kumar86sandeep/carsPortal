import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule, HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { NgxMaskModule } from 'ngx-mask'

import { HomeComponent } from './home/home.component';
import { PrivatePolicyComponent } from './private-policy/private-policy.component';
import { TermConditionsComponent } from './term-conditions/term-conditions.component';

import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../core/shared.module';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { HelpSupportComponent } from './help-support/help-support.component';
import { ThankuSubscriberComponent } from './thanku-subscriber/thanku-subscriber.component';
import { FaqComponent } from './faq/faq.component';
import { } from './about/about.module'

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, data: { title: 'Home' } },
  // { path: 'contact', component: ContactComponent,data: { title: 'Contact Us' } },
  // { path: 'user-agreement', component: TermConditionsComponent, data: { title: 'User Agreement' } },
  // { path: 'about-us', component: AboutComponent, data: { title: 'User Agreement' } },
  // { path: 'privacy-policy', component: PrivatePolicyComponent, data: { title: 'Privacy Policy' } },
  // { path: 'thanku-subscriber', component: ThankuSubscriberComponent, data: { title: 'Thank You Subscriber' } },
  // { path: 'faq', component: FaqComponent, data: { title: 'FAQ' } }
  {
    path: 'contact',
    loadChildren: './contact/contact.module#ContactModule'
  },
  {
    path: 'about-us',
    loadChildren: './about/about.module#AboutModule'
  },
  {
    path: 'thanku-subscriber',
    loadChildren: './thanku-subscriber/thanku.module#ThankYouModule'
  },
  {
    path: 'faq',
    loadChildren: './faq/faq.module#FAQModule'
  },
  {
    path: 'user-agreement',
    loadChildren: './term-conditions/term.module#TermConditionModule'
  },
  {
    path: 'privacy-policy',
    loadChildren: './private-policy/privacy.module#PrivacyModule'
  },
];



@NgModule({
  declarations: [HomeComponent ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMaskModule.forRoot(),
    RouterModule.forChild(routes)
  ]
})
export class WebsiteFrontModule { }
