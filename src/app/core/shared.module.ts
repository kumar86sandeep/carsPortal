import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrModule } from 'ng6-toastr-notifications';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {LoadingComponent} from './_loaders/common.loader';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { RatingReviewComponent } from './components/rating-review/rating-review.component';
import { FormValidationErrorsComponent } from './components/form-validation-errors/form-validation-errors.component';
import { RoundPipe } from './_pipes/round.pipe';
import { SortByPipe } from './_pipes/sortby.pipe';
import { SearchNameComponent } from './components/search-name/search-name.component';
import { SafePipe } from './_pipes/safe.pipe';
import { TimmerComponent } from './components/timmer/timmer.component';
import { MembershipComponent } from './components/membership/membership.component';
import { DeactivateCarComponent } from './components/deactivate-car/deactivate-car.component';
import {CreateDisputeComponent} from './components/create-dispute/create-dispute.component';
import {TrumbowygModule} from 'ng2-lazy-trumbowyg';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,  
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        ToastrModule.forRoot()  ,
        TrumbowygModule.forRoot({plugins: ['colors', 'noembed', 'preformatted', 'pasteimage', 'upload'], version: '2.8.0'}), //Optional config : plug-ins and version

    ],
    declarations: [
        BreadcrumbsComponent,
        RatingReviewComponent,
        LoadingComponent,
        FormValidationErrorsComponent,
        RoundPipe,
        SortByPipe,
        SearchNameComponent,
        SafePipe,
        TimmerComponent,
        MembershipComponent,
        DeactivateCarComponent,
        CreateDisputeComponent,
     
    ],
    exports: [
        BreadcrumbsComponent,
        RatingReviewComponent,
        FormValidationErrorsComponent,
        RoundPipe,
        SortByPipe,
        LoadingComponent,
        SearchNameComponent,
        SafePipe,CreateDisputeComponent,
        LoadingComponent,TimmerComponent,MembershipComponent,DeactivateCarComponent
    ]
})
export class SharedModule { }