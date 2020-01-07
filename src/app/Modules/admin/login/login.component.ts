import { Component, OnInit } from '@angular/core';
import { AlertService, PageLoaderService } from '../../../shared/_services'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private alertService:AlertService, private pageLoaderService:PageLoaderService) { }

  ngOnInit() {
    //this.pageLoaderService.pageLoader(true);
    this.alertService.setAlert('success','Data has been added');
    
  }

}
