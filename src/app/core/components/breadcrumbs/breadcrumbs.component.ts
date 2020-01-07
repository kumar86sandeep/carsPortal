import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.css']
})
export class BreadcrumbsComponent implements OnInit {
  @Input() pageTitle: string;
  @Input() breadcrumbs: any[];
  @ViewChild("contentSection") contentSection: ElementRef;

  constructor() { }

  ngOnInit() {
    this.contentSection.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });//scroll the page to defined section #contentSection
  }

}
