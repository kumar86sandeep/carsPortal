import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.css']
})
export class PageNotFoundComponent implements OnInit {

  //define the component properties
  title:string = 'Page Not Found';
  breadcrumbs:any = [{page:'Home',link:'#'},{page:'Page Not Found',link:''}]
  constructor() { }

  ngOnInit() {
  }

}
