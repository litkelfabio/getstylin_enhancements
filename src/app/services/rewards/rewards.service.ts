import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import {CacheService} from 'ionic-cache';
import { ComponentsService } from '../components/components.service';
import { ApiService } from '../api/api.service';
@Injectable({
  providedIn: 'root'
})
export class RewardsService {
  public counter:number = 0;
  public lastClaimedReward:any;
  public allowJoining = true;
  constructor(
    public componentsProvider: ComponentsService,
    public storage: Storage,
    public cache: CacheService,
    public http: HttpClient,
    public apiProvider: ApiService
  ) { }
  getRewardLists(){
    return new Promise(resolve => {
      this.apiProvider.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/marketplace/listing';

          // `let headers = new Headers();
          // // headers.append('Content-Type', 'application/json');
          // headers.append('Accept', 'application/json');
          // headers.append('Authorization', 'Bearer ' + auth['data']['token']);
          // headers.append('Devicetoken', auth['data']['device_token']);

          // console.log('headers:',headers);
          // console.log('url:',url);`

          let httpOptions: any = {
            headers: new HttpHeaders({
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
              'Authorization':'Bearer '+ auth['data']['token'],
              'Devicetoken':auth['data']['device_token']
            })
          };
          console.log('options',httpOptions);
          // let request = this.http.get(url, httpOptions).timeout(this.apiProvider.timeout).map(result => 
          //   result.json()
          //   );
            let request = this.http.get(url, httpOptions);
          // let groupKey = 'api_clothing_listing';
          // if (genderId) {
          //   groupKey += '_genderid_' + genderId;
          // }
          // console.log('request',request);
          // let response = this.cache.loadFromDelayedObservable(url, request );
          // console.log('sampleeeeea',response);
          request.subscribe(result => {
            console.log('sampleeeeeas',result);
            resolve(result);
          }, err => {
            console.log('err', err);
            // response.subscribe(result => {
            //   resolve(result);
            // }, err => {
            //   console.log('err', err);
            //   resolve({ error: 1, message: this.componentsProvider.generic_error_msg });
            // });
          });
        } else {
          resolve({ error: 1, message: this.componentsProvider.generic_error_msg });
        }
      });
    });
  }

  getRewardDetails(params){
    return new Promise(resolve => {
      this.apiProvider.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/marketplace/details?reward_id='+params.reward_id+'&user_id='+params.user_id;
          // console.log('url',url);
          // let headers = new Headers();
          // headers.append('Content-Type', 'application/json');
          // headers.append('Accept', 'application/json');
          // headers.append('Authorization', 'Bearer ' + auth['data']['token']);
          // headers.append('Devicetoken', auth['data']['device_token']);

          // console.log('headers:',headers);
          // console.log('url:',url);
          
          let httpOptions: any = {
            headers: new HttpHeaders({
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
              'Authorization':'Bearer '+ auth['data']['token'],
              'Devicetoken':auth['data']['device_token']
            })
          };

          // let options = new RequestOptions({headers: headers});
          // console.log('options',options);
          // let request = this.http.get(url, httpOptions).timeout(this.apiProvider.timeout).map(result => {
          //   result.json()
          // });
          let request = this.http.get(url, httpOptions);
          // let groupKey = 'api_clothing_listing';
          // if (genderId) {
          //   groupKey += '_genderid_' + genderId;
          // }
          // console.log('request',request);
          // let response = this.cache.loadFromDelayedObservable(url, request );
          // console.log('sampleeeeea',response);
          request.subscribe(result => {
            let e:any =result;
            resolve(e);
            console.log('results',e);
          }, err => {
            console.log('err1', err);
            // response.subscribe(result => {
            //   resolve(result);
            // }, err => {
            //   console.log('err2', err);
            //   resolve({ error: 1, message: this.componentsProvider.generic_error_msg });
            // });
          });
        } else {
          resolve({ error: 1, message: this.componentsProvider.generic_error_msg });
        }
      });
    });

  }

  getDetails(params){
    return new Promise(resolve => {
      this.apiProvider.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/marketplace/details?reward_id='+params.reward_id+'&user_id='+params.user_id;

          // let headers = new Headers();
          // headers.append('Content-Type', 'application/x-www-form-urlencoded');
          // headers.append('Accept', 'application/json');
          // headers.append('Authorization', 'Bearer ' + auth['data']['token']);
          // headers.append('Devicetoken', auth['data']['device_token']);

          let httpOptions: any = {
            headers: new HttpHeaders({
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
              'Authorization':'Bearer '+ auth['data']['token'],
              'Devicetoken':auth['data']['device_token']
            })
          };
          // let options = new RequestOptions({headers: headers});
          // let request = this.http.get(url, options).timeout(this.apiProvider.timeout).map(result => result.json());
          let request = this.http.get(url, httpOptions);
          // let groupKey = 'api_clothing_listing';
          // if (genderId) {
          //   groupKey += '_genderid_' + genderId;
          // }
          // let response = this.cache.loadFromDelayedObservable(url, request );

          request.subscribe(  
            result => {
              console.log('result',result);
              resolve(result);
            },
            err => {
              console.log("err1", err);
              // response.subscribe(
              //   result => {
              //     resolve(result);
              //   },
              //   err => {
              //     console.log("err2", err);
              //     resolve({
              //       error: 1,
              //       message: this.componentsProvider.generic_error_msg
              //     });
              //   }
              // );
            }
          );
        } else {
          resolve({ error: 1, message: this.componentsProvider.generic_error_msg });
        }
      });
    });
  }
 
  claimReward(params){
    return new Promise(resolve => {
      this.apiProvider.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/marketplace/join?reward_id='+params.reward_id+'&id='+params.id;
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
          // let request = this.http.get(url, options).timeout(this.apiProvider.timeout).map(result => result.json());
          let request = this.http.get(url, httpOptions);
          // let groupKey = 'api_clothing_listing';
          // if (genderId) {
          //   groupKey += '_genderid_' + genderId;
          // }
          // let response = this.cache.loadFromDelayedObservable(url, request );

          request.subscribe(result => {
            this.counter++;
            console.log('challenge ts:',this.counter);
            this.allowJoining = false;
            this.lastClaimedReward = params.reward_id;
            resolve(result);
          }, err => {
            console.log('err', err);
            // response.subscribe(result => {

            //   resolve(result);
            //   this.allowJoining = false;
            //   this.lastClaimedReward = params.reward_id;
            // }, err => {
            //   console.log('err', err);
            //   resolve({ error: 1, message: this.componentsProvider.generic_error_msg });
            // });
          });
        } else {
          resolve({ error: 1, message: this.componentsProvider.generic_error_msg });
        }
      });
    });
  }

  getClaimedReward(user_id){
    return new Promise(resolve => {
      this.apiProvider.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/marketplace/claimed?user_id='+user_id;

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
          // let request = this.http.get(url, options).timeout(this.apiProvider.timeout).map(result => result.json());
          // let groupKey = 'api_clothing_listing';
          // if (genderId) {
          //   groupKey += '_genderid_' + genderId;
          // }
          // let response = this.cache.loadFromDelayedObservable(url, request );

          request.subscribe(  
            result => {
              console.log('claimed reward',result);
              resolve(result);
            },
            err => {
              console.log("claimed reward err1", err);
              // response.subscribe(
              //   result => {
              //     resolve(result);
              //   },
              //   err => {
              //     console.log("claimed reward err2", err);
              //     resolve({
              //       error: 1,
              //       message: this.componentsProvider.generic_error_msg
              //     });
              //   }
              // );
            }
          );
        } else {
          resolve({ error: 1, message: this.componentsProvider.generic_error_msg });
        }
      });
    });

  }
}
