import { Component, ViewChild, OnInit, AfterViewInit, ViewEncapsulation, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from "@angular/router";
import { untilDestroyed } from 'ngx-take-until-destroy';// unsubscribe from observables when the  component destroyed
import { Subject } from 'rxjs/Rx';
import {Location} from '@angular/common';
//import services
//modules core services
import { RealUpdateService, CommonUtilsService, DealerService, NotificationService } from '../../../core/_services';
//import models
import { PagedData, Car, Page } from "../../../core/_models";
import { environment } from '../../../../environments/environment'
declare let $: any;
import * as _ from 'lodash';

@Component({
  selector: 'app-dispute-detail',
  templateUrl: './dispute-detail.component.html',
  styleUrls: ['./dispute-detail.component.css']
})
export class DisputeDetailComponent implements OnInit {
  disputeDetail: any;
  ckeditorContent: any
  messageForm: FormGroup;
  messages: any = [];
  submitted:boolean = false;
  public showPreview: boolean = false;
  public initialContentOne: string = "";
  public initialContentTwo: string = "";
  public contentOne: string;
  public contentTwo: string;
  public update$: Subject<any> = new Subject();
  public options1: any = {
    autogrow: true,
    removeformatPasted: true,
    semantic: false,
    btns: [['bold', 'italic'], ['link'], ['foreColor', 'backColor'], ['preformatted']],

  };


  //title and breadcrumbs
  readonly title: string = 'Dispute Detail';
  readonly breadcrumbs: any[] = [{ page: 'Home', link: '/dealer/home' }, { page: "Dispute Listing", link: '/dealer/disputes' }, { page: " Dispute Detail", link: '' }]

  constructor(private _location :Location,private commonUtilService: CommonUtilsService, private dealerService: DealerService, private activatedRoute: ActivatedRoute, private fb: FormBuilder) {

    //Initial content update.
    setTimeout(() => {
      this.initialContentOne = ""
      this.update$.next(); // this is needed only when you use ChangeDetectionStrategy.OnPush strategy
    }, 2000);

  }

  ngOnInit() {

    this.messageForm = this.fb.group({
      disputeId: [null, Validators.required],
      message: [null, Validators.required]
    })

    this.getDisputeDetail();
  }

  getDisputeDetail(){
    this.dealerService.getDisputeDetail({ _id: this.activatedRoute.snapshot.params.id }).pipe(untilDestroyed(this)).subscribe(response => {
      this.disputeDetail = response;//response is the dispute detail
      this.messages = this.disputeDetail.messages;
      this.messageForm.patchValue({
        disputeId: response._id
      })
    })
  }

/**
 * the dispute message willbe save in db send to admin
 */
  sendMessage():void {


    if (!$('.trumbowyg-editor').trumbowyg('html')){
      this.commonUtilService.onError(environment.MESSAGES.MESSAGE_EMPTY);
      return
    }
    if(this.submitted)
    return;
     this.submitted = true;
    let message = {
      is_read: false,
      is_admin: false,
      message: $('.trumbowyg-editor').trumbowyg('html')
    }
    //single message object need to saved 

    this.messages.push(message) // all the messages
    let obj = {
      disputeId: this.messageForm.controls.disputeId.value,
      messages: this.messages
    }
    $('.trumbowyg-editor').trumbowyg('html', "");
    this.dealerService.saveDisputeMessage(obj).subscribe(response => {
      this.commonUtilService.onSuccess(environment.MESSAGES.DISPUTE_MESSAGE_SUCCESS);
      this.messageForm.patchValue({
        message: ''
      })
      this.submitted =false;
      this.getDisputeDetail()
    },
      error => {
        this.submitted= false;
        this.commonUtilService.onError(error);
      })
  }


  goBack(){
    this._location.back();
  }
  ngOnDestroy() {

  }
}
