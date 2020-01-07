import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery';
import {Location} from '@angular/common';
import { environment } from '../../../../../environments/environment'
//modules services, models and enviornment file
import { TitleService, CarService, CommonUtilsService ,DealerService} from '../../../../core/_services'
import { untilDestroyed } from 'ngx-take-until-destroy';// unsubscribe from observables when the component destroyed
declare let $: any;
import Swal from 'sweetalert2/dist/sweetalert2.js'
declare let POTENZA: any;
import * as _ from 'lodash';

@Component({
  selector: 'app-car-detail-page',
  templateUrl: './car-detail-page.component.html',
  styleUrls: ['./car-detail-page.component.css']
})
export class CarDetailPageComponent implements OnInit {
  sliderOptions: NgxGalleryOptions[];
  sliderImages: NgxGalleryImage[];
  isMemberShipModelOpen:boolean = false;
  isPlaceBidModalOpen:boolean =false;//this is for opening shortcut bid modal and proxybid
  carDetail: any;
  dealerShips:any = [];
  isImageFilterEnable:Boolean = false
  isCategoryHaveThumbnail:boolean=true
  selectedCategories: any= [] 
  isOpen:boolean=false;
  isBidModalOpen:boolean = false;//this is for opening bid modal with multiple dealerships
  modalType:string;
  //title and breadcrumbs
  title: string = 'Car Detail';
  breadcrumbs: any[] = [{ page: 'Home', link: '' }, { page: "Car Listing", link: '/dealer/car-listing' }, { page: 'Car Detail', link: '' }]

  constructor(private dealerService :DealerService, private _location:Location, private activatedRoute: ActivatedRoute, private carService: CarService, private commonUtilsService: CommonUtilsService, private titleService:TitleService) {
    //console.log('page',this.page);
    //setting the page title
    this.titleService.setTitle();
    this.commonUtilsService.showPageLoader();  

    //checking the type to change breadcrumbs
    if ('type' in this.activatedRoute.snapshot.params) {
      this.breadcrumbs = [{ page: 'Home', link: '' }, { page: "Dealer Dashboard", link: '/dealer/dashboard' }, { page: 'Car Detail', link: '' }]
    }    
    
  }



  ngOnInit() {
    this.getAllDealShips();
    POTENZA.tabs();
    POTENZA.carousel();  
    this.sliderinit();
    this.getCarDetails(this.activatedRoute.snapshot.params._id);

 
 
  } 

  getCarDetails(id){
 //hit api to fetch data
 this.carService.dealerCarDetail({ id: id }).pipe(untilDestroyed(this)).subscribe(

  //case success
  (response) => {
    this.carDetail = response;
    
    this.carDetail['placebid_price'] =  response.higest_bid ? (response.higest_bid +100) :(response.vehicle_finance_details.vehicle_min_selling_price  ?(75 /100)*(response.vehicle_finance_details.vehicle_min_selling_price) : 100); 
    this.carDetail.car_images.forEach(element => {
      this.pushElement(element);
    });
    this.commonUtilsService.hidePageLoader();
   
    //case error 
  }, error => {
    this.commonUtilsService.onError(error);
  }
);  
  }
/**
 * Function to show/hide the image filters
 * @return  void
*/
  imageFilterToggle():void{ 

    this.isImageFilterEnable = (this.isImageFilterEnable)?false:true
    
  }
/**
 * Function to push element
 * @param   element array element 
 * @return  void
*/
private pushElement(element): void {
  this.sliderImages.push({
    small: element.file_path,
    medium: element.file_path,
    big: element.file_path,
    label: element.file_category
  })
}

/**
 * Function to filter image in slider
 * @param   event object 
 * @return  void
*/
  onImageFilter(event):void{   
    (event.target.checked)?this.selectedCategories.push(event.target.value):_.pullAt(this.selectedCategories,this.selectedCategories.indexOf(event.target.value))
    this.sliderImages = [];
    if(this.selectedCategories.length){
      this.carDetail.car_images.forEach(element => {
        if(_.includes(this.selectedCategories,element.file_category)){
          this.pushElement(element);
        }        
      });
      if(this.sliderImages.length<=0)
        this.isCategoryHaveThumbnail = false
    }
    else{
      this.carDetail.car_images.forEach(element => {
        this.pushElement(element);
      });
    }
  }

/**
 * Private function to initalize slider 
 * @return  void
*/
  private sliderinit():void{
    this.sliderOptions = [
      {
          width: '100%',
          height: '365px',     
          imageAnimation: NgxGalleryAnimation.Slide,
          imageArrowsAutoHide:true,          
          thumbnailsArrows:true,
          thumbnailsColumns:5,
          thumbnailMargin: 2,
          thumbnailsPercent:20,
          imageInfinityMove:true,
          thumbnailsAutoHide:true,
          closeIcon:'fa fa-times'
         
      },
      // max-width 800
      {
          breakpoint: 800,
          width: '100%',
          height: '600px',
          imagePercent: 80,
          thumbnailsMargin: 20,
          thumbnailMargin: 20,
           
      },
      // max-width 400
      {
          breakpoint: 400,
          preview: false
      }
    ];  
    this.sliderImages = [];
  }

/**
* Show a popup modal 
*/
show():void {
  this.isOpen = true;  
}
 /**
  * Reset modal popup to hide
  * @param isOpened    boolean value 
  * @return void
  */
 hide(isOpened:boolean):void{
  this.isOpen = isOpened; //set to false which will reset modal to show on click again
}

/**
 * go back to the location from where it came on this page
 */
goBack(){
  this._location.back();
}




  /**
    * save the car in wishlist of the dealer 
    * @param $carId    carId is car id to hide the car
    */
   saveToWishList(carId: any) {

    this.carService.saveCarInWishList({ carId: carId }).pipe(untilDestroyed(this)).subscribe(response => {
      this.commonUtilsService.onSuccess(environment.MESSAGES.CAR_MOVETO_WISHLIST);
      this.sliderImages = []
      this.getCarDetails(this.carDetail._id)

    }, error => {
      this.commonUtilsService.onError(error)
    })

  };

  /**
    * move the car from wishlist of the dealer 
    * @param $carId    carId is car id to hide the car
    */
  moveFromWishList(carId: any) {

    this.carService.moveCarFromWishList({ carId: carId }).pipe(untilDestroyed(this)).subscribe(response => {
      this.commonUtilsService.onSuccess(environment.MESSAGES.CAR_REMOVED_FROM_WISHLIST);
      this.sliderImages = []
      this.getCarDetails(this.carDetail._id)

    }, error => {
      this.commonUtilsService.onError(error)
    })

  };



  /**
    * save the car in hide list
    * @param $carId    carId is car id to hide the car
    */
  hideCar(carId: any) {
    this.carService.hideCar({ carId: carId }).pipe(untilDestroyed(this)).subscribe(response => {
      this.commonUtilsService.onSuccess(environment.MESSAGES.CAR_HIDDEN);
      this.sliderImages = []
      this.getCarDetails(this.carDetail._id)
    }, error => {
      this.commonUtilsService.onError(error)
    })
  };



  /**
    * unhide the car in hide list
    * @param $carId    carId is car id to hide the car
    */
  unhideCar(carId: any) {
    this.carService.unhideCar({ carId: carId }).pipe(untilDestroyed(this)).subscribe(response => {
      this.commonUtilsService.onSuccess(environment.MESSAGES.CAR_UN_HIDEEN);
      this.sliderImages = []
      this.getCarDetails(this.carDetail._id)
    }, error => {
      this.commonUtilsService.onError(error)
    })
  }
/**
     * 
     * @param carId is unique car id
     */
    reportSpam(car){
      Swal.fire({
        title: 'Are you sure to report it as spam ?', 
        html: "By confirming you will agree to our policies for reporting any listing to spam. <a href='#/web/user-agreement' target='_blank'>Read here</a>",
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Apply!',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.value) { 
          let reportSpamDealers = car.report_spam
          reportSpamDealers.push({dealer_id:localStorage.getItem('loggedinUserId')})
          this.dealerService.reportSpam(reportSpamDealers, car._id).pipe(untilDestroyed(this)).subscribe(response => {
            this.sliderImages = []
            this.getCarDetails(this.carDetail._id)
            this.commonUtilsService.onSuccess(environment.MESSAGES.REPORT_SPAM_SUCCESS);    
      
          
          }, error => {
            this.commonUtilsService.onError(error);
          })
  
  
        }
      })
  
    }

    alreadySpammedByDealer(dealersList){
      if(dealersList == null ) return
      let dealer = dealersList.filter((l) => (l.dealer_id==localStorage.getItem('loggedinUserId') && l.email_send==false)).map((l) => l);
      if (dealer.length <= 0) {
        return true
      } else if (dealer.length > 1) {
        return false
      }
    }
    isSpammedByDealer(dealersList){
      if(dealersList.length<=0)
        return false

      let dealer = dealersList.filter((l) => (l.dealer_id==localStorage.getItem('loggedinUserId') && l.email_send==false)).map((l) => l);
      if (dealer.length > 0) {
        return true
      } else if (dealer.length<=0) {
        return false
      }
    }

  placeBid(){
    let user  = JSON.parse(localStorage.getItem('loggedinUser'));
    if(user.membership_type == 'free'){
      this.isMemberShipModelOpen = true;
        return
   } 
  this.isBidModalOpen = true;
}

closeBidModal(event){
  this.isBidModalOpen = false;
  this.isPlaceBidModalOpen = false;

}

onBidSuccess(event){
  this.isBidModalOpen = false;
  this.sliderImages = []
  this.getCarDetails(this.carDetail._id)
}



increaseBidPrice(car){
  // this.car.placebid_price;
  let user  = JSON.parse(localStorage.getItem('loggedinUser'));
      if(user.membership_type == 'free'){
        this.isMemberShipModelOpen = true;
          return
     } 
  let minPrice =car.higest_bid ? (car.higest_bid +100) :(car.vehicle_finance_details.vehicle_min_selling_price  ? (75 /100)*(car.vehicle_finance_details.vehicle_min_selling_price) : 100);
  if(minPrice > car.placebid_price){
    this.commonUtilsService.onError(environment.MESSAGES.BID_PRICE_LESS + '$'+ minPrice);
    return
  }
  if (this.dealerShips.length < 1) {
    this.commonUtilsService.onError(environment.MESSAGES.DEALERSHIP_ACIVATED);
    return

  }

   if(this.dealerShips.length > 1){
      this.isBidModalOpen =  true;

   }else{
    this.modalType = 'bid'
    this.isPlaceBidModalOpen = true;
   }
 
}
placeProxyBid(car){
  let user  = JSON.parse(localStorage.getItem('loggedinUser'));
      if(user.membership_type == 'free'){
        this.isMemberShipModelOpen = true;
          return
     } 
     if (this.dealerShips.length < 1) {
      this.commonUtilsService.onError(environment.MESSAGES.DEALERSHIP_ACIVATED);
      return

    }
     if (this.dealerShips.length < 1) {
      this.commonUtilsService.onError(environment.MESSAGES.DEALERSHIP_ACIVATED);
      return

    }
       this.modalType = 'proxy'
       this.isPlaceBidModalOpen = true;
}



cancelUpdateBid(event){
  this.isPlaceBidModalOpen = false;
  console.log('hi i am cancel')
}


closePlaceBidModal(event){
  this.isBidModalOpen = false;
}

/**
 * 
 * @param event when member ship modal closes 
 */
cancelMembershipModal(event:any){
  this.isMemberShipModelOpen =false;
}

getAllDealShips() {
  this.dealerShips = [];
  this.dealerService.getAllDealShips().pipe(untilDestroyed(this)).subscribe((response:any) => {
        this.dealerShips = response;
    // this.legalContacts = this.dealerShips[0].legal_contacts;
  }, error => {
    this.commonUtilsService.onError(error);
  })

}
ngOnDestroy(){

}

}
