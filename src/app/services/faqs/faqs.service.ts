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
export class FaqsService {

  constructor(
    private events: EventsService,
    private apiService: ApiService,
    public storage: Storage,
    public http: HttpClient
  ) { }

  getFaqsListing(limit) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/faqs/getall';
          let httpOptions: any = {
            headers: new HttpHeaders({
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
              'Authorization':'Bearer '+ auth['data']['token'],
              'Devicetoken':auth['data']['device_token']
            })
          };
          // let request = this.http.post(url, data, httpOptions).timeout(this.apiProvider.timeout).map(result => result.json());
          let request = this.http.post(url,limit, httpOptions);
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
