import { Component, ViewChild, Input, ElementRef, ViewEncapsulation } from '@angular/core';
import { CarService } from '../../../../core/_services/car.service';
import { Bid } from '../../../../core/_models'
import Swal from 'sweetalert2'
declare let $: any; import { ToastrManager } from 'ng6-toastr-notifications';//toaster class
//shared services
import { AlertService, PageLoaderService } from '../../../../shared/_services'
//import DealerService 
import { TitleService, SellerService, CommonUtilsService } from '../../../../core/_services';
//import models
import { Page, Purchase } from "../../../../core/_models";
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import * as _ from 'lodash';
@Component({
  selector: 'app-car-bids',
  templateUrl: './car-bids.component.html',
  styleUrls: ['./car-bids.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CarBidsComponent {
  @ViewChild('myTable') table;
  page = new Page();
  bids = new Array<Bid>()
  bidStartDate: any;
  bidEndDate: any;
  datesFilter: any = {};
  carId: any;
  bidId: any;
  //title and breadcrumbs
  readonly title: string = 'Car Bid Listing';
  readonly breadcrumbs: any[] = [{ page: 'Home', link: '/dealer/home' }, { page: 'Car Bid Listing', link: '' }];

  //Defined records limit and records limit options
  currentPageLimit: number = environment.DEFAULT_RECORDS_LIMIT
  readonly pageLimitOptions = environment.DEFAULT_PAGE_LIMIT_OPTIONS
  constructor(private sellerService: SellerService, private route: ActivatedRoute, private carService: CarService, private router: Router, private commonUtilsService: CommonUtilsService, private titleService: TitleService, private pageLoaderService: PageLoaderService, private toastr: ToastrManager) {

  }


  //default pagination settings
  private _defaultPagination = {
    count: 0,
    limit: this.currentPageLimit,
    offset: 0,
    pageSize: this.currentPageLimit
  }

  ngOnInit() {

    this.route.params.subscribe(param => {
      this.carId = param['id'];
      let checkForHexRegExp = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;//regex for valid object id
      if (checkForHexRegExp.test(this.carId)) {
        this.page['car_id'] = this.carId;
        this.setPage(this._defaultPagination);

      } else {
        this.router.navigate(['/seller/car-listing'])
      }
    })
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
    this.carService.getCarBids(this.page).subscribe(pagedData => {
      this.page = pagedData.page;
      this.bids = pagedData.data;
      //console.log('the data is', this.bids);
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
    this.page.sortProperty = sortValue.sorts[0].prop;
    this.page.sortDirection = sortValue.sorts[0].dir;
    this.setPage(this._defaultPagination)
  }


  /**
   * Search results according to user inputs
   * @param searchValue user inputs to search particular data
   * @return  void
   */
  onSearch(searchValue: string): void {
    this.page.search = searchValue
    this.setPage(this._defaultPagination);
  }


  /**
   * accept bid will be invoked on accepting the bid
   * @param bidId is the bid id 
   */
  acceptBid(bidId: any): void {
    console.log('the bid id is', bidId);
    this.bidId = bidId;
    Swal.fire({
      title: 'Are you sure you want to Accept this bid? ',
      text: 'You will not be able to cancel it again!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Accept it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.value) {

        this.submitBid();

      
        // For more information about handling dismissals please visit
        // https://sweetalert2.github.io/#handling-dismissals
      }
    })
  };

  /**
   * will invoke when you confirm that accept the bid
   */
  private submitBid(): void {
    let obj = {
      bidId: this.bidId,
      carId:this.bids[0].car._id
    };
    this.sellerService.acceptBid(obj).subscribe(response => {
      // console.log('');
     
        Swal.fire(
          'success!',
          'Your bid  has been Accepted.',
          'success'
        );
        this.setPage(this._defaultPagination);
    },error=>{
      this.commonUtilsService.onError(error)
    })
  }

}
