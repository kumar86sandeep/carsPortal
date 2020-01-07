import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import { environment } from '../../../environments/environment'
import { UserAuthService } from '../../core/_services/user-auth.service'
@Injectable({
  providedIn: 'root'
})
export class TitleService {


  constructor(private authService:UserAuthService,private titleService: Title, private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {

  }
  setTitle() {
    // this.contentSection.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });    
    this.router.events
      .filter((event) => event instanceof NavigationEnd)
      .map(() => this.activatedRoute)
      .map((route) => {
        while (route.firstChild) route = route.firstChild;
        return route;
      })
      .filter((route) => route.outlet === 'primary')
      .mergeMap((route) => route.data)
      .subscribe((event) => {

           if(JSON.parse(localStorage.getItem('loggedinSellerUser'))){
            this.authService.isLoggedIn(true, 'Seller');

           } else if(JSON.parse( localStorage.getItem('loggedinDealerUser'))){
            this.authService.isLoggedIn(true, 'Dealer');
           }
           return this.titleService.setTitle(environment.APP_NAME + ' | ' + event['title'])
      
      
      });
  }
}
