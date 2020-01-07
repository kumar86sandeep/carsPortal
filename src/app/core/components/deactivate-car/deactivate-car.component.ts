import { Component, OnInit ,Input,ViewChild,ElementRef,EventEmitter,Output} from '@angular/core';
import {FormGroup, FormBuilder,Validators} from '@angular/forms';
declare let $: any;
import {environment} from '../../../../environments/environment'
import {CommonUtilsService} from '../../_services/common-utils.service';
@Component({
  selector: 'app-deactivate-car',
  templateUrl: './deactivate-car.component.html',
  styleUrls: ['./deactivate-car.component.css']
})
export class DeactivateCarComponent implements OnInit {
  deactivateReason:any ='';
  @Input() isModalOpen: any;
  @ViewChild('deactivateModal') deactivateModal :ElementRef;
  @Output() onCloseModal: EventEmitter<any> = new EventEmitter<any>();
  @Output() onSubmit: EventEmitter<any> = new EventEmitter<any>();
  submitted:boolean = false;
  constructor(private commonUtilsService :CommonUtilsService) { }

  ngOnInit() {

   
  }
/**
  * component life cycle default method, runs when input value named 'isOpen' gets change
  * @return void
  */
 
 ngOnChanges():void{

  //to show the modal popup
  if(this.isModalOpen) {
    $(this.deactivateModal.nativeElement).modal({backdrop: 'static', keyboard: false, show: true}); 
  }
}


submit(){
  this.isModalOpen = false;
  if(this.deactivateReason.length < 1){
    this.commonUtilsService.onError(environment.MESSAGES.REASON_REQUIRED);
    return
  }
  if(this.deactivateReason.length < 20){
    this.commonUtilsService.onError(environment.MESSAGES.CANCEL_REASON_LENGTH)
    return
  }

  this.onSubmit.emit(this.deactivateReason)
  this.deactivateReason = ''
  $(this.deactivateModal.nativeElement).modal('hide');
 
}

  /**
  * function to close the popup and emit response to onClose event
  * @return void
  */
 cancelSubmit() {
  this.isModalOpen = false;
  this.onCloseModal.emit(false);   
  $(this.deactivateModal.nativeElement).modal('hide') 
}
}
