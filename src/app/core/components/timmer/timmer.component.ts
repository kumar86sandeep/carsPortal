import { Component, ElementRef,Input, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx';

@Component({
  selector: 'app-timmer',
  templateUrl: './timmer.component.html',
  styleUrls: ['./timmer.component.css']
})
export class TimmerComponent implements OnInit {
  private future: Date;
  private futureString: string;
  @Input() inputDate:any;
  private counter$: Observable<number>;
  private subscription: Subscription;
   message: string;
   hour :string;
   
  constructor(elm: ElementRef) {
      // this.futureString = elm.nativeElement.getAttribute('inputDate');
  }
  dhms(t) {
    var days, hours, minutes, seconds;
    days = Math.floor(t / 86400);
    t -= days * 86400;
    hours = Math.floor(t / 3600) % 24;
    // hours = Math.floor(t / 24);
    let total_hours = (days * 24) + hours;
   
    t -= hours * 3600;
    minutes = Math.floor(t / 60) % 60;
    t -= minutes * 60;
    seconds = t % 60;
   
      total_hours = total_hours < 10 ? '0'+total_hours: total_hours;
      minutes = minutes < 10 ? '0'+minutes: minutes;
  
    
    
    return [
      // (days > 0 ) ? days + 'd':'',
      total_hours+':',
        minutes+':'  +seconds
    ].join('');
}

  ngOnInit() {
    this.futureString = this.inputDate
    this.future = new Date(this.futureString);
    this.counter$ = Observable.interval(1000).map((x) => {
       return Math.floor((this.future.getTime() - new Date().getTime()) / 1000);
    });

    this.subscription = this.counter$.subscribe((x) =>{
      this.message = this.dhms(x)
      this.hour = this.message.split(':')[0];
    });
}

ngOnDestroy(): void {
    this.subscription.unsubscribe();
}
}
