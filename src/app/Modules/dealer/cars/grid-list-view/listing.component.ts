import { Component, OnInit, NgZone, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { untilDestroyed } from 'ngx-take-until-destroy';// unsubscribe from observables when the component destroyed
import Swal from 'sweetalert2/dist/sweetalert2.js'
//modules services, models and enviornment file
import { TitleService, CarService, RealUpdateService, CommonUtilsService, SharedService, DealerService } from '../../../../core/_services'
import { PagedData, Car, Page } from "../../../../core/_models";
import { environment } from '../../../../../environments/environment'


declare let jQuery: any;
declare let $: any;
declare let POTENZA: any;
import * as _ from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { retry } from 'rxjs-compat/operator/retry';

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.css'],
})
export class ListingComponent implements OnInit {
  @ViewChild("listingSection") listingSection: ElementRef;
  @ViewChild("searchNameModal") searchNameModal: ElementRef;

  page = new Page(); //object of Page type  
  cars = new Array<Car>() //array of Car type 
  car: any;
  dealerPaymentDetails: any;
  filtersForm: FormGroup;
  dateFilterForm: FormGroup;
  searchNameForm: FormGroup;
  isGridListing: boolean = true; //set boolean value to show/hide listing (grid/list)
  searchApplied: boolean = false;
  showsaveSearch: boolean = false;
  isSearchModelOpen: boolean = false;
  isMemberShipModelOpen: boolean = false;
  isBidModalOpen: boolean = false;
  isAddPaymentMethodModal: boolean = false;
  isPlaceBidModalOpen: boolean = false;
  placebid_price: any; ///the custom price
  modalType: any;
  submitted: boolean = false;
  searchData: any;
  search: string = '';
  selectedSearch: any;
  viewedPages: any = []; //array of page number which have been reviewed by user
  currentPage: number = 0;
  dealerShips: any = [];
  yearsRange: any = []
  makes: any = []
  models: any = []
  trims: any = [];
  todayDate = new Date();
  bodyStyles: any = [{ name: "2 Door Convertible" }, { name: "2 Door Coupe" }, { name: "4 Door Sedan" }];
  transmissions: any = [{ name: "Automated-Manual" }, { name: "Continuously Variable Transmission" }, { name: "Dual-Clutch Transmission" }];
  interiorColors = [{ label: 'Beige', value: '#F5F5DC' }, { label: 'Black', value: '#252627' }, { label: 'Brown', value: '#672E10' }, { label: 'Burgundy', value: '#75141C' }, { label: 'Charcoal Grey', value: '#757776' }, { label: 'Dark Blue', value: '#172356' }, { label: 'Dark Green', value: '#316241' }, { label: 'Gold', value: '#D6C17F' }, { label: 'Grey', value: '#808080' }, { label: 'Light Blue', value: '#5F7DC5' }, { label: 'Light Green', value: '#8E9F87' }, { label: 'Orange', value: '#FF9200' }, { label: 'Purple', value: '#6A4574' }, { label: 'Red', value: '#E32F43' }, { label: 'Silver', value: '#D4D9DC' }, { label: 'Tan', value: '#D2B48C' }, { label: 'White', value: '#F2F6F9' }, { label: 'Yellow', value: '#F8E81C' }];

  exteriorColors = [{ label: 'Beige', value: '#F5F5DC' }, { label: 'Black', value: '#252627' }, { label: 'Brown', value: '#672E10' }, { label: 'Burgundy', value: '#75141C' }, { label: 'Charcoal Grey', value: '#757776' }, { label: 'Dark Blue', value: '#172356' }, { label: 'Dark Green', value: '#316241' }, { label: 'Gold', value: '#D6C17F' }, { label: 'Grey', value: '#808080' }, { label: 'Light Blue', value: '#5F7DC5' }, { label: 'Light Green', value: '#8E9F87' }, { label: 'Orange', value: '#FF9200' }, { label: 'Purple', value: '#6A4574' }, { label: 'Red', value: '#E32F43' }, { label: 'Silver', value: '#D4D9DC' }, { label: 'Tan', value: '#D2B48C' }, { label: 'White', value: '#F2F6F9' }, { label: 'Yellow', value: '#F8E81C' }];
  isAllBodySelected: boolean = false;
  isAllTransmissionSelected: boolean = false;
  isAllInteriorColorSelected: boolean = false;
  isAllExtriorColorSelected: boolean = false;
  isAllTrimSelected: boolean = false;
  yearFilterOption: string = '';
  datesFilter: any = {};
  AllFilters = []
  appDate = "2019-10-12T12:38:25.960Z"
  //default pagination, limit(records on per page) settings
  currentPageLimit: number = environment.DEFAULT_RECORDS_LIMIT
  readonly paginationLinks: number = 1//environment.DEFAULT_PAGES_PAGINATION   //Defines the maximum number of page links to display 
  readonly pageLimitOptions = environment.DEFAULT_PAGE_LIMIT_OPTIONS
  private _defaultPagination = {
    count: 0,
    limit: this.currentPageLimit,
    offset: 0,
    pageSize: this.currentPageLimit
  }

  //year & price 
  private _year
  private _price

  //title and breadcrumbs
  readonly title: string = 'Auction Listing';
  readonly breadcrumbs: any[] = [{ page: 'Home', link: '/dealer/home' }, { page: 'Auction Listing', link: '' }]


  constructor(private realTimeUpdate: RealUpdateService, private activatedRoute: ActivatedRoute, private dealerService: DealerService, private sharedService: SharedService, private ngbDateParserFormatter: NgbDateParserFormatter, private commonUtilsService: CommonUtilsService, private carService: CarService, private formBuilder: FormBuilder, private ngZone: NgZone, private titleService: TitleService) {
    //fetching the data with default settings
    this.currentPage = 0
    if ('type' in this.activatedRoute.snapshot.params) {
      this.isGridListing = false
    }


    this.realTimeUpdate.updateLsiting().subscribe(res => {
      this.loadRealTimeLsiting() // this willbe called after real time updation of listing
    })


    //update will be invoked on acception of bid from seller side
    this.realTimeUpdate.updateLsitingOnBidAcception().subscribe((res:any) => {
      let dealerid = localStorage.getItem('loggedinUserId');
      if(dealerid.toString() == res.data.toString()){
        this.page.type='transactions';
        this.loadRealTimeLsiting() // this willbe called after real time updation of listing
        
      } else{
        this.loadRealTimeLsiting() // this willbe called after real time updation of listing
      }
    })


    this.realTimeUpdate.saveUserOnSocketIo();
    //setting the page title
    this.titleService.setTitle();

    this.dateFilterForm = this.formBuilder.group({
      startDate: [null, null],
      endDate: [null, null]
    });
    this.page.filters = {}
    this.sharedService.pageFilter.subscribe(data => {

      if (!$.isEmptyObject(data.filters)) {

        if (_.has(data.filters, ['year'])) {
          this.setFilters(data.filters['year'][0], 'year')
          let componentRefrence = this
          console.log('year', data.filters['year'][0]);
          $.getJSON(`${environment.VEHICLE_STATS_API.ENDPOINT}/?callback=?`, { cmd: "getMakes", year: data.filters['year'][0] }, function (data) {
            console.log('data', data);
            componentRefrence.makes = data.Makes || [];
          });
        }

        if (_.has(data.filters, ['make'])) {

          let option = data.filters['make'][0].toLowerCase();
          this.setFilters(option, 'make')

          let componentRefrence = this
          $.getJSON(`${environment.VEHICLE_STATS_API.ENDPOINT}/?callback=?`, { cmd: "getModels", make: data.filters['make'][0], year: data.filters['year'][0], sold_in_us: 1 }, function (data) {

            console.log('Models', data.Models);
            componentRefrence.models = data.Models || [];
          });
        }
        if (_.has(data.filters, ['model'])) {

          let option = data.filters['model'][0].toLowerCase();
          this.setFilters(option, 'model')
          let componentRefrence = this
          $.getJSON(`${environment.VEHICLE_STATS_API.ENDPOINT}/?callback=?`, { cmd: "getTrims", model: data.filters['model'][0], make: data.filters['make'][0], min_year: data.filters['year'][0], sold_in_us: 1 }, function (data) {
            componentRefrence.trims = []
            let allTrims = [];
            let trimData = data.Trims || [];
            (trimData).forEach(element => {
              if (allTrims.indexOf(element.model_trim) == -1) {
                allTrims.push(element.model_trim);
                (componentRefrence.trims).push(element)
              }
            });
          })


        }
        this.page['filters'] = data.filters
        //this.sharedService.setPageFilterState({filters:{}});   
      }
      this.getPaymentMethod();
      this.getAllDealShips()
      this.setPage(this._defaultPagination, 'all');

    })


  }

  ngOnInit() {

    //calling filters form initlization method
    this.initalizeFilterForm();
    this.getSearches()

  }


  getAllDealShips() {

    this.dealerShips = [];
    this.dealerService.getAllDealShips().pipe(untilDestroyed(this)).subscribe((response: any) => {
      this.dealerShips = response;
      // this.legalContacts = this.dealerShips[0].legal_contacts;
    }, error => {
      this.commonUtilsService.onError(error);
    })

  }

  /**
  * component life cycle default method, runs after view page initlization
  * @return void
  */
  ngAfterViewInit(): void {
    let currentYear = new Date().getFullYear();
    //initalize the price & year slider on view page

    POTENZA.featurelist()
    this.onApplyingFilters()
    for (var i = 0; i < 15; i++) {
      this.yearsRange.push({
        label: currentYear - i,
        value: currentYear - i
      });
    }

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
    // this.yearsRange = this.commonUtilsService.createYearRange();    
  }

  /**
  * Filters records when user click on 'Apply Filters' button
  * @return  void
  */
  private onApplyingFilters(): void {

    let componentRefrence = this //assign the component object to use with jquery 

    //when we stop price slider
    $("#price-range").on("slidestop", function (event, ui) {
      componentRefrence.page.filters['price_range'] = [ui.values[0], ui.values[1]]
      componentRefrence.viewedPages = [];
      componentRefrence.currentPage = 0
      componentRefrence.setPage(componentRefrence._defaultPagination, componentRefrence.page.type);
    });

    //when we stop year slider
    $("#year-range").on("slidestop", function (event, ui) {
      componentRefrence.page.filters['year_range'] = [ui.values[0], ui.values[1]]
      componentRefrence.viewedPages = [];
      componentRefrence.currentPage = 0
      componentRefrence.setPage(componentRefrence._defaultPagination, componentRefrence.page.type);
    });

    $("#year-range").on("slide", function (event, ui) {
      componentRefrence.year = ui.values[0] + " - " + ui.values[1]
    });
    $("#price-range").on("slide", function (event, ui) {
      componentRefrence.price = "$" + ui.values[0] + " - " + '$' + ui.values[1]
    });

  }

  /**
  * change listing type list/grid
  * @return void
  */
  onChangeListingType(listingType: string): void {
    this.isGridListing = (listingType == 'list') ? false : true
  }

  /**
  * initializing filters form 
  * @return void
  */
  private initalizeFilterForm(): void {
    this.filtersForm = this.formBuilder.group({
      /*amount: ['$100 - $100000'],*/
      years: ['2010 - 2019']
    })
    this.searchNameForm = this.formBuilder.group({
      searchName: ['', Validators.required]
    });
  }

  /**
   * Populate the table with new data based on the page number
   * @param page The page to select
   * @param type Result type (All, Active, Archived)
  */
  setPage(page, type) {

    this.page.type = type;
    this.page.pageNumber = page.offset;
    this.page.size = page.pageSize;

    //Do not show page loader if fetching results using search
    if (!this.page.search) {
      this.commonUtilsService.showPageLoader();
    }

    //hit api to fetch data
    this.carService.listingDealersCars(this.page).subscribe(

      //case success
      (pagedData) => {
        this.ngZone.run(() => {
          this.page = pagedData.page;
          this.cars = pagedData.data
        });
        console.log('the cars are', this.cars)
        if (pagedData.data.length > 0 && (Object.keys(this.page.filters).length || this.page.search.length)) {
          console.log('hi iam hit by kkkkkkkkkkkkk')
          this.showsaveSearch = true;

        } else {
          this.searchApplied = false;
          this.showsaveSearch = false;

        }

        this.commonUtilsService.hidePageLoader();
        this.listingSection.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });

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
    // console.log('hi');
    this.viewedPages = [];
    this.currentPage = 0
    this.page.search = searchValue;
    this.searchApplied = false;
    this.setPage(this._defaultPagination, this.page.type);
  }

  onPageChange(pageNumber: number) {
    console.log('pageNumber', pageNumber);
    this.currentPage = pageNumber
    console.log('currentPage', this.currentPage);
    this.setPage({ offset: pageNumber - 1, pageSize: this.currentPageLimit }, this.page.type)
  }

  /**
   * To change the records limit on page
   * @param limit number of records to dispaly on page
   * @return  void
  */

  onLimitChange(limit: any): void {
    this.viewedPages = [];
    this.currentPage = 0
    this.currentPageLimit = this._defaultPagination.limit = this._defaultPagination.pageSize = parseInt(limit)
    this.setPage(this._defaultPagination, this.page.type);
  }

  /**
   * To fetch the records according to type(All, Archive, Sold, Active)
   * @param type type of records(All, Archive, Sold, Active)
   * @return  void
   */
  onChangeListType(type): void {
    this.viewedPages = [];
    this.setPage(this._defaultPagination, type);
  }
  /**
   * To sort the records
   * @param event event object which have column name and direction data
   * @return  void
  */
  onSort(event): void {
    if (event.target.value) {
      const sortingObject = event.target.value.split(',');
      this.page.sortProperty = sortingObject[0]
      this.page.sortDirection = sortingObject[1]
    } else {
      this.page.sortProperty = 'desc'
      this.page.sortDirection = 'created_at'
    }
    this.currentPage = 0
    this.viewedPages = [];
    this.setPage(this._defaultPagination, this.page.type);
  }

  /**
  * get & set method of private property named year.
  * @return     year
  */
  get year(): string {
    return this._year;
  }

  /**
  * set year.
  * @param year    string(year range) which is selected by user.
  */
  set year(year: string) {
    this._year = year;
    console.log('this._year', this._year)
    this.filtersForm.controls['years'].patchValue(this._year);
  }

  /**
  * get & set method of private property named price.
  * @return     Star price selected by user .
  */
  get price(): string {
    return this.price;
  }

  /**
  * set price.
  * @param price    string(price range) which is selected by user.
  */
  set price(price: string) {
    this._price = price;
    console.log('this._price', this._price)
    this.filtersForm.controls['amount'].patchValue(this._price);
  }

  /**
   * set filters
   * @param option value of filter
   * @param filter name of filter
   * @return  void
  */
  setFilters(option, filter): void {
    delete this.page.filters[filter]; //for single selection
    let options = (_.has(this.page.filters, [filter])) ? this.page.filters[filter] : [];
    let index = options.indexOf(option);
    (index >= 0) ? _.pullAt(options, [index]) : options.push(option)
    this.page.filters[filter] = options;
    console.log('filter', filter);
    console.log('filters', this.page.filters)
    if (filter == 'year' && _.has(this.page.filters, ['year']) && !this.page.filters['year'].length) {
      delete this.page.filters['make'];
      delete this.page.filters['model'];
      delete this.page.filters['trim'];
      $('#makeFilter, #modelFilter, #trimFilter').slideUp()
    }
    if (filter == 'make' && _.has(this.page.filters, ['make']) && !this.page.filters['make'].length) {
      delete this.page.filters['model'];
      delete this.page.filters['trim'];
      $('#modelFilter, #trimFilter').slideUp()
    }
    if (filter == 'model' && _.has(this.page.filters, ['model']) && !this.page.filters['model'].length) {
      delete this.page.filters['trim'];
      $('#trimFilter').slideUp()
    }

    console.log(this.page.filters);
  }

  CustomizeFiltersObject(): any {
    return Object.keys(this.page.filters);
  }
  removeFilter(event) {

    console.log(event.target.dataset.key, typeof event.target.dataset.value);
    let index = '';
    if (event.target.dataset.key == 'year') {
      index = this.page.filters[event.target.dataset.key].indexOf(parseInt(event.target.dataset.value));
      console.log('year filter', this.page.filters[event.target.dataset.key]);
    } else {
      index = this.page.filters[event.target.dataset.key].indexOf(event.target.dataset.value);
      console.log('year filter else', this.page.filters[event.target.dataset.key]);
    }

    console.log('index', index);
    _.pullAt(this.page.filters[event.target.dataset.key], [index])
    console.log(typeof this.page.filters[event.target.dataset.key][0])
    this.resetAll(event.target.dataset.key, event.target.dataset.value)
  }

  /**
   * Filter data according to year and fetch makes also
   * @param option value of filter
   * @param filter name of filter
   * @return  void
  */
  vehicleStatisticsByYear(option, filter): void {
    this.setFilters(option, filter)
    let componentRefrence = this
    console.log('year', this.page.filters[filter][0]);
    $.getJSON(`${environment.VEHICLE_STATS_API.ENDPOINT}/?callback=?`, { cmd: "getMakes", year: this.page.filters[filter][0] }, function (data) {

      console.log('data', data);
      componentRefrence.makes = data.Makes || []
      componentRefrence.currentPage = 0
      componentRefrence.setPage(componentRefrence._defaultPagination, componentRefrence.page.type);
    });
    /*
    //hit api to fetch data
    this.commonUtilsService.getVehicleStatisticsByMultipleyear({ year: this.page.filters[filter]}).subscribe(
      //case success
    (response) => { 
      let makes = []; 
      response.forEach(element => {        
        (element.makes).forEach(element => {
          makes.push(element)
        });
      });
      this.makes = makes;  
      this.viewedPages = [];
      this.currentPage = 0
      this.setPage(this._defaultPagination,this.page.type);     
    //case error 
    },error => {    
      this.commonUtilsService.onError(error);
    });*/
  }


  /**
   * Filter data according to make and fetch models also
   * @param option value of filter
   * @param filter name of filter
   * @return  void
  */
  vehicleStatisticsByMake(optionVal, filter): void {
    let option = optionVal.toLowerCase();
    this.setFilters(option, filter)

    let componentRefrence = this
    $.getJSON(`${environment.VEHICLE_STATS_API.ENDPOINT}/?callback=?`, { cmd: "getModels", make: this.page.filters[filter][0], year: this.page.filters['year'][0], sold_in_us: 1 }, function (data) {

      console.log('Models', data.Models);
      componentRefrence.models = data.Models || []
      componentRefrence.currentPage = 0
      componentRefrence.setPage(componentRefrence._defaultPagination, componentRefrence.page.type);
    });
    /*
    //hit api to fetch data
    this.commonUtilsService.getVehicleStatisticsByMultiplemake({ make: this.page.filters[filter]}).subscribe(
      //case success
    (response) => { 
      let models = []; 
      response.forEach(element => {    
        console.log('element',element);    
        (element.makes).forEach(element => {        
          (element.models).forEach(element => {
            models.push(element)
          });
        });
      });
      this.models = models;  
      this.viewedPages = [];
      this.currentPage = 0
      this.setPage(this._defaultPagination,this.page.type);     
    //case error 
    },error => {    
      this.commonUtilsService.onError(error);
    });*/
  }



  /**
   * Filter data accoding to make and fetch trims also
   * @param option value of filter
   * @param filter name of filter
   * @return  void
  */
  vehicleStatisticsByModel(optionVal, filter): void {
    let option = optionVal.toLowerCase();
    this.setFilters(option, filter)
    let componentRefrence = this
    $.getJSON(`${environment.VEHICLE_STATS_API.ENDPOINT}/?callback=?`, { cmd: "getTrims", model: this.page.filters[filter][0], make: this.page.filters['make'][0], min_year: this.page.filters['year'][0], sold_in_us: 1 }, function (data) {
      componentRefrence.trims = []
      let allTrims = [];
      let trimData = data.Trims || [];
      (trimData).forEach(element => {
        if (allTrims.indexOf(element.model_trim) == -1) {
          allTrims.push(element.model_trim);
          (componentRefrence.trims).push(element)
        }
      });
      componentRefrence.currentPage = 0
      componentRefrence.setPage(componentRefrence._defaultPagination, componentRefrence.page.type);
    });
    /*
    //hit api to fetch data
    this.commonUtilsService.getVehicleStatisticsByMultiplemodel({ model: this.page.filters[filter]}).subscribe(
      //case success
    (response) => { 
      let trims = []; 
      response.forEach(element => {    
        console.log('element',element);    
        (element.makes).forEach(element => {        
          (element.models).forEach(element => {
            (element.trims).forEach(element => {
              trims.push(element)
            });
          });
        });
      });
      this.trims = trims;  
      this.viewedPages = [];
      this.currentPage = 0
      this.setPage(this._defaultPagination,this.page.type);     
    //case error 
    },error => {    
      this.commonUtilsService.onError(error);
    });*/
  }

  /**
   * Set all select options to uncheck and check 'All'
   * @param filter name of filter
   * @return  void
  */

  resetAll(filter, keyName = ''): void {
    console.log('keyName', typeof keyName);
    if (!keyName.length) delete this.page.filters[filter];

    if (filter == 'interior_color') {
      if (!keyName.length) this.isAllInteriorColorSelected = true
      this.interiorColors.forEach(element => {
        if (keyName.length) {
          console.log('element.name', element.label);
          if (element.label == keyName) {
            element['checked'] = false
            console.log('element', element);
            return false;
          }
        } else {
          element['checked'] = false
        }

      });
    }
    if (filter == 'exterior_color') {
      if (!keyName.length) this.isAllExtriorColorSelected = true
      this.exteriorColors.forEach(element => {
        if (keyName.length) {
          if (element.label == keyName) {
            element['checked'] = false
            return false;
          }
        } else {
          element['checked'] = false
        }
      });
    }
    if (filter == 'transmission') {
      if (!keyName.length) this.isAllTransmissionSelected = true
      this.transmissions.forEach(element => {
        if (keyName.length) {
          if (element.name == keyName) {
            element['checked'] = false
            return false;
          }
        } else {
          element['checked'] = false
        }
      });
    }
    if (filter == 'body_style') {
      if (!keyName.length) this.isAllBodySelected = true
      this.bodyStyles.forEach(element => {
        if (keyName.length) {
          if (element.name == keyName) {
            element['checked'] = false
            return false;
          }
        } else {
          element['checked'] = false
        }
      });
    }
    if (filter == 'trim') {
      if (!keyName.length) this.isAllBodySelected = true
      this.trims.forEach(element => {
        if (keyName.length) {
          if (element.name == keyName) {
            element['checked'] = false
            return false;
          }
        } else {
          element['checked'] = false
        }
      });
    }

    if (filter == 'year') {
      // if(!keyName.length) this.isAllBodySelected = true
      if (!this.page.filters['year'].length || !this.page.filters['make'].length || !this.page.filters['model'].length) {
        this.searchApplied = false;
        delete this.page.filters['year'];
        delete this.page.filters['make'];
        delete this.page.filters['model'];
        delete this.page.filters['trim'];
        $('#makeFilter, #modelFilter, #trimFilter').slideUp()
      }

      this.yearsRange.forEach(element => {
        if (keyName.length) {
          console.log('element.name', element);
          if (element.label == keyName) {
            element['checked'] = false
            console.log('element', element);
            return false;
          }
        } else {
          element['checked'] = false
        }
      });
      console.log('yearsRange', this.yearsRange);
    }

    if (filter == 'make') {
      if (!this.page.filters['year'].length || !this.page.filters['make'].length || !this.page.filters['model'].length) {
        delete this.page.filters['model'];
        delete this.page.filters['trim'];
        $('#makeFilter, #modelFilter, #trimFilter').slideUp()
      }
      //if(!keyName.length) this.isAllBodySelected = true
      this.makes.forEach(element => {
        if (keyName.length) {
          if (element.name == keyName) {
            element['checked'] = false
            return false;
          }
        } else {
          element['checked'] = false
        }
      });
    }

    if (filter == 'model') {
      if (!this.page.filters['year'].length || !this.page.filters['make'].length || !this.page.filters['model'].length) {
        delete this.page.filters['trim'];
        $('#makeFilter, #modelFilter, #trimFilter').slideUp()
      }
      //if(!keyName.length) this.isAllBodySelected = true
      this.models.forEach(element => {
        if (keyName.length) {
          if (element.name == keyName) {
            element['checked'] = false
            return false;
          }
        } else {
          element['checked'] = false
        }
      });
    }


    this.viewedPages = [];
    this.currentPage = 0
    this.setPage(this._defaultPagination, this.page.type);
    this.getSearches();

  }

  /**
   * Set all select options to uncheck and fetch records accordingly
   * @param filter name of filter
   * @return  void
  */
  uncheckAllFetchRecords(option, filter): void {
    if (filter == 'interior_color') this.isAllInteriorColorSelected = false

    if (filter == 'exterior_color') this.isAllExtriorColorSelected = false

    if (filter == 'transmission') this.isAllTransmissionSelected = false

    if (filter == 'body_style') this.isAllBodySelected = false

    if (filter == 'trim') this.isAllTrimSelected = false

    this.setFilters(option, filter)

    this.viewedPages = [];
    this.currentPage = 0
    this.setPage(this._defaultPagination, this.page.type);
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
      // seller_id:'5cd170562688321559f12f32' 

    }

    //Start process to delete car
    this.commonUtilsService.showPageLoader();

    //hit api to delete record from database
    this.carService.deleteCar(data).subscribe(

      //case success
      (response) => {

        let index = this.cars.indexOf(item, 0);
        if (index > -1) this.cars.splice(index, 1);

        this.setPage({ offset: this.page.pageNumber, pageSize: this.currentPageLimit }, this.page.type)
        this.commonUtilsService.onSuccess(environment.MESSAGES.RECORD_DELETED);

        //case error
      }, error => {
        this.commonUtilsService.onError(error);
      });
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
      this.setPage(this._defaultPagination, this.page.type);
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
      this.setPage(this._defaultPagination, this.page.type);
    }

  }

  /**
    * To choose the option from year dropdown from leftside filters
    * @return  void
  */
  changeYear(event): void {
    this.yearFilterOption = event.target.value
  }

  //save the pagefilters to maintain the state

  savePageFilters() {
    this.sharedService.setPageFilterState({ filters: this.page.filters });
  }
  applySearch() {

    console.log('hiiiiiiiiiii')
    $(".search_suggestions").show();
  }

  getSearches() {
    let search = {
      search_type: 'listing'
    }
    this.dealerService.getSearches(search).subscribe(val => {
      this.searchData = val;
    }, error => {
      this.commonUtilsService.onError(error);
    })
  }

  /**
   * save search willbe called once the user save the search
   */
  saveSearch() {
    this.isSearchModelOpen = true;

  }

  submitSearch(value: any) {

    this.page.searchName = value.searchName;
    this.page.search_type = 'listing';
    this.dealerService.saveSearch(this.page).subscribe(val => {
      this.getSearches();
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
    // if ('filters' in search)
    let allsearch = search.filters;
    console.log('the search is' + JSON.stringify(search))
    this.page.filters = Object.assign({}, search.filters);;
    console.log('the page is', this.page)
    this.setPage(this._defaultPagination, 'all');
    this.searchApplied = true;
    $(".search_suggestions").hide();


  }
  /**
   * remove search from the db
   */
  removeSearch(searchId: any) {
    this.dealerService.removeSearch(searchId).subscribe(val => {
      this.searchApplied = false
      this.getSearches();
      this.commonUtilsService.onSuccess(environment.MESSAGES.SEARCH_REMOVED)

    }, error => {
      this.commonUtilsService.onError(error);
    })
  }

  setTimmer(i) {
    // Set the date we're counting down to
    var countDownDate = new Date("Jan 5, 2021 15:37:25").getTime();

    // Update the count down every 1 second
    var x = setInterval(function () {

      // Get today's date and time
      var now = new Date().getTime();

      // Find the distance between now and the count down date
      var distance = countDownDate - now;

      // Time calculations for days, hours, minutes and seconds
      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // Output the result in an element with id="demo"
      $("#tim" + i).innerHTML = days + "d " + hours + "h "
        + minutes + "m " + seconds + "s ";

      // If the count down is over, write some text 
      if (distance < 0) {
        clearInterval(x);
        $("#tim" + i).innerHTML = "EXPIRED";
      }
    }, 1000);
  }

  closeBidModal(event) {
    this.isBidModalOpen = false;
  }
  onBidSuccess(event) {
    this.isBidModalOpen = false;
    this.isPlaceBidModalOpen = false;
    this.page.type = "applied";
    this.setPage(this._defaultPagination, 'applied');
  }

  increaseBidPrice(car) {
    // this.car.placebid_price;
    let user = JSON.parse(localStorage.getItem('loggedinUser'));
    // if (user.membership_type == 'free') {
    //   this.isMemberShipModelOpen = true;
    //   return
    // }
    console.log('the bid price is' + car.placebid_price);
    let minPrice = car.higest_bid ? (car.higest_bid + 100) : (car.vehicle_finance_details.vehicle_min_selling_price ? (75 / 100) * (car.vehicle_finance_details.vehicle_min_selling_price) : 100);
    if (minPrice > car.placebid_price) {
      this.commonUtilsService.onError(environment.MESSAGES.BID_PRICE_LESS);
      return
    }
    if (!this.dealerPaymentDetails.payment_details.length) {
      this.isAddPaymentMethodModal = true;
      return
    }
    if (this.dealerShips.length < 1) {
      this.commonUtilsService.onError(environment.MESSAGES.DEALERSHIP_ACIVATED);
      return

    }
    if (this.dealerShips.length > 1) {
      this.isPlaceBidModalOpen = true;
      this.car = car;

    } else {
      this.car = car;
      this.modalType = 'bid'
      this.isBidModalOpen = true;
    }

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
    //  let minPrice = car.higest_bid ? (car.higest_bid +100) :(car.vehicle_finance_details.vehicle_min_selling_price  ? (75 /100)*(car.vehicle_finance_details.vehicle_min_selling_price) : 100);
    //  if(minPrice > car.placebid_price){
    //    this.commonUtilsService.onError(environment.MESSAGES.BID_PRICE_LESS);
    //    return
    //  }
    this.car = car;
    this.modalType = 'proxy'
    this.isBidModalOpen = true;
  }
  cancelUpdateBid(event) {
    this.isBidModalOpen = false;
  }
  closePlaceBidModal(event) {
    this.isPlaceBidModalOpen = false;
  }



  /**
   * 
   * @param event when member ship modal closes 
   */
  cancelMembershipModal(event: any) {
    this.isMemberShipModelOpen = false;
  }
 /**
   * hide modal popup of no add payment method
   * @param event is the modal close value
   */
  hideAddPaymentModal(event) {
    this.isAddPaymentMethodModal = false;

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
 * check weather the dealer has payment method added
 */
  getPaymentMethod(): any {
    //check weather the dealer has payment method added or not
    this.dealerService.checkDealerPaymentMethod({}).subscribe(response => {
      this.dealerPaymentDetails = response;
    })
  }
  ngOnDestroy() {

  }


  changeStatusToSold(car:any):void{

    Swal.fire({
          title: 'Are you sure you want to change car status to sold?',
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, Update!',
          cancelButtonText: 'Cancel'
        }).then((result) => {
          if (result.value) {
            this.carService.changeCarStatustoSold(car._id).subscribe((response)=>{
              this.commonUtilsService.onSuccess('The cas status has been changed to sold.');
              this.page.type = 'purchased';
              this.setPage(this._defaultPagination,'purchased');
           },error=>{
             this.commonUtilsService.onError(error);
           })
          }
        })

  
  }

}
