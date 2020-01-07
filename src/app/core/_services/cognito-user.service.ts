import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import 'rxjs/add/observable/from.js';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';
import { CognitoUserSession, CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import * as AWS from 'aws-sdk';
import { ListUsersRequest } from 'aws-sdk/clients/cognitoidentityserviceprovider';

import { environment } from '../../../environments/environment';
import { CognitoUtils } from './cognito-utils.service';
import * as _ from 'lodash';
import { addAllToArray } from '@angular/core/src/render3/util';

let cognitoUser = null
let username = null
@Injectable({
    providedIn: 'root'
})


export class CognitoUserService {
    session: CognitoUserSession;
    cognitoAdminService: AWS.CognitoIdentityServiceProvider;
    userPool: CognitoUserPool;

    constructor(private http: HttpClient, private router: Router) {

        this.cognitoAdminService = new AWS.CognitoIdentityServiceProvider({
            accessKeyId: environment.AWS.ACCESS_KEY,
            secretAccessKey: environment.AWS.SECRET_KEY,
            region: environment.AWS.REGION
        });
        this.userPool = CognitoUtils.getUserPool();
    }

    private getUserData(username: string) {
        return {
            Username: username,
            Pool: this.userPool
        };
    }
    private getUsername(email: string) {
        //username = email?String(_.dropRight((email).split('@'))):''; 
        username = email.substring(0, email.lastIndexOf("."))
        return String(username.replace("@", "_"));
    }

    public login(formData): Observable<any | false> {

        username = this.getUsername(formData.email) //(formData.email)?String(_.dropRight((formData.email).split('@'))):''; 
        cognitoUser = new CognitoUser(this.getUserData(username));
        cognitoUser.setAuthenticationFlowType('USER_PASSWORD_AUTH');
        const authenticationDetails = new AuthenticationDetails(CognitoUtils.getAuthDetails(username, formData.password));

        return Observable.create(obs => {
            cognitoUser.authenticateUser(authenticationDetails, {
                mfaRequired() {
                    obs.next({ mfaRequired: true });
                    return;
                },
                onSuccess: (result) => {
                    // User authentication was successful.
                    obs.next({ mfaRequired: true });
                    return;
                },
               
                onFailure(err) {
                    if (err.code == 'UserNotConfirmedException') {
                        obs.error('Your account is registered but not confirmed so please follow signup process again and confirm the account.');
                        return;
                    }
                    obs.error(err.message);
                    return;

                }
            });
        });
    }


    public signup(newUser: any): Observable<Object> {
        return Observable.create(obs => {

            // const phoneNumber = newUser.phones[0].country_code + newUser.phones[0].phone;
            console.log('the user is ',newUser)
            const userObject = {
                name: newUser.name.first_name,
                middle_name: newUser.name.last_name,
                updated_at: new Date().getTime() / 1000
            };

            //check MFA on the basis of user 
            if ('phones' in newUser)
                userObject['phone_number'] = newUser.phones[0].country_code + newUser.phones[0].phone;
            if ('emails' in newUser)
                userObject['email'] = newUser.emails[0].email;

            console.log('the object is ',userObject);
            //console.log('userObj',userObject)
            const attrs = CognitoUtils.createNewUserAttributes(userObject);
            //console.log('attrs',attrs)               
            // username = this.getUsername(userObject.email) //(userObject.email)?String(_.dropRight((userObject.email).split('@'))):'';        
            username = newUser.username;
            cognitoUser = new CognitoUser(this.getUserData(username));
            //console.log('username',username)
            //console.log('cognitoUser',cognitoUser)

            this.userPool.signUp(username, newUser.cipher, attrs, [], (err, result) => {
                if (err) {
                    console.error(err);
                    //console.log('code',err['code'])
                    if (err['code'] == 'UsernameExistsException') {
                        //console.log('resendConfirmationCode');
                        //this.resendSignupOTP();
                        cognitoUser.resendConfirmationCode((err, result) => {
                            if (err) {
                                //console.log('err',err);
                                obs.error(err.message);
                                return;
                            }
                            //console.log('result',result)            

                            obs.next({ username: username });
                             return;

                        });

                    } else {
                        obs.error(err.message);
                        return;
                    }


                }
                //console.log(result)                    
                //localStorage.setItem('aws-user', JSON.stringify(data))
                obs.next({ username: username });
                return;

            });
        });
    }


     setMfaPrefrence(username:any): Observable<Object> {

      
        return Observable.create(obs => {
        var params = {
            UserPoolId: environment.AWS.COGNITO.UserPoolId, /* required */
            Username: username, /* required */
            SMSMfaSettings: {
              Enabled: true,
              PreferredMfa: true 
            },
            SoftwareTokenMfaSettings: {
              Enabled: true ,
              PreferredMfa: true 
            }
          };
          console.log('the creentials are',params);
          this.cognitoAdminService.adminSetUserMFAPreference(params, function(err, data) {
            if (err){
              console.log('THER ERROR IS ',err);
              obs.error(err.message);
            return;
            } // an error occurred
            
            else   {
                obs.next(data);
                return;
            }            // successful response
          });
        })
    }
    resendSignupOTP(): Observable<Object> {

        return Observable.create(obs => {
            //const username = 'sandeep.may86'//(formData.email)?String(_.dropRight((formData.email).split('@'))):''; 
            //cognitoUser = new CognitoUser(this.getUserData(username));
            console.log('resendSignupOTP');
            cognitoUser.resendConfirmationCode((err, result) => {
                if (err) {
                    console.log('err', err);
                    obs.error(err.message);
                    return;
                }
                console.log('result', result)

                obs.next(result);
                return;

            });
        });

    }


    //to verify the seller login OTP
    public confirmLoginOtp(params: any): Observable<Object> {

        return Observable.create(obs => {

            cognitoUser.sendMFACode(params.controls['code'].value, {

                onSuccess(response) {

                    obs.next(response);
                    return;
                },
                onFailure(err) {

                    obs.error(err.message);
                    return;

                }
            })
        });


    }

    //to verify the seller signup OTP
    public confirmSignupOtp(params: any): Observable<Object> {
        return Observable.create(obs => {

            this.cognitoAdminService.confirmSignUp(params, function (err, result) {
                if (err) {

                    console.log('otp err', err); // an error occurred
                    //console.error(err);
                    //obs.next(false);
                    obs.error(err.message);
                    return;

                } else {
                    // successful response
                    console.log(result);
                    obs.next(result);
                    return;
                }

            });
        });
    }
    //forgot password

    public forgotPassword(formData): Observable<Object> {
        return Observable.create(obs => {
            username = this.getUsername(formData.email)
            cognitoUser = new CognitoUser(this.getUserData(username));

            cognitoUser.forgotPassword({

                onFailure: function (err) {
                    console.log('forgot password error', err); // an error occurred                   
                    obs.error(err.message);
                    return;
                },
                inputVerificationCode() {
                    obs.next({ showOtpForm: true });
                    return;
                    /*var verificationCode = prompt('Please input verification code ' ,'');
                    var newPassword = prompt('Enter new password ' ,'');
                    cognitoUser.confirmPassword(verificationCode, newPassword, this);*/
                }
            });

        });
    }

    //to verify the seller/dealer login OTP
    public confirmForgotPasswordOtp(params: any): Observable<Object> {
        console.log('params', params);
        return Observable.create(obs => {

            cognitoUser.confirmPassword(params.controls['ConfirmationCode'].value, params.controls['password'].value, {

                onSuccess(response) {
                    console.log('response', response);
                    obs.next(response);
                    return;
                },
                onFailure(err) {
                    console.log('err', err);
                    obs.error(err.message);
                    return;

                }
            })
        });


    }
    //to delete the seller/dealer
    public deleteUser(params: any): Observable<Object> {
        return Observable.create(obs => {

            let newparams = {
                UserPoolId: environment.AWS.COGNITO.UserPoolId,
                Username: params,
            };

            this.cognitoAdminService.adminDeleteUser(newparams, function (err, response) {
                if (err) { // error response
                    obs.error(err.message);
                    return;
                }
                else {
                    obs.next(response);
                    return; // successful response
                }
            });

        });
    }



    signout() {
        cognitoUser.signOut()
    }

}