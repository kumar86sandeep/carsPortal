import { Component, OnInit } from '@angular/core';
//modules core services
import { TitleService} from '../../../core/_services'

declare var POTENZA: any;

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
  title: string = 'About Us';  
  breadcrumbs: any[] = [{ page: 'Home', link: '/web' }, { page: 'About Us', link: '' }]

  constructor(private titleService:TitleService) { }
  
  ngOnInit() {
    this.titleService.setTitle();//setting page title 
    POTENZA.carousel()
  }

}
