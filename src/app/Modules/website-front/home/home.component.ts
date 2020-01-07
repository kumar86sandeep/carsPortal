import { Component, OnInit, ElementRef, Inject } from '@angular/core';
//import core services
import { UserAuthService, TitleService } from '../../../core/_services'

declare var jQuery: any;
declare var $: any;
declare var POTENZA: any;
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  elementRef: ElementRef;
  slideValue: number = 0;
  isLoggedin: boolean = false;
  constructor(@Inject(ElementRef) elementRef: ElementRef, private userAuthService: UserAuthService, private titleService:TitleService) {
    POTENZA.Isotope(),
    POTENZA.masonry();
  
    this.elementRef = elementRef;
     this.userAuthService.checkLoggedinStatus().subscribe((loginStatus) => {
      this.isLoggedin = loginStatus.isLoggedIn;
      console.log('isLoggedin:'+this.isLoggedin);
    });
  }

  
  ngOnInit() {
    if (localStorage.getItem('loggedinUser')) {
      this.isLoggedin = true;
    }
    this.titleService.setTitle();
    console.log('isLoggedin:'+this.isLoggedin);
    POTENZA.counters()
    POTENZA.carousel()
    POTENZA.scrolltotop()
    POTENZA.revolutionSlider(jQuery)
    POTENZA.Isotope(),
    POTENZA.masonry();
    
  }

}
