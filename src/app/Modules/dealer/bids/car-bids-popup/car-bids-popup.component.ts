import { Component, OnInit, Output, EventEmitter, ViewChild, Input,  ElementRef } from '@angular/core';
//import Service 
import { CommonUtilsService, CarService  } from '../../../../core/_services'

import { untilDestroyed } from 'ngx-take-until-destroy';
import { environment } from 'src/environments/environment';
declare let $: any;

@Component({
  selector: 'app-car-bids-popup',
  templateUrl: './car-bids-popup.component.html',
  styleUrls: ['./car-bids-popup.component.css']
})
export class CarBidsPopupComponent {

  @Input() isOpen: any;
  @Input() carId: any;
  @ViewChild('contentSection') contentSection :ElementRef;
  @ViewChild('cancelBidModal') cancelBidModal :ElementRef;
  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();
  @Output() onCalcel: EventEmitter<any> = new EventEmitter<any>();
  
  delalerId:any ;
  cancelReason:string ='';
  bidId:any;  
  bids:any;
  constructor(private carService: CarService, private commonUtilsService:CommonUtilsService) { }

  ngOnInit(){

  }

  /**
  * component life cycle default method, runs when input value named 'isOpen' gets change
  * @return void
  */
 
  ngOnChanges():void{
    
    this.delalerId = localStorage.getItem('loggedinUserId');   
    //to show the modal popup
    if(this.isOpen) {
      this.commonUtilsService.showPageLoader();
      this.carService.listingCarBids({ id:this.carId }).pipe(untilDestroyed(this)).subscribe(pagedData => {
    
        this.bids = pagedData;  
        this.commonUtilsService.hidePageLoader();
      },
      error => {
        this.commonUtilsService.onError(error);
      });

      $(this.contentSection.nativeElement).modal({backdrop: 'static', keyboard: false, show: true}); 
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
 * cancel bid only for delaer
 */
  cancelBid(bidId:any){
    this.bidId = bidId;
    $(this.cancelBidModal.nativeElement).modal('show');    
  }

  cancel(){
    $(this.cancelBidModal.nativeElement).modal('hide');
    this.cancelReason = ''
  }

  submitCancelation(){


    if(this.cancelReason.length < 1){
      this.commonUtilsService.onError(environment.MESSAGES.REASON_REQUIRED);
      return
    }
    if(this.cancelReason.length < 20){
      this.commonUtilsService.onError(environment.MESSAGES.CANCEL_REASON_LENGTH)
      return
    }
    this.carService.cancelBid({bidId:this.bidId,reason:this.cancelReason}).pipe(untilDestroyed(this)).subscribe(res=>{
      this.commonUtilsService.onSuccess(environment.MESSAGES.BID_CANCEL);

      this.isOpen = false;
      this.cancelReason = '';
      $(this.cancelBidModal.nativeElement).modal('hide');
      $(this.contentSection.nativeElement).modal('hide')
      this.onCalcel.emit(true);

  },error=>{
    this.commonUtilsService.onError(error);
  })

}

enter(i){
  $('#raingId_'+i).css('display','block');
}

leave(i){
  $('#raingId_'+i).css('display','none');
}

// This method must be present, even if empty.
ngOnDestroy() {
  // To protect you, we'll throw an error if it doesn't exist.
}
  
}
