import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import {CacheService} from 'ionic-cache';
import { ComponentsService } from '../components/components.service';
import { ApiService } from '../api/api.service';


@Injectable({
  providedIn: 'root'
})
export class FriendService {

  constructor(
    private componentService: ComponentsService,
    private apiService: ApiService,
    public storage: Storage,
    public cache: CacheService,
    public http: HttpClient
  ) { }
  validate(otherUserId) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/friends/validate/otherUserId/'+otherUserId;

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
          // let request = this.http.get(url, httpOptions).pipe(timeout(this.apiService.timeout),map(result => {}));
          let request = this.http.get(url, httpOptions);

          let groupKey = 'api_friends_validate_otheruserid_'+otherUserId;
          let response = this.cache.loadFromDelayedObservable(url, request, groupKey, this.apiService.ttl, groupKey);

          request.subscribe(result => {
            resolve(result);
          }, err => {
            console.log('err', err);
            response.subscribe(result => {
              resolve(result);
            }, err => {
              console.log('err', err);
              resolve({ error: 1, message: this.componentService.generic_error_msg });
            });
          });
        } else {
          resolve({ error: 1, message: this.componentService.generic_error_msg });
        }
      });
    });
  }
  save(data) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/friends/save';

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
          // let request = this.http.post(url, data, httpOptions).pipe(timeout(this.apiService.timeout),map(result => {}));
          let request = this.http.post(url, data, httpOptions);
          request.subscribe(result => {
            resolve(result);
          }, err => {
            console.log('err', err);
            resolve({ error: 1, message: this.componentService.generic_error_msg });
          });
        } else {
          resolve({ error: 1, message: this.componentService.generic_error_msg });
        }
      });
    });
  }
  getList(otherUserId?, page = 1, limit = 10, search?) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/friends/listing/page/' + page + '/limit/' + limit;
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
          // let request = this.http.get(url, httpOptions).pipe(timeout(this.apiService.timeout),map(result => {}));
          let request = this.http.get(url, httpOptions);

          let groupKey = 'api_friends_listing_page_'+page+'_limit_'+limit;
          if (otherUserId) {
            groupKey += '_otheruserid_' + otherUserId;
          }
          if (search) {
            groupKey += '_search_' + search;
          }
          let response = this.cache.loadFromDelayedObservable(url, request, groupKey, this.apiService.ttl, groupKey);

          request.subscribe(result => {
            resolve(result);
          }, err => {
            console.log('err', err);
            response.subscribe(result => {
              resolve(result);
            }, err => {
              console.log('err', err);
              resolve({ error: 1, message: this.componentService.generic_error_msg });
            });
          });
        } else {
          resolve({ error: 1, message: this.componentService.generic_error_msg });
        }
      });
    });
  }

  getFriendsForMessaging(type, page, search?) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/friends/' + type + '?page=' + page + '&limit=20';

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
          // let request = this.http.get(url, httpOptions).pipe(timeout(this.apiService.timeout),map(result => {}));
          let request = this.http.get(url, httpOptions);
          request.subscribe(result => {
            resolve(result);
          }, ex => {
            resolve({error: 1, trace: ex, request: 'getFriendsForMessaging - request'});
          });
        }
        else {
          resolve({error: 1, trace: auth, request: 'getFriendsForMessaging - getAuth'});
        }
      }).catch(authError => {
        resolve({error: 1, trace: authError, request: 'getFriendsForMessaging'});
      });
    });
  }
}
