import { Component, OnInit ,Input,ViewChild,Output,ElementRef,EventEmitter} from '@angular/core';
declare let $: any;
@Component({
  selector: 'app-payment-method-alert',
  templateUrl: './payment-method-alert.component.html',
  styleUrls: ['./payment-method-alert.component.css']
})

export class PaymentMethodAlertComponent implements OnInit {
  @Input() isModalOpen: any;
  @ViewChild('nopaymentmethod') nopaymentmethod :ElementRef;
  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();
  // @Output() onSubmit: EventEmitter<any> = new EventEmitter<any>();
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
    $(this.nopaymentmethod.nativeElement).modal({backdrop: 'static', keyboard: false, show: true}); 
  }

}
  cancelPaymentAdd(){
    this.isModalOpen = false;
   this.onClose.emit(false);   
   $(this.nopaymentmethod.nativeElement).modal('hide') 
  }

}
