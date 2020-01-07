/**
 * A model for an individual corporate employee
 */
export class Bid {
    // car_id:any;
    dealer_name:any;
    bid_date:Date;
    buyer_rating:any;
    price:number;
    car:any;
    bidId:any;
    status:any;
    legal_contact:any;




constructor(object){
    
    if(object && object.dealer_id && object.dealer_id.name)
    this.dealer_name=object.dealer_id.name.first_name +' '+object.dealer_id.name.last_name;
    // this.buyer_rating = object.dealer_id.rating;
    this.buyer_rating = 2.5;
    this.bid_date = object.bid[object.bid.length-1].bid_date;
    this.price  = object.bid[object.bid.length-1].price;
    this.car = object.car_id,
    this.bidId =object._id;
    this.status = object.bid_acceptance;
    legal_contact:object.bid[object.bid.length-1].legal_contact
}
}