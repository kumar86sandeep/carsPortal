import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery';
import {Location} from '@angular/common';
//modules services, models and enviornment file
import { TitleService, CarService, CommonUtilsService } from '../../../../core/_services'
import { untilDestroyed } from 'ngx-take-until-destroy';
declare let $: any;
declare let POTENZA: any;
import * as _ from 'lodash';

@Component({
  selector: 'app-car-detail-page',
  templateUrl: './car-detail-page.component.html',
  styleUrls: ['./car-detail-page.component.css']
})

export class CarDetailPageComponent implements OnInit {
  sliderOptions: NgxGalleryOptions[];
  sliderImages: NgxGalleryImage[];


  carDetail: any;
  isImageFilterEnable: Boolean = false
  isCategoryHaveThumbnail:boolean=true
  selectedCategories: any = []
  isOpen: boolean = false;

  //title and breadcrumbs
  title: string = 'Car Detail';
  breadcrumbs: any[] = [{ page: 'Home', link: '' }, { page: "Car Listing", link: '/seller/car-listing' }, { page: 'Car Detail', link: '' }]

  constructor(private _location :Location, private activatedRoute: ActivatedRoute, private carService: CarService, private commonUtilsService: CommonUtilsService, private titleService: TitleService) {

    //setting the page title
    this.titleService.setTitle();    

    //checking the type to change breadcrumbs
    if ('type' in this.activatedRoute.snapshot.params) {
      this.breadcrumbs = [{ page: 'Home', link: '' }, { page: "Car Listing", link: '/seller/car-dashboard' }, { page: 'Car Detail', link: '' }]
    }
    this.fetchVehicleDetails(); //fetch vehcile details
  }

  ngOnInit() {
    POTENZA.tabs();
    POTENZA.carousel();
    this.sliderinit();
  }

  private fetchVehicleDetails():void{
    //hit api to fetch data
    this.commonUtilsService.showPageLoader();
    this.carService.carDetail({ id: this.activatedRoute.snapshot.params._id }).pipe(untilDestroyed(this)).subscribe(

      //case success
      (response) => {
        this.carDetail = response
        console.log('cardetails',this.carDetail);
        this.carDetail.car_images.forEach(element => {
          this.pushElement(element);
        });
        this.commonUtilsService.hidePageLoader();

        //case error 
      }, error => {
        this.commonUtilsService.onError(error);
      }
    );
  }

  /**
   * Function to push element
   * @param   element array element 
   * @return  void
  */
  private pushElement(element): void {
    this.sliderImages.push({
      small: element.file_path,
      medium: element.file_path,
      big: element.file_path,
      label: element.file_category
    })
  }

  /**
   * Function to show/hide the image filters
   * @return  void
  */
  imageFilterToggle(): void {

    this.isImageFilterEnable = (this.isImageFilterEnable) ? false : true

  }

  /**
   * Function to filter image in slider
   * @param   event object 
   * @return  void
  */
  onImageFilter(event): void {
    (event.target.checked) ? this.selectedCategories.push(event.target.value) : _.pullAt(this.selectedCategories, this.selectedCategories.indexOf(event.target.value))
    this.sliderImages = [];
    if (this.selectedCategories.length) {
      this.carDetail.car_images.forEach(element => {
        if (_.includes(this.selectedCategories, element.file_category)) {
          this.pushElement(element);
        }
      });
      if(this.sliderImages.length<=0)
        this.isCategoryHaveThumbnail = false
    }
    else {
      this.carDetail.car_images.forEach(element => {
        this.pushElement(element);
      });
    }
  }

  /**
   * Private function to initalize slider 
   * @return  void
  */
  private sliderinit(): void {
    this.sliderOptions = [
      {
        width: '100%',
        height: '365px',
        imageAnimation: NgxGalleryAnimation.Slide,
        imageArrowsAutoHide: true,
        thumbnailsArrows: true,
        thumbnailsColumns: 5,
        thumbnailMargin: 2,
        thumbnailsPercent: 20,
        imageInfinityMove: true,
        thumbnailsAutoHide: true,
        closeIcon: 'fa fa-times',
  

      },
      // max-width 800
      {
        breakpoint: 800,
        width: '100%',
        height: '600px',
        imagePercent: 80,
        thumbnailsMargin: 20,
        thumbnailMargin: 20,

      },
      // max-width 400
      {
        breakpoint: 400,
        preview: false
      }
    ];
    this.sliderImages = [];
  }

  /**
  * Show a popup modal 
  */
  show(): void {
    this.isOpen = true;
  }
  /**
   * Reset modal popup to hide
   * @param isOpened    boolean value 
   * @return void
   */
  
  hide(isOpened: boolean): void {
    this.isOpen = isOpened; //set to false which will reset modal to show on click again
  }


  goBack(){
    this._location.back();
  }
 // This method must be present, even if empty.
 ngOnDestroy() {
  // To protect you, we'll throw an error if it doesn't exist.
}
}
