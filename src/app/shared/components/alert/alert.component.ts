import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { AlertService } from '../../_services/index';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {


  alertMsgObj: any = {};
  alertSubscription: Subscription;
  constructor(private alertService: AlertService) { }

  ngOnInit() {
    this.alertSubscription = this.alertService.getAlert().subscribe((alert) => {
      this.alertMsgObj = alert;
    });
  }
  removeAlert() {
    this.alertMsgObj = {}
  }
  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.alertSubscription.unsubscribe();
  }

}
