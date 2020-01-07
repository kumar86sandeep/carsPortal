import { Component, OnInit, NgZone, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from "@angular/router";
import { NgbDateAdapter, NgbDateStruct, NgbDateParserFormatter, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';


//modules services, models and enviornment file
import { TitleService, CarService, SellerService, CommonUtilsService, SharedService, RealUpdateService } from '../../../../core/_services'
import { PagedData, Car, Page } from "../../../../core/_models";
import { environment } from '../../../../../environments/environment'


declare let jQuery: any;
declare let $: any;
declare let POTENZA: any;
import * as _ from 'lodash';

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.css'],
})
export class ListingComponent implements OnInit {
  @ViewChild("listingSection") listingSection: ElementRef;
  page = new Page(); //object of Page type
  cars = new Array<Car>() //array of Car type 
  filtersForm: FormGroup;
  dateFilterForm: FormGroup;
  searchApplied: boolean = false;
  showsaveSearch: boolean = false;
  isSearchModelOpen: boolean = false;
  isDeactivateResonModelOpen: boolean = false;
  searchData: any;
  deactivateCarData:any;
  search: string = '';
  selectedSearch: any;
  isGridListing: boolean = true; //set boolean value to show/hide listing (grid/list)
  viewedPages: any = []; //array of page number which have been reviewed by user
  currentPage: number = 0;
  yearsRange: any = []
  makes: any = []
  models: any = []
  trims: any = []
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

  //default pagination, limit(records on per page) settings
  currentPageLimit: number = environment.DEFAULT_RECORDS_LIMIT
  readonly paginationLinks: number = 1//environment.DEFAULT_PAGES_PAGINATION   //Defines the maximum number of page links to display 
  readonly pageLimitOptions = environment.DEFAULT_PAGE_LIMIT_OPTIONS
  private _defaultPagination = {
    count: 0,
    limit: this.currentPageLimit,
    offset: 1,
    pageSize: this.currentPageLimit
  }

  //year & price 
  private _year
  private _price
  isBidsModalOpen: boolean = false;
  isModalOpen: boolean = false;
  selectedCarId: any;
  isBidListingModalOpen: boolean = false;
  isEditListingModalOpen: boolean = false;

  isEditLocationModalOpen: boolean = false;
  //title and breadcrumbs
  readonly title: string = 'Auction Listing';
  readonly breadcrumbs: any[] = [{ page: 'Home', link: '/seller/home' }, { page: 'Auction Listing', link: '' }]


  constructor(private activatedRoute: ActivatedRoute, private sellerService: SellerService, private sharedService: SharedService, private realTimeUpdate: RealUpdateService, private ngbDateParserFormatter: NgbDateParserFormatter, private commonUtilsService: CommonUtilsService, private carService: CarService, private formBuilder: FormBuilder, private ngZone: NgZone, private titleService: TitleService) {
    //fetching the data with default settings


    this.realTimeUpdate.updateLsiting().subscribe(res => {
      this.loadRealTimeLsiting() // this willbe called after real time updation of listing
    })
    if ('type' in this.activatedRoute.snapshot.params) {
      this.isGridListing = false
    }

    this.currentPage = 0

    //setting the page title
    this.titleService.setTitle();

    this.dateFilterForm = this.formBuilder.group({
      startDate: [null, null],
      endDate: [null, null]
    });

    this.page.filters = {}
    this.sharedService.pageFilter.subscribe(data => {
      //console.log('filters', data.filters);
      if (!$.isEmptyObject(data.filters)) {

        if (_.has(data.filters, ['year'])) {
          this.setFilters(data.filters['year'][0], 'year')
          let componentRefrence = this
          $.getJSON('${environment.VEHICLE_STATS_API.ENDPOINT}/?callback=?', { cmd: "getMakes", year: data.filters['year'][0] }, function (data) {
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

      }

      this.setPage(this._defaultPagination, 'active');
    })


  }

  ngOnInit() {
    //calling filters form initlization method
    this.initalizeFilterForm();
    this.getSearches();
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
    // this.yearsRange = this.commonUtilsService.createYearRange();  
    $('body').click(function (evt) {
      //console.log('id',evt.target);
      if (evt.target.id == "search_field_dash" || evt.target.id == "search_items") {

        $(".search_suggestions").show();
        return
      }
      //For descendants of menu_content being clicked, remove this check if you do not want to put constraint on descendants.
      $(".search_suggestions").hide();

      //Do processing of click event here for every element except with id menu_content

    });
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
   * Reset modal popup to hide
   * @param isOpened    boolean value 
   * @return void
   */
  hide(isOpened: boolean): void {
    console.log('hiiii', isOpened);
    this.isModalOpen = isOpened
    this.isBidListingModalOpen = isOpened; //set to false which will reset modal to show on click again
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
    this.carService.listingCars(this.page).subscribe(

      //case success

      (pagedData) => {


        this.ngZone.run(() => {
          this.page = pagedData.page;
          this.cars = pagedData.data
          //console.log('the dats ia', pagedData.data)
        });
        if (pagedData.data.length > 0 && (Object.keys(this.page.filters).length || this.page.search.length)) {
          //console.log('hi iam hit by kkkkkkkkkkkkk')
          this.showsaveSearch = true;
        } else {
          this.showsaveSearch = false;
          this.searchApplied = false;
        }
        this.commonUtilsService.hidePageLoader();
        this.listingSection.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });//scroll the page to defined section 
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
    this.page.search = searchValue
    this.searchApplied = false;
    this.setPage(this._defaultPagination, this.page.type);
  }

  onPageChange(pageNumber: number) {
    //console.log(pageNumber);
    this.currentPage = pageNumber
    this.setPage({ offset: pageNumber, pageSize: this.currentPageLimit }, this.page.type)
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
    console.log('this.page', this.page);
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

  /**
   * Customize the filters array object
   * @return  any
  */
  CustomizeFiltersObject(): any {
    return Object.keys(this.page.filters);
  }

  /**
   * Remove filter
   * @return  void
  */
  removeFilter(event) {

    console.log(event.target.dataset.key, typeof event.target.dataset.value);
    let index = '';
    if (event.target.dataset.key == 'year') {
      index = this.page.filters[event.target.dataset.key].indexOf(parseInt(event.target.dataset.value));
    } else {
      index = this.page.filters[event.target.dataset.key].indexOf(event.target.dataset.value);
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
    $.getJSON(`${environment.VEHICLE_STATS_API.ENDPOINT}/?callback=?`, { cmd: "getMakes", year: this.page.filters[filter][0] }, function (data) {


      componentRefrence.makes = data.Makes || [];
      componentRefrence.currentPage = 0
      componentRefrence.setPage(componentRefrence._defaultPagination, componentRefrence.page.type);
    });

    //hit api to fetch data
    /*this.commonUtilsService.getVehicleStatisticsByMultipleyear({ year: this.page.filters[filter]}).subscribe(
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
      componentRefrence.models = data.Models || [];
      componentRefrence.currentPage = 0
      componentRefrence.setPage(componentRefrence._defaultPagination, componentRefrence.page.type);
    });

    //hit api to fetch data
    /*this.commonUtilsService.getVehicleStatisticsByMultiplemake({ make: this.page.filters[filter]}).subscribe(
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
    this.getSearches()
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
      this.commonUtilsService.onError('End date should not be less than start date');

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
      this.setPage(this._defaultPagination, this.page.type);
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
      this.setPage(this._defaultPagination, this.page.type);
    }
  }

  /**
   * 
   * @param carId open the bid modal popup
   */
  show(carId): void {

    this.isBidListingModalOpen = true;
    this.selectedCarId = carId
  }



  showEditLocationPopup(carId): void {
    //console.log('carDetails', carId);
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

    let page = {
      offset: this.page.pageNumber,
      pageSize: this.page.size
    }
    this.setPage(page, this.page.type);

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
    console.log('the type is',type)
    if (car.totalBids && type =='inactive') {
      this.isDeactivateResonModelOpen = true;
    } else {
      //console.log('type', type);

      //Start process to delete car
      this.commonUtilsService.showPageLoader();

      //hit api to delete record from database
      this.carService.changeCarStatus(this.deactivateCarData).subscribe(

        //case success
        (response) => {
          let page = {
            offset: this.page.pageNumber,
            pageSize: this.page.size
          }
          this.setPage(page, this.page.type);
          //this.setPage(this._defaultPagination,this.page.type);
          this.commonUtilsService.onSuccess(environment.MESSAGES.CAR_STATUS_CHANGED);


          //case error
        }, error => {
          this.commonUtilsService.onError(error);
        });
    }


  }


 public relistCar(car: any): void {

     this.carService.relistCar(car._id).subscribe(response=>{
               this.commonUtilsService.onSuccess('The car has been re-listed successfully.');
               this.page.type = 'active';
               this.setPage(this._defaultPagination,'active');
     },error=>{
       this.commonUtilsService.onError(error);
     })

 }

  savePageFilters() {
    this.sharedService.setPageFilterState({ filters: this.page.filters });

  }


  applySearch() {

    //console.log('hiiiiiiiiiii')
    $(".search_suggestions").show();
  }

  getSearches() {
    let search = {
      search_type: 'listing'
    }
    this.sellerService.getSearches(search).subscribe(val => {
      this.searchData = val;
      //console.log('the search data is', this.searchData)
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
    this.selectedSearch = search;
    this.page.search = search.search;
    this.search = search.search;
    if ('filters' in search)
      this.page.filters = search.filters;
    console.log('the page is', this.page)
    this.setPage(this._defaultPagination, 'all');
    this.searchApplied = true;
    $(".search_suggestions").hide();


  }
  /**
   * remove search from the db
   */
  removeSearch(searchId: any) {
    this.sellerService.removeSearch(searchId).subscribe(val => {
      this.searchApplied = false
      this.getSearches();
      this.commonUtilsService.onSuccess(environment.MESSAGES.SEARCH_REMOVED)

    }, error => {
      this.commonUtilsService.onError(error);
    })
  }

  submitDeactivateReason(value) {
    this.isDeactivateResonModelOpen = false;
    this.deactivateCarData['reason'] = value
    this.commonUtilsService.showPageLoader();

    //hit api to delete record from database
    this.carService.changeCarStatus(this.deactivateCarData).subscribe(

      //case success
      (response) => {
        let page = {
          offset: this.page.pageNumber,
          pageSize: this.page.size
        }
        this.setPage(page, this.page.type);
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

  /**
   * this willbe inviked for real time update
   */
  loadRealTimeLsiting() {
    this.page.type = 'active';
    this.page.pageNumber = this._defaultPagination.offset;
    this.page.size = this._defaultPagination.pageSize;
    //hit api to fetch data
    this.carService.listingCars(this.page).subscribe(

      //case success
      (pagedData) => {

        this.page = pagedData.page;

        //this.cars =  pagedData.data; 
        this.cars = pagedData.data
        //case error 
      }, error => {
        this.commonUtilsService.onError(error);
      });
  }
}
