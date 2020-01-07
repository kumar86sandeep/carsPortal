import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/observable/of';
import { DealerRatingReview,Dispute } from '../_models'
import { PagedData, Purchase, Page, Invoice } from "../../core/_models";
/**
 * A server used to mock a paged data result from a server
 */
@Injectable()
export class DealerService {

    constructor(private httpClient: HttpClient) { }

    /**
    * List seller's car
    * @param page    passed object of Page.
    * @return        Observable<PagedData<Car>>
   */

    public getPurchaseList(page: Page): Observable<any> {

        page['dealer_id'] = localStorage.getItem('loggedinUserId') 
        // page['dealer_id'] = '5ca1e88f9dac60394419c0bc'
        return this.httpClient.post('dealer/getPurchaseList', page)
            .map((response: any) => {
                console.log('response', response);

                page.totalElements = response.count;
                let pagedData = new PagedData<Purchase>();
                page.totalElements = response.count;
                page.totalPages = page.totalElements / page.size;
                let start = page.pageNumber * page.size;
                for (let i in response.records) {
                    let jsonObj = response.records[i];
                    let car = new Purchase(jsonObj);
                    pagedData.data.push(car);
                }
                pagedData.page = page;
                return pagedData;
            });
    }



    public getDealerRatingList(page: Page): Observable<any> {

        page['dealer_id'] = localStorage.getItem('loggedinUserId')
        // page['seller_id'] = '5cd170562688321559f12f32'
        return this.httpClient.post('car/getDealerRating', page)
            .map((response: any) => {
                console.log('response', response);

                page.totalElements = response.count;
                let pagedData = new PagedData<DealerRatingReview>();
                page.totalElements = response.count;
                page.totalPages = page.totalElements / page.size;
                let start = page.pageNumber * page.size;
                for (let i in response.records) {
                    let jsonObj = response.records[i];
                    let carRate = new DealerRatingReview(jsonObj);
                    pagedData.data.push(carRate);
                }
                pagedData.page = page;
                return pagedData;
            });
    }

    public saveSellerRating(postedData: any): Observable<any> {
        postedData['dealer_id'] = localStorage.getItem('loggedinUserId');
        return this.httpClient.post('car/saveSellerRating', postedData).map((response: any) => response);

    }

    public saveCarRating(postedData: any): Observable<any> {
        postedData['dealer_id'] = localStorage.getItem('loggedinUserId');
        return this.httpClient.post('car/saveCarRating', postedData).map((response: any) => response);

    }
    public getAllDealShips(): Observable<any> {
        let postedData ={};
        postedData['dealer_id'] = localStorage.getItem('loggedinUserId');
        return this.httpClient.post('dealer/getAllDealerShips', postedData).map((response: any) => response);

    }


    public placeBid(postedData:any): Observable<any> {
        postedData['dealer_id'] = localStorage.getItem('loggedinUserId');
        return this.httpClient.post('dealer/createBid', postedData).map((response: any) => response);

    }
    public saveSearch(postedData:any): Observable<any> {
        postedData['dealer_id'] = localStorage.getItem('loggedinUserId');
        return this.httpClient.post('dealer/saveSearch', postedData).map((response: any) => response);

    }

    public getSearches(search:any): Observable<any> {
        search['dealer_id'] = localStorage.getItem('loggedinUserId');
        return this.httpClient.post('dealer/getSearches', search).map((response: any) => response);

    }
    public removeSearch(searchId): Observable<any> {
        let dealer_id = localStorage.getItem('loggedinUserId');
         return this.httpClient.post('dealer/removeSearch', {searchId:searchId}).map((response: any) => response);
 
     }
    

    
    public updateBid(postedData:any): Observable<any> {
        postedData['dealer_id'] = localStorage.getItem('loggedinUserId');
        return this.httpClient.post('dealer/placeBid', postedData).map((response: any) => response);

    }
    
    public updateBidPrice(postedData:any): Observable<any> {
        postedData['dealer_id'] = localStorage.getItem('loggedinUserId');
        return this.httpClient.post('dealer/updateBid', postedData).map((response: any) => response);

    }
    public updateBidProxyPrice(postedData:any): Observable<any> {
        postedData['dealer_id'] = localStorage.getItem('loggedinUserId');
        return this.httpClient.post('dealer/updateProxyBid', postedData).map((response: any) => response);

    }
    
    public getChatDetails(postedData:any): Observable<any> {
        postedData['dealer_id'] = localStorage.getItem('loggedinUserId');
        return this.httpClient.post('dealer/getChatDetails', postedData).map((response: any) => response);

    }
    public checkDealerPaymentMethod(postedData: any): Observable<any> {
        postedData['dealer_id'] = localStorage.getItem('loggedinUserId');
        return this.httpClient.post('dealer/checkPaymentMethod', postedData).map((response: any) => response);
  
    }
    public getDealerChatDetails(postedData:any): Observable<any> {
        postedData['dealer_id'] = localStorage.getItem('loggedinUserId');
        return this.httpClient.post('dealer/getDealerChatDetails', postedData).map((response: any) => response);

    }
    public getDisputeDetail(postedData): Observable<any> {

        console.log('the req i '+JSON.stringify(postedData))
       
        postedData['dealer_id'] = localStorage.getItem('loggedinUserId');
        postedData['is_seller'] = false;
        return this.httpClient.post('common/getDisputeDetail', postedData).map((response: any) => response);

    }

    public saveMessage(postedData:any): Observable<any> {
        postedData['dealer_id'] = localStorage.getItem('loggedinUserId');
        return this.httpClient.post('common/saveMessage', postedData).map((response: any) => response);

    }

    public saveDisputeMessage(postedData:any): Observable<any> {
        postedData['dealer_id'] = localStorage.getItem('loggedinUserId');
        return this.httpClient.post('common/saveDisputeMessage', postedData).map((response: any) => response);

    }
    public getAllMessageNotifications(): Observable<any> {
        let postedData ={};
        postedData['dealer_id'] = localStorage.getItem('loggedinUserId');
        return this.httpClient.post('dealer/getDealerUnreadMessages', postedData).map((response: any) => response);
    
    }

    public reportSpam(postedData, carId): Observable<any> {        
        let data = {
            report_spam_dealers:postedData,
            car_id : carId
        }
        return this.httpClient.post('dealer/reportSpam', data).map((response: any) => response);
    
    }

    public chatSellersListing(){
        let postedData = {
            dealer_id: localStorage.getItem('loggedinUserId')
        }
        return this.httpClient.post('dealer/chatSellersListing', postedData).map((response: any) => response);
    }
    public getAllDisputes(page): Observable<any> {
       
        page['dealer_id'] = localStorage.getItem('loggedinUserId');
        return this.httpClient.post('dealer/getDisputes', page) .map((response: any) => {
            console.log('response', response);

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
       
        postedData['dealer_id'] = localStorage.getItem('loggedinUserId');
        return this.httpClient.post('dealer/saveDispute', postedData).map((response: any) => response);

    }

    /***************************
     Invoice section 
     ***************************/
    public invoiceListing(page){
        let userData = JSON.parse(localStorage.getItem('loggedinUser'));//parsing the local store data
        let postedData = {
            dealer_id: localStorage.getItem('loggedinUserId'),
            subscription_id:userData.subscription_id,
            page:page.offset,
            limit:page.limit,
            type:page.status,
        }
        console.log('postedData',postedData);
        return this.httpClient.post('dealer/invoiceListing', postedData).
        map((response: any) => response);
        /*map((response: any) => {          

            page.totalElements = 1000//response.count;
            let pagedData = new PagedData<Invoice>();
            page.totalElements = 1000//response.count;
            page.totalPages = page.totalElements / page.size;
            let start = page.pageNumber * page.size;
            for (let i in response.invoices) {
                let jsonObj = response.invoices[i];
                let invoiceObject = new Invoice(jsonObj);
                pagedData.data.push(invoiceObject);
            }
            pagedData.page = page;
            return pagedData;
        });*/
    }  
    
    //invoice details
    public invoiceDetails(postedData){
        
        console.log('postedData',postedData);
        return this.httpClient.post('dealer/invoiceDetails', postedData).
        map((response: any) => response);
    }

     /***************************
     Invoice section 
     ***************************/
    public transactionsListing(page){
       
        console.log('postedData',page);
        return this.httpClient.post('dealer/transactionListing', page).
        map((response: any) => response);       
    }
}
