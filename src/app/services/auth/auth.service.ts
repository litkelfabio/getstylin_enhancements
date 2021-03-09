import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse  } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { AbstractControl } from '@angular/forms';
import { EventsService } from '../events.service';
import { ComponentsService } from '../components/components.service';
import { ApiService } from '../api/api.service';
import { CacheService } from 'ionic-cache';

@Injectable({
providedIn: 'root'
})
export class AuthService {
  networkState = 'online';  
  constructor(
    private events: EventsService,
    private apiService: ApiService,
    public storage: Storage,
    public cache: CacheService,
    public http: HttpClient
  ) { 
    console.log('AuthProvider ready; subscribing to network change events.');

    this.events.subscribe('network-changed', (data) => {
      console.log('Network change event fired; changing states.');
      let state = data;
      if (state == 'offline') {
        this.networkState = 'offline';
      }
      else {
        this.networkState = 'online';
      }
    });
  }
  saveAppple(data?){
    return new Promise(resolve => {
      this.apiService.getAuthentication().then(auth => {
        console.log(auth);
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/user/applelogin';
          let httpOptions: any = {
            headers: new HttpHeaders({
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
              'Authorization':'Bearer '+ auth['data']['token'],
              'Devicetoken':auth['data']['device_token']
            })
          };
          // let request = this.http.post(url, data, httpOptions).timeout(this.apiService.timeout).map(result => result.json());
          let request = this.http.post(url, data, httpOptions);
          request.subscribe(result => {
            resolve(result);
          }, err => {
            console.log("err", err);
            resolve({ error: 1, message: err });
          });
        } else {
          resolve({ error: 1, message: auth['message'] });
        }
      }).catch(e => {
        console.log("e", e);
        resolve({ error: 1, message: e });
      });
    });
  }
  auth(type, data?, loggedIn?, token?) {
    console.log("Login data: ", loggedIn);
    return new Promise(resolve => {
      if (this.networkState == 'offline') {
        resolve('offline');
      }else {
        this.apiService.getAuthentication(loggedIn).then(auth => {
          if (auth['error'] == 0) {
            let url = auth['data']['data_url'] + '/user/' + type;

            console.log('Data in getAuth promise: ', data);

            // if(auth['data']['data_url'] == 'http://getstyln.local/api') data['token'] = token['data']['token'];
            let httpOptions: any = {
              headers: new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'Authorization':'Bearer '+ auth['data']['token'],
                'Devicetoken':auth['data']['device_token']
              })
            };
            // let request = this.http.post(url, data, httpOptions).timeout(this.apiService.timeout).map(result => result.json());
            let request = this.http.post(url, data, httpOptions);
            request.subscribe(result => {
              resolve(result);
            }, err => {
              console.log("Error: ", err);
              if (type == 'sociallogin') {
                if (data.type == 'google') {
                  err = "Could not sync Google account. Please try again later.";
                } else {
                  err = "Could not sync Facebook account. Please try again later."
                }
              }
              resolve({ error: 1, message: err });
            });
          }else {
            console.log('Error: ', auth);
            resolve({ error: 1, message: auth['message'] });
          }
        }).catch(e => {
          console.log("Error: ", e);
          if (type == 'sociallogin') {
            if (data.type == 'google') {
              e = "Could not sync Google account. Please try again later.";
            } else {
              e = "Could not sync Facebook account. Please try again later."
            }
          }
          resolve({ error: 1, message: e });
        });
      }
    });
  }
  forgotPassword(data, token?) {
    return new Promise(resolve => {
      this.apiService.getAuthentication().then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/user/forgotpassword';
          let httpOptions: any;
          if (token) {
             httpOptions = {
              headers: new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'Authorization':'Bearer '+ token,
                'Devicetoken':auth['data']['device_token']
              })
            };
          } else {
            httpOptions= {
              headers: new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'Authorization':'Bearer '+ auth['data']['token'],
                'Devicetoken':auth['data']['device_token']
              })
            };
            
          }
          
          // let request = this.http.post(url, data, httpOptions).timeout(this.apiProvider.timeout).map(result => result.json());
          let request = this.http.post(url, data, httpOptions);
          request.subscribe(result => {
            resolve(result);
          }, err => {
            console.log("err", err);
            resolve({ error: 1, message: err });
          });
        } else {
          resolve({ error: 1, message: auth['message'] });
        }
      }).catch(e => {
        console.log("e", e);
        resolve({ error: 1, message: e });
      });
    });
  }
  MatchPassword(AC: AbstractControl) {
    const password = AC.get('password').value // to get value in input tag
    const confirm_password = AC.get('confirm_password').value // to get value in input tag
    // console.log(password);
    // console.log(confirm_password);
    if(password != confirm_password) {
      AC.get('confirm_password').setErrors({
        MatchPassword: true
      });
    } else {
      AC.get('confirm_password').setErrors(null);
    }
  }
}
