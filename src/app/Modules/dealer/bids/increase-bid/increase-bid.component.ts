import { Component, OnInit, Input, ViewChild, Output, EventEmitter, ElementRef } from '@angular/core';
import { TitleService, CarService, RealUpdateService, SharedService, CommonUtilsService, DealerService, NotificationService } from '../../../../core/_services';
import { untilDestroyed } from 'ngx-take-until-destroy';// unsubscribe from observables when the component destroyed
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RealtimeEndpointInfo } from 'aws-sdk/clients/machinelearning';
import { environment } from '../../../../../environments/environment'
import Swal from 'sweetalert2/dist/sweetalert2.js'

declare var $: any;
@Component({
  selector: 'app-increase-bid',
  templateUrl: './increase-bid.component.html',
  styleUrls: ['./increase-bid.component.css']
})
export class IncreaseBidComponent implements OnInit {
  @Input() isOpen: any;
  @Input() modalType: any;
  @Input() car: any;
  @ViewChild('bidModal') bidModal: ElementRef;
  @ViewChild('proxyBidModal') proxyBidModal: ElementRef;
  
  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();
  @Output() onSuccess: EventEmitter<any> = new EventEmitter<any>();
  @Output() onCancel: EventEmitter<any> = new EventEmitter<any>();
  dealerShips: any;
  legalContacts: any;
  bidForm: FormGroup;
  minBidPrice: 0;
  minPrice: 100;
  submitted:boolean = false;
  constructor(private realTimeUpdate:RealUpdateService, private formBuilder: FormBuilder, private dealerService: DealerService, private commonUtilsService: CommonUtilsService) { }

  ngOnInit() {



  // initilize bid form
    this.bidForm = this.formBuilder.group({
      car_id: [null, Validators.required],
      bid_price:[null,Validators.required],
      proxy_price: [0,Validators.required],

    });

  }

  ngOnChanges() {
    if (this.isOpen) {
      /**place bid will open the placebid modal popup
   * @param car is the car object for bid
   *will return nothing
   */


      // this.minBidPrice = this.car.totalBids == 0 ? ((75 /100)*this.car.vehicle_min_selling_price) : (this.car.higest_bid + 100);
      this.minBidPrice = this.car.placebid_price
      this.minPrice = this.minBidPrice == 0 ? 100 : this.minBidPrice
      // this.bidForm.patchValue({
      //   bid_price: this.minBidPrice,

      // })
      if(this.modalType =='proxy' ){
        this.minBidPrice = this.car.higest_bid ? (this.car.higest_bid +100) :(this.car.vehicle_finance_details.vehicle_min_selling_price  ? (75 /100)*(this.car.vehicle_finance_details.vehicle_min_selling_price) : 100);
        let vehicleMinBidPrice = this.bidForm.controls.proxy_price;
        vehicleMinBidPrice.setValidators([Validators.compose([Validators.required, Validators.min(this.minBidPrice)])]);
        vehicleMinBidPrice.updateValueAndValidity();
      $(this.proxyBidModal.nativeElement).modal({ backdrop: 'static', keyboard: false, show: true });

      }
      else
      $(this.bidModal.nativeElement).modal({ backdrop: 'static', keyboard: false, show: true });
    }
  }
/**
 * willbe invoked to close the modal popup
 */
  close(){
    this.isOpen = false
    $(this.proxyBidModal.nativeElement).modal('hide');
    this.bidForm.reset()
    let vehicleMinBidPrice = this.bidForm.controls.proxy_price;
        vehicleMinBidPrice.setValidators(null);
        vehicleMinBidPrice.updateValueAndValidity();
        this.onClose.emit(true);
  }



  /**
 * willbe invoked to close the modal popup
 */
  closeModal(){
    this.isOpen = false
    $(this.bidModal.nativeElement).modal('hide');
    this.onCancel.emit(true)
  }


/**
 * this willbe called to place bid if the dealer having one dealership 
 */
  onSubmit():void{

    let dataObject ={
      car_id:this.car._id,
      bid_price:this.minBidPrice
    }
      this.dealerService.updateBidPrice(dataObject).pipe(untilDestroyed(this)).subscribe(response => {
        this.realTimeUpdate.updateRealTimeData();
        this.commonUtilsService.onSuccess(environment.MESSAGES.BID_SUCCESS);
        this.submitted = false;
        this.onSuccess.emit(true)
        $(this.bidModal.nativeElement).modal('hide');
      }, error => {
        this.submitted = false;
        this.commonUtilsService.onError(error);
      })
  }
  /**
   * this willbe called to place proxy bid
   */
  onSubmitProxyBid():void{
    this.bidForm.patchValue({
      car_id:this.car._id,
      bid_price:this.minBidPrice
    })
    this.submitted = true;
    if(this.bidForm.valid){

    this.dealerService.updateBidProxyPrice(this.bidForm.value).pipe(untilDestroyed(this)).subscribe(response => {
      this.realTimeUpdate.updateRealTimeData();
      this.commonUtilsService.onSuccess(environment.MESSAGES.BID_SUCCESS);
      this.submitted = false;
      this.bidForm.reset()
      this.onSuccess.emit(true)
      $(this.proxyBidModal.nativeElement).modal('hide');
    }, error => {
      this.submitted = false;
      this.commonUtilsService.onError(error);
    })
  }

  }

 
ngOnDestroy() {

}
}
