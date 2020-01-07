
import { Component, OnInit ,Input,ViewChild,ElementRef,EventEmitter,Output} from '@angular/core';
declare let $: any;
@Component({
  selector: 'app-membership',
  templateUrl: './membership.component.html',
  styleUrls: ['./membership.component.css']
})
export class MembershipComponent implements OnInit {
  @Input() isModalOpen: any;
  @ViewChild('membershipexpmodal') membershipexpmodal :ElementRef;
  @Output() onCloseModal: EventEmitter<any> = new EventEmitter<any>();
  @Output() onSubmit: EventEmitter<any> = new EventEmitter<any>();
  submitted:boolean = false;
  constructor() { }

  ngOnInit() {


  }
/**
  * component life cycle default method, runs when input value named 'isOpen' gets change
  * @return void
  */
 
 ngOnChanges():void{

  //to show the modal popup
  if(this.isModalOpen) {
    $(this.membershipexpmodal.nativeElement).modal({backdrop: 'static', keyboard: false, show: true}); 
  }
}


  /**
  * function to close the popup and emit response to onClose event
  * @return void
  */
 cancelsubmitSearch() {
  this.isModalOpen = false;
 
  this.onCloseModal.emit(false);   
  $(this.membershipexpmodal.nativeElement).modal('hide') 
}

hidePopup(){
  this.isModalOpen = false;
  $(this.membershipexpmodal.nativeElement).modal('hide') 
}


//
}
