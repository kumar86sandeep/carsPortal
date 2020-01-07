import { Component, ViewChild, OnInit, Input, ElementRef, ViewEncapsulation } from '@angular/core';
// import { CarService } from '../../../../core/_services/car.service';
import { Bid } from '../../../core/_models'
import { ToastrManager, ToastrModule } from 'ng6-toastr-notifications';//toaster class


//import DealerService 
import { TitleService, DealerService, CommonUtilsService } from '../../../core/_services';
//import models
import { Page, Purchase } from "../../../core/_models";
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';
import * as _ from 'lodash';
import { log } from 'util';
declare let $: any;
@Component({
  selector: 'app-rate-review',
  templateUrl: './rate-review.component.html',
  styleUrls: ['./rate-review.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RateReviewComponent implements OnInit {
  @ViewChild('myTable') table;
  page = new Page();
  bids = new Array<Bid>()
  bidStartDate: any;
  bidEndDate: any;
  datesFilter: any = {};
  carId: any;
  car:any;
  sellerRating ={
    rating:0,
    review:''
  }
  carRating ={
    rating:0,
    review:''
  }
  
  default_img = "../../../../assets/images/default-user.png"
  //title and bradcrumbs
  readonly title: string = 'Rate & Review';
  readonly breadcrumbs: any[] = [{ page: 'Home', link: '/dealer/home' }, { page: 'Rate and Review', link: '' }];

  //Defined records limit and records limit options
  currentPageLimit: number = environment.DEFAULT_RECORDS_LIMIT
  readonly pageLimitOptions = environment.DEFAULT_PAGE_LIMIT_OPTIONS
  constructor(private dealerService: DealerService, private toastr: ToastrManager, private commonUtilsService: CommonUtilsService) { }
  //default pagination settings
  private _defaultPagination = {
    count: 0,
    limit: this.currentPageLimit,
    offset: 0,
    pageSize: this.currentPageLimit
  }
  @ViewChild("ratingModal") ratingModal: ElementRef;
  @ViewChild("carRatingModal") carRatingModal: ElementRef;
  
  ngOnInit() {
    this.setPage(this._defaultPagination)
  }


  /**
   * To change the records limit on page
   * @param limit number of records to dispaly on pag e
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
  * @ return  void
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
      this.commonUtilsService.onError('Please select listed date');
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
    this.dealerService.getDealerRatingList(this.page).subscribe(pagedData => {
      this.page = pagedData.page;
      this.bids = pagedData.data;
      console.log('the paged Data is',this.bids);
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
 * Open Rating modal to rate buyer
 * @param car sold car object
 */
  giveRating(car:any){
    this.car= car;
    this.sellerRating.rating = this.car.rating_given;
    this.sellerRating.review = this.car.review_given;
    $(this.ratingModal.nativeElement).modal({ backdrop: 'static', keyboard: false, show: true });
  
  }


/**
 * Open Rating modal to rate buyer
 * @param car sold car object
 */
giveCarRating(car:any){
  this.car= car;
  this.carRating.rating = this.car.car_rating.rating;
  this.carRating.review = this.car.car_rating.review;
  $(this.carRatingModal.nativeElement).modal({ backdrop: 'static', keyboard: false, show: true });

}
/**
 * save the buyer rating by seller
 */
  public saveSellerRating(){
   this.sellerRating['car_id']= this.car._id;
   this.sellerRating['seller_id'] = this.car.seller_id;
   if(this.sellerRating.rating < 1){
   this.commonUtilsService.onError('Rate at-least 1 out of 5 stars.');
   return
   }
   this.dealerService.saveSellerRating(this.sellerRating).subscribe(response=>{

    this.toastr.successToastr('Rating has been submitted successfully!','Success!');
    $(this.ratingModal.nativeElement).modal('hide');
    this.setPage(this._defaultPagination);
   },error=>{
      this.toastr.errorToastr(error, 'Oops!');//showing error toaster message
   })
  }


  /**
 * save the buyer rating by seller
 */
public saveCarRating(){
  this.carRating['car_id']= this.car._id;
  if(this.carRating.rating < 1){
  this.commonUtilsService.onError('Rate at-least 1 out of 5 stars.');
  return
  }
  this.dealerService.saveCarRating(this.carRating).subscribe(response=>{

   this.toastr.successToastr('Rating has been submitted successfully!','Success!');
   $(this.carRatingModal.nativeElement).modal('hide');
   this.setPage(this._defaultPagination);
  },error=>{
     this.toastr.errorToastr(error, 'Oops!');//showing error toaster message
  })
 }



}
