import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject'

@Injectable()
export class SharedService {



  private pageTypeState = new BehaviorSubject<any>([]);
  private pageFilterState = new BehaviorSubject<any>([]);

  
  pageType = this.pageTypeState.asObservable();
  setPageTypeState(obj?: any){
      this.pageTypeState.next(obj);
  }


  pageFilter = this.pageFilterState.asObservable();
  setPageFilterState(obj?: any){
      this.pageFilterState.next(obj);
  }

 

}
