import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../../environments/environment';

import { UserAuthService, RealUpdateService } from '../_services/'

@Injectable()
export class ApiIntercepter implements HttpInterceptor {

  
  constructor(private userAuthService: UserAuthService, private realTimeUpdateService: RealUpdateService,) { }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    this.realTimeUpdateService.saveUserOnSocketIo();
  
    // check Dealer Subscription Expired or Not

    //console.log('API_ENDPOINT:' + environment.API_ENDPOINT)
    let apiReq = request.clone({ url: `${request.url}` });
   
    if (!(request.url).includes('i18n') && !(request.url).includes('vpic') && !(request.url).includes('smartystreets') && !(request.url).includes('carqueryapi')) {
      apiReq = request.clone({ url: environment.API_ENDPOINT + '/api/' + `${request.url}` });
    }
   
    return next.handle(apiReq);

  }


}
