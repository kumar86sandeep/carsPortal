import { Component, OnInit } from '@angular/core';
import { UserAuthService, TitleService, CognitoUserService } from '../../../core/_services';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-upgrade-your-dealership-plan',
  templateUrl: './upgrade-your-dealership-plan.component.html',
  styleUrls: ['./upgrade-your-dealership-plan.component.css']
})
export class UpgradeYourDealershipPlanComponent implements OnInit {
  getDealerId:any;

  title: string = 'Upgrade Dealership';  
  breadcrumbs: any[] = [{ page: 'Home', link: '/web' }, { page: 'Upgrade Dealership', link: '' }]

  constructor(private userAuthService: UserAuthService, private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit() {
   

    this.getDealerId = this.activatedRoute.snapshot.params.id;

  }



}
