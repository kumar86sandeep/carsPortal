import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
//modules core services
import { UserAuthService } from '../../core/_services'

@Injectable({
  providedIn: 'root'
})
export class DealerAuthGuardService implements CanActivate {

  constructor(private userAuthService: UserAuthService, private router: Router) { }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
  
    if (JSON.parse(localStorage.getItem("loggedinDealerUser"))) {
      // logged in so return true
      return true;
    }

    // not logged in so redirect to login page with the return url
    localStorage.clear();
    this.userAuthService.isLoggedIn(false, '');
    this.router.navigate(['/dealer/login']);
    return false;
  }
}
