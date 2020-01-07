import { Component, OnInit } from '@angular/core';
//modules core services
import { TitleService } from '../../../core/_services/index'

@Component({
  selector: 'app-term-conditions',
  templateUrl: './term-conditions.component.html'
})
export class TermConditionsComponent implements OnInit { 

  title: string = 'User Agreement';
  breadcrumbs: any = [{ page: 'Home', link: '' }, { page: 'Register', link: '/seller/signup' }, { page: 'User Agreement', link: '' }]


  constructor(private titleService: TitleService) { }

  ngOnInit() {   
    this.titleService.setTitle();
  }

}
