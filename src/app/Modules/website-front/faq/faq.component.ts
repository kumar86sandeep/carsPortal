import { Component, OnInit } from '@angular/core';
//modules core services
import { TitleService} from '../../../core/_services'


declare var jQuery: any;
declare var $: any;
declare var POTENZA: any;

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent implements OnInit {

  title: string = 'FAQ';
  breadcrumbs: any[] = [{ page: 'Home', link: '/web/' }, { page: 'FAQ', link: '' }]

  constructor(private titleService:TitleService) { }

  ngOnInit() {
    this.titleService.setTitle();//setting page title 
    POTENZA.accordion();
    POTENZA.tabs();
  }

}
