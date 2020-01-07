import { Component, SimpleChanges, OnInit, Output, EventEmitter, ViewChild, Input,  ElementRef } from '@angular/core';
import { AbstractControl,  FormBuilder, FormArray,  FormGroup,  FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
//import core services
import { VehicleService, CommonUtilsService } from '../../../../core/_services'
import { environment } from '../../../../../environments/environment'

//import Lodash
import * as _ from 'lodash';
declare let $: any;

@Component({
  selector: 'app-edit-location-popup',
  templateUrl: './edit-location-popup.component.html',
  styleUrls: ['./edit-location-popup.component.css']
})
export class EditLocationPopupComponent implements OnInit {

  @Input() isOpen: any;
  @Input() carDetails: any;
  @ViewChild('contentSection') contentSection :ElementRef;
  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();
  @Output() hideEditLocationPopup: EventEmitter<any> = new EventEmitter<any>();


  cities:any =[];
  vehicleDetails: FormGroup;
  private _vehicleLocation:any = {}
  isVehicleDetailsSubmitted:boolean = false;
  editVehicleSubscription: Subscription;

  constructor(private vehicleService: VehicleService, private commonUtilsService:CommonUtilsService, private formBuilder: FormBuilder) { 
    // set Car ID
    this.selectvehicleDetails(); // Initialize Vehicle Option Fields

  }


  /**
  * Initialize Basic Info Wizard Fields.
  */
 private selectvehicleDetails(){
  this.vehicleDetails = this.formBuilder.group({
    _id: [''],
    seller_id: [localStorage.getItem('loggedinUserId')],           
    vehicle_location:this.formBuilder.group({
      zipcode: ['', Validators.compose([Validators.required,Validators.pattern('^[0-9]{5}$')])],     
      state: [''],
      city: [''],
      type: ["Point"],
      coordinates:[null]
    })  
  });
}

  ngOnInit() {
  }

  ngOnChanges():void{
    //to show the modal popup
    if(this.isOpen) {
     // const vehicleZipcode = this.vehicleDetails.controls.vehicle_location.get('zipcode');
      //console.log('selectedCarDetails',this.carDetails);
      //vehicleZipcode.setValidators([Validators.required,Validators.pattern('^[0-9]{5}$')]);        
     // vehicleZipcode.updateValueAndValidity();
      
      this.vehicleDetails.controls.vehicle_location.patchValue(this.carDetails.location);
      this.vehicleDetails.controls._id.patchValue(this.carDetails._id);
      $(this.contentSection.nativeElement).modal({backdrop: 'static', keyboard: false, show: true}); 
    }
  }

  fetchCityState(zipcode){
    
    this.vehicleDetails.controls.vehicle_location.get('state').patchValue(''); 
    this.vehicleDetails.controls.vehicle_location.get('city').patchValue('');
    if((zipcode) && zipcode.length==5){            
        (zipcode.length==5)?this.fetchCityStateOfZipcode(zipcode):this.resetVehicleLocationControl()
    }   
   
  }

   /**
   * private function to fetch city and state information of entered zipcode
   * @param zipcode number(entered zipcode from clientside)
   * @return  void
  */
  private fetchCityStateOfZipcode(zipcode):void{
    this.commonUtilsService.fetchCityStateOfZipcode(zipcode)
      .subscribe(
      (response) => {       
        if(!_.has(response[0],['status'])){
         // console.log(response)
          this.cities = response[0]['city_states'];
          let cityState = response[0]['city_states'][0]        
          cityState['coordinates'] = [response[0]['zipcodes'][0]['longitude'],response[0]['zipcodes'][0]['latitude']]            
          this.vehicleLocation =  cityState    
        }else{
          this.vehicleDetails.controls.vehicle_location.get('zipcode').patchValue('');                  
          this.commonUtilsService.onError('Could not fetch city, state data for zip code.');
        }       
      },
      error => {        
        this.vehicleDetails.controls.vehicle_location.get('zipcode').patchValue(''); 
        this.commonUtilsService.onError('Could not fetch city, state data for zip code.');
      });  

      //console.log('vehicleDetails', this.vehicleDetails.value)
  }

  /**
  * Reset Vehicle Location Control
  */
  resetVehicleLocationControl():void{
    this.cities = [];
    this.vehicleDetails.get('vehicle_location').patchValue('');
  }

  /**
  * get vehicle to be picked up value.
  * @return  any
  */
 get vehicleLocation(): any {
  return this._vehicleLocation;
}

/**
* set vehicle to be picked up value.
* @param vehicleLocation  object of key:value
*/
set vehicleLocation(vehicleLocation: any){  
  this._vehicleLocation = vehicleLocation;  
  this.vehicleDetails.get('vehicle_location').patchValue(this._vehicleLocation);  
}


updateLocation(){


  if(this.vehicleDetails.invalid) { 
    this.isVehicleDetailsSubmitted = true;    
    return;
  }

  this.commonUtilsService.showPageLoader('Updating your car location...');

    this.editVehicleSubscription = this.vehicleService.editYourVehicleLocation(this.vehicleDetails.value)
      .subscribe(
      (response) => {  
        console.log('location', response);      
        this.commonUtilsService.onSuccess('Vehicle Location has been updated successfully.');
        this.close();
      },
      error => {
        
        this.commonUtilsService.onError(error);
      });
}

  close(){
    this.isOpen = false
    this.hideEditLocationPopup.emit(false); 
    $(this.contentSection.nativeElement).modal('hide'); // Close the current popup

  }




}
