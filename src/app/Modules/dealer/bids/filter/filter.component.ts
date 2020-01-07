import { Component, OnInit,Output, EventEmitter, Input } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonUtilsService } from '../../../../core/_services'

declare let jQuery: any;
declare let $: any;
declare let POTENZA: any;
import * as _ from 'lodash';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {
  @Input() filters:any
  @Output() onSubmit: EventEmitter<any> = new EventEmitter<any>();
  filtersForm:FormGroup;
  yearsRange:any=[]
  makes:any =[]
  models:any=[]
  trims:any=[]
  states:any=[]
  bodystyles:any=[]
  colors = [{label:'Beige',value:'#F5F5DC'},{label:'Black',value:'#252627'},{label:'Brown',value:'#672E10'},{label:'Burgundy',value:'#75141C'},{label:'Charcoal Grey',value:'#757776'},{label:'Dark Blue',value:'#172356'},{label:'Dark Green',value:'#316241'},{label:'Gold',value:'#D6C17F'},{label:'Grey',value:'#808080'},{label:'Light Blue',value:'#5F7DC5'},{label:'Light Green',value:'#8E9F87'},{label:'Orange',value:'#FF9200'},{label:'Purple',value:'#6A4574'},{label:'Red',value:'#E32F43'},{label:'Silver',value:'#D4D9DC'},{label:'Tan',value:'#D2B48C'},{label:'White',value:'#F2F6F9'},{label:'Yellow',value:'#F8E81C'}];

  

  carConditions:any = [
    {name:'Ready For Resale Without Any Reconditioning',value:'Excellent'},
    {name:'May Need Some Reconditioning',value:'Good'},
    {name: 'Needs Some Reconditioning But Yet Functional',value:'Fair'},
    {name:'Non-functional',value:'Non-functional' }
  ]
  interiorMaterials= [{name: "Faux Leather"}, {name: "Brushed Nylon"}, {name: "Nylon Fabric"}];
  radius:any = [ 25, 50, 100, 150, 200, 250]

  constructor(private commonUtilsService: CommonUtilsService, private formBuilder: FormBuilder) { 
   
    this.commonUtilsService.showPageLoader();
    this.commonUtilsService.listingMakes().subscribe(
      //case success
      (data) => {      
        this.makes = data
        this.commonUtilsService.hidePageLoader();
        //case error 
      }, error => {
        this.commonUtilsService.onError(error);
    });
    
    


    this.commonUtilsService.getStates().subscribe(
      //case success
      (data) => {      
        this.states = data
        this.commonUtilsService.hidePageLoader();
        //case error 
      }, error => {
        this.commonUtilsService.onError(error);
    });
  } 

/**
* initializing filters form 
* @return void
*/
private initalizeFilterForm():void {
  let currentYear = (_.has(this.filters, ['year_range']) && this.filters['year_range'].length > 0)?this.filters['year_range'][1]:new Date().getFullYear();
  let maxMileage = (_.has(this.filters, ['mileage_range']) && this.filters['mileage_range'].length > 0)?this.filters['year_range'][1]:'10000';
  this.filtersForm = this.formBuilder.group({
    vin_license_plate:[''],
    reserve_not_met:[''], 
    radius:[''],
    make:[''],
    model:[''],
    selectedmake:[''],
    selectedmodel:[''],
    trim:[''],
    
    state:[''],
    condition:[''],
    interior_color:[''],
    exterior_color:[''], 
    mileagerange: [`1 - ${maxMileage}`],
    yearrange:[`1970 - ${currentYear}`],
    year_range:'' ,
    mileage_range:''  
  })
}

/**
* Filters records when user click on 'Apply Filters' button
* @return  void
*/
private onApplyingRangeFilters():void { 

  let componentRefrence = this //assign the component object to use with jquery 
  
  //when we stop price slider
  $( "#mileage-range" ).on( "slidestop", function( event, ui ) {     
    componentRefrence.filtersForm.get('mileage_range').patchValue([ui.values[0],ui.values[1]])  
     
  });

  //when we stop year slider
  $( "#year-range" ).on( "slidestop", function( event, ui ) {    
    componentRefrence.filtersForm.get('year_range').patchValue([ui.values[0],ui.values[1]])   
   
  });

  $( "#year-range" ).on( "slide", function( event, ui ) {    
    //componentRefrence.filtersForm.get('year_range').patchValue([ui.values[0],ui.values[1]])     
    componentRefrence.filtersForm.get('yearrange').patchValue(`${ui.values[0]} - ${ui.values[1]}`)        
  });
  $( "#mileage-range" ).on( "slide", function( event, ui ) {   
   // componentRefrence.filtersForm.get('mileage_range').patchValue([ui.values[0],ui.values[1]])     
    componentRefrence.filtersForm.get('mileagerange').patchValue(`${ui.values[0]} - ${ui.values[1]}`)       
  });

}

async resetFilters(){
  //confirm before deleting car
  if(! await this.commonUtilsService.isResetConfirmed()) {
    return;
  }

  this.initalizeFilterForm();
  this.filtersForm.get('mileagerange').patchValue(`1 - 10000`) 
  this.filtersForm.get('yearrange').patchValue(`1970 - ${new Date().getFullYear()}`) 
  this.yearSlider()
  this.mileageSlider();
  this.onSubmit.emit({}); 
}
/**
* Initalize year range slider
* @return  void
*/
private yearSlider():void{
  let selectedMaximumYear = (_.has(this.filters, ['year_range']) && this.filters['year_range'].length > 0)?this.filters['year_range'][1]:new Date().getFullYear();  
  let selectedMinimumYear = (_.has(this.filters, ['year_range']) && this.filters['year_range'].length > 0)?this.filters['year_range'][0]:1970;  
  if($(".year-slide").exists()) {       
        $("#year-range").slider({
            range: true,
            min: 1970,
            max: new Date().getFullYear(),
            values: [selectedMinimumYear, selectedMaximumYear]            
        });
    }
}

/**
* Initalize mileage range slider
* @return  void
*/
private mileageSlider():void{
  let selectedMaximumMileage = (_.has(this.filters, ['mileage_range']) && this.filters['mileage_range'].length > 0)?this.filters['mileage_range'][1]:10000;
  let selectedMinimumMileage = (_.has(this.filters, ['mileage_range']) && this.filters['mileage_range'].length > 0)?this.filters['mileage_range'][0]:1;

  if($(".mileage-slide").exists()) {
    //$("#slider-range,#slider-range-2").slider({
    $("#mileage-range").slider({
        range: true,
        min: 1,
        max: 10000,
        values: [selectedMinimumMileage, selectedMaximumMileage]            
    });
  }
}


  ngOnInit() {
    
    let currentYear = new Date().getFullYear(); 
    for (var i = 0; i < 15; i++) {
      this.yearsRange.push({
        label: currentYear - i,
        value: currentYear - i
      });
    }

    //calling filters form initlization method
    this.initalizeFilterForm();
    this.filtersForm.patchValue(this.filters)

    //fetching models if make already selected
    if (_.has(this.filters, ['make']) && this.filters['make'].length > 0){
      this.commonUtilsService.listingModels({ make_id:this.filters['make']}).subscribe(
        //case success
        (data) => {                
          this.models = data
          this.commonUtilsService.hidePageLoader();
          //case error 
        }, error => {
          this.commonUtilsService.onError(error);
      });
    }

    //fetching trims if model already selected
    if (_.has(this.filters, ['model']) && this.filters['model'].length > 0){
      this.commonUtilsService.listingTrimsWithBodystyles({ model_id:this.filters['model']}).subscribe(
        //case success
        (data) => {  
  
          this.trims = data.trims
          this.bodystyles = data.bodystyles
          this.commonUtilsService.hidePageLoader();
          //case error 
        }, error => {
          this.commonUtilsService.onError(error);
      });
    }
    this.onApplyingRangeFilters()
   
    this.yearSlider()
    this.mileageSlider()
    
   } 

  listingModel(event){
    
    this.trims = []
    if(event.target.value){
      this.commonUtilsService.showPageLoader();
      this.commonUtilsService.listingModels({ make_id:event.target.value}).subscribe(
        //case success
        (data) => {                
          this.models = data
          this.commonUtilsService.hidePageLoader();
          //case error 
        }, error => {
          this.commonUtilsService.onError(error);
      });
    }
    this.filtersForm.get('selectedmake').patchValue([event.target.options[event.target.selectedIndex].getAttribute('data-makeName')])
  }

  listingTrim(event){
    console.log(event.target.value)
    this.trims = []
    this.bodystyles = []
    
    if(event.target.value){
      this.commonUtilsService.showPageLoader();
      this.commonUtilsService.listingTrimsWithBodystyles({ model_id:event.target.value}).subscribe(
        //case success
        (data) => {  
  
          this.trims = data.trims
          this.bodystyles = data.bodystyles
          this.commonUtilsService.hidePageLoader();
          //case error 
        }, error => {
          this.commonUtilsService.onError(error);
      });
    }
    this.filtersForm.get('selectedmodel').patchValue([event.target.options[event.target.selectedIndex].getAttribute('data-modelName')])
  }


  applyFilters(){

    let yearRangeObject = (this.filtersForm.get('yearrange').value).split(" - ")
    this.filtersForm.get('year_range').patchValue([yearRangeObject[0],yearRangeObject[1]])
    this.onSubmit.emit(this.filtersForm.value); 
  }
  multipleSelection(event,formcontrolName){
   
    if(event.target.value!='All'){
      let selection = (event.target.value).split(": ")      
      if(selection[1].slice(1, -1).length<=0){ 
        this.filtersForm.get(formcontrolName).patchValue('')
        console.log(this.filtersForm.value);
      }
    }else{
      this.filtersForm.get(formcontrolName).patchValue('')
    }
    
  }  

}
