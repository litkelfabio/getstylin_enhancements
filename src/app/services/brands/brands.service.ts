import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse  } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import {CacheService} from 'ionic-cache';
import { ComponentsService } from '../components/components.service';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class BrandsService {

  constructor(
    private componentService: ComponentsService,
    private apiService: ApiService,
    public storage: Storage,
    public cache: CacheService,
    public http: HttpClient
  ) { }

  getBrands(page=1, limit=20, search?) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/brands/listing?page=' + page;
          if (search) {
            url += '&q=' + search;
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
          // let request = this.http.get(url, httpOptions).timeout(this.apiProvider.timeout).map(result => result.json());
          let request = this.http.get(url, httpOptions);

          let groupKey = 'api_brands_listing_page' + page + "_limit_" + limit ;
          if (search) {
            groupKey += '_search_' + search;
          }
          let response = this.cache.loadFromDelayedObservable(url, request, groupKey, this.apiService.ttl, groupKey);

          request.subscribe(result => {
            resolve(result);
          }, err => {
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
      }).catch(e => {
        console.log('e', e);
        this.componentService.showToast(this.componentService.generic_error_msg);
        resolve({ error: 1, message: this.componentService.generic_error_msg });
      });
    });
  }
  saveFavoriteBrands(data) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/favoritebrands/save';

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
          // let request = this.http.post(url, data, httpOptions).timeout(this.apiProvider.timeout).map(result => result.json());
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
      }).catch(e => {
        console.log('e', e);
        resolve({ error: 1, message: this.componentService.generic_error_msg });
      });
    });
  }
}
