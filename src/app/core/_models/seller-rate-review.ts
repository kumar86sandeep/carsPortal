/**
 * A model for an individual corporate employee
 */
export class SellerRatingReview {
    _id: any;
    vehicle_year: any;
    vehicle_make: any;
    vehicle_model: any;
    vehicle_trim:any;
    created_on: Date;
    sold_date: Date;
    sold_to: any;
    profile_pic:any;
    dealer_id:any;
    rating_given: any;
    rating_received: any;
    review_given:any;
    review_received:any
    price:any;




    constructor(object) {
        this._id = object._id;
        this.vehicle_year = object.vehicle_year;
        this.vehicle_make = object.vehicle_make;
        this.vehicle_model = object.vehicle_model;
        this.vehicle_trim = object.vehicle_trim;
        this.created_on = object.created_at;
        this.sold_date = object.car_bids[0].bid_acceptance_date;
        this.sold_to = object.dealer[0]?object.dealer[0].name.first_name:'';
        this.profile_pic = (object.dealer[0] && object.dealer[0].profile_pic) ? object.dealer[0].profile_pic:''
        this.dealer_id = object.dealer[0]?object.dealer[0]._id:'';
        this.rating_received = object.seller_ratings.length > 0 ? object.seller_ratings[0].rating:0;
        this.review_received = object.seller_ratings.length > 0 ? object.seller_ratings[0].review:'';
        this.rating_given =object.dealer_ratings.length > 0 ?object.dealer_ratings[0].rating:0;
        this.review_given = object.dealer_ratings.length > 0 ?object.dealer_ratings[0].review:'';

        this.price = object.car_bids[0].price;
    }
}