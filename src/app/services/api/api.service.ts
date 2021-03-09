import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { JwtHelperService } from "@auth0/angular-jwt";
import { FCM } from 'cordova-plugin-fcm-with-dependecy-updated/ionic/ngx';
// import {  FCM } from '@ionic-native/fcm/ngx'
import { EventsService } from "../../services/events.service";
import { ComponentsService } from '../components/components.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  networkState = "online"; // flag this as offline if the networkOnChange event is fired.

  jwtHelper = new JwtHelperService();
  timeout = 10000;
  ttl = 60 * 60 * 3;

  // // LOCAL SERVER
  // data_url = "http://getstyln.local/api";
  // default_url = "http://getstyln.local";

  // LIVE SERVER
  // data_url = "https://getstylin.com/api";
  // default_url = "https://getstylin.com";
  
  data_url = environment.data_url;
  default_url = environment.default_url


  // DEV SERVER
  // data_url = "https://dev.livewire365.com/api";
  // default_url = "https://dev.livewire365.com/";
  constructor(
    private fcm: FCM,
    private http: HttpClient,
    private storage: Storage,
    private events: EventsService,
    private componentService: ComponentsService) {
    console.log("ApiProvider ready; subscribing to network change events.");
    this.events.subscribe("network-changed", data => {
      console.log("Network change event fired; changing states.");
      let state = data;
      if (state == "offline") {
        this.networkState = "offline";
      } else {
        this.networkState = "online";
      }
    });
  }
  getAuthentication(loggedIn?) {
    console.log("login in:", loggedIn);
    return new Promise(resolve => {
      if (this.networkState == "offline") {
        // this.componentsProvider.showToast(this.componentsProvider.offlineMessage);
        resolve("offline");
      } else {
        let type = "guest_token";
        if (loggedIn) {
          type = "user_token";
        }
        console.log("Type: ", type);
        this.storage
          .get(type)
          .then(token => {
            console.log(token)
            if (token) {
              let decodedToken = this.jwtHelper.decodeToken(token);
              this.storage.get("device_token").then(device_token => {
                if (device_token) {
                  resolve({
                    error: 0,
                    data: {
                      //OLD IMPLEMENTATION
                      // base_url: "https://" + decodedToken["iss"],
                      // data_url: "https://" + decodedToken["iss"] + "/api",
                      // base_url: "http://" + decodedToken["iss"],
                      // data_url: "http://" + decodedToken["iss"] + "/api",

                      //NEW IMPLEMENTATION
                      base_url: environment.base_url + decodedToken["iss"],
                      data_url: environment.data_url_api + decodedToken["iss"] + "/api",
                      
                      token: token,
                      device_token: device_token
                    }
                  });
                } else {
                  resolve({
                    error: 1,
                    message: "Cant get URL Authentication"
                  });
                }
              });
            } else {
              resolve({
                error: 1,
                message: "Cant get URL Authentication"
              });
            }
          })
          .catch(e => {
            resolve({
              error: 1,
              message: /* 'Cant get URL Authentication' */ e
            });
          });
      }
    });
  }
  getDeviceToken() {
    return new Promise(resolve => {
      try {
        this.fcm.getToken().then(device_token => {
          console.log("getDeviceToken", device_token);
          if (device_token) {
            this.storage.set("device_token", device_token);
            resolve({
              error: 0,
              device_token: device_token
            });
          }
        })
          .catch(e => {
            console.log("getDeviceToken failed", e);
            let device_token =
              "11eelNifMDBJZc:APA91bE0s5I_hZvwmgdN5-I9XPF1XTJszxAf4kcyTtWxMDpsxG4LY_0PbaqMtdm5pcOWTsx4-Dm6m5fbWl_wK9_J9qQ7azLrViOzh63Rvh_jh7sCmFv_M0frcznUD0Vgbi-NoWCYUSqT";
            this.storage.set("device_token", device_token);
            resolve({
              error: 0,
              device_token: device_token

            });
          });
      } catch (e) {
        let device_token =
          "11eelNifMDBJZc:APA91bE0s5I_hZvwmgdN5-I9XPF1XTJszxAf4kcyTtWxMDpsxG4LY_0PbaqMtdm5pcOWTsx4-Dm6m5fbWl_wK9_J9qQ7azLrViOzh63Rvh_jh7sCmFv_M0frcznUD0Vgbi-NoWCYUSqT";
        this.storage.set("device_token", device_token);
        resolve({
          error: 0,
          device_token: device_token

        });
      }

    });
  }
  getGuestAccessToken() {
    return new Promise(resolve => {
      this.storage.get("device_token").then(device_token => {
        let data = {
          device_token: device_token
        };

        let httpOptions: any = {
          headers: new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          })
        };
        // let headers = new HttpHeaders();
        // headers.append("Content-Type", "application/x-www-form-urlencoded");
        // headers.append("Accept", "application/json");
        // let options = any({ headers: headers });


        let url = this.data_url + "/token/get";
        this.http
          .post(url, data, httpOptions) /* .timeout(this.timeout) */
          .subscribe(
            result => {
              if (result["error"] == 0) {
                this.storage
                  .set("guest_token", result["data"]["token"])
                  .then(token => {
                    console.log("token", token);
                    resolve(result);
                  });
              } else {
                resolve({
                  error: 1,
                  message: this.componentService.generic_error_msg
                });
              }
            },
            err => {
              resolve({
                error: 1,
                message: this.componentService.generic_error_msg
              });
            }
          );
      });
    });
  }
}
