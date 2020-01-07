import { Component, SimpleChanges, OnInit, Output, EventEmitter, ViewChild, Input,  ElementRef } from '@angular/core';
//modules core services
import { TitleService } from '../../../../core/_services'

declare let $: any;

@Component({
  selector: 'app-contact-view',
  templateUrl: './contact-view.component.html',
  styleUrls: ['./contact-view.component.css']
})
export class ContactViewComponent{

  @Input() isOpen: any;
  @Input() dealershipObject: any;
  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('legalContactsSection') legalContactsSection :ElementRef;
  
  constructor(private titleService:TitleService) { }

  ngOnChanges(changes: SimpleChanges) {
    //setting the page title
    this.titleService.setTitle();
   console.log('the email is',this.dealershipObject)
    if(this.isOpen)
      $(this.legalContactsSection.nativeElement).modal({backdrop: 'static', keyboard: false, show: true}); 

  }
  /**
  * function to close the popup and emit response to onClose event
  * @return void
  */
  close() {
    this.isOpen = false
    this.onClose.emit(false);    
  }
  
 
}
