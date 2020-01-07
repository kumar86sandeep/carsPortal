import { Component, SimpleChanges, OnInit, Output, EventEmitter, ViewChild, Input,  ElementRef } from '@angular/core';
import { CommonUtilsService, CarService  } from '../../../../core/_services'
import { IPayPalConfig, ICreateOrderRequest } from 'ngx-paypal';
import { environment } from '../../../../../environments/environment'
declare let $: any;

@Component({
  selector: 'app-car-payments-popup',
  templateUrl: './car-payments-popup.component.html',
  styleUrls: ['./car-payments-popup.component.css']
})
export class CarPaymentsPopupComponent implements OnInit {

  
  @Input() isOpen: any;
  @Input() selectedCarDetails: any;
  @ViewChild('contentSection') contentSection :ElementRef;
  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();
  @Output() showInvoicePopup: EventEmitter<any> = new EventEmitter<any>();
  public payPalConfig?: IPayPalConfig;
  constructor(private carService: CarService, private commonUtilsService:CommonUtilsService) { }

  ngOnInit() {
    this.initConfig();
     
  }

  /**
  * component life cycle default method, runs when input value named 'isOpen' gets change
  * @return void
  */
 
  ngOnChanges():void{
    //console.log('selectedCarDetails',this.selectedCarDetails);
    //console.log('price', this.selectedCarDetails.my_bid[0].price)
    //to show the modal popup
    if(this.isOpen) {
      $(this.contentSection.nativeElement).modal({backdrop: 'static', keyboard: false, show: true}); 
    }
  }

  private initConfig(): void {
    this.payPalConfig = {
      currency: 'USD',
      clientId: environment.PAYPAL_CLIENT_ID,
      createOrderOnClient: (data) => <ICreateOrderRequest>{
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: this.selectedCarDetails.my_bid.bid_price,
              breakdown: {
                item_total: {
                  currency_code: 'USD',
                  value: this.selectedCarDetails.my_bid.bid_price,
                }
              }
            },
            items: [
              {
                name: this.selectedCarDetails.vin,
                quantity: '1',
                category: 'DIGITAL_GOODS',
                unit_amount: {
                  currency_code: 'USD',
                  value: this.selectedCarDetails.my_bid.bid_price,
                },
              }
            ]
          }
        ]
      },
      advanced: {
        commit: 'true'
      },
      style: {
        label: 'paypal',
        layout: 'vertical'
      },
      onApprove: (data, actions) => {
        this.commonUtilsService.showPageLoader(environment.MESSAGES.PAYMENT_SUCCESS);
        //console.log('onApprove - transaction was approved, but not authorized', data, actions);
        actions.order.get().then(details => {
          //console.log('onApprove - you can get full order details inside onApprove: ', details);
        });
      },
      onClientAuthorization: (data) => {
        //console.log('onClientAuthorization - you should probably inform your server about completed transaction at this point', data);

        
        
        const transactionData = {car_id: this.selectedCarDetails._id, seller_id:this.selectedCarDetails.seller_id, dealer_id:localStorage.getItem('loggedinUserId'), 

        payer:{ email_address:  data.payer.email_address, payer_id:  data.payer.payer_id }, 

        payee:{ email_address:  data['purchase_units'][0].payee.email_address, merchant_id:  data['purchase_units'][0].payee.merchant_id }, 
        
        vin_number:  data['purchase_units'][0].items[0].name, transaction_id: data.id, transaction_amount: data['purchase_units'][0].amount.value, transaction_status: data.status, fee_status: 'paid', type: 'sold'};


        // Update Car Status

         this.carService.onTransctionComplete(transactionData).subscribe(response => {   

            const transactionDetails = {car_details: this.selectedCarDetails, transaction_details:data}

            this.onClose.next(false); 

            this.showInvoicePopup.next(transactionDetails);

            $(this.contentSection.nativeElement).modal('hide'); // Close the current popup

            //console.log('response',response)

          },
          error => {
            $(this.contentSection.nativeElement).modal('hide'); // Close the current popup
            this.commonUtilsService.onError(environment.MESSAGES.PAYMENT_FAILED);

          });

       
      },
      onCancel: (data, actions) => {
        this.close();
        //console.log('OnCancel', data, actions);
        $(this.contentSection.nativeElement).modal('hide'); // Close the current popup
        //this.commonUtilsService.onError(environment.MESSAGES.PAYMENT_FAILED);
      },
      onError: err => {
        this.close();
        //console.log('OnError', err);
        $(this.contentSection.nativeElement).modal('hide'); // Close the current popup
        this.commonUtilsService.onError(environment.MESSAGES.PAYMENT_FAILED);
      },
      onClick: (data, actions) => {
        //console.log('onClick', data, actions);
      },
    };
  }

  

  /**
  * function to close the popup and emit response to onClose event
  * @return void
  */
  close() {
    this.isOpen = false
    this.onClose.emit(false);    
  }


}
