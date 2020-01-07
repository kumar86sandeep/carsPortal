import { Component, OnInit,Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventEmitter } from '@angular/core';
//modules services, models and enviornment file
import { CommonUtilsService  } from '../../../../core/_services'

import * as _ from 'lodash';

@Component({
  selector: 'app-date-filter',
  templateUrl: './date-filter.component.html',
  styleUrls: ['./date-filter.component.css']
})
export class DateFilterComponent implements OnInit {

  dateFilterForm:FormGroup
  datesFilter:any = {}
  @Output() sendDate = new EventEmitter();

  constructor(private commonUtilsService:CommonUtilsService, private formBuilder: FormBuilder) {
    this.dateFilterForm = this.formBuilder.group( {
      startDate: [null, null],
      endDate: [null, null]
    });

   }

   /**
   * Check date validations and filters records when select start date filter
   * @return  void
   */
  onStartDateSelected(event:any):void {
    let currentDate = new Date();      
   // this.ngbDateParserFormatter.parse(event.year + "-" + (event.month-1).toString() + "-" + (event.day));
    let formattedStartDate = new Date(event.year,event.month-1,event.day)
    


    

    if((formattedStartDate).getTime() > (currentDate).getTime()){ 
      this.dateFilterForm.patchValue({
        startDate: null,        
      });
      this.commonUtilsService.onError('Start date should not be greater than today.'); 
      return;
    }else{
      this.datesFilter['start']  = new Date(event.year,event.month-1,event.day+1)   
      this.datesFilter['startCurrent']  = new Date(event.year,event.month-1,event.day)       
      this.datesFilter['transformedStartDate']  = (this.datesFilter['start']).toISOString();
    }
   
    if(_.has(this.datesFilter, ['start']) &&  !_.has(this.datesFilter, ['end'])){
      this.datesFilter['end']  = currentDate;
      this.datesFilter['endCurrent']  = currentDate
      this.datesFilter['transformedEndDate']  = (this.datesFilter['end']).toISOString();
    }

    this.validateDateFilters(); 
    //return this.ngbDateParserFormatter.parse(startYear + "-" + startMonth.toString() + "-" + startDay);      
  }
  /**
   * Check date validations and filters records when select end date filter
   * @return  void
   */
  onEndDateSelected(event:any):void {
    
    //this.ngbDateParserFormatter.parse(event.year + "-" + (event.month-1).toString() + "-" + (event.day));

    this.datesFilter['end']  = new Date(event.year,event.month-1,event.day+1)
    this.datesFilter['endCurrent']  = new Date(event.year,event.month-1,event.day)
    
    this.datesFilter['transformedEndDate']  = (this.datesFilter['end']).toISOString();
    this.validateDateFilters();        
  }

  /**
  * To validate date filters
  * @return  void
  */
  private validateDateFilters(){
    
    if(! _.has(this.datesFilter, ['start']))
      this.commonUtilsService.onError('Please select start date');
    else if(! _.has(this.datesFilter, ['end']))
      this.commonUtilsService.onError('Please select end date');
    else if(_.has(this.datesFilter, ['end']) && (this.datesFilter['endCurrent']).getTime() < (this.datesFilter['startCurrent']).getTime()){
      this.dateFilterForm.patchValue({
        endDate: null,        
      });
      this.commonUtilsService.onError('End date should not less than start date');  
      
    }else{     
      
      this.datesFilter;  
      this.sendDate.emit(this.datesFilter);

    }
  }

  /**
  * To clear date filters(inputs)
  * @return  void
  */
 clearDateFilters():void{
  if(_.has(this.datesFilter, ['start']) || _.has(this.datesFilter, ['end'])){
    this.dateFilterForm.patchValue({
      endDate: null,  
      startDate: null,      
    });
    this.datesFilter = {}    
    this.sendDate.emit(this.datesFilter);

  }  
  
}

  ngOnInit() {
  }

}
