import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/observable/of';
import { PagedData, SellerRatingReview, Page ,Dispute} from "../../core/_models";
import { retry } from 'rxjs/operators';

/**
 * A server used to mock a paged data result from a server
 */
@Injectable()
export class SellerService {

    constructor(private httpClient: HttpClient) { }

    /**
    * List seller's car
    * @param page    passed object of Page.
    * @return        Observable<PagedData<Car>>
   */

    public getSellerRatingList(page: Page): Observable<any> {

        page['seller_id'] = localStorage.getItem('loggedinUserId')
        // page['seller_id'] = '5cd170562688321559f12f32'
        return this.httpClient.post('car/getsellerRating', page)
            .map((response: any) => {
                console.log('response', response);

                page.totalElements = response.count;
                let pagedData = new PagedData<SellerRatingReview>();
                page.totalElements = response.count;
                page.totalPages = page.totalElements / page.size;
                let start = page.pageNumber * page.size;
                for (let i in response.records) {
                    let jsonObj = response.records[i];
                    let carRate = new SellerRatingReview(jsonObj);
                    pagedData.data.push(carRate);
                }
                pagedData.page = page;
                return pagedData;
            });
    }



    public saveDealerRating(postedData: any): Observable<any> {
        postedData['seller_id'] = localStorage.getItem('loggedinUserId');
        return this.httpClient.post('car/saveDealerRating', postedData).map((response: any) => response);

    }


    public acceptBid(postedData: any): Observable<any> {
        postedData['seller_id'] = localStorage.getItem('loggedinUserId');
        return this.httpClient.post('car/acceptBid', postedData).map((response: any) => response);

    }
    public checkSellerPaymentMethod(postedData: any): Observable<any> {
        postedData['seller_id'] = localStorage.getItem('loggedinUserId');
        return this.httpClient.post('seller/checkPaymentMethod', postedData).map((response: any) => response);

    }
    public chargeServiceFee(postedData: any): Observable<any> {
        postedData['seller_id'] = localStorage.getItem('loggedinUserId');
        return this.httpClient.post('payment/chargePayment', postedData).map((response: any) => response);

    }
    public rejectBid(postedData: any): Observable<any> {
        postedData['seller_id'] = localStorage.getItem('loggedinUserId');
        return this.httpClient.post('car/rejectBid', postedData).map((response: any) => response);

    }

    public getChatDetails(postedData: any): Observable<any> {
        postedData['seller_id'] = localStorage.getItem('loggedinUserId');
        return this.httpClient.post('seller/getChatDetails', postedData).map((response: any) => response);

    }
    public saveMessage(postedData: any): Observable<any> {
        postedData['seller_id'] = localStorage.getItem('loggedinUserId');
        return this.httpClient.post('common/saveMessage', postedData).map((response: any) => response);

    }

    public getSellerChatDetails(postedData: any): Observable<any> {
        postedData['seller_id'] = localStorage.getItem('loggedinUserId');
        return this.httpClient.post('seller/getSellerChatDetails', postedData).map((response: any) => response);

    }

    public getAllMessageNotifications(): Observable<any> {
        let postedData = {};
        postedData['seller_id'] = localStorage.getItem('loggedinUserId');
        return this.httpClient.post('seller/getSellerUnreadMessages', postedData).map((response: any) => response);

    }


    public getAllDisputes(page): Observable<any> {
        page['is_seller'] = true;
        page['seller_id'] = localStorage.getItem('loggedinUserId');
        return this.httpClient.post('common/getDisputes', page).map((response: any) => {

            page.totalElements = response.count;
            let pagedData = new PagedData<Dispute>();
            page.totalElements = response.count;
            page.totalPages = page.totalElements / page.size;
            let start = page.pageNumber * page.size;
            for (let i in response.records) {
                let jsonObj = response.records[i];
                let dispute = new Dispute(jsonObj);
                pagedData.data.push(dispute);
            }
            pagedData.page = page;
            return pagedData;
        });

    }
    public saveDispute(postedData): Observable<any> {
       
        postedData['seller_id'] = localStorage.getItem('loggedinUserId');
        postedData['is_seller'] = true;
        return this.httpClient.post('common/saveDispute', postedData).map((response: any) => response);

    }
    public saveDisputeMessage(postedData:any): Observable<any> {
        postedData['seller_id'] = localStorage.getItem('loggedinUserId');
        return this.httpClient.post('common/saveDisputeMessage', postedData).map((response: any) => response);

    }
    public getDisputeDetail(postedData): Observable<any> {
       
        postedData['seller_id'] = localStorage.getItem('loggedinUserId');
        postedData['is_seller'] = true;
        return this.httpClient.post('common/getDisputeDetail', postedData).map((response: any) => response);

    }

    public saveSearch(postedData: any): Observable<any> {
        postedData['seller_id'] = localStorage.getItem('loggedinUserId');
        return this.httpClient.post('seller/saveSearch', postedData).map((response: any) => response);

    }

    public getSearches(search: any): Observable<any> {
        search['seller_id'] = localStorage.getItem('loggedinUserId');
        return this.httpClient.post('seller/getSearches', search).map((response: any) => response);

    }
    public removeSearch(searchId): Observable<any> {
        let dealer_id = localStorage.getItem('loggedinUserId');
        return this.httpClient.post('seller/removeSearch', { searchId: searchId }).map((response: any) => response);

    }


public chatDealersListing(){
    let postedData = {
        seller_id: localStorage.getItem('loggedinUserId')
    }
    return this.httpClient.post('seller/chatDealersListing', postedData).map((response: any) => response);
}
}