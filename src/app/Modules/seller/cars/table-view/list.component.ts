import { Component, ViewChild, OnInit, AfterViewInit, ViewEncapsulation, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { untilDestroyed } from 'ngx-take-until-destroy';// unsubscribe from observables when the  component destroyed
import { NgbDateAdapter, NgbDateNativeAdapter, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

//import services
//modules core services
import { TitleService, CarService, SharedService, RealUpdateService, CommonUtilsService, SellerService, NotificationService } from '../../../../core/_services'

//import models
import { PagedData, Car, Page } from "../../../../core/_models";

import { environment } from '../../../../../environments/environment'

declare let jQuery: any;
declare let $: any;
declare let POTENZA: any;
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { isStepId } from 'angular-archwizard';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  providers: [
    CarService
  ],
  styleUrls: ['./list.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class ListComponent implements AfterViewInit {
  @ViewChild('listingTable') listingTable;


  page = new Page();
  cars = new Array<Car>()
  isGridListing: boolean = true; //set boolean value to show/hide listing (grid/list)
  viewedPages: any = [];
  carId: any;
  dealer: any;
  deactivateCarData: any;
  users: any = [];
  messages: any = [];
  isSubmitted: boolean = false;
  searchApplied: boolean = false;
  showsaveSearch: boolean = false;
  isSearchModelOpen: boolean = false;
  isDeactivateResonModelOpen: boolean = false;
  searchData: any;
  search: string = '';
  messageBody: any;
  selectedSearch: any;
  isModalOpen: boolean = false;
  isBidsModalOpen: boolean = false;
  isFiltersModalOpen: boolean = false;
  isOpenChatWindow: boolean = false
  selectedCarId: any;
  isBidListingModalOpen: boolean = false;
  isEditLocationModalOpen: boolean = false;
  chatDealers: any = []
  datesFilter: any = {};
  dateFilterForm: FormGroup
  //Defined records limit and records limit options
  currentPageLimit: number = environment.DEFAULT_RECORDS_LIMIT
  readonly pageLimitOptions = environment.DEFAULT_PAGE_LIMIT_OPTIONS
  defaultUserImgUrl: string = 'assets/images/default-user.png';
  selectedChat: any = '';
  //title and breadcrumbs
  readonly title: string = 'Auction Listing';
  readonly breadcrumbs: any[] = [{ page: 'Home', link: '/seller/home' }, { page: "Auction Listing", link: '/seller/car-listing' }, { page: "Table View", link: '' }]


  //default pagination settings
  private _defaultPagination = {
    count: 0,
    limit: this.currentPageLimit,
    offset: 0,
    pageSize: this.currentPageLimit
  }




  constructor(private sharedService: SharedService, private notificationService: NotificationService, private sellerService: SellerService, private realTimeUpdate: RealUpdateService, private ngbDateParserFormatter: NgbDateParserFormatter, private router: Router, private commonUtilsService: CommonUtilsService, private carService: CarService, private formBuilder: FormBuilder, private titleService: TitleService) {

    //setting the page title
    this.titleService.setTitle();

    this.dateFilterForm = this.formBuilder.group({
      startDate: [null, null],
      endDate: [null, null]
    });

    this.realTimeUpdate.haveNewMessage().subscribe(res => {
      console.log('the message is ', res);
      $("#chatScroll").animate({ scrollTop: $(document).height() }, "slow");
      delete res['sendTo'];
      delete res['from'];
      let message = res;

      this.messages.push(message)
      console.log('the message is ', this.messages)
    });

    this.page.type = 'active';

    this.realTimeUpdate.updateLsiting().subscribe(res => {
      this.loadRealTimeLsiting() // this willbe called after real time updation of listing
    })

    //get users info from socket api
    this.realTimeUpdate.updateUsers().subscribe(res => {
      console.log('the users are --------------------------', res)
      this.users = res;
    })


    //fetching the data with saved settings
    this.sharedService.pageType.subscribe((val) => {
      if (!$.isEmptyObject(val)) {
        this.page = val.page;
      }
    })
    this.setPage(this._defaultPagination);
    this.sharedService.setPageTypeState({});


  }

  /**
  * component life cycle default method, runs after view page initlization
  * @return void
  */
  ngAfterViewInit(): void {

    //initializing some jquery neccessary functions    
    POTENZA.toggleFilters()
    POTENZA.priceslider()
    POTENZA.yearslider()
    //POTENZA.tabs()      
    $('body').click(function (evt) {
      //console.log('id',evt.target);
      if (evt.target.id == "search_field_dash" || evt.target.id == "search_item") {

        $(".search_suggestions").show();
        return
      }

      //For descendants of menu_content being clicked, remove this check if you do not want to put constraint on descendants.
      $(".search_suggestions").hide();

      //Do processing of click event here for every element except with id menu_content

    });
    this.notificationService.chatHistoryWindow().subscribe((status) => {
      this.chatDealersListing();
      $("#sellerChatListing").addClass("opend");
      this.isOpenChatWindow = status
      console.log('status is', status);

    })
  }

  ngOnInit() {


    this.realTimeUpdate.saveUserOnSocketIo();

    this.notificationService.charUser.subscribe(val => {

      if (!$.isEmptyObject(val)) {
        console.log('notificationService val', val);
        let user = {

          username: val.dealer[0].username,
          _id: val.dealer[0]._id,
          name: val.dealer[0].name,
          profile_pic: val.dealer[0].profile_pic

        };

        this.dealer = user;
        this.getSellerChat();
        this.notificationService.setReload({ reload: true });//set service for reloading notification after getting chat

      }

    })
    this.chatDealersListing();
    this.getSeaches()
  }

  /**
  * change listing type list/grid
  * @return void
  */
  onChangeListingType(listingType: string): void {
    this.isGridListing = (listingType == 'list') ? false : true
  }

  /**
   * this willbe inviked for real time update
   */
  loadRealTimeLsiting() {
    this.page.type = this.page.type;
    this.page.pageNumber = this._defaultPagination.offset;
    this.page.size = this._defaultPagination.pageSize;
    //hit api to fetch data
    this.carService.listingCarsOnDatable(this.page).subscribe(

      //case success
      (pagedData) => {

        this.page = pagedData.page;

        //this.cars =  pagedData.data; 
        this.cars = [...pagedData.data];
        console.log('Rows', this.cars);
        //case error 
      }, error => {
        this.commonUtilsService.onError(error);
      });
  }



  /**
   * Populate the table with new data based on the page number
   * @param page The page to select
   * @param type Result type (All, Active, Archived)
   */
  setPage(page): void {

    this.page.type = this.page.type;
    this.page.pageNumber = page.offset;
    this.page.size = page.pageSize;

    //Do not fetch page data if page is already clicked and paginated
    /*if( _.includes(this.viewedPages, this.page.pageNumber))
      return;
    else    
      this.viewedPages.push(this.page.pageNumber)*/

    //Do not show page loader if fetching results using search
    if (!this.page.search) {

      this.commonUtilsService.showPageLoader();
    }

    //hit api to fetch data
    this.carService.listingCarsOnDatable(this.page).subscribe(

      //case success
      (pagedData) => {

        this.page = pagedData.page;

        //this.cars =  pagedData.data; 
        this.cars = [...pagedData.data];
        if (pagedData.data.length > 0 && (Object.keys(this.page.filters).length || this.page.search.length)) {
          this.showsaveSearch = true;
        } else {
          this.showsaveSearch = false;
        }
        console.log('Rows', this.cars);
        this.commonUtilsService.hidePageLoader();
        //case error 
      }, error => {
        this.commonUtilsService.onError(error);
      });
  }

  /**
   * Search results according to user inputs
   * @param searchValue user inputs to search particular data
   * @return  void
   */
  onSearch(searchValue: string): void {
    this.viewedPages = [];
    this.page.search = searchValue;
    this.searchApplied = false;
    this.setPage(this._defaultPagination);
  }

  /**
  * To change the records limit on page
  * @param limit number of records to dispaly on page
  * @return  void
  */

  onLimitChange(limit: any): void {
    this.viewedPages = [];
    this.currentPageLimit = this._defaultPagination.limit = this._defaultPagination.pageSize = parseInt(limit)
    this.setPage(this._defaultPagination);
  }

  /**
  * To fetch the records according to type(All, Archive, Sold, Active)
  * @param type type of records(All, Archive, Sold, Active)
  * @return  void
  */
  onChangeListType(type): void {
    this.viewedPages = [];
    this.page.type = type;
    this.setPage(this._defaultPagination);
  }

  /**
  * To sort the records according to selected option from sort by dropmenu
  * @param event event object which have column name and direction data
  * @return  void
  */

  onFilterSort(event): void {
    this.viewedPages = [];
    const sortingObject = event.target.value.split(',');
    this.page.sortProperty = sortingObject[0]
    this.page.sortDirection = sortingObject[1]
    //console.log('this.page',this.page); 
    this.setPage(this._defaultPagination);
  }

  /**
* To sort the records on dattable columns
* @param event event object which have column name and direction data
* @return  void
*/
  onSort(event): void {

    const sort = event.sorts[0];
    this.page.sortProperty = sort.prop
    this.page.sortDirection = sort.dir
    this.setPage(this._defaultPagination);
  }





  /**
   * Check date validations and filters records when select start date filter
   * @return  void
   */
  onStartDateSelected(event: any): void {
    let currentDate = new Date();
    // this.ngbDateParserFormatter.parse(event.year + "-" + (event.month-1).toString() + "-" + (event.day));
    let formattedStartDate = new Date(event.year, event.month - 1, event.day)





    if ((formattedStartDate).getTime() > (currentDate).getTime()) {
      this.dateFilterForm.patchValue({
        startDate: null,
      });
      this.commonUtilsService.onError('Start date should not be greater than today.');
      return;
    } else {
      this.datesFilter['start'] = new Date(event.year, event.month - 1, event.day + 1)
      this.datesFilter['startCurrent'] = new Date(event.year, event.month - 1, event.day)
      this.datesFilter['transformedStartDate'] = (this.datesFilter['start']).toISOString();
    }

    if (_.has(this.datesFilter, ['start']) && !_.has(this.datesFilter, ['end'])) {
      this.datesFilter['end'] = currentDate;
      this.datesFilter['endCurrent'] = currentDate
      this.datesFilter['transformedEndDate'] = (this.datesFilter['end']).toISOString();
    }

    this.validateDateFilters();
    //return this.ngbDateParserFormatter.parse(startYear + "-" + startMonth.toString() + "-" + startDay);      
  }
  /**
   * Check date validations and filters records when select end date filter
   * @return  void
   */
  onEndDateSelected(event: any): void {

    //this.ngbDateParserFormatter.parse(event.year + "-" + (event.month-1).toString() + "-" + (event.day));

    this.datesFilter['end'] = new Date(event.year, event.month - 1, event.day + 1)
    this.datesFilter['endCurrent'] = new Date(event.year, event.month - 1, event.day)

    this.datesFilter['transformedEndDate'] = (this.datesFilter['end']).toISOString();
    this.validateDateFilters();
  }

  /**
  * To validate date filters
  * @return  void
  */
  private validateDateFilters() {

    if (!_.has(this.datesFilter, ['start']))
      this.commonUtilsService.onError('Please select start date');
    else if (!_.has(this.datesFilter, ['end']))
      this.commonUtilsService.onError('Please select end date');
    else if (_.has(this.datesFilter, ['end']) && (this.datesFilter['endCurrent']).getTime() < (this.datesFilter['startCurrent']).getTime()) {
      this.dateFilterForm.patchValue({
        endDate: null,
      });
      this.commonUtilsService.onError('End date should not less than start date');

    } else {
      this.page.filters['dates'] = this.datesFilter;
      this.viewedPages = [];
      this.setPage(this._defaultPagination);
    }
  }
  /**
  * To clear date filters(inputs)
  * @return  void
  */
  clearDateFilters(): void {
    if (_.has(this.datesFilter, ['start']) || _.has(this.datesFilter, ['end'])) {
      this.dateFilterForm.patchValue({
        endDate: null,
        startDate: null,
      });
      this.page.filters['dates'] = this.datesFilter = {}
      this.viewedPages = [];
      delete this.page.filters['dates'];
      this.setPage(this._defaultPagination);
    }

  }
  /**
  * Show a popup modal
  * @param index    array index of selected car
  * @param type     which modal popup should show
  * Before delete, system confirm to delete the car. If yes opted then process deleting car else no action;
  // */
  //   show(carId):void {
  //     this.router.navigate(['/seller/car-bids',carId])


  //     // this.isBidsModalOpen = true 
  //     // this.carId = carId
  //   }




  show(carId): void {

    this.isBidListingModalOpen = true;
    this.selectedCarId = carId
  }
  /**
  * Reset modal popup to hide
  * @param isOpened    boolean value 
  * @return void
  */
  hide(isOpened: boolean): void {
    this.isModalOpen = isOpened
    this.isBidListingModalOpen = isOpened; //set to false which will reset modal to show on click again
  }



  showEditLocationPopup(carId): void {
    // console.log('carDetails', carId);
    this.isEditLocationModalOpen = true;
    this.selectedCarId = carId
  }

  /**
  * Reset modal popup to hide
  * @param isOpened    boolean value 
  * @return void
  */
  hideEditLocationPopup(isOpened: boolean): void {
    // console.log('carDetails', isOpened);
    this.isEditLocationModalOpen = isOpened; //set to false which will reset modal to show on click again
    this.selectedCarId = [];

  }

  /**
  * Change car status
  * @param $item    item is car object(selected) to delete
  * Before delete, system confirm to delete the car. If yes opted then process deleting car else no action;
  */
  changeCarStatus(car, type): void {
    this.deactivateCarData = {
      id: car._id,
      type: type,
    }
    console.log('the type is', type)
    if (car.totalBids && type == 'inactive') {
      this.isDeactivateResonModelOpen = true;
    } else {

      //Start process to delete car
      this.commonUtilsService.showPageLoader();

      //hit api to delete record from database
      this.carService.changeCarStatus(this.deactivateCarData).subscribe(

        //case success
        (response) => {

          this.setPage(this._defaultPagination);
          //this.setPage(this._defaultPagination,this.page.type);
          this.commonUtilsService.onSuccess(environment.MESSAGES.CAR_STATUS_CHANGED);

          //case error
        }, error => {
          this.commonUtilsService.onError(error);
        });
    }
  }

  /**
  * Delete a car
  * @param $item    item is car object(selected) to delete
  * Before delete, system confirm to delete the car. If yes opted then process deleting car else no action;
  */
  async delete(item) {

    //confirm before deleting car
    if (! await this.commonUtilsService.isDeleteConfirmed()) {
      return;
    }

    //manually create a data object which have the car unique id and seller id 
    const data = {
      id: item._id,
      seller_id: localStorage.getItem('loggedinUserId')
      // seller_id:"5cd170562688321559f12f32"

    }

    //Start process to delete car
    this.commonUtilsService.showPageLoader();

    //hit api to delete record from database
    this.carService.deleteCar(data).subscribe(

      //case success
      (response) => {

        let index = this.cars.indexOf(item, 0);
        if (index > -1)
          this.cars.splice(index, 1);
        this.cars = [...this.cars];
        //this.setPage(this._defaultPagination,this.page.type);
        this.commonUtilsService.onSuccess(environment.MESSAGES.RECORD_DELETED);

        //case error
      }, error => {
        this.commonUtilsService.onError(error);
      });
  }
  toggleExpandRow(row) {
    this.listingTable.rowDetail.toggleExpandRow(row);
  }

  onDetailToggle(event): void {
  }

  // This method must be present, even if empty.
  ngOnDestroy() {
    // To protect you, we'll throw an error if it doesn't exist.
  }






  /**
   * 
   * @param $event is the true value if the bid accept successfully!
   */
  acceptBid($event) {

    if ($event) {
      this.realTimeUpdate.updateRealTimeOnAcceptBid($event);
      this.page.type = 'accepted'
      this.isModalOpen = false
      this.isBidListingModalOpen = false; //set to false which will reset modal to sho
      this.setPage(this._defaultPagination);
    }
  }


  /**
     * 
     * @param $event is the true value if the bid accept successfully!
     */
  rejectBid($event) {
    if ($event) {
      this.isModalOpen = false
      this.isBidListingModalOpen = false; //set to false which will reset modal to sho
      this.setPage(this._defaultPagination);
    }
  }

  /**
   *  this will open chat modal popup and get all the chat history of seller and dealer
   * @param carId is the car id to get the chat according to this car seller
   */
  showChat(dealerObject, dealer_id: any) {
    console.log('dealer_id', dealer_id);
    if (!dealer_id) {
      this.commonUtilsService.onError('Dealer does not exist.');
      return false;
    }
    this.selectedChat = dealerObject.chat_id;
    this.messages = [];
    let self = this;
    this.sellerService.getChatDetails({ dealer_id: dealer_id }).subscribe(res => {
      let msgs = [];

      msgs = (res.chat == null) ? [] : res.chat.messages;
      this.messages = msgs //msgs.reverse();
      this.dealer = res.dealer;
      this.dealer['isOnline'] = self.isInArray(this.dealer.username);
      $(".chat_box").addClass("opend");
      $("#chatScroll").animate({ scrollTop: $('#chatScroll').prop("scrollHeight") }, 1000);


    })

  }


  /**
   * this will close the chat modal popup
   */
  chatClose() {
    $(".chat_box").removeClass("opend");
    this.messageBody = ''
    this.selectedChat = '';
  }

  /**
   * send message to seller if it is online and save it to the database too
   */
  sendMessage() {

    if (!this.messageBody || this.isSubmitted) return
    this.isSubmitted = true;
    let message = {
      dealer_id: this.dealer._id,
      messageBody: this.messageBody,
      message: this.messageBody,
      created_at: new Date(),
      isSeller: true,
      is_seller: true,

    }
    this.sellerService.saveMessage(message).subscribe(res => {

      this.messageBody = ''
      this.messages = res.msg.messages
      //this.messages.push(res.msg);
      $("#chatScroll").animate({ scrollTop: $('#chatScroll').prop("scrollHeight") }, 1000);
      this.isSubmitted = false;
      //let message = res.msg.messages;
      if (res.chatList) {
        this.chatDealers = res.chatList
      }
      if (this.isInArray(this.dealer.username)) {
        message['sendTo'] = this.users[this.users.map(user => user.username).indexOf(this.dealer.username)];
        console.log('message', message);
        this.realTimeUpdate.sendMessage(message)
      }
    }, error => {
      this.isSubmitted = false;
    })
  }


  // check weather the dealer is in user array or not
  isInArray(value) {
    if (this.users.length)
      return this.users.map(user => user.username).indexOf(value) > -1;
    else false
  }


  /**
 *  will be invoked if the seller has left a message for dealer
 * @param user is the seller whom dealer want to chat with
 */
  getSellerChat() {

    this.messages = [];
    this.sellerService.getSellerChatDetails({ dealer_id: this.dealer._id }).pipe(untilDestroyed(this)).subscribe(res => {
      console.log('response', res);
      let msgs = [];
      msgs = res.chat.messages;
      this.messages = msgs //msgs.reverse();
      this.dealer = res.dealer;


      // this.seller = res.seller;
      this.dealer['isOnline'] = this.isInArray(this.dealer.username);
      $(".chat_box").addClass("opend");
      $("#chatScroll").animate({ scrollTop: $('#chatScroll').prop("scrollHeight") }, 1000);

    })

  }
  /**
   * will save the page State
   */
  savePageType() {

    this.sharedService.setPageTypeState({ page: this.page })

  }


  applySearch() {

    console.log('hiiiiiiiiiii')
    $(".search_suggestions").show();
  }

  getSeaches() {
    let search = {
      search_type: 'listing'
    }
    this.sellerService.getSearches(search).pipe(untilDestroyed(this)).subscribe(val => {
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
    this.page.search_type = 'listing';
    this.sellerService.saveSearch(this.page).subscribe(val => {
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
    this.selectedSearch = search;
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
    this.sellerService.removeSearch(searchId).pipe(untilDestroyed(this)).subscribe(val => {

      this.getSeaches();
      this.searchApplied = false
      this.commonUtilsService.onSuccess(environment.MESSAGES.SEARCH_REMOVED)

    }, error => {
      this.commonUtilsService.onError(error);
    })
  }
  chatDealersListing() {
    this.sellerService.chatDealersListing().pipe(untilDestroyed(this)).subscribe(res => {
      this.chatDealers = res
      console.log('chatDealers', this.chatDealers);
    }, error => {
      console.log('error', error);
      //this.isSubmitted = false;
    })
  }


  /**
   * 
   * @param value is car 
   */
  public relistCar(car: any): void {

      this.carService.relistCar(car._id).subscribe(response=>{
                this.commonUtilsService.onSuccess('The car has been re-listed successfully.');
                this.page.type = 'active';
                this.setPage(this._defaultPagination);
      },error=>{
        this.commonUtilsService.onError(error);
      })

  }
  /**
   * 
   * @param value 
   */
  submitDeactivateReason(value) {


    console.log('the resaon is', value)
    this.isDeactivateResonModelOpen = false;
    this.commonUtilsService.showPageLoader();
    this.deactivateCarData['reason'] = value
    //hit api to delete record from database
    this.carService.changeCarStatus(this.deactivateCarData).pipe(untilDestroyed(this)).subscribe(

      //case success
      (response) => {

        this.setPage(this._defaultPagination);
        //this.setPage(this._defaultPagination,this.page.type);
        this.commonUtilsService.onSuccess(environment.MESSAGES.CAR_STATUS_CHANGED);

        //case error
      }, error => {
        this.commonUtilsService.onError(error);
      });

  }
  cancelSubmit(value) {
    this.isDeactivateResonModelOpen = false;
  }


  chatHistoryClose() {
    $("#sellerChatListing").removeClass("opend");
    this.chatClose();
  }

}