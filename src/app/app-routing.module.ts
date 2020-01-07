import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PageNotFoundComponent } from './core/components/page-not-found/page-not-found.component';

const routes: Routes = [

  { path: '', redirectTo: 'web', pathMatch: 'full' },
  {
    path: 'web',
    loadChildren: './Modules/website-front/website-front.module#WebsiteFrontModule'
  },
  {
    path: 'dealer',
    loadChildren: './Modules/dealer/dealer.module#DealerModule'
  },
  {
    path: 'admin',
    loadChildren: './Modules/admin/admin.module#AdminModule'
  },
  {
    path: 'seller',
    loadChildren: './Modules/seller/seller.module#SellerModule'
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],

  exports: [RouterModule]
})
export class AppRoutingModule { }
