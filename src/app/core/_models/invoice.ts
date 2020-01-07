/**
 * A model for an individual corporate employee
 */
export class Invoice {
    invoice_id: any;
    invoice_number:any;
    status:string;
    invoice_date:Date;
    due_date:Date;
    customer_id:any;
    customer_name:string
    email:string
    balance:number
    total:number
    currency_code:string
    currency_symbol:string
    created_time:Date
    updated_time:Date

    constructor(object){
        this.invoice_id  =  object. invoice_id;   
        this.invoice_number  =  object.number;        
        this.status  =  object. status;
        this.invoice_date  =  object.invoice_date;
        this.due_date = object.due_date;
        this.customer_id  =  object. customer_id;
        this.customer_name  =  object. customer_name;
        this.email  =  object. email;
        this.balance  =  object.balance;
        this.total  =  object. total;
        this.currency_code  =  object.currency_code;
        this.currency_symbol  =  object.currency_symbol;
        this.created_time  =  object.created_time;
        this.updated_time  =  object.updated_time;        
    }
}