/**
 * A model for an individual corporate employee
 */
export class Dispute {
    _id: any;
    title: string;
    description: string;
    email: string;
    created_at:any;
    status:any;
    name:any;
    constructor(object){
        this._id  =  object. _id;
        this.title  =  object.title;
        this.description  =  object.description;
        this.email  =  object.is_seller ? object.seller_id.emails[0].email:object.dealer_id.emails[0].email;
        this.name = object.is_seller ? object.seller_id.name.first_name + ' '+object.seller_id.name.last_name :object.dealer_id.name.first_name +' '+object.dealer_id.name.last_name
        this.created_at  =  object.created_at;
        this.status  =  object.status;
             
    }
}