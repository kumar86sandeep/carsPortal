import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Router } from "@angular/router";
import { retry, catchError } from 'rxjs/operators';
import { UserAuthService, SellerService, DealerService, NotificationService, RealUpdateService } from '../_services/'
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
    constructor(private userAuthService: UserAuthService, private router: Router) {

    }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request)
            .pipe(
                retry(1),
                catchError((error: HttpErrorResponse) => {
                    let errorMessage = '';
                    if (error.error instanceof ErrorEvent) {
                        // client-side error
                        errorMessage = `Error: ${error.error.message}`;
                    } else {
                        // server-side error
                        errorMessage = error.error
                    }
                    // window.alert(errorMessage);
                    console.log('the error is', errorMessage);
                    let redirectUrl = '';
                    if (errorMessage == 'Invalid token' || errorMessage  == 'Access denied. No token provided.') {
                        if (JSON.parse(localStorage.getItem('loggedinSellerUser'))) {
                            redirectUrl = 'seller'
                        } else {
                            redirectUrl = 'dealer'
                        }

                        localStorage.removeItem('loggedinUser');
                        localStorage.clear();
                        this.userAuthService.isLoggedIn(false, '');
                        console.log('the redirect url is'+redirectUrl)
                        this.router.navigate(['/' + redirectUrl + '/login']);
                    }
                    return throwError(errorMessage);
                })
            )
    }
}