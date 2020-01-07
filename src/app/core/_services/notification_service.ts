import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Subject } from 'rxjs/Subject';

@Injectable()
export class NotificationService {



  private user = new BehaviorSubject<any>([]);
  private isReload = new BehaviorSubject<any>([]);
  private isLoggedIn = new BehaviorSubject<any>([]);
  public chatWindow: Subject<any> = new Subject<any>();

  charUser = this.user.asObservable();
  setUser(obj?: any){
      this.user.next(obj);
  }

   
  reload = this.isReload.asObservable();

  setReload(obj?: any){
      this.isReload.next(obj);
  }
 
  loggedIn = this.isLoggedIn.asObservable();

  setIsloggedIn(obj?: any){
      this.isLoggedIn.next(obj);
  }

  

  chatHistoryWindow(): Observable<any> {
    return this.chatWindow.asObservable();
  }

  isChatHistoryWindowOpen(value: boolean){
      console.log('chat window value',value);
    this.chatWindow.next(value);
  }

  
  

}
