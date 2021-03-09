import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { ComponentsService } from '../components/components.service';
import { HttpClient, HttpHeaders, HttpErrorResponse  } from '@angular/common/http';
import { CacheService } from 'ionic-cache';

@Injectable({
  providedIn: 'root'
})
export class CmsService {

  constructor(
    private apiProvider: ApiService,
    private componentsProvider: ComponentsService,
    private http: HttpClient,
    private cache: CacheService
  ) { }

  cms(data, loggedIn?) {
    return new Promise(resolve => {
      if (loggedIn) {
        this.apiProvider.getAuthentication(loggedIn).then(auth => {
          if (auth['error'] == 0) {
            let url = auth['data']['data_url'] + '/cms/page?get=' + data['page_code'];

            // let headers = new Headers();
            // headers.append('Content-Type', 'application/x-www-form-urlencoded');
            // headers.append('Accept', 'application/json');
            // headers.append('authorization', 'Bearer ' + auth['data']['token']);

            // let options = new RequestOptions({headers: headers});
            let httpOptions: any = {
              headers: new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'Authorization':'Bearer '+ auth['data']['token'],
                'Devicetoken':auth['data']['device_token']
              })
            };

            // let request = this.http.get(url, httpOptions).timeout(this.apiProvider.timeout).map(result => result.json());
            let request = this.http.get(url, httpOptions)

            let groupKey = data['page_code'];
            let response = this.cache.loadFromDelayedObservable(url, request, groupKey, this.apiProvider.ttl, data['page_code']);

            request.subscribe(result => {
              resolve(result);
            }, err => {
              response.subscribe(result => {
                resolve(result);
              }, err => {
                this.componentsProvider.showToast(this.componentsProvider.generic_error_msg);
                resolve({ error: 1, message: this.componentsProvider.generic_error_msg });
              });
            });
          } else {
            this.componentsProvider.showToast(this.componentsProvider.generic_error_msg);
            resolve({ error: 1, message: this.componentsProvider.generic_error_msg });
          }
        }).catch(e => {
          console.log(e);
          this.componentsProvider.showToast(this.componentsProvider.generic_error_msg);
          resolve({ error: 1, message: this.componentsProvider.generic_error_msg });
        });
      }
      else {
        this.apiProvider.getAuthentication().then(auth => {
          console.log("token",auth['data']['token'])
          console.log("device token",auth['data']['device_token'])
          if (auth['error'] == 0) {
            let url = auth['data']['data_url'] + '/cms/page?get=' + data['page_code'];

            // let headers = new Headers();
            // headers.append('Content-Type', 'application/x-www-form-urlencoded');
            // headers.append('Accept', 'application/json');
            // headers.append('authorization', 'Bearer ' + auth['data']['token']);

            // let options = new RequestOptions({headers: headers});
            // let request = this.http.get(url, options).timeout(this.apiProvider.timeout).map(result => result.json());

            let httpOptions: any = {
              headers: new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'Authorization':'Bearer '+ auth['data']['token'],
                'Devicetoken':auth['data']['device_token']
              })
            };

            let request = this.http.get(url, httpOptions);

            let groupKey = data['page_code'];
            let response = this.cache.loadFromDelayedObservable(url, request, groupKey, this.apiProvider.ttl, data['page_code']);

            request.subscribe(result => {
              resolve(result);
            }, err => {
              response.subscribe(result => {
                resolve(result);
              }, err => {
                this.componentsProvider.showToast(this.componentsProvider.generic_error_msg);
                resolve({ error: 1, message: this.componentsProvider.generic_error_msg });
              });
            });
          } else {
            this.componentsProvider.showToast(this.componentsProvider.generic_error_msg);
            resolve({ error: 1, message: this.componentsProvider.generic_error_msg });
          }
        }).catch(e => {
          console.log(e);
          this.componentsProvider.showToast(this.componentsProvider.generic_error_msg);
          resolve({ error: 1, message: this.componentsProvider.generic_error_msg });
        });
      }
    });
  }
}
