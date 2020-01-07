import { Component, ViewChild, OnInit, AfterViewInit, ViewEncapsulation, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { untilDestroyed } from 'ngx-take-until-destroy';// unsubscribe from observables when the  component destroyed

//import services
//modules core services
import { CommonUtilsService, SellerService } from '../../../core/_services';
//import models
import { PagedData, Car, Page } from "../../../core/_models";
import { environment } from '../../../../environments/environment'
declare let $: any;
import * as _ from 'lodash';


@Component({
  selector: 'app-dispute',
  templateUrl: './dispute.component.html',
  styleUrls: ['./dispute.component.css']
})
export class DisputeComponent implements OnInit {
  @ViewChild('listingTable') listingTable;

  disputes: any;
  page = new Page();
  cars = new Array<Car>();
  isDisputeModelOpen: boolean = false;

  //Defined records limit and records limit options
  currentPageLimit: number = environment.DEFAULT_RECORDS_LIMIT
  readonly pageLimitOptions = environment.DEFAULT_PAGE_LIMIT_OPTIONS
  defaultUserImgUrl: string = 'assets/images/default-user.png';
  selectedChat: any = '';
  bidStartDate:any;
  bidEndDate:any;
  //title and breadcrumbs
  readonly title: string = 'Dispute Listing';
  readonly breadcrumbs: any[] = [{ page: 'Home', link: '/seller/home' }, { page: "Dispute Listing", link: '/seller/disputes' }, { page: "Table View", link: '' }]


  //default pagination settings
  private _defaultPagination = {
    count: 0,
    limit: this.currentPageLimit,
    offset: 0,
    pageSize: this.currentPageLimit
  }
  search:string = '';
  dateFilterForm: FormGroup;
  datesFilter: any = {};
  constructor(private formBuilder : FormBuilder, private sellerService: SellerService,private commonUtilsService:CommonUtilsService) { }

  ngOnInit() {

    this.setPage(this._defaultPagination);
    this.dateFilterForm = this.formBuilder.group({
      startDate: [null, null],
      endDate: [null, null]
    });
  }

 
onSort($event){

}
  /**
   * Populate the table with new data based on the page number
   * @param page The page to select
   * @param type Result type (All, Active, Archived)
   */
  setPage(page) {

    this.page.type = this.page.type;
    this.page.pageNumber = page.offset;
    this.page.size = page.pageSize;
    this.sellerService.getAllDisputes(this.page).pipe(untilDestroyed(this)).subscribe(response => {
     this.disputes = response.data;
     this.page = response.page;

    });
  }
  onSearch(value){
    if(value.length > 3){
      this.page.search = value;

    }else{
      this.page.search = '';

    }
    this.setPage(this.page);
  }
/**8
 this method will open the create dispute modal popup
 */
  
  openDispute():void{
  this.isDisputeModelOpen = true;
  }
  /**
   * this will close the data modal
   */
  cancelDispute(event):void {
   this.isDisputeModelOpen = false;
  }

  /**
   * save dispute in the db and return nothing
   * @param disputeObject is the subject and description of the dispute
   */
  submitDispute(disputeObject):void {
    disputeObject['is_seller']= true;
     this. sellerService.saveDispute(disputeObject).pipe(untilDestroyed(this)).subscribe(response=>{ 
      this.commonUtilsService.onSuccess(environment.MESSAGES.DISPUTE_SAVED);
      this.setPage(this._defaultPagination);
     },error=>{
       this.commonUtilsService.onError(error)
     })
    this.isDisputeModelOpen = false; // close dispute modal after saving dispute in the db

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
      delete this.page.filters['dates'];
      this.setPage(this._defaultPagination);
    }

  }

  
 // This method must be present, even if empty.
 ngOnDestroy() {
  // To protect you, we'll throw an error if it doesn't exist.
}
}
