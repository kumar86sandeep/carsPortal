import { Component, SimpleChanges, OnInit, Output, EventEmitter, ViewChild, Input,  ElementRef } from '@angular/core';
import { CommonUtilsService, CarService  } from '../../../../core/_services'

declare let $: any;

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css']
})
export class InvoiceComponent implements OnInit {
  
  @Input() isInvoiceOpen: any;
  @ViewChild('invoiceSection') invoiceSection :ElementRef;
  @Input() transactionDetails: any;
  @Output() onInvoiceClose: EventEmitter<any> = new EventEmitter<any>();
  @Output() refreshTransactions: EventEmitter<any> = new EventEmitter<any>();
  constructor(private carService: CarService, private commonUtilsService:CommonUtilsService) { }

  /**
  * component life cycle default method, runs when input value named 'isOpen' gets change
  * @return void
  */
 
 ngOnChanges():void{
    //to show the modal popup
    if(this.isInvoiceOpen) {

      //console.log(this.transactionDetails)
      this.commonUtilsService.hidePageLoader();

      $(this.invoiceSection.nativeElement).modal({backdrop: 'static', keyboard: false, show: true}); 

    }
  }

  /**
  * function to close the popup and emit response to onClose event
  * @return void
  */
  close() {
    this.isInvoiceOpen = false
    this.onInvoiceClose.emit(false);    
  }

  reloadTransactions(type):void{
    this.refreshTransactions.next(type);
  }


  ngOnInit() {
   
   // $(this.invoiceSection.nativeElement).modal({backdrop: 'static', keyboard: false, show: true});
  }

}
