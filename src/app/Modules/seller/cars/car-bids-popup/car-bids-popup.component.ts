import { Component, SimpleChanges, OnInit, Output, EventEmitter, ViewChild, Input, ElementRef } from '@angular/core';
//import Service 
import { CommonUtilsService, CarService, SellerService } from '../../../../core/_services'

//import models
import { Bid } from "../../../../core/_models";
import Swal from 'sweetalert2'
import { environment } from 'src/environments/environment';
import { retry } from 'rxjs/operators';
import { bool } from 'aws-sdk/clients/signer';
declare let $: any;
@Component({
  selector: 'app-car-bids-popup',
  templateUrl: './car-bids-popup.component.html',
  styleUrls: ['./car-bids-popup.component.css']
})
export class CarBidsPopupComponent {

  @Input() isOpen: any;
  @Input() carId: any;
  @ViewChild('contentSection') contentSection: ElementRef;
  @ViewChild('rejectBidModal') rejectBidModal: ElementRef;
  @ViewChild('nopaymentmethod') nopaymentmethod :ElementRef;
  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();
  @Output() onAccept: EventEmitter<any> = new EventEmitter<any>();
  @Output() onReject: EventEmitter<any> = new EventEmitter<any>();
  bidId: any;
  acceptedBid:any;
  bids: any;
  isPaymentMethodModal:boolean =false;
  rejectionReason: any = '';
  constructor(private sellerService: SellerService, private carService: CarService, private commonUtilsService: CommonUtilsService) {


    // this.realTimeUpdate.updateLsiting().subscribe(res => {
    //   this.loadRealTimeLsiting() // this willbe called after real time updation of listing
    // })

  }

  /**
  * component life cycle default method, runs when input value named 'isOpen' gets change
  * @return void
  */

  ngOnChanges(): void {
    console.log('chanhge', this.isOpen);
    //to show the modal popup
    if (this.isOpen) {
      this.commonUtilsService.showPageLoader();
      this.carService.listingCarBids({ id: this.carId._id }).subscribe(pagedData => {

        this.bids = pagedData;
        this.commonUtilsService.hidePageLoader();
        console.log('bids', this.bids)
      },
        error => {
          this.commonUtilsService.onError(error);
        });
      console.log('here i am')
      $(this.contentSection.nativeElement).modal({ backdrop: 'static', keyboard: false, show: true });
    }
  }

  /**
  * function to close the popup and emit response to onClose event
  * @return void
  */
  close() {
    this.isOpen = false

    this.onClose.emit(false);
  }



  /**
    * reject bid will be invoked on accepting the bid
    * @param bidId is the bid id 
    */
  rejectBid(bidId: any): void {

    this.bidId = bidId;
    this.rejectionReason = '';
    $(this.rejectBidModal.nativeElement).modal('show');
  };


  /**
   * hide rejection popup
   */

  cancelRejection() {
    $(this.rejectBidModal.nativeElement).modal('hide');
  }

  /**
   * will invoke when you confirm that accept the bid
   */
  public submitRejection(): void {

    let obj = {
      bidId: this.bidId,
      carId: this.carId,
      reason: this.rejectionReason
    };
    if (this.rejectionReason.length < 1) {
      this.commonUtilsService.onError(environment.MESSAGES.REASON_REQUIRED);
      return
    }
    if (this.rejectionReason.length < 20) {
      this.commonUtilsService.onError(environment.MESSAGES.REJECTION_REASON_LENGTH)
      return
    }

    this.sellerService.rejectBid(obj).subscribe(response => {
      // console.log('');

      this.commonUtilsService.onSuccess(environment.MESSAGES.BID_REJECTED)
      // this.setPage(this._defaultPagination);
      this.isOpen = false;
      $(this.rejectBidModal.nativeElement).modal('hide');
      $(this.contentSection.nativeElement).modal('hide');
      this.onReject.emit(true);
    }, error => {
      this.commonUtilsService.onError(error)
    })
  }


  /**
    * accept bid will be invoked on accepting the bid
    * @param bidId is the bid id 
    */
  acceptBid(bid: any): void {
    // console.log('the bid id is', bidId);
    this.bidId = bid._id;
    this.acceptedBid = bid;
    console.log('the car is',this.carId)
    //check weather the seller has a added payment method or not
    this.sellerService.checkSellerPaymentMethod({}).subscribe((seller:any) => {
  
      if(!seller.payment_details.length){
        $(this.nopaymentmethod.nativeElement).modal({backdrop: 'static', keyboard: false, show: true}); 
      }
       else{
        Swal.fire({
          title: '$5 service fee will be deducted from your account to accept the bid. ',
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, Continue',
          cancelButtonText: 'Cancel'
        }).then((result) => {
          if (result.value) {
           let reqObj={
            //  seller_id
             dealer_id:bid.dealer[0]._id,
             vin_number:this.carId.vin,
             car_id:this.carId._id,
             car_price : bid.bid_price
           }
           this.sellerService.chargeServiceFee(reqObj).subscribe(response=>{
               this.submitBid();
           },
           error=>{
             this.commonUtilsService.onError(error);
           })
    
    
    
          }
        })
      }


    })
    


  };
/**
 * 
 * @param event the value return from canceling modal
 */

  cancelPaymentAdd():void{
    $(this.nopaymentmethod.nativeElement).modal('hide') ;
    $(this.contentSection.nativeElement).modal('hide');
  }
  

  /**
   * will invoke when you confirm that accept the bid
   */
  private submitBid(): void {
    let obj = {
      bidId: this.bidId,
      carId: this.carId
    };
    this.sellerService.acceptBid(obj).subscribe(response => {
      // console.log('');

      this.commonUtilsService.onSuccess(environment.MESSAGES.BID_ACCEPTED)
      // this.setPage(this._defaultPagination);
      this.isOpen = false;
      $(this.contentSection.nativeElement).modal('hide')
      this.onAccept.emit(this.acceptedBid.dealer[0]._id);
    }, error => {
      this.commonUtilsService.onError(error)
    })
  }
}
