import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {environment} from '../../../environments/environment';
declare var FB:any;
declare const gapi: any;
@Injectable({
  providedIn: 'root'
})
export class AuthService {
    element:any;
   public auth2: any;
  constructor(){





  }
  // public googleInit() {
      
  //   gapi.load('auth2', () => {
  //     this.auth2 = gapi.auth2.init({
  //       client_id: environment.SOCIAL_LOGINS.GOOGLE.GOOGLE_0AUTH_CLIENT_ID,
  //       cookiepolicy: 'single_host_origin',
  //       scope: 'profile email'
  //     });
      
  //     this.googleLogin(this.element)
  //   });
  // }

fbSignIn(res){
    // FB.login(function(response) {
    //     // statusChangeCallback(response);
    //     console.log('the response id from the facebook',response)
  
  
    //     FB.api(
    //       response.authResponse.userID,{fields: 'name, email' },
    //       function (response) {
    //         if (response && !response.error) {
    //           /* handle the result */
    //           console.log('the response is ',response)
    //           res(response)
    //         }
    //       }
    //   );
    //   },{scope: 'public_profile,email'});
}

 public  googleLogin(element){
    // this.auth2.attachClickHandler(this.element, {},
    //     (googleUser) => {
  
    //       let profile = googleUser.getBasicProfile();
    //       console.log('Token || ' + googleUser.getAuthResponse().id_token);
    //       console.log('ID: ' + profile.getId());
    //       console.log('Name: ' + profile.getName());
    //       console.log('Image URL: ' + profile.getImageUrl());
    //       console.log('Email: ' + profile.getEmail());
    //       //YOUR CODE HERE
  
    //     }, (error) => {
    //       alert(JSON.stringify(error, undefined, 2));
    //     });
}

}
