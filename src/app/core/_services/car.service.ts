import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/observable/of';
import { delay } from "rxjs/operators";
import { PagedData, Car, Page, Bid } from "../../core/_models";

/**
 * A server used to mock a paged data result from a server
 */
@Injectable()
export class CarService {


    constructor(private httpClient: HttpClient) { }

    /**
     * List seller's car
     * @param page    passed object of Page.
     * @return        Observable<PagedData<Car>>
    */

    public listingCars(page: Page): Observable<PagedData<Car>> {

        page['seller_id'] = localStorage.getItem('loggedinUserId')
        // page['seller_id'] = '5cd170562688321559f12f32'
        return this.httpClient.post('car/listingCars', page)
            .map((response: any) => {

                page.totalElements = response.count;
                let pagedData = new PagedData<Car>();
                page.totalElements = response.count;
                page.filteredElements = response.filteredRecords;
                page.totalPages = page.totalElements / page.size;
                let start = page.pageNumber * page.size;
                for (let i in response.records) {
                    let jsonObj = response.records[i];
                    //console.log('jsonObj', jsonObj);
                    let car = new Car(jsonObj);

                    // console.log('created object', car);
                    pagedData.data.push(car);
                }
                pagedData.page = page;
                return pagedData;
            })
    }

    /**
     * List seller's car
     * @param page    passed object of Page.
     * @return        Observable<PagedData<Car>>
    */

    public listingCarsOnDatable(page: Page): Observable<PagedData<Car>> {

        page['seller_id'] = localStorage.getItem('loggedinUserId')
        // page['dealer_id'] = '5cf5ccb2307a6515e914c269'
        return this.httpClient.post('car/listingCarsOnDatable', page)
            .map((response: any) => {

                page.totalElements = response.count;
                let pagedData = new PagedData<Car>();
                page.totalElements = response.count;
                page.filteredElements = response.filteredRecords;
                page.totalPages = page.totalElements / page.size;
                let start = page.pageNumber * page.size;
                for (let i in response.records) {
                    let jsonObj = response.records[i];
                    let car = new Car(jsonObj);
                    pagedData.data.push(car);
                }
                pagedData.page = page;
                return pagedData;
            })
    }



    /**
     * List cars on which delaer has posted the bids
     * @param page    passed object of Page.
     * @return        Observable<PagedData<Car>>
    */
    public listingDealersCars(page: Page): Observable<PagedData<Car>> {

        page['dealer_id'] = localStorage.getItem('loggedinUserId')
        // page['dealer_id'] = '5ca1e88f9dac60394419c0bc'

        return this.httpClient.post('car/getdealerCarListing', page)
            .map((response: any) => {

                page.totalElements = response.count;
                let pagedData = new PagedData<Car>();
                page.totalElements = response.count;
                page.filteredElements = response.filteredRecords;
                page.totalPages = page.totalElements / page.size;
                let start = page.pageNumber * page.size;
                for (let i in response.records) {
                    let jsonObj = response.records[i];
                    //console.log('jsonObj', jsonObj);
                    let car = new Car(jsonObj);

                    //console.log('created object', car);
                    pagedData.data.push(car);
                }
                pagedData.page = page;
                return pagedData;
            })
    }

    /**
     * Delete car
     * @param carObject    car object to delete from database.
     * @return        Observable<any>
    */
    public deleteCar(carObject): Observable<any> {

        return this.httpClient.post('car/deleteCar', carObject)
            .map((response: any) => response)
    }


    /**
      * Cancel carbid
      * @param bidId    bid id is  to cancel from database.
      * @return        Observable<any>
     */
    public cancelBid(bidId): Observable<any> {

        return this.httpClient.post('car/cancelBid', bidId)
            .map((response: any) => response)
    }
    /**
      * Relist car
      * @param carid    
      * @return        Observable<any>
     */
    public relistCar(car_id): Observable<any> {

        return this.httpClient.post('car/relistCar', { car_id: car_id })
            .map((response: any) => response)
    }

    /**
      * Cancel carbid
      * @param carid    bid id is  to change to sold.
      * @return        Observable<any>
     */
    public changeCarStatustoSold(carid): Observable<any> {

        return this.httpClient.post('car/changeCarStatustoSold', { carid: carid })
            .map((response: any) => response)
    }


    /**
     * Fetch car details
     * @param carObject    car object to fetch from database.
     * @return        Observable<any>
    */
    public carDetail(carIdObject): Observable<any> {

        return this.httpClient.post('car/carDetail', carIdObject)
            .map((response: any) => {
                console.log('car response', response);
                let car = new Car(response);
                console.log('car detail', car);
                return car;
            })
    }



    /**
     * Fetch car details
     * @param carObject    car object to fetch from database.
     * @return        Observable<any>
    */
    public dealerCarDetail(carIdObject): Observable<any> {
        carIdObject['dealer_id'] = localStorage.getItem('loggedinUserId')
        return this.httpClient.post('car/dealerCarDetail', carIdObject)
            .map((response: any) => {
                console.log('car response', response);
                let car = new Car(response);
                console.log('car detail', car);
                return car;
            })
    }

    /*
    * @param carData    car object to delete from database.
    * @return        Observable<any>
   */
    public removeCar(carData): Observable<any> {

        return this.httpClient.post('car/deleteCar', carData)
            .map((response: any) => response)
    }

    /*
    * @param requestData    contact request object 
    * @return        Observable<any>
   */
    public contactRequest(requestData): Observable<any> {

        return this.httpClient.post('car/contactRequest', requestData)
            .map((response: any) => response)
    }


    /*
      * @param carId    car id to fetch data from database.
      * @return        Observable<any>
     */
    public getCarBids(page: Page): Observable<PagedData<Bid>> {



        return this.httpClient.post('car/getCarBids', page)
            .map((response: any) => {
                page.totalElements = response.count;
                let pagedData = new PagedData<Bid>();
                page.filteredElements = response.filteredRecords;
                page.totalPages = page.totalElements / page.size;
                for (let i in response.records) {
                    let jsonObj = response.records[i];
                    let bid = new Bid(jsonObj);
                    pagedData.data.push(bid);
                }
                pagedData.page = page;
                return pagedData;



            })


    }

    /*
  * @param carId    car id to fetch data from database.
  * @return        Observable<any>
 */
    public listingCarBids(carObject): Observable<PagedData<Bid>> {



        return this.httpClient.post('car/listingCarBidsData', carObject)
            .map((response: any) => response)


    }
    /*
    * Function to rate & review car by dealer
    * @param ratingReview    rating and review object
    * @return        Observable<any>
    */
    public ratingReviewByDealer(ratingReview): Observable<any> {

        ratingReview['seller_id'] = localStorage.getItem('loggedinUserId')
        return this.httpClient.post('car/ratingReviewByDealer', ratingReview)
            .map((response: any) => response)
    }


    /*
    * Function to rate & review car by seller
    * @param ratingReview    rating and review object
    * @return        Observable<any>
    */
    public ratingReviewBySeller(ratingReview): Observable<any> {
        ratingReview['seller_id'] = localStorage.getItem('loggedinUserId')
        // ratingReview['seller_id'] = '5ca1e88f9dac60394419c0bc'
        return this.httpClient.post('car/ratingReviewBySeller', ratingReview)
            .map((response: any) => response)
    }


    /*
    * Function to rate & review car by seller
    * @param ratingReview    rating and review object
    * @return        Observable<any>
    */
    public changeCarStatus(carData): Observable<any> {
        return this.httpClient.post('car/changeCarStatus', carData)
            .map((response: any) => response)
    }

    /**
     * Fetch car details
     * @param carObject    car object to fetch from database.
     * @return        Observable<any>
    */
    public fetchCarDetails(carIdObject): Observable<any> {

        return this.httpClient.post('car/carDetail', carIdObject)
            .map((response: any) => {
                //let car = new Car(response);
                //console.log('car detail', car);
                return response;
            })
    }



    /**
     * Delete car
     * @param carObject    car object to delete from database.
     * @return        Observable<any>
    */
    public saveCarInWishList(carObject): Observable<any> {
        carObject['dealer_id'] = localStorage.getItem('loggedinUserId')
        return this.httpClient.post('car/saveCarToWishList', carObject)
            .map((response: any) => response)
    }

    /**
      * Delete car
      * @param carObject    car object to delete from database.
      * @return        Observable<any>
     */
    public moveCarFromWishList(carObject): Observable<any> {
        carObject['dealer_id'] = localStorage.getItem('loggedinUserId')
        return this.httpClient.post('car/deleteCarFromWishList', carObject)
            .map((response: any) => response)
    }



    /**
        * hide car
        * @param carObject    car object to hide from database.
        * @return        Observable<any>
       */
    public hideCar(carObject): Observable<any> {
        carObject['dealer_id'] = localStorage.getItem('loggedinUserId')
        return this.httpClient.post('car/hideCar', carObject)
            .map((response: any) => response)
    }
    /**
           * unhide car
           * @param carObject    car object to unhide from hide list.
           * @return        Observable<any>
          */
    public unhideCar(carObject): Observable<any> {
        carObject['dealer_id'] = localStorage.getItem('loggedinUserId')
        return this.httpClient.post('car/unhideCar', carObject)
            .map((response: any) => response)
    }

    /**
     * onTransctionComplete car
     * @param postedData    car object to update car status.
     * @return   Observable<any>
     */
    public onTransctionComplete(postedData: any): Observable<any> {
        return this.httpClient.post('payment/onTransctionComplete', postedData).map((response: any) => response);

    }





}
