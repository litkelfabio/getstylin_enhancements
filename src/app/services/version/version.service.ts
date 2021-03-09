import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse  } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { AbstractControl } from '@angular/forms';
import { EventsService } from '../events.service';
import { ComponentsService } from '../components/components.service';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class VersionService {

  constructor(
    private events: EventsService,
    private apiService: ApiService,
    public storage: Storage,
    public http: HttpClient
  ) { }

  getVersion(platform,  token?) {
    return new Promise(resolve => {
      this.apiService.getAuthentication().then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/user/getversion';
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
          let plat = {};
          if(platform == 'android'){
            plat = {platform:platform}
          }else{
            console.log('platform: ',platform);
            plat = {platform:platform}
          }
          
          // let request = this.http.post(url, data, httpOptions).timeout(this.apiProvider.timeout).map(result => result.json());
          let request = this.http.post(url, plat, httpOptions);
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
}
