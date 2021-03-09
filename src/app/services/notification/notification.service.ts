import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {CacheService} from 'ionic-cache';
import { EventsService } from '../events.service';
import { ComponentsService } from '../components/components.service';
import { ApiService } from '../api/api.service';
import { timeout,map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  hasNotifications: boolean = false; // flag this from the app controller's FCM subscription if it received any notifications.
  hasRequests: boolean = false;      // flag this by the app controller if it got any connection requests.
  requestCount: number = 0;          // override this count from the app controller
  constructor(
    private events: EventsService,
    private componentService: ComponentsService,
    private apiService: ApiService,
    public cache: CacheService,
    public http: HttpClient
  ) { 
    console.log("Notifications provider ready.");
    this.subscribeToFcmNotifications();
    this.subscribeToAcceptRequests();
    this.subscribeToGlobalControl();
  }
   // FCM Notification Subscription
  // The fcm-notified event is fired by the FCM subscription in the app.controller.
  // On an alternative method, we could directly import FCM into the controllers that require notifications.
  subscribeToFcmNotifications() {
    console.log('Subscribing to FCM notifications.');
    this.events.subscribe('fcm-notified', (data?) => {
      console.log('FCM notification event fired.');
    });

    this.events.subscribe('fcm-notified-foreground', (data?, navController?) => {
      if (data) {
        console.log('This foreground FCM notification\'s data: ', data);
        this.componentService.showNotificationToast(data, data['body'], 'notification-toast');
      }
      else {
        console.log('FCM notification event fired but no data received.');
      }
    });
  }

  // Connection Request Accept
  // This is fired by the Connection Request view every time a request is accepted or rejected.
  // This keeps the request counts updated.
  subscribeToAcceptRequests() {
    console.log('Subscribing to user-accepted event.');
    this.events.subscribe('user-accepted', () => {
      console.log('user-accepted event fired; adjusting count and states.');

      // Only perform this action if and only if both hasRequests and requestCount
      // are in their active and positive states.
      if (Object.is(this.hasRequests, true) == true && this.requestCount > 0) {
        // First, we reduce the number of requests by one.
        if (this.requestCount > 0) {
          this.requestCount = this.requestCount - 1;
          console.log("Requests remaining: ", this.requestCount);

          // Then check if we need to swap the hasRequests state.
          if (this.requestCount > 0) {
            console.log("Not swapping hasRequests state.");
          } else {
            // If the requestCount is reduced to 0, swap the hasRequests state.
            this.hasRequests = false;
          }
        }
      }

      // Fire this event every time the parent event is emitted in order to keep things updated.
      let params = {
        hasRequest: this.hasRequests,
        requestCount: this.requestCount
      };
      this.events.publish("requests-updated", params);

      console.log("Adjustments completed.");
    });
  }

  // Global Control
  // This is fired from the app.component.ts and is considered to be the workaround for iOS issues
  // when provider-reliant values and functions are used in that particular controller.
  subscribeToGlobalControl() {
    console.log('Subscribing to global control.');
    // this.notificationsProvider.hasRequests = false;
    // this.notificationsProvider.requestCount = 0;
    this.events.subscribe('clearing-out', () => {
      this.hasRequests = false;
      this.requestCount = 0;

      this.events.publish('disconnect-socket');
    });

    this.events.subscribe('requests-found-for-notifications', (data) => {
      console.log(data);
    });

    this.events.subscribe('has-friend-requests', (data) => {
      console.log('Requests count: ', data);
      if (data > 0) {
        this.hasRequests = true;
        this.requestCount = data;
      }
      else {
        this.hasRequests = false;
        this.requestCount = 0;
      }
    });
  }

  async getFriendRequests(type) {
    return await new Promise(resolve => {
      this.apiService
        .getAuthentication(true)
        .then(auth => {
          if (auth["error"] == 0) {
            let url = auth["data"]["data_url"] + "/user/" + type;

            // let headers = new Headers();
            // headers.append("Content-Type", "application/x-www-form-urlencoded");
            // headers.append("Accept", "application/json");
            // headers.append("Authorization", "Bearer " + auth["data"]["token"]);
            // headers.append("Devicetoken", auth["data"]["device_token"]);

            // let options = new RequestOptions({ headers: headers });
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

            // let groupKey = 'api_posts_listing_page_'+page+'_limit_'+limit;
            // if (userId) {
            //   groupKey += '_userid_' + userId;
            // }
            // if (fromPage) {
            //   groupKey += '_frompage_' + fromPage;
            // }
            // let response = this.cache.loadFromDelayedObservable(url, request, groupKey, this.apiService.ttl, groupKey);

            request.subscribe(
              result => {
                resolve(result);
              },
              ex => {
                resolve({ error: 1, trace: ex, request: "getFriendRequests" });
              }
            );
          } else {
            resolve({ error: 1, trace: auth, request: "getFriendRequests" });
          }
        })
        .catch(authError => {
          resolve({ error: 1, trace: authError, request: "getFriendRequests" });
        });
    });
  }

  getNotifications(page?, limit = 8) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url =
            auth["data"]["data_url"] +
            "/notif/getnotifs?page=" +
            page +
            "&limit=" +
            limit;

          // let headers = new Headers();
          // headers.append("Content-Type", "application/x-www-form-urlencoded");
          // headers.append("Accept", "application/json");
          // headers.append("Authorization", "Bearer " + auth["data"]["token"]);
          // headers.append("Devicetoken", auth["data"]["device_token"]);

          // let options = new RequestOptions({ headers: headers });
          let httpOptions: any = {
            headers: new HttpHeaders({
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
              'Authorization':'Bearer '+ auth['data']['token'],
              'Devicetoken':auth['data']['device_token']
            })
          };
          // let request = this.http.get(url, httpOptions).pipe(timeout(this.apiService.timeout),map(result =>{ }));
          let request = this.http.get(url, httpOptions);

          let groupKey = "api_posts_listing_page_" + page + "_limit_" + limit;

          let response = this.cache.loadFromDelayedObservable(
            url,
            request,
            groupKey,
            this.apiService.ttl,
            groupKey
          );

          request.subscribe(
            result => {
              resolve(result);
            },
            err => {
              console.log("err", err);
              response.subscribe(
                result => {
                  resolve(result);
                }
              );
            }
          );
        } else {
          resolve({
            error: 1,
            message: this.componentService.generic_error_msg
          });
        }
      });
    });
  }

  markNotificationAsRead(type, data) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/user/' + type;

          let paramData = {
            notifId: data.notifId
          }

          // let headers = new Headers();
          // headers.append("Content-Type", "application/x-www-form-urlencoded");
          // headers.append("Accept", "application/json");
          // headers.append("Authorization", "Bearer " + auth["data"]["token"]);
          // headers.append("Devicetoken", auth["data"]["device_token"]);

          // let options = new RequestOptions({headers: headers});
          let httpOptions: any = {
            headers: new HttpHeaders({
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
              'Authorization':'Bearer '+ auth['data']['token'],
              'Devicetoken':auth['data']['device_token']
            })
          };
          let request = this.http.post(url, paramData, httpOptions);
          request.subscribe(result => {
            resolve(result);
          }, ex => {
            resolve({error: 1, trace: ex, request: 'markNotificationAsRead'});
          });
        }
        else {
          resolve({error: 1, trace: auth, request: 'markNotificationAsRead'});
        }
      }).catch(ex => {
        resolve({error: 1, trace: ex, request: 'markNotificationAsRead'});
      });
    });
  }
  markAllNotificationAsRead(type, data) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/user/' + type;
          let paramData = {
            notif_user_id: data['user_id']
          }
          // let headers = new Headers();
          // headers.append("Content-Type", "application/x-www-form-urlencoded");
          // headers.append("Accept", "application/json");
          // headers.append("Authorization", "Bearer " + auth["data"]["token"]);
          // headers.append("Devicetoken", auth["data"]["device_token"]);

          // let options = new RequestOptions({headers: headers});
          let httpOptions: any = {
            headers: new HttpHeaders({
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
              'Authorization':'Bearer '+ auth['data']['token'],
              'Devicetoken':auth['data']['device_token']
            })
          };
          let request = this.http.post(url, paramData, httpOptions);
          request.subscribe(result => {
            resolve(result);
          }, ex => {
            resolve({error: 1, trace: ex, request: 'markAllNotificationAsRead'});
          });
        }
        else {
          resolve({error: 1, trace: auth, request: 'markAllNotificationAsRead'});
        }
      }).catch(ex => {
        resolve({error: 1, trace: ex, request: 'markAllNotificationAsRead'});
      });
    });
  }
  clearNotification(type, data) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/user/' + type;
          let paramData = {
            notif_user_id: data['user_id']
          }
          // let headers = new Headers();
          // headers.append("Content-Type", "application/x-www-form-urlencoded");
          // headers.append("Accept", "application/json");
          // headers.append("Authorization", "Bearer " + auth["data"]["token"]);
          // headers.append("Devicetoken", auth["data"]["device_token"]);

          // let options = new RequestOptions({headers: headers});
          let httpOptions: any = {
            headers: new HttpHeaders({
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
              'Authorization':'Bearer '+ auth['data']['token'],
              'Devicetoken':auth['data']['device_token']
            })
          };
          let request = this.http.post(url, paramData, httpOptions);
          request.subscribe(result => {
            resolve(result);
          }, ex => {
            resolve({error: 1, trace: ex, request: 'clearNotification'});
          });
        }
        else {
          resolve({error: 1, trace: auth, request: 'clearNotification'});
        }
      }).catch(ex => {
        resolve({error: 1, trace: ex, request: 'clearNotification'});
      });
    });
  }
}
