import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ToastrManager } from 'ng6-toastr-notifications';//toaster class
//shared services
import { AlertService, PageLoaderService } from '../../../../shared/_services'
import { Angular5Csv } from 'angular5-csv/dist/Angular5-csv';
//import DealerService 
import { TitleService, DealerService, CommonUtilsService } from '../../../../core/_services';
//import models
import { Page, Purchase } from "../../../../core/_models";
import { Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import * as _ from 'lodash';
@Component({
  selector: 'app-purchases-list',
  templateUrl: './purchases-list.component.html',
  styleUrls: ['./purchases-list.component.css'],
  providers: [
    DealerService
  ],
  encapsulation: ViewEncapsulation.None
})
export class PurchasesListComponent implements OnInit {
  @ViewChild('myTable') table;
  page = new Page();
  purchases = new Array<Purchase>()
  bidStartDate: any;
  bidEndDate: any;
  datesFilter: any = {};

  //title and breadcrumbs
  readonly title: string = 'My Purchase Listing';
  readonly breadcrumbs: any[] = [{ page: 'Home', link: '/dealer/home' }, { page: 'My Purchase Listing', link: '' }];

  //Defined records limit and records limit options
  currentPageLimit: number = environment.DEFAULT_RECORDS_LIMIT
  readonly pageLimitOptions = environment.DEFAULT_PAGE_LIMIT_OPTIONS

  constructor(private router: Router, private commonUtilsService: CommonUtilsService, private dealerService: DealerService, private titleService: TitleService, private pageLoaderService: PageLoaderService, private toastr: ToastrManager) {
  }

  //default pagination settings
  private _defaultPagination = {
    count: 0,
    limit: this.currentPageLimit,
    offset: 0,
    pageSize: this.currentPageLimit
  }
  ngOnInit() {

    this.setPage(this._defaultPagination);
    // this.getPurchasesList();
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
   * Check date validations and filters records when select start date filter
   * @return  void
   */
  onBidDateSelected(event: any): void {
    this.datesFilter['start'] = new Date(event.year, event.month - 1, event.day + 1)
    this.datesFilter['transformedStartDate'] = (this.datesFilter['start']).toISOString();
    this.validateDateFilters();
  }

  /**
 * Check date validations and filters records when select start date filter
 * @return  void
 */
  onAcceptedDateSelected(event: any): void {
    this.datesFilter['end'] = new Date(event.year, event.month - 1, event.day + 1)
    this.datesFilter['transformedEndDate'] = (this.datesFilter['end']).toISOString();
    this.validateDateFilters();
  }

  /**
  * To clear date filters(inputs)
  * @return  void
  */
  clearDateFilters(): void {
    if (_.has(this.datesFilter, ['start']) || _.has(this.datesFilter, ['end'])) {
      this.bidStartDate = null
      this.bidEndDate = null
      this.page.filters['dates'] = this.datesFilter = {}
      delete this.page.filters['dates'];
      this.setPage(this._defaultPagination);
    }

  }


  /**
  * To validate date filters
  * @return  void
  */
  private validateDateFilters() {

    if (!_.has(this.datesFilter, ['start']))
      this.commonUtilsService.onError('Please select bid date');
    else if (!_.has(this.datesFilter, ['end']))
      this.commonUtilsService.onError('Please select end date');
    else if (_.has(this.datesFilter, ['end']) && (this.datesFilter['end']).getTime() < (this.datesFilter['start']).getTime()) {
      this.bidEndDate = null
      this.commonUtilsService.onError('End date should not less than start date');

    } else {
      this.page.filters['dates'] = this.datesFilter;
      this.setPage(this._defaultPagination);
    }
  }



  /**
     * Populate the table with new data based on the page number
     * @param pageInfo The page object to select the records
     */
  setPage(pageInfo): void {
    this.page.pageNumber = pageInfo.offset;
    this.page.size = pageInfo.pageSize;
    this.dealerService.getPurchaseList(this.page).subscribe(pagedData => {
      this.page = pagedData.page;
      this.purchases = pagedData.data;
      console.log('the purchase list is',pagedData.data)
    },
      error => {
        this.toastr.errorToastr(error, 'Oops!');//showing error toaster message
      });
  }

  /**
      * Populate the table with new data based on the sorting
      * @param sortValue The sort object to select the records
      */
  sortCallback(sortValue: any): void {
    console.log('the value of sorting is ', sortValue);
    this.page.sortProperty = sortValue.sorts[0].prop;
    this.page.sortDirection = sortValue.sorts[0].dir;
    this.setPage(this._defaultPagination)
  }

  /**
   * Search results according to user inputs
   * @param searchValue user inputs to search particular data
   * @return  void
   */
  onSearch(searchValue: string):void {
    this.page.search = searchValue
    this.setPage(this._defaultPagination);
  }

  viewCarDetails(carId: any):void {
    console.log('the car id is ', carId);
    this.router.navigate(['/dealer/car-detail/' + carId]);

  }


  /**
   * download the list of all purchases in csv
   */
  downloadCsv() :void{

    if (this.purchases.length == 0)
      return

    var options = {
      fieldSeparator: ',',
      showLabels: true,
      showTitle: true,
      title: 'My Purchases List',
      useBom: true,
      headers: ["Title ", "Bid Date", "Acceptance Date", "Bid Price", "Dealership", "Payment Status"]
    };

    let data = [];
    //iterate purchase list and make custom data
    this.purchases.forEach(purchase => {
      let purchaseObj = {
        car_ref: purchase.car_id[0].vehicle_year +''+purchase.car_id[0].vehicle_make +''+purchase.car_id[0].vehicle_model +''+purchase.car_id[0].vehicle_trim,
        bid_date: purchase.bid_date,
        bid_acceptence_date: purchase.bid_acceptance_date,
        price: purchase.price,
        contact: purchase.contact,
        fee_status: purchase.fee_status
      };
      data.push(purchaseObj);
    });

    //pass data and options to download csv
    new Angular5Csv(data, 'My Purchase List', options);
  }


}
