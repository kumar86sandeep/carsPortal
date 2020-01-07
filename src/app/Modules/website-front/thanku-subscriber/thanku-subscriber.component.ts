import { Component, OnInit } from '@angular/core';
//modules core services
import { TitleService} from '../../../core/_services'


@Component({
  selector: 'app-thanku-subscriber',
  templateUrl: './thanku-subscriber.component.html',
  styleUrls: ['./thanku-subscriber.component.css']
})
export class ThankuSubscriberComponent implements OnInit {
  title: string = 'Thank You';  
  breadcrumbs: any[] = [{ page: 'Home', link: '/web' }, { page: 'Thank You', link: '' }]

  constructor(private titleService:TitleService) { }

  ngOnInit() {
    this.titleService.setTitle(); //setting page title 
  }

}
