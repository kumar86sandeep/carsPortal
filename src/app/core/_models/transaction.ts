import { DateTime } from 'aws-sdk/clients/transcribeservice';

/**
 * A model for an individual corporate employee
 */
export class Transaction {

    transaction_number:any;
    status:string;
    customer_name:string;
    status_transitions:object;
    amount_due:number
    amount_paid:number
    amount_remaining:number
    total:number
    hosted_invoice_url:string
    invoice_pdf:string
    paid_on:DateTime
    constructor(object){
    
        this.transaction_number  =  object.number;        
        this.status  =  object. status;        
        this.customer_name = object.customer_name 
        this.customer_name = object.customer_name 
        this.status_transitions = object.status_transitions
        this.amount_due = (object.amount_due/100)
        this.amount_paid = (object.amount_paid/100)
        this.total = object.total
        this.amount_remaining = object.amount_remaining
        this.hosted_invoice_url = object.hosted_invoice_url
        this.invoice_pdf = object.invoice_pdf
        this.paid_on = new Date(object.status_transitions.paid_at * 1000)

    }
}