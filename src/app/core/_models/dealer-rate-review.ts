/**
 * A model for an individual corporate employee
 */
export class DealerRatingReview {
    _id: any;
    vehicle_year: any;
    vehicle_make: any;
    vehicle_model: any;
    vehicle_trim:any;
    car_rating:any;
    created_on: Date;
    purchase_date: Date;
    purchase_from: any;
    seller_id:any;
    rating_given: any;
    rating_received: any;
    review_given:any;
    review_received:any;
    price:any;
    profile_pic:any;
    vehicle_images:any;
    cover_image:any;




    constructor(object) {
        this._id = object._id;
        this.vehicle_images = object.vehicle_images;
        this.car_rating =object.car_rating;
        this.vehicle_year = object.vehicle_year;
        this.vehicle_make = object.vehicle_make;
        this.vehicle_model = object.vehicle_model;
        this.vehicle_trim = object.vehicle_trim;
        this.created_on = object.created_at;
        this.purchase_date = object.car_bids[0].bid_acceptance_date;
        this.purchase_from = object.seller[0].name.first_name;
        this.cover_image = (object.vehicle_images.length > 0) ? this.coverImage(object.vehicle_images) : 'assets/images/no_vehicle.png'
        this.profile_pic = (object.seller[0] && object.seller[0].profile_pic)?object.seller[0].profile_pic:'';
        this.seller_id = object.seller[0]._id;
        this.rating_received =object.dealer_ratings.length > 0?object.dealer_ratings[0].rating:0;
        this.review_received = object.dealer_ratings.length > 0?object.dealer_ratings[0].review:'';
        this.rating_given = object.seller_ratings.length > 0? object.seller_ratings[0].rating :0;
        this.review_given = object.seller_ratings.length > 0 ? object.seller_ratings[0].review:'';
        this.price = object.car_bids[0].price;
    }
    coverImage(images){
        let  imageObject = images.find(i => i.file_default == true)
       if(imageObject && imageObject.file_path)
            return imageObject['file_path']
        else
            return images[0]['file_path'];
    }
}