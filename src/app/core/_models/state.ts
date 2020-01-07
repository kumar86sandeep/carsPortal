/**
 * A model for an individual corporate employee
 */
export class Car {
    _id: any;
    ref: number;
    vin: string;
    mileage:number;
    year: number;
    make: string;
    model: string;
    body_style:string;
    trim: string;
    doors:number;
    engine:number;
    transmission:string;
    fuel_type:string;
    drive_type:string;
    interior_color:string;
    exterior_color:string;
    interior_material:string;
    best_bid:number;
    created_at: Date;
    offer_in_hand:number;
    comments:string;
    car_selleing_radius:number;
    location:any;  
    bids:any;
    images:any;
    offer_in_hand_images:any

     







    constructor(object){
        this._id  =  object. _id;
        this.ref  =  object. ref;
        this.vin  =  object. vin;
        this.mileage  =  object.mileage;
        this.year  =  object. year;
        this.make  =  object. make;
        this.model  =  object. model;
        this.body_style  =  object.body_style;
        this.trim  =  object. trim;
        this.doors  =  object.doors;
        this.engine  =  object.engine;
        this.transmission  =  object.transmission;
        this.fuel_type  =  object.fuel_type;
        this.drive_type  =  object.drive_type;
        this.interior_color  =  object.interior_color;
        this.exterior_color  =  object.exterior_color;
        this.interior_material  =  object.interior_material;
        this.best_bid  =  object.best_bid;
        this.created_at  =  object. created_at;
        this.offer_in_hand  =  object.offer_in_hand;
        this.comments  =  object.comments;
        this.car_selleing_radius  =  object.car_selleing_radius;
        this.location  =  object.location;  
        this.bids  =  object.bids;
        this.images  =  object.images;
        this.offer_in_hand_images  =  object.offer_in_hand_images
    }
}