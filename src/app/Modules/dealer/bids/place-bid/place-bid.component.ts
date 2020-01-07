import { Component, OnInit, Input, ViewChild, Output, EventEmitter, ElementRef } from '@angular/core';
import { TitleService, CarService, RealUpdateService, SharedService, CommonUtilsService, DealerService, NotificationService } from '../../../../core/_services';
import { untilDestroyed } from 'ngx-take-until-destroy';// unsubscribe from observables when the component destroyed
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RealtimeEndpointInfo } from 'aws-sdk/clients/machinelearning';
import { environment } from '../../../../../environments/environment'

declare var $: any;
import Swal from 'sweetalert2/dist/sweetalert2.js'
@Component({
  selector: 'app-place-bid',
  templateUrl: './place-bid.component.html',
  styleUrls: ['./place-bid.component.css']
})
export class PlaceBidComponent implements OnInit {
  @Input() isOpen: any;
  @Input() car: any;
  @ViewChild('bidModal') bidModal: ElementRef;
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



    this.bidForm = this.formBuilder.group({
      car_id: [null, Validators.required],
      dealership_id: ['', [Validators.required]],
      legal_contact: ['', [Validators.required]],
      bid_price: [0],
      proxy_price: [0]

    });

  }

  ngOnChanges() {
    if (this.isOpen) {
      /**place bid will open the placebid modal popup
   * @param car is the car object for bid
   *will return nothing
   */

      let minCondPrice = this.car.higest_bid ? (this.car.higest_bid +100) :(this.car.vehicle_finance_details.vehicle_min_selling_price  ? (75 /100)*(this.car.vehicle_finance_details.vehicle_min_selling_price) : 100);//this is actual minimum price needed
      // this.minBidPrice = this.car.totalBids == 0 ? ((75 /100)*this.car.vehicle_min_selling_price) : (this.car.higest_bid + 100);
      this.minBidPrice = this.car.placebid_price;
       if(minCondPrice > this.minBidPrice){
        this.minBidPrice = minCondPrice;
       }
      this.minPrice = this.minBidPrice == 0 ? 100 : this.minBidPrice
      // this.minProxyBidPrice = car.totalBids == 0 ? car.vehicle_min_selling_price : car.higest_bid;
      this.bidForm.patchValue({
        bid_price: this.minBidPrice,
        proxy_price: 0

      })
      this.bidForm.controls.proxy_price.setValidators(null);
      this.bidForm.controls.proxy_price.updateValueAndValidity()


      let vehicleMinBidPrice = this.bidForm.controls.bid_price;
      vehicleMinBidPrice.setValidators([Validators.compose([Validators.required, Validators.min(this.minPrice)])]);
      vehicleMinBidPrice.updateValueAndValidity();

      this.getAllDealShips();
      // this.car = car;
      this.bidForm.patchValue({
        car_id: this.car._id,
        price: this.car.vehicle_finance_details.vehicle_min_bid_price
      })
      $(this.bidModal.nativeElement).modal({ backdrop: 'static', keyboard: false, show: true });
    }
  }

  /**
   * get all dealer ships
   */



  getAllDealShips():void {
    this.dealerShips = [];
    this.legalContacts= []
    this.dealerService.getAllDealShips().pipe(untilDestroyed(this)).subscribe(response => {
         let dealerObject = {
          _id:'',
          legalcoroporationname:'Select the dealership',
          legal_contacts:[]

         }
         if(response.length > 1){
           console.log('hi iam inside')
          this.dealerShips.push(dealerObject);
          response.forEach(element => {
            this.dealerShips.push(element)
          });
         } else{
          this.dealerShips = response;
         }
     

         //assign the legal contact 
         let legalContact ={
             name  :'Assign a Legal Contact',
             value:''
        }
         if(this.dealerShips[0].legal_contacts.length > 1){
          console.log('hi iam inside')

        
             this.legalContacts.push(legalContact);
             this.dealerShips[0].legal_contacts.forEach(element => {
                 
                  let legalCon ={
                    name  :element.name.first_name + ' '+element.name.last_name,
                      value:element.name.first_name + ' '+element.name.last_name
                    }
                    this.legalContacts.push(legalCon);

                });
              } else if(this.dealerShips[0].legal_contacts.length == 1){
                this.dealerShips[0].legal_contacts.forEach(element => {
                 
                  let legalCon ={
                    name  :element.name.first_name + ' '+element.name.last_name,
                    value:element.name.first_name + ' '+element.name.last_name
                  
                    }
                    this.legalContacts.push(legalCon);

                });
              } else{
                this.legalContacts.push(legalContact);
              }

              console.log('the legal contact is ',this.legalContacts)
      // this.legalContacts = this.dealerShips[0].legal_contacts;
    }, error => {
      this.commonUtilsService.onError(error);
    })

  }

 /**after selecting the store assign legal contacts to legal contact array
   * @params value is the target value after selecting the dealership
   * return void
   */
  selectStore(value: any): void {
    this.legalContacts = []
    let legalContact ={
      name  :'Assign a Legal Contact',
      value:""
 }

    if(value == ""){
      this.legalContacts.push(legalContact);
      console.log('the legal conats are',this.legalContacts)
      return
    }
    console.log('hi iam inside')
    let pos = this.dealerShips.map(e => e._id).indexOf(value);

  
    if(this.dealerShips[pos].legal_contacts.length > 1){
    

    
         this.legalContacts.push(legalContact);
         this.dealerShips[pos].legal_contacts.forEach(element => {
                 console.log('the name is',element)
              let legalCon ={
                name  :element.name.first_name + ' '+element.name.last_name,
                  value:element.name.first_name + ' '+element.name.last_name
                }
                this.legalContacts.push(legalCon);

            });
            console.log('the dealers legal contac',this.legalContacts)
          } else if(this.dealerShips[pos].legal_contacts.length == 1){
            this.dealerShips[pos].legal_contacts.forEach(element => {
             
              let legalCon ={
                name  :element.name.first_name + ' '+element.name.last_name,
                value:element.name.first_name + ' '+element.name.last_name
              
                }
                this.legalContacts.push(legalCon);

            });
          }
          else{
            this.legalContacts.push(legalContact);
          }

     let self = this;
        setTimeout(function(){
          if($('#lega').val()){
            self.bidForm.patchValue({
              legal_contact:$('#lega').val()
            })
          } else{
            self.bidForm.patchValue({
              legal_contact:''
            })
          }
        },500)  
          
  }
  /**
* function to close the popup and emit response to onClose event
* @return void
*/
  close():void {
    this.isOpen = false
    $(this.bidModal.nativeElement).modal('hide')
    this.onClose.emit(false);
    
  }

  chnageProxyPrice() :void{
    let vehicleMinBidPrice = this.bidForm.controls.proxy_price;
    if (this.bidForm.controls.proxy_price.value > 0) {

      vehicleMinBidPrice.setValidators([Validators.compose([Validators.required, Validators.min(this.bidForm.controls.bid_price.value)])]);

    } else {
      vehicleMinBidPrice.setValidators(null);

    }
    vehicleMinBidPrice.updateValueAndValidity();
  }


  selectLegalContact(value):void{
    if($('#lega').val()){
      this.bidForm.patchValue({
        legal_contact:$('#lega').val()
      })
    
  }
  }

  onSubmit() :void{
    this.submitted = true;
  if($('#selectStore').val()){
    this.bidForm.patchValue({
      dealership_id:$('#selectStore').val()
    })
  }
  if($('#lega').val()){
    this.bidForm.patchValue({
      legal_contact:$('#lega').val()
    })
  }

  // if(!$('#selectStore').val()){
  //   this.bidForm.controls.legal_contact.setValidators([Validators.compose([Validators.required])]);
  //   this.bidForm.controls.legal_contact.updateValueAndValidity()
  // }

  if (this.bidForm.invalid) return;

   //console.log('the valu eis '+this.car.vehicle_finance_details.vehicle_min_bid_price  +'asdas'+this.bidForm.controls.price.value)

   if(this.car.vehicle_finance_details.vehicle_min_bid_price >this.bidForm.controls.bid_price.value){
    this.commonUtilsService.onError('Your bid amount is less then the minimum bid acceptance amount set by the seller. Please try again with higher bid.') 
    return
   }
  this.confirmBid();

}

/**
 * 
 * place bid confirmation
 */

private confirmBid(): void {
  Swal.fire({
    title: 'Confirm your Bid?',
    type: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.value) {
      // if (Object.keys(this.car.my_bid).length > 0) {
      //    this.updateBid();//update bid if the dealer is loosing the bid
      // } else {
        this.saveBid();//create bid 
      // }



    }
  })

}
/**
 * to save the bid first time in the db
 */
private saveBid() :void{
  this.dealerService.placeBid(this.bidForm.value).pipe(untilDestroyed(this)).subscribe(response => {
    this.commonUtilsService.onSuccess(environment.MESSAGES.BID_SUCCESS);
    this.realTimeUpdate.updateRealTimeData();
    this.bidForm.reset();
    this.submitted = false;

    $(this.bidModal.nativeElement).modal('hide');
    this.onSuccess.emit(true)
  }, error => {
    this.submitted = false;
    this.commonUtilsService.onError(error);
  })
}

/**
 * update the bid if the dealer has already placed a bid
 */
private updateBid() {
  this.dealerService.updateBid(this.bidForm.value).pipe(untilDestroyed(this)).subscribe(response => {
    this.realTimeUpdate.updateRealTimeData();
    this.commonUtilsService.onSuccess(environment.MESSAGES.BID_SUCCESS);
    this.bidForm.reset();
    this.submitted = false;
    this.onSuccess.emit(true)
    $(this.bidModal.nativeElement).modal('hide');
  }, error => {
    this.submitted = false;
    this.commonUtilsService.onError(error);
  })
}


  ngOnDestroy() {

  }
}
