import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,   } from '@angular/common/http';
import {CacheService} from 'ionic-cache';
import { ComponentsService } from '../components/components.service';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class ChallengesService {

  constructor(
    private componentsProvider: ComponentsService,
    public cache: CacheService,
    public http: HttpClient,
    public apiProvider: ApiService
  ) { }
  getChallengeLists(){
    return new Promise(resolve => {
      this.apiProvider.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/challenges/listing';

          // let headers = new Headers();
          // // headers.append('Content-Type', 'application/json');
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
          // let request = this.http.get(url, options).timeout(this.apiProvider.timeout).map(result => 
          //   result.json()
          //   );
            let request = this.http.get(url, httpOptions);
          // let groupKey = 'api_clothing_listing';
          // if (genderId) {
          //   groupKey += '_genderid_' + genderId;
          // }
          console.log('request',request);
          // let response = this.cache.loadFromDelayedObservable(url, request );
          // console.log('sampleeeeea',response);
          request.subscribe(result => {
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


  getDetails(id){
    return new Promise(resolve => {
      this.apiProvider.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/challenges/details?challenge_id='+id;

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

          request.subscribe(  
            result => {
              resolve(result);
              console.log('result',result);
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

  getJoined(id){
    return new Promise(resolve => {
      this.apiProvider.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/challenges/joined?user_id='+id;

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

          request.subscribe(result => {
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
  counter:number = 0;
   lastChallengeJoined:any;
  allowJoining = true;
  joinChallenge(params){
    return new Promise(resolve => {
      this.apiProvider.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/challenges/join';
          // let formData = new FormData();
          // formData.append('challenge_id',params.challenge_id);
          // formData.append('id',params.user_id);
          let postData = {
            challenge_id: params.challenge_id,
            user_id: params.user_id
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
          let request = this.http.post(url, postData, httpOptions);
          // let request = this.http.get(url, options).timeout(this.apiProvider.timeout).map(result => result.json());
          // let groupKey = 'api_clothing_listing';
          // if (genderId) {
          //   groupKey += '_genderid_' + genderId;
          // }
          // let response = this.cache.loadFromDelayedObservable(url, request );

          request.subscribe(result => {
            this.counter++;
            console.log('challenge ts:',this.counter);
            this.allowJoining = false;
            this.lastChallengeJoined = params.challenge_id;
            resolve(result);
          }, err => {
            console.log('err', err);
            // response.subscribe(result => {

            //   resolve(result);
            //   this.allowJoining = false;
            //   this.lastChallengeJoined = params.challenge_id;
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
}
