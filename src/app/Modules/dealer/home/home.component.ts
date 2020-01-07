import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

//import module services
import { TitleService } from '../../../core/_services'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @ViewChild("contentSection") contentSection: ElementRef;
  title: string = 'Cars Listing';
  breadcrumbs: any = [{ page: 'Home', link: '' }, { page: 'Cars Listing', link: '' }]

  constructor(private titleService: TitleService, ) { }

  ngOnInit() {
    this.contentSection.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });
    this.titleService.setTitle()
  }

}
