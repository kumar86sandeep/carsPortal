import { Component,SimpleChanges, ViewChild, Output, EventEmitter, OnInit, Input,  ElementRef } from '@angular/core';
//modules core services
import { TitleService  } from '../../../../core/_services'

declare let $: any;

@Component({
  selector: 'app-dealership-view',
  templateUrl: './dealership-view.component.html',
  styleUrls: ['./dealership-view.component.css']
})
export class DealershipViewComponent implements OnInit {
  @Input() isOpen: any;
  @Input() dealershipObject: any;
  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('contentSection') contentSection :ElementRef;

  constructor(private titleService:TitleService) { }

  ngOnInit() {
  }

  close() {
    this.isOpen = false
    this.onClose.emit(false);    
  }
  ngOnChanges(changes: SimpleChanges) {
    //setting the page title
    this.titleService.setTitle();

    if(this.isOpen)
      $(this.contentSection.nativeElement).modal({backdrop: 'static', keyboard: false, show: true}); 

  }

}