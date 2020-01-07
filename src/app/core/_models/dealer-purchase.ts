/**
 * A model for an individual corporate employee
 */
export class Purchase {
           car_id:any;
          
           bid_date:Date;
           bid_acceptance_date:Date;
           price:number;
           contact:any;
           fee_status:string;




  constructor(object){
    this.car_id = object.cars;
    this.bid_date = object.bid_date;
    this.price  = object.bid_price;
    this.bid_acceptance_date= object.bid_acceptance_date;
   
    this.contact=(object.dealership.length) ? object.dealership[0].legalcoroporationname:'' ;
    this.fee_status = object.fee_status;
    }
}