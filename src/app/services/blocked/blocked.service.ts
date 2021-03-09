import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse  } from '@angular/common/http';
import {CacheService} from 'ionic-cache';
import { ComponentsService } from '../components/components.service';
import { ApiService } from '../api/api.service';

@Injectable({
providedIn: 'root'
})
export class BlockedService {

  constructor(
    private apiProvider: ApiService,
    private componentsProvider: ComponentsService,
    private http: HttpClient,
    private cache: CacheService
  ) { }

  validate(otherUserId) {
    return new Promise(resolve => {
      this.apiProvider.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/blocked/validate/otherUserId/'+otherUserId;

          // let headers = new Headers();
          // headers.append('Content-Type', 'application/x-www-form-urlencoded');
          // headers.append('Accept', 'application/json');
          // headers.append('Authorization', 'Bearer ' + auth['data']['token']);
          // headers.append('Devicetoken', auth['data']['device_token']);

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
          let request = this.http.get(url, httpOptions);

          let groupKey = 'api_blocked_validate_otheruserid_'+otherUserId;
          let response = this.cache.loadFromDelayedObservable(url, request, groupKey, this.apiProvider.ttl, groupKey);

          request.subscribe(result => {
            resolve(result);
          }, err => {
            console.log('err', err);
            response.subscribe(result => {
              resolve(result);
            }, err => {
              console.log('err', err);
              resolve({ error: 1, message: this.componentsProvider.generic_error_msg });
            });
          });
        } else {
          resolve({ error: 1, message: this.componentsProvider.generic_error_msg });
        }
      });
    });
  }
  save(data) {
    return new Promise(resolve => {
      this.apiProvider.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/blocked/save';

          // let headers = new Headers();
          // headers.append('Content-Type', 'application/x-www-form-urlencoded');
          // headers.append('Accept', 'application/json');
          // headers.append('Authorization', 'Bearer ' + auth['data']['token']);
          // headers.append('Devicetoken', auth['data']['device_token']);

          // let options = new RequestOptions({headers: headers});
          let httpOptions: any = {
            headers: new HttpHeaders({
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
              'Authorization':'Bearer '+ auth['data']['token'],
              'Devicetoken':auth['data']['device_token']
            })
          };
          let request = this.http.post(url, data, httpOptions);
          // let request = this.http.post(url, data, httpOptions).timeout(this.apiProvider.timeout).map(result => result.json());
          request.subscribe(result => {
            resolve(result);
          }, err => {
            console.log('err', err);
            resolve({ error: 1, message: this.componentsProvider.generic_error_msg });
          });
        } else {
          resolve({ error: 1, message: this.componentsProvider.generic_error_msg });
        }
      });
    });
  }
  getList(otherUserId?, page = 1, limit = 10, search?) {
    return new Promise(resolve => {
      this.apiProvider.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/blocked/listing/page/' + page + '/limit/' + limit;
          if (otherUserId) {
            url += '/otherUserId/' + otherUserId;
          }
          if (search) {
            url += '?search=' + search;
          }
          // let headers = new Headers(); 
          // headers.append('Content-Type', 'application/x-www-form-urlencoded');
          // headers.append('Accept', 'application/json');
          // headers.append('Authorization', 'Bearer ' + auth['data']['token']);
          // headers.append('Devicetoken', auth['data']['device_token']);

          // let options = new RequestOptions({headers: headers});
          let httpOptions: any = {
            headers: new HttpHeaders({
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
              'Authorization':'Bearer '+ auth['data']['token'],
              'Devicetoken':auth['data']['device_token']
            })
          };
          let request = this.http.get(url, httpOptions);
          // let request = this.http.get(url, httpOptions).timeout(this.apiProvider.timeout).map(result => result.json());

          let groupKey = 'api_blocked_listing_page_'+page+'_limit_'+limit;
          if (otherUserId) {
            groupKey += '_otheruserid_' + otherUserId;
          }
          if (search) {
            groupKey += '_search_' + search;
          }
          let response = this.cache.loadFromDelayedObservable(url, request, groupKey, this.apiProvider.ttl, groupKey);

          request.subscribe(result => {
            resolve(result);
          }, err => {
            console.log('err', err);
            response.subscribe(result => {
              resolve(result);
            }, err => {
              console.log('err', err);
              resolve({ error: 1, message: this.componentsProvider.generic_error_msg });
            });
          });
        } else {
          resolve({ error: 1, message: this.componentsProvider.generic_error_msg });
        }
      });
    });
  }
}
