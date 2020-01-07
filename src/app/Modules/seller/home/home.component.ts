import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  title: string = 'Cars Listing';
  breadcrumbs: any = [{ page: 'Home', link: '/seller/home' }, { page: 'Cars Listing', link: '' }]

  constructor() { }

  ngOnInit() {
    //POTENZA.scrolltotop()
  }

}
