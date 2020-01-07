import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastrManager } from 'ng6-toastr-notifications';//toaster class

//import shared services
import { PageLoaderService } from '../../shared/_services'

import { environment } from '../../../environments/environment'

import Swal from 'sweetalert2'



 

const apiURL:string = 'https://vpic.nhtsa.dot.gov/api/vehicles/';

let headers: HttpHeaders = new HttpHeaders();
headers = headers.append('Accept', 'application/json');
headers = headers.append('Content-Type', 'application/json');
headers = headers.append('Access-Control-Allow-Methods', 'GET, POST');

@Injectable()
export class CommonUtilsService {
  currentYear: number = new Date().getFullYear();   // get Current Year

  constructor(private httpClient: HttpClient, private pageLoaderService: PageLoaderService, private toastrManager: ToastrManager, ) { }

  /**
  * Fetch all US states 
  * @return Observable type collection of states having id, name, abbreviation attributes
  */
  public getStates(): Observable<any> {

    return this.httpClient
      .get('common/fetchStates')
      .map((response: Response) => {
        return response;
      })

  }

  /**
  * To check the image validity for type jpeg, png, jpg
  * @return boolean
  * @param base64string image base64 string 
  * @param type image type (jpeg, png, jpg)
  */
  public isFileCorrupted(base64string, type): boolean {

    if (type == 'png') {
      console.log('get filetype', type)
      const imageData = Array.from(atob(base64string.replace('data:image/png;base64,', '')), c => c.charCodeAt(0))
      const sequence = [0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]; // in hex: 

      //check last 12 elements of array so they contains needed values
      for (let i = 12; i > 0; i--) {
        if (imageData[imageData.length - i] !== sequence[12 - i]) {
          return false;
        }
      }

      return true;
    }
    else if(type=='pdf'){ 
      return true;
    }
    else if (type == 'jpeg' || type == 'jpg') {
      const imageDataJpeg = Array.from(atob(base64string.replace('data:image/jpeg;base64,', '')), c => c.charCodeAt(0))
      const imageCorrupted = ((imageDataJpeg[imageDataJpeg.length - 1] === 217) && (imageDataJpeg[imageDataJpeg.length - 2] === 255))
      return imageCorrupted;
    }
  }

  /**
  * Show page loder on fetching data
  * @return void
  */
  public showPageLoader(message = environment.MESSAGES.FETCHING_RECORDS):void{
    this.pageLoaderService.setLoaderText(message);//setting loader text
    this.pageLoaderService.pageLoader(true);//show page loader
  }

  /**
  * Hide page loder on fetching data
  * @return void
  */
  public hidePageLoader(): void {
    this.pageLoaderService.pageLoader(false);//hide page loader
    this.pageLoaderService.setLoaderText('');//setting loader text
  }

  /**
  * Show alert on success response & hide page loader
  * @return void
  */
  public onSuccess(message): void {
    this.pageLoaderService.pageLoader(false);//hide page loader
    this.pageLoaderService.setLoaderText('');//setting loader text empty
    this.toastrManager.successToastr(message, 'Success!'); //showing success toaster 
  }

  /**
  * Show alert on error response & hide page loader
  * @return void
  */
  public onError(message): void {
    this.pageLoaderService.setLoaderText(environment.MESSAGES.ERROR_TEXT_LOADER);//setting loader text
    this.pageLoaderService.pageLoader(false);//hide page loader
    this.toastrManager.errorToastr(message, 'Oops!',{maxShown:1});//showing error toaster message  
  }

  /**
  * Remove Image from AWS Bucket
  * @return boolean
  */
  public removeImageFromBucket(params): Observable<any> {
    return this.httpClient
      .post('common/deleteObject', params)
      .map((response: Response) => {
        return response;
      })  
  }

  /** ToDo
   * show last 2 years list in the year dropdown
  */
  public createYearRange() {
    let years = [];
    for (let i = 0; i < 2; i++) {
      years.push({
        label: this.currentYear - i,
        value: this.currentYear - i
      });
    }
    console.log('typeof', typeof years);
    return <Array<any>>years;
  }

  /**
   * Fetch make,model,year by year
   * @param year    pass year.
   * @return        Observable<any>
  */
  public getVehicleStatisticsByMultipleyear(year): Observable<any> {
    return this.httpClient.post('common/fetchVehicleStatisticsByMultipleyear', year)
      .map((response: any) => {
        //console.log(response); 
        return response;
      })
  }


  /**
   * Fetch make,model,year by year
   * @param year    pass year.
   * @return        Observable<any>
  */
  public getVehicleStatisticsByMultiplemake(year): Observable<any> {
    return this.httpClient.post('common/fetchVehicleStatisticsByMultiplemake', year)
      .map((response: any) => {
        //console.log(response); 
        return response;
      })
  }

  /**
   * Fetch make,model,year by year
   * @param year    pass year.
   * @return        Observable<any>
  */
  public getVehicleStatisticsByMultiplemodel(year): Observable<any> {
    return this.httpClient.post('common/fetchVehicleStatisticsByMultiplemodel', year)
      .map((response: any) => {
        //console.log(response); 
        return response;
      })
  }


  /**
     * get Vehicle Details from DB
     * @param year selected year from dropdown.
     * @return  array(vehicle details)       
    */
  public getVehicleStatisticsByYear(year): Observable<any> {
    return this.httpClient.post('common/fetchVehicleStatisticsByYear', year)
      .map((response: any) => {
        //console.log(response); 
        return response;
      })
  }

/**
 * 
 * @param email user email for signup
 * @return username
 */

  public getUsername(email: string): string {
    //username = email?String(_.dropRight((email).split('@'))):''; 
    let username = email.substring(0, email.lastIndexOf("."))
    return String(username.replace("@", "_"));
  }

  
  /**
  * Show confirmation popup before going to previous step.
  * @return any
  */
 public isPreviousConfirmed(): any {
  let isConfirmed = Swal.fire({
    title: 'Do you want to leave this page?',
    text: "Changes you made may not be saved.",
    type: 'warning',
    showCancelButton: true,
    allowOutsideClick: false,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Leave',
    cancelButtonText: 'Stay'
  }).then((result) => {
   
    return (result.value) ? true : false
  })  
  
  return isConfirmed;
}


/**
  * Show confirmation popup before going to previous step.
  * @return any
  */
 public isCancelYourSubscriptionConfirmed(): any {
  let isConfirmed = Swal.fire({
    title: 'Are you sure you want to cancel this dealership?',
    text: "",
    type: 'warning',
    showCancelButton: true,
    allowOutsideClick: false,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Cancel Dealership',
    cancelButtonText: 'Do not Cancel'
  }).then((result) => {
   
    return (result.value) ? true : false
  })  
  
  return isConfirmed;
}

/**
  * Show confirmation popup before delete the record.
  * @return any
  */
 public isDeleteConfirmed(): any {

  let isConfirmed = Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    type: 'warning',
    showCancelButton: true,
    allowOutsideClick: false,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    return (result.value) ? true : false
  })

  return isConfirmed;
}

public isResetConfirmed(): any {

  let isConfirmed = Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    type: 'warning',
    showCancelButton: true,
    allowOutsideClick: false,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, reset it!'
  }).then((result) => {
    return (result.value) ? true : false
  })

  return isConfirmed;
}



  /**
* To check the image validity for type pdf
* @return boolean
* @param base64string image base64 string 
* @param type image type (pdf)
*/
public isPDFCorrupted(base64string, type): Observable<any> {

  const pdfData = Array.from(atob(base64string.replace('data:application/pdf;base64,', '')), c => c.charCodeAt(0))

  const params = { base64string : pdfData, fileExtension: type }
  
  return this.httpClient
    .post('common/checkPDFCorrupted', params)
    .map((response: Response) => {
      return response;
    })  
 } 

/**
   * Fetch city, state information of zipcode
   * @param zipcode    Vehicle zipcode.
   * @return        Observable<any>
*/
 public fetchCityStateOfZipcode(zipcode): Observable<any> {  
    
  let url = `${environment.ADDRESS_API.ENDPOINT}/lookup?auth-id=${environment.ADDRESS_API.KEY}&auth-token=${environment.ADDRESS_API.TOKEN}&zipcode=${zipcode}`;

  return this.httpClient.get(url)
      .map((response: any) => {         
          return response;
      })
}

/**
 * get Vehicle makes from DB
 * @return  array(makes)       
*/
public listingMakes(): Observable<any> {
  return this.httpClient.get('common/listingMakes')
    .map((response: any) => {
      //console.log(response); 
      return response;
    })
}

/**
 * get vehicle models from DB
 * @param makeData selected make from dropdown.
 * @return  array(makes)       
*/
public listingModels(makeData): Observable<any> {
  return this.httpClient.post('common/ListingModels', makeData)
    .map((response: any) => {
      //console.log(response); 
      return response;
    })
}

/**
 * get model trims from DB
 * @param modelData selected model from dropdown.
 * @return  array(models)       
*/
public listingTrimsWithBodystyles(modelData): Observable<any> {
  return this.httpClient.post('common/ListingTrimsWithBodystyles',modelData)
    .map((response: any) => {
      //console.log(response); 
      return response;
    })
}

/**
 * get model body styles from DB
 * @return  array(models)       
*/
public listingBodystyles(modelData): Observable<any> {
  return this.httpClient.post('common/listingBodystyles',modelData)
    .map((response: any) => {
      //console.log(response); 
      return response;
    })
}

/**
 * Add Your Payment Method
 * @param paymentData    Payment Details.
 * @return        Observable<any>
*/
public addPaymentMethod(paymentData): Observable<any> {
  console.log('paymentData', paymentData);
  return this.httpClient
  .post('payment/addSellerPaymentMethod', paymentData)
  .map((response: any) => {
      //console.log('response', response);
      return response;
  })

}


/**
 * Add Your Payment Method
 * @param paymentData    Payment Details.
 * @return        Observable<any>
*/
public addDealerPaymentMethod(paymentData): Observable<any> {
  console.log('paymentData', paymentData);
  return this.httpClient
  .post('payment/addDealerPaymentMethod', paymentData)
  .map((response: any) => {
      //console.log('response', response);
      return response;
  })

}



/**
 * Charge Auto Payment
 * @param paymentData   Payment Details.
 * @return  Observable<any>
*/

public makePayment(paymentData): Observable<any> {

  return this.httpClient
    .post('payment/makePayment', paymentData)
    .map((response: any) => {
      return response;
    })

}

/**
 * Payment Method Listings
 * @param postData   Payment Details.
 * @return  Observable<any>
*/
public paymentMethodListings(postData){      
  return this.httpClient.post('payment/listingPaymentMethods', postData).
  map((response: any) => response);       
}


/**
 * Payment Method Listings of dealer
 * @param postData   Payment Details.
 * @return  Observable<any>
*/
public dealerPaymentMethodListings(postData){      
  return this.httpClient.post('payment/dealerListingPaymentMethods', postData).
  map((response: any) => response);       
}
/**
 * Remove Card from DB
 * @param postData   Payment Details.
 * @return  Observable<any>
*/
public removeCard(postData){      
  return this.httpClient.post('payment/removeCard', postData).
  map((response: any) => response);       
}

/**
 * Remove Card from DB
 * @param postData   Payment Details.
 * @return  Observable<any>
*/
public removeDealerCard(postData){      
  return this.httpClient.post('payment/removeDealerCard', postData).
  map((response: any) => response);       
}


/**
  * Show confirmation popup before removing the card.
  * @return any
  */
 public isCardRemoveConfirmed(): any {
  let isConfirmed = Swal.fire({
    title: 'Are you sure you want to remove this card?',
    text: "",
    type: 'warning',
    showCancelButton: true,
    allowOutsideClick: false,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes',
    cancelButtonText: 'No'
  }).then((result) => {
   
    return (result.value) ? true : false
  })  
  
  return isConfirmed;
}

/**
  * Show confirmation popup before removing the card.
  * @return any
  */
 public isDefaultCardConfirmed(): any {
  let isConfirmed = Swal.fire({
    title: 'Are you sure you want to make this card default?',
    text: "",
    type: 'warning',
    showCancelButton: true,
    allowOutsideClick: false,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes',
    cancelButtonText: 'No'
  }).then((result) => {
   
    return (result.value) ? true : false
  })  
  
  return isConfirmed;
}

/**
 * Default Payment Method 
 * @param postData   Payment Details.
 * @return  Observable<any>
*/
public defaultCard(postData){      
  return this.httpClient.post('payment/defaultCard', postData).
  map((response: any) => response);       
}

/**
 * Default Payment Method 
 * @param postData   Payment Details.
 * @return  Observable<any>
*/
public dealerDefaultCard(postData){      
  return this.httpClient.post('payment/dealerDefaultCard', postData).
  map((response: any) => response);       
}



}