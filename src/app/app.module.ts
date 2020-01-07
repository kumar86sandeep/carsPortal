import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule, HttpClient } from '@angular/common/http';
import { CountdownTimerModule } from 'ngx-countdown-timer';
import { environment } from '../environments/environment'
//importing root routing configuration file
import { AppRoutingModule } from './app-routing.module';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive'; // this includes the core NgIdleModule but includes keepalive providers for easy wireup

//importing root component
import { AppComponent } from './app.component';

//importing core 
//components
import { HeaderComponent } from './core/components/header/header.component';
import { FooterComponent } from './core/components/footer/footer.component';
import { PageNotFoundComponent } from './core/components/page-not-found/page-not-found.component';

//importing shared 
//components
import { AlertComponent } from './shared/components/alert/alert.component';
import { PageLoaderComponent } from './shared/components/page-loader/page-loader.component';
//services 
import { AlertService, PageLoaderService } from './shared/_services'

//import core services
import { UserAuthService,SellerService,AuthService,SharedService, TitleService,RealUpdateService, CommonUtilsService, CarService,DealerService, DealershipService ,NotificationService} from './core/_services';
import {TrumbowygModule} from 'ng2-lazy-trumbowyg';
//import shared module
import { SharedModule } from './core/shared.module';




//importing intercepters
import { ApiIntercepter } from './core/intercepters/api.intercepter';
import { TokenInterceptor } from './core/intercepters/token.interceptor';
import { HttpErrorInterceptor } from './core/intercepters/http-error.interceptor';
import {
  SocialLoginModule,
  AuthServiceConfig,
  GoogleLoginProvider,
  FacebookLoginProvider,
} from "angular-6-social-login";


// Configs 
export function getAuthServiceConfigs() {
  let config = new AuthServiceConfig(
      [
        {
          id: FacebookLoginProvider.PROVIDER_ID,
          provider: new FacebookLoginProvider(environment.SOCIAL_LOGINS.FACEBOOK.FACEBOOK_APP_ID)
        },
        {
          id: GoogleLoginProvider.PROVIDER_ID,
          provider: new GoogleLoginProvider(environment.SOCIAL_LOGINS.GOOGLE.GOOGLE_0AUTH_CLIENT_ID)
        }
          // {
          //   id: LinkedinLoginProvider.PROVIDER_ID,
          //   provider: new LinkedinLoginProvider("1098828800522-m2ig6bieilc3tpqvmlcpdvrpvn86q4ks.apps.googleusercontent.com")
          // },
      ]
  );
  return config;
}


@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    HeaderComponent,
    FooterComponent,
    AlertComponent,
    PageLoaderComponent

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    SharedModule,
    BrowserAnimationsModule,
    SocialLoginModule,
    NgIdleKeepaliveModule.forRoot(),
    TrumbowygModule.forRoot({plugins: ['colors', 'noembed', 'preformatted', 'pasteimage', 'upload'], version: '2.8.0'}), //Optional config : plug-ins and version
    CountdownTimerModule.forRoot()
  ],
  providers: [
    AlertService,
    PageLoaderService,
    UserAuthService,
    CommonUtilsService,
    CarService,
    DealershipService,
    DealerService,
    TitleService,
    SellerService,
    RealUpdateService,
    NotificationService,
    AuthService,
    SharedService,
    {
      provide: AuthServiceConfig,
      useFactory: getAuthServiceConfigs
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiIntercepter, multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor, multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor, multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

