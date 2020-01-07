import { Component, OnInit, ViewChild, ViewEncapsulation, ElementRef, AfterViewInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery';


//modules services, models and enviornment file
import { TitleService, CarService, RealUpdateService, SharedService, CommonUtilsService, DealerService, NotificationService } from '../../../../core/_services'
import { PagedData, Car, Page } from "../../../../core/_models";
import { environment } from '../../../../../environments/environment'
import { untilDestroyed } from 'ngx-take-until-destroy';// unsubscribe from observables when the component destroyed
import Swal from 'sweetalert2/dist/sweetalert2.js'
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/map";

declare let $: any;
declare let POTENZA: any;

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ListingComponent implements OnInit {



  @ViewChild('listingTable') listingTable;
  // @ViewChild('bidModal') bidModal: ElementRef;
  @ViewChild('searchNameModal') searchNameModal: ElementRef;


  @ViewChild("listingSection") listingSection: ElementRef;

  sectionEnable: string = 'list'
  sliderOptions: NgxGalleryOptions[];
  sliderImages: NgxGalleryImage[];
  dealerShips: any = [];
  bidForm: FormGroup;
  proxyBidForm: FormGroup;
  searchNameForm: FormGroup;
  searchForm: FormGroup;
  legalContacts: any = [];
  car: any;
  isBidModalOpen: boolean = false;
  isBidUpdateModalOpen: boolean = false;
  modalType: string;
  page = new Page(); //object of Page type  
  cars = new Array<Car>() //array of Car type 
  seller: any;
  messages: any = [];
  chatSellers: any = []
  users: any = [];
  isSubmitted: boolean = false;
  dealerPaymentDetails:any;
  messageBody: any;
  selectedCarId: any;
  selectedCarDetails: any;
  isBidListingModalOpen: boolean = false;
  isPaymentModalOpen: boolean = false;
  isSearchModelOpen: boolean = false;
  isMemberShipModelOpen: boolean = false;
  showsaveSearch: boolean = false;
  searchApplied: boolean = false;
  isInvoiceModalOpen: boolean = false;
  isAddPaymentMethodModal: boolean = false;
  transactionDetails: any;
  minBidPrice: number = 0;
  minPrice: number = 0;
  searchData: any;
  search: string = '';
  selectedSearch: any;
  minProxyBidPrice: number = 0;
  submitted: boolean = false;
  isModalOpen: any = false;
  isOpenChatWindow: boolean = false
  selectedChat: any = '';
  currentPageLimit: number = environment.DEFAULT_RECORDS_LIMIT
  readonly pageLimitOptions = environment.DEFAULT_PAGE_LIMIT_OPTIONS
  private _defaultPagination = {
    count: 0,
    limit: this.currentPageLimit,
    offset: 0,
    pageSize: this.currentPageLimit
  }
  defaultUserImgUrl: string = 'assets/images/default-user.png';
  //title and breadcrumbs
  readonly title: string = 'Dashboard'
  readonly breadcrumbs: any[] = [{ page: 'Home', link: '/dealer/home' }, { page: 'Dashboard', link: '' }]


  constructor(private sharedService: SharedService, private notificationService: NotificationService, private dealerService: DealerService, private realTimeUpdate: RealUpdateService, private commonUtilsService: CommonUtilsService, private carService: CarService, private formBuilder: FormBuilder, private titleService: TitleService) {

    this.page.type = 'all';
    //setting the page title



    this.realTimeUpdate.updateLsiting().subscribe(res => {
      this.loadRealTimeLsiting() // this willbe called after real time updation of listing
    })

    this.realTimeUpdate.updateUsers().subscribe(res => {
      console.log('the users are --------------------------',res)
      this.users = res;
    })


    this.realTimeUpdate.haveNewMessage().subscribe(res => {
      $("#chatScroll").animate({ scrollTop: $(document).height() }, "slow");
      delete res['sendTo'];
      delete res['from'];
      let message = res;
      this.messages.push(message)
      console.log('the message is ', this.messages)
    });

    //update will be invoked on acception of bid from seller side
    this.realTimeUpdate.updateLsitingOnBidAcception().subscribe((res:any)=> {
      let dealerid = localStorage.getItem('loggedinUserId');
      let dealerId= dealerid.toString();
      let socketDealerId =res.data.toString()
      if(dealerId == socketDealerId){
        console.log('hi iam inside')
        this.page.type='transactions';
        this.loadRealTimeLsiting() // this willbe called after real time updation of listing
        
      } else{
        this.loadRealTimeLsiting() // this willbe called after real time updation of listing
      }
      
      
    })


    this.searchForm = this.formBuilder.group({
      search: [null]
    });
    this.searchNameForm = this.formBuilder.group({
      searchName: ['', Validators.required]
    });

    this.titleService.setTitle();

    this.sharedService.pageType.subscribe((val) => {
      if (!$.isEmptyObject(val)) {
        this.page = val.page;
      }
    })
    this.getAllDealShips();
    this.getPaymentMethod()
    this.setPage(this._defaultPagination);


    this.sharedService.setPageTypeState({})//empty the page state
  }



  private dealerBidForm() {
    this.bidForm = this.formBuilder.group({
      car_id: [null, Validators.required],
      dealership_id: ['', [Validators.required]],
      legal_contact: ['', [Validators.required]],
      bid_price: [0],
      proxy_price: [0]

    });
  }

  /**
   * it will be invoked for realtime data update
   */
  loadRealTimeLsiting() {
    this.page.pageNumber = this._defaultPagination.offset;
    this.page.size = this._defaultPagination.pageSize;


    //hit api to fetch data
    this.carService.listingDealersCars(this.page).pipe(untilDestroyed(this)).subscribe(

      //case success
      (pagedData) => {
        this.listingSection.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });//scroll the page to defined section #contentSection
        this.page = pagedData.page;

        //this.cars =  pagedData.data; 
        this.cars = [...pagedData.data];
        //console.log('the cars are', this.cars)

        //case error 
      }, error => {
        this.commonUtilsService.onError(error);
      });



  }

  /**
   * get all dealerships to plcae bid 
   */
  getAllDealShips() {
    this.dealerShips = [];
    this.dealerService.getAllDealShips().pipe(untilDestroyed(this)).subscribe((response: any) => {
      this.dealerShips = response;
      // this.legalContacts = this.dealerShips[0].legal_contacts;
    }, error => {
      this.commonUtilsService.onError(error);
    })

  }

  applySearch() {

    $(".search_suggestions").show();
  }

  ngAfterViewInit() {
    $('body').click(function (evt) {
      console.log('id', evt.target.id);
      if (evt.target.id.trim() == "search_field" || evt.target.id == "search_item" || evt.target.id == "search_field_dash") {
        $(".search_suggestions").show();
        return
      }



      console.log('what the ')
      //For descendants of menu_content being clicked, remove this check if you do not want to put constraint on descendants.
      $(".search_suggestions").hide();

      //Do processing of click event here for every element except with id menu_content

    });

    this.notificationService.chatHistoryWindow().subscribe((status) => {
      this.chatSellersListing();
      $("#sellerChatListing").addClass("opend");
      this.isOpenChatWindow = status
      console.log('status is', status);

    })
  }

  setPage(page) {

    this.page.pageNumber = page.offset;
    this.page.size = page.pageSize;
    if (this.page.search.length <= 0)
      this.commonUtilsService.showPageLoader();

    //hit api to fetch data
    this.carService.listingDealersCars(this.page).pipe(untilDestroyed(this)).subscribe(

      //case success
      (pagedData) => {
        this.listingSection.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });//scroll the page to defined section #contentSection
        this.page = pagedData.page;

        //this.cars =  pagedData.data; 
        this.cars = [...pagedData.data];
        console.log('rows', this.cars);
        if (pagedData.data.length > 0 && (Object.keys(this.page.filters).length || this.page.search.length)) {

          this.showsaveSearch = true;
        } else {
          this.showsaveSearch = false;
        }
        this.commonUtilsService.hidePageLoader();
        //case error 
      }, error => {
        this.commonUtilsService.onError(error);
      });
  }

  show(type) {
    this.sectionEnable = type
    console.log('sectionEnable', this.sectionEnable);
  }

  showInvoicePopup(transactionDetails): void {
    //console.log('transactionDetails', transactionDetails);
    this.isInvoiceModalOpen = true;
    this.transactionDetails = transactionDetails
  }

  /**
  * Reset modal popup to hide
  * @param isOpened    boolean value 
  * @return void
  */
  hideInvoicePopup(isOpened: boolean): void {
    //console.log(isOpened)
    this.isInvoiceModalOpen = isOpened; //set to false which will reset modal to show on click again
    this.transactionDetails = [];
  }


  showPaymentPopup(carDetails): void {
    //console.log('carDetails', carDetails);
    this.isPaymentModalOpen = true;
    this.selectedCarDetails = carDetails
  }

  /**
  * Reset modal popup to hide
  * @param isOpened    boolean value 
  * @return void
  */
  hidePaymentPopup(isOpened: boolean): void {

    this.isPaymentModalOpen = isOpened; //set to false which will reset modal to show on click again
    this.selectedCarDetails = [];

  }

  showBids(carId): void {
    this.isBidListingModalOpen = true;
    this.selectedCarId = carId
  }

  /**
  * Reset modal popup to hide
  * @param isOpened    boolean value 
  * @return void
  */
  hide(isOpened: boolean): void {
    //console.log(isOpened)
    this.isBidListingModalOpen = isOpened; //set to false which will reset modal to show on click again
    this.selectedCarId = '';
  }


  ngOnInit() {



    let searchFormControl = this.searchForm.get('search')
    searchFormControl.valueChanges.debounceTime(1000).subscribe((search) => {
      this.page.search = search;
      this.setPage(this._defaultPagination);
    })
    POTENZA.priceslider()
    POTENZA.yearslider()
    this.dealerBidForm();
    this.realTimeUpdate.saveUserOnSocketIo();
    this.notificationService.charUser.subscribe(val => {
      if (!$.isEmptyObject(val)) {
        let user = {

          username: val.seller[0].username,
          _id: val.seller[0]._id,
          name: val.seller[0].name,
          profile_pic: val.seller[0].profile_pic
        };

        this.seller = user;
        //console.log('the user is ',this.seller)
        this.getDealerChat();
        this.notificationService.setReload({ reload: true });//set service for reloading notification after getting chat

      }

    });
    this.getSeaches()
    this.chatSellersListing();

  }


  onChanges(): void {
    this.bidForm.get('proxy_price').valueChanges.subscribe(val => {
      // this.bidForm.patchValue({
      //   proxy_price: this.bidForm.controls.bid_price.value
      // })
      let vehicleMinBidPrice = this.bidForm.controls.proxy_price;
      if (this.bidForm.controls.proxy_price.value > 0) {
        console.log('hiii')

        vehicleMinBidPrice.setValidators([Validators.compose([Validators.required, Validators.min(this.bidForm.controls.bid_price.value)])]);

      } else {
        console.log('hiiitt')
        vehicleMinBidPrice.setValidators(null);

      }
      vehicleMinBidPrice.updateValueAndValidity();
    });
  }



  chnageProxyPrice() {
    let vehicleMinBidPrice = this.bidForm.controls.proxy_price;
    if (this.bidForm.controls.proxy_price.value > 0) {

      vehicleMinBidPrice.setValidators([Validators.compose([Validators.required, Validators.min(this.bidForm.controls.bid_price.value)])]);

    } else {
      vehicleMinBidPrice.setValidators(null);

    }
    vehicleMinBidPrice.updateValueAndValidity();
  }
  /**
     * Search results according to user inputs
     * @param searchValue user inputs to search particular data
     * @return  void
     */
  onSearch(searchValue: string): void {
    this.page.search = searchValue;
    console.log('the value is')
    this.searchApplied = false;
    this.setPage(this._defaultPagination);
  }

  /**
  * To fetch the records according to type(All, Archive, Sold, Active)
  * @param type type of records(All, WishList, Hidden, Active)
  * @return  void
  */
  onChangeListType(type): void {
    this.page.type = type;
    this.page.totalElements = 0;
    this.setPage(this._defaultPagination);
  }


  /**
    * save the car in wishlist of the dealer 
    * @param $carId    carId is car id to hide the car
    */
  saveToWishList(carId: any) {

    this.carService.saveCarInWishList({ carId: carId }).pipe(untilDestroyed(this)).subscribe(response => {
      this.commonUtilsService.onSuccess(environment.MESSAGES.CAR_MOVETO_WISHLIST);
      this.setPage(this._defaultPagination);

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
      this.setPage(this._defaultPagination);

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
      this.setPage(this._defaultPagination);
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
      this.setPage(this._defaultPagination);
    }, error => {
      this.commonUtilsService.onError(error)
    })
  }



  /**
   * this will trigger when user hit the date filter 
   * @param value  is the date filters object
   */
  getDateFilter(value: any) {
    if (Object.keys(value).length === 0 && value.constructor === Object)
      this.page.filters = {};
    else
      this.page.filters['dates'] = value;
    this.searchApplied = false; //
    this.setPage(this._defaultPagination);

  };


  // /**place bid will open the placebid modal popup
  //  * @param car is the car object for bid
  //  *will return nothing
  //  */
  // placeBid(car: any) {

  //   this.minBidPrice = car.totalBids == 0 ? (car.vehicle_min_selling_price+1) : (car.higest_bid+1);
  //   this.minPrice= this.minBidPrice == 0? 1:this.minBidPrice
  //   // this.minProxyBidPrice = car.totalBids == 0 ? car.vehicle_min_selling_price : car.higest_bid;
  //   this.bidForm.patchValue({
  //     bid_price: this.minBidPrice,
  //     proxy_price: 0

  //   })
  //   this.bidForm.controls.proxy_price.setValidators(null);
  //   this.bidForm.controls.proxy_price.updateValueAndValidity()


  //   let vehicleMinBidPrice = this.bidForm.controls.bid_price;
  //   vehicleMinBidPrice.setValidators([Validators.compose([Validators.required, Validators.min(this.minPrice)])]);        
  //   vehicleMinBidPrice.updateValueAndValidity();

  //   this.getAllDealShips();
  //   this.car = car;
  //   this.bidForm.patchValue({
  //     car_id: car._id,
  //     price:car.vehicle_finance_details.vehicle_min_bid_price
  //   })
  //   $(this.bidModal.nativeElement).modal({ backdrop: 'static', keyboard: false, show: true });
  // }

  /**
     * will be invoked when the proxy bid be updated
  */
  // updateProxyBid(car) {
  //   this.car = car;
  //   this.proxyBidForm.patchValue({
  //     bidId: car.my_bid._id,
  //     // proxy_price:this.car.higest_bid
  //   });
  //   let vehicleMinBidPrice = this.proxyBidForm.controls.proxy_price;
  //   vehicleMinBidPrice.setValidators([Validators.compose([Validators.required, Validators.min(this.car.higest_bid)])]);
  //   vehicleMinBidPrice.updateValueAndValidity();


  // }

  /**
   * will invoke in the updation of the proxy bid price
   */
  // updateBidPrice() {

  //   if (!this.proxyBidForm.valid)
  //     return
  //   Swal.fire({
  //     title: 'Are you sure you want to update?',
  //     type: 'warning',
  //     showCancelButton: true,
  //     confirmButtonText: 'Yes, Apply!',
  //     cancelButtonText: 'Cancel'
  //   }).then((result) => {
  //     if (result.value) {
  //       this.submitted = false;
  //       this.updateBid();
  //     }
  //   })
  // }


  /**
   * get all dealer ships
   */
  // getAllDealShips() {
  //   this.dealerService.getAllDealShips().pipe(untilDestroyed(this)).subscribe(response => {
  //     this.dealerShips = response;
  //     this.legalContacts = this.dealerShips[0].legal_contacts;
  //   }, error => {
  //     this.commonUtilsService.onError(error);
  //   })

  // }

  // onSubmit() {

  //     this.submitted = true;
  //   //console.log('the form is', this.car.vehicle_finance_details.vehicle_min_bid_price);
  //   if (this.bidForm.invalid) return;

  //    //console.log('the valu eis '+this.car.vehicle_finance_details.vehicle_min_bid_price  +'asdas'+this.bidForm.controls.price.value)

  //    if(this.car.vehicle_finance_details.vehicle_min_bid_price >this.bidForm.controls.bid_price.value){
  //     this.commonUtilsService.onError('Your bid amount is less then the minimum bid acceptance amount set by the seller. Please try again with higher bid.') 
  //     return
  //    }
  //   this.confirmBid();

  // }

  /**
   * 
   * place bid confirmation
   */

  // private confirmBid(): void {
  //   Swal.fire({
  //     title: 'Are you sure you want to apply?',
  //     type: 'warning',
  //     showCancelButton: true,
  //     confirmButtonText: 'Yes, Apply!',
  //     cancelButtonText: 'Cancel'
  //   }).then((result) => {
  //     if (result.value) {

  //       if (this.page.type == 'applied') {
  //         this.updateBid();//update bid if the dealer is loosing the bid
  //       } else {
  //         this.saveBid();//create bid 
  //       }



  //     }
  //   })

  // }

  // private saveBid() {
  //   this.dealerService.placeBid(this.bidForm.value).pipe(untilDestroyed(this)).subscribe(response => {
  //     this.commonUtilsService.onSuccess(environment.MESSAGES.BID_SUCCESS);
  //     this.realTimeUpdate.updateRealTimeData();
  //     this.bidForm.reset();
  //     this.submitted = false;

  //     $(this.bidModal.nativeElement).modal('hide');
  //     this.page.type = "applied";
  //     this.setPage(this._defaultPagination);
  //   }, error => {
  //     this.submitted = false;
  //     this.commonUtilsService.onError(error);
  //   })
  // }


  // private updateBid() {
  //   this.dealerService.updateBid(this.bidForm.value).pipe(untilDestroyed(this)).subscribe(response => {
  //     this.realTimeUpdate.updateRealTimeData();
  //     this.commonUtilsService.onSuccess(environment.MESSAGES.BID_SUCCESS);
  //     this.bidForm.reset();
  //     this.submitted = false;

  //     $(this.bidModal.nativeElement).modal('hide');
  //     this.page.type = "applied";
  //     this.setPage(this._defaultPagination);
  //   }, error => {
  //     this.submitted = false;
  //     this.commonUtilsService.onError(error);
  //   })
  // }
  /**
   *  will be invoked if the seller has left a message for dealer
   * @param user is the seller whom dealer want to chat with
   */
  getDealerChat() {

    console.log('the seller os ', this.seller.seller_id)
    this.messages = [];
    this.dealerService.getDealerChatDetails({ seller_id: this.seller._id }).subscribe(res => {
      let msgs = [];
      msgs = (res.chat == null) ? [] : res.chat.messages;
      this.messages = msgs //msgs.reverse();
      // this.seller = res.seller;
      this.seller['isOnline'] = this.isInArray(this.seller.username);
      $(".chat_box").addClass("opend");
      $("#chatScroll").animate({ scrollTop: $('#chatScroll').prop("scrollHeight") }, 1000);

    })

  }

  showChat(sellerObject, seller_id: any) {
    console.log('dealer_id', seller_id);
    if (!seller_id) {
      this.commonUtilsService.onError('Seller does not exist.');
      return false;
    }
    this.selectedChat = sellerObject.chat_id;  // don't forget to update the model here
    this.messages = [];
    this.dealerService.getChatDetails({ seller_id: seller_id }).subscribe(res => {
      let msgs = [];

      msgs = (res.chat == null) ? [] : res.chat.messages;
      this.messages = msgs
      this.seller = res.seller;
      this.seller['isOnline'] = this.isInArray(this.seller.username);
      console.log('the seller is ', this.seller)
      $(".chat_box").addClass("opend");
      $("#chatScroll").animate({ scrollTop: $('#chatScroll').prop("scrollHeight") }, 1000);

    })

  }

  chatHistoryClose() {
    $("#sellerChatListing").removeClass("opend");
    this.chatClose();
  }
  chatClose() {
    $(".chat_box").removeClass("opend");
    this.messageBody = ''
    this.selectedChat = '';
  }

  /**
   * send message to seller
   */
  sendMessage() {
    if (!this.messageBody || this.isSubmitted) return
    this.isSubmitted = true;

    let message = {
      seller_id: this.seller._id,
      messageBody: this.messageBody,
      message: this.messageBody,
      created_at: new Date(),
      isSeller: false,
      is_seller: false,

    }
    this.dealerService.saveMessage(message).subscribe(res => {

      if (res.chatList) {
        this.chatSellers = res.chatList
      }
      this.messageBody = ''
      // this.messages.push(res);
      this.messages = res.msg.messages
      $("#chatScroll").animate({ scrollTop: $('#chatScroll').prop("scrollHeight") }, 1000);
      //let message = res.message;
      if (this.isInArray(this.seller.username)) {
        message['sendTo'] = this.users[this.users.map(user => user.username).indexOf(this.seller.username)]
        console.log('message to', message);
        this.realTimeUpdate.sendMessage(message)
      }

      this.isSubmitted = false;
    }, error => {
      this.isSubmitted = false;
    })
  }
  chatSellersListing() {
    this.dealerService.chatSellersListing().subscribe(res => {
      this.chatSellers = res
      console.log('chatSellers', this.chatSellers);
    }, error => {
      console.log('error', error);
      //this.isSubmitted = false;
    })
  }


  isInArray(value) {
    console.log(this.users)
    if (this.users.length) {
      console.log(this.users)
      return this.users.map(user => user.username).indexOf(value) > -1;
    }

    else false
  }
  /**after selecting the store assign legal contacts to legal contact array
   * @params value is the target value after selecting the dealership
   * return void
   */
  selectStore(value: any): void {
    let pos = this.dealerShips.map(e => e._id).indexOf(value);
    console.log(pos)
    if (pos >= 0) this.legalContacts = this.dealerShips[pos].legal_contacts;
    else this.legalContacts = [];
  }
  /**
   * Search results according to user inputs
   * @param searchValue user inputs to search particular data
   * @return  void
   */
  applyDashboardFilters(filters): void {
    this.page.filters = filters
    this.sectionEnable = 'list'
    console.log('filters', this.page.filters);
    this.searchApplied = false; //
    this.setPage(this._defaultPagination);
  }

  /**
   * validate offer in hands popup.   
   */
  showPopupToMakePayment(): void {
    //$(this.offerInHandsSection.nativeElement).modal('hide');
  }


  /**
* To sort the records on dattable columns
* @param event event object which have column name and direction data
* @return  void
*/
  onSort(event) {

    const sort = event.sorts[0];
    this.page.sortProperty = sort.prop
    this.page.sortDirection = sort.dir
    this.setPage(this._defaultPagination);
  }



  /**
 * will invoke on the discard of the bid
 */
  cancelProxyBidUpdate() {
    this.proxyBidForm.reset();
    // $(this.proxybidModal.nativeElement).modal('hide');
  }
  toggleExpandRow(row) {
    this.listingTable.rowDetail.toggleExpandRow(row);
  }


  onDetailToggle(event) {
  }
  ngOnDestroy() {

  }

  /**
 * will save the page State
 */
  savePageType() {
    this.sharedService.setPageTypeState({ page: this.page })
  }



  /**
* To change the records limit on page
* @param limit number of records to dispaly on page
* @return  void
*/

  onLimitChange(limit: any): void {
    this.currentPageLimit = this._defaultPagination.limit = this._defaultPagination.pageSize = parseInt(limit)
    this.setPage(this._defaultPagination);
  }


  /**
       * 
       * @param $event is the true value if the bid accept successfully!
       */
  onCancel($event) {
    if ($event) {
      this.isModalOpen = false
      this.isBidListingModalOpen = false; //set to false which will reset modal to sho
      this.realTimeUpdate.updateRealTimeData();
      this.setPage(this._defaultPagination);

    }
  }



  getSeaches() {
    let search = {
      search_type: 'listing'
    }
    this.dealerService.getSearches(search).subscribe(val => {
      this.searchData = val;
      console.log('the search data is', this.searchData)
    }, error => {
      this.commonUtilsService.onError(error);
    })
  }

  /**
   * save search willbe called once the user save the search
   */
  saveSearch() {
    console.log('this ', this.page)
    this.isSearchModelOpen = true;

  }

  submitSearch(value: any) {

    this.page.searchName = value.searchName;
    this.page.search_type = 'dashboard';
    this.dealerService.saveSearch(this.page).subscribe(val => {
      this.getSeaches();
      this.commonUtilsService.onSuccess(environment.MESSAGES.SEARCH_SAVED);
      this.isSearchModelOpen = false;
      this.showsaveSearch = false;

    }, error => {
      this.commonUtilsService.onError(error)
    })
  }
  cancelsubmitSearch(value: any) {
    this.isSearchModelOpen = false;

  }
  /**
   * 
   * @param search is the filetrs and search object
   */
  getSearchData(search: any) {
    this.selectedSearch = search
    this.page.search = search.search;
    this.search = search.search;
    if ('filters' in search)
      this.page.filters = search.filters;
    console.log('the page is', this.page)
    this.setPage(this._defaultPagination);
    this.searchApplied = true;
    $(".search_suggestions").hide();


  }
  /**
   * remove search from the db
   */
  removeSearch(searchId: any) {

    this.dealerService.removeSearch(searchId).subscribe(val => {
      this.searchApplied = false
      this.getSeaches();
      this.commonUtilsService.onSuccess(environment.MESSAGES.SEARCH_REMOVED)

    }, error => {
      this.commonUtilsService.onError(error);
    })
  }


  /**
   * 
   * @param carId is unique car id
   */
  reportSpam(car) {
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
        reportSpamDealers.push({ dealer_id: localStorage.getItem('loggedinUserId') })
        this.dealerService.reportSpam(reportSpamDealers, car._id).pipe(untilDestroyed(this)).subscribe(response => {
          this.setPage(this._defaultPagination);
          this.commonUtilsService.onSuccess(environment.MESSAGES.REPORT_SPAM_SUCCESS);


        }, error => {
          this.commonUtilsService.onError(error);
        })


      }
    })

  }

  alreadySpammedByDealer(dealersList) {
    let dealer = dealersList.filter((l) => (l.dealer_id == localStorage.getItem('loggedinUserId') && l.email_send == false)).map((l) => l);
    if (dealer.length <= 0) {
      return true
    } else if (dealer.length > 1) {
      return false
    }
  }

  isSpammedByDealer(dealersList) {
    if (dealersList.length <= 0)
      return false

    let dealer = dealersList.filter((l) => (l.dealer_id == localStorage.getItem('loggedinUserId') && l.email_send == false)).map((l) => l);
    if (dealer.length > 0) {
      return true
    } else if (dealer.length <= 0) {
      return false
    }
  }
  cancelMembershipModal(event) {
    this.isMemberShipModelOpen = false;
  }
  placeBid(car: any) {

    let user = JSON.parse(localStorage.getItem('loggedinUser'));
    if (user.membership_type == 'free') {
      this.isMemberShipModelOpen = true;
      return
    }
    this.car = car;
    this.isBidModalOpen = true;
  }

  closeBidModal(event) {
    this.isBidModalOpen = false;

  }

  onBidSuccess(event) {
    this.isBidModalOpen = false;
    this.page.type = "applied";
    this.setPage(this._defaultPagination);

  }

  //bid updates methods
  closeBidUpdateModal(event) {
    this.isBidUpdateModalOpen = false;
  }
  onBidUpdateSuccess(event) {
    this.isBidUpdateModalOpen = false;
  }

  increaseBidPrice(car) {
    let user = JSON.parse(localStorage.getItem('loggedinUser'));
    // if (user.membership_type == 'free') {
    //   this.isMemberShipModelOpen = true;
    //   return
    // }

    if (!this.dealerPaymentDetails.payment_details.length) {
      this.isAddPaymentMethodModal = true;
      return
    }

    let minPrice = car.higest_bid ? (car.higest_bid + 100) : (car.vehicle_finance_details.vehicle_min_selling_price ? (75 / 100) * (car.vehicle_finance_details.vehicle_min_selling_price) : 100);
    if (minPrice > car.placebid_price) {
      this.commonUtilsService.onError(environment.MESSAGES.BID_PRICE_LESS);
      return
    }

    if (this.dealerShips.length < 1) {
      this.commonUtilsService.onError(environment.MESSAGES.DEALERSHIP_ACIVATED);
      return

    }

    if (this.dealerShips.length > 1) {
      this.isBidModalOpen = true;
      this.car = car;

    } else {
      this.car = car;
      this.modalType = 'bid'

      this.isBidUpdateModalOpen = true;
    }
    this.car = car;
    this.modalType = 'bid'

  }
  placeProxyBid(car) {
    let user = JSON.parse(localStorage.getItem('loggedinUser'));
    // if (user.membership_type == 'free') {
    //   this.isMemberShipModelOpen = true;
    //   return
    // }
    if (!this.dealerPaymentDetails.payment_details.length) {
      this.isAddPaymentMethodModal = true;
      return
    }
    if (this.dealerShips.length < 1) {
      this.commonUtilsService.onError(environment.MESSAGES.DEALERSHIP_ACIVATED);
      return

    }
    // let minPrice = car.higest_bid ? (car.higest_bid +100) :(car.vehicle_finance_details.vehicle_min_selling_price  ? (75 /100)*(car.vehicle_finance_details.vehicle_min_selling_price) : 100);
    // if(minPrice > car.placebid_price){
    //   this.commonUtilsService.onError(environment.MESSAGES.BID_PRICE_LESS);
    //   return
    // }
    this.car = car;
    this.modalType = 'proxy'
    this.isBidUpdateModalOpen = true;
  }
  cancelUpdateBid(event) {
    this.isBidUpdateModalOpen = false;
  }
  /**
   * hide modal popup of no add payment method
   * @param event is the modal close value
   */
  hideAddPaymentModal(event) {
    this.isAddPaymentMethodModal = false;

  }
  /**
   * check weather the dealer has payment method added
   */
  getPaymentMethod(): any {
    //check weather the dealer has payment method added or not
    this.dealerService.checkDealerPaymentMethod({}).subscribe(response => {
      this.dealerPaymentDetails =response;  
    })
      }

      changeCarStatus(carId:any):void{

        Swal.fire({
              title: 'Are you sure you want to change car status to sold?',
              type: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Yes, Update!',
              cancelButtonText: 'Cancel'
            }).then((result) => {
              if (result.value) {
                this.carService.changeCarStatustoSold(carId).subscribe((response)=>{
                  this.commonUtilsService.onSuccess('The cas status has been changed to sold.');
                  this.page.type = 'purchased';
                  this.setPage(this._defaultPagination);
               },error=>{
                 this.commonUtilsService.onError(error);
               })
              }
            })

      
      }
}





