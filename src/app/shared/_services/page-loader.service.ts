import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { Router, NavigationStart } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PageLoaderService {

  public pageLoaderStatus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
  public shouldPageLoad: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
  public pageLoaderText: Subject<any> = new Subject<any>();
  private keepAfterRouteChange = false;

  constructor(private router: Router) {
    // clear alert messages on route change unless 'keepAfterRouteChange' flag is true
    router.events.subscribe(event => {
        if (event instanceof NavigationStart) {
            if (this.keepAfterRouteChange) {
                // only keep for a single route change
                this.keepAfterRouteChange = false;
            } else {
                // clear alert messages
                this.clear();
            }
        }
    });
}

clear() {
    // clear alerts
    this.pageLoaderText.next('');
}

  pageLoader(value: boolean) {
    console.log('value:' + value);
    this.pageLoaderStatus.next(value)
  }

  setLoaderText(text?: String) {
    this.pageLoaderText.next(text);
  }
  getLoaderText(): Observable<any> {
    return this.pageLoaderText.asObservable();
  }
  refreshPage(value){
     this.shouldPageLoad.next(value);
  }
}
