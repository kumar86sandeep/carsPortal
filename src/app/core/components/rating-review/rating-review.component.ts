import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { untilDestroyed } from 'ngx-take-until-destroy';// unsubscribe from observables when the component destroyed
import { environment } from '../../../../environments/environment'
//import services

  //shared services
  import {  PageLoaderService } from '../../../shared/_services'
  //modules core services
  import { CarService, CommonUtilsService } from '../../../core/_services'

declare let $;

@Component({
  selector: 'app-rating-review',
  templateUrl: './rating-review.component.html',
  styleUrls: ['./rating-review.component.css']
})
export class RatingReviewComponent implements OnInit {
  @Input() currentRating:number
  @Input() carId:any
  @Input() isDisable:any
  

  @ViewChild("contentSection") contentSection: ElementRef;
  
  private _rating:number = 0
  MaxRateStars = environment.MAX_RATE_STARS; 
  isSubmitted: boolean = false;
  ratingReviewForm: FormGroup;
  constructor(private pageLoaderService:PageLoaderService, private formBuilder: FormBuilder, private commonUtilsService:CommonUtilsService, private carService:CarService) { }


   /**
  * component life cycle default method, inatlize the rating & review form and current rating
  * @return void
  */
  ngOnInit():void {
    //calling initializing review form
    this.reviewForm();    
  }



  /**
  * initializing review form 
  * @return void
  */
  private reviewForm():void{
    this.ratingReviewForm = this.formBuilder.group({
      _id:[this.carId],
      rating:[null],
      //dealer_id:localStorage.getItem('loggedinUserId'),       
      comment: [null, [Validators.minLength(10),Validators.maxLength(500)]]      
    });
  }



  /**
  * show review popup
  * @param $starRate    number(starRate) which is selected by user.
  * @return             void
  */
  public show():void{    
   $(this.contentSection.nativeElement).modal({keyboard: false, show: true});
  }

  /**
  * hide & reset review popup
  * @return             void
  */
  public close():void{
    this.reviewForm(); 
  }



  /**
  * get rating.
  * @return     Star rating selected by iser .
  */
  get rating(): number {
    return this._rating;
  }

  /**
  * set rating.
  * @param $rate    number(Star rating) which is selected by user.
  */
  set rating($rate: number) {
    this._rating = $rate;
    this.ratingReviewForm.controls['rating'].patchValue(this._rating);
  }


  
   
  /**
  * insert rating & review
  * If the review & rating form is invalid, set isSubmitted=true and true is returned. 
  */ 
  onSubmit(){    


    this.ratingReviewForm.patchValue({
      rating:this.rating
    })
    // stop here if form is invalid

    if (this.ratingReviewForm.invalid) {
      this.isSubmitted = true;
      return true;
    }
    this.commonUtilsService.showPageLoader(environment.MESSAGES.PLS_WAIT_TEXT);   
    this.carService.ratingReviewByDealer(this.ratingReviewForm.value)
      .subscribe(
        (response) => {
          this.isDisable = true;
          $(this.contentSection.nativeElement).modal('hide');   
          this.commonUtilsService.onSuccess(environment.MESSAGES.CONTACT_REQUEST_SEND);      
          this.reviewForm();
         // this.pageLoaderService.refreshPage(true)           
        },
        error => {        
          this.commonUtilsService.onError(error); 
        });
    
  }

  // This method must be present, even if empty.
  ngOnDestroy() {
    // To protect you, we'll throw an error if it doesn't exist.
  }

}
