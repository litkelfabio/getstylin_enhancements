import { Injectable } from '@angular/core';
/* import * as jwt_decode from 'jwt-decode'; */
import JwtDecode from 'jwt-decode';
import { CacheService } from "ionic-cache/";
import { FileTransferObject, FileUploadOptions, FileTransfer } from '@ionic-native/file-transfer/ngx';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../api/api.service';
import { EventsService } from '../events.service';
import { Storage } from '@ionic/storage';
import { ComponentsService } from '../components/components.service';
import { catchError, timeout, map } from 'rxjs/operators';
import _ from 'lodash';
import { SocketService } from '../socket/socket.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(
    public fileTransfer: FileTransfer,
    public apiService: ApiService,
    public events: EventsService,
    public storage: Storage,
    public http: HttpClient,
    public componentService: ComponentsService,
    public cache: CacheService,

  ) {
    console.log("Hello ChatProvider Provider");

    this.storage.get("user_token").then(token => {
      if (token) {
        this.decodeToken(token);
      }
    });

    this.events.subscribe('convo-opened', (data?) => {
      console.log('Thread opened event fired: ', data);

      // Remove the opened thread from unreads list.
      this.storage.get('unread_conversations').then(unreads => {
        if (unreads) {
          console.log("Removing from unreads.");
          console.log(unreads);
          if (unreads.length > 0) {
            var unrd = unreads;
            unrd = _.remove(unrd, item => {
              return item['convo']['id'] != data['id'];
            });
            this.storage.set('unread_conversations', unrd);
          }
        }
      });

      this.markMessageAsRead('readat', data['id']);
    });
  }
  payload: any;
  chatSocket: any;
  socketValues: any;

  decodeToken(token) {
    let decodedToken = JwtDecode(token);
    console.log("decoded", decodedToken);
    this.payload = decodedToken;
    console.log("PAYLOAD ", this.payload)
  }

  setSocket(socketConatiner: any, socket: any, port: any, opt: any = null) {
    // PROD
    let options = {
      url: "https://getstylin.com" + ":" + port,
      options: {}
    };

    // DEV
    // let options = {
    //   url: "https://dev.livewire365.com" + ":" + port,
    //   options: {}
    // };

    if (opt) {
      options.options = opt;
    }

    this[socketConatiner] = new socket(options);
    this[socketConatiner].setVar("currentLogedInUserId", this.payload.jti);
    this[socketConatiner].setVar("devicetoken", opt.query.devicetoken);
    this.storage.get("user_token").then(user_token => {
      this[socketConatiner].setVar("apiToken", user_token);
    });
    // PROD
    this[socketConatiner].setVar("baseUrl", "https://getstylin.com");
    // DEV
    // this[socketConatiner].setVar("baseUrl", "https://dev.livewire365.com");

    console.log("SOCKET CONTAINER: ", this[socketConatiner]);
    this.events.publish('socket-ready');
  }

  initChatSocket(userId?) {
    console.log("Initialize ChatSocket");
    console.log("PAYLOAD ", this.payload)
    if(this.payload == undefined){
      this.storage.get("user_token").then(token => {
        if (token) {
          this.decodeToken(token);
        }
      });
      this.storage.get("device_token").then(device_token => {
        var params = {
          query: {
            user: userId ? userId : this.payload.jti,
            request_type: "mobile"
          }
        };
        if (device_token) {
          params["query"]["devicetoken"] = device_token;
        }
        console.log("SOCKET PARAMS: ", params);
        // PROD (LIVE)
        this.setSocket("chatSocket", SocketService, "3000", params);
        // PROD (DEV)
        // this.setSocket("chatSocket", SocketProvider, "3001", params);
        // DEV
        // this.setSocket("chatSocket", SocketProvider, "3002", params);
      });
    }else{
      this.storage.get("device_token").then(device_token => {
        var params = {
          query: {
            user: userId ? userId : this.payload.jti,
            request_type: "mobile"
          }
        };
        if (device_token) {
          params["query"]["devicetoken"] = device_token;
        }
        console.log("SOCKET PARAMS: ", params);
        // PROD (LIVE)
        if(params){
          this.setSocket("chatSocket", SocketService, "3000", params);
        }
        // PROD (DEV)
        // this.setSocket("chatSocket", SocketProvider, "3001", params);
        // DEV
        // this.setSocket("chatSocket", SocketProvider, "3002", params);
      });
    }
  }

  socketSendMessage(message, otherid, convoid, temp_id, attachmentId?) {
    console.log(temp_id);
    if (attachmentId) {
      this.chatSocket.sendMessage(message, otherid, convoid, attachmentId, temp_id);
    }
    else {
      this.chatSocket.sendMessage(message, otherid, convoid, null, temp_id);
    }
  }

  socketSetCurrentConvo(convoId) {
    this.chatSocket.setVar("currentConvo", convoId);
  }

  socketEmitMessage(otherId) {
    this.chatSocket.getMessagesV2(otherId);
  }

  socketListen() {
    this.chatSocket.listeners();
  }

  socketEmitChatting(convoId) {
    this.chatSocket.chatting(convoId);
  }

  socketEmitDeleteConvo(convoId) {
    this.chatSocket.deleteConvo(convoId);
  };

  socketEmitGetConvo(currentPage?, convoId?) {
    this.chatSocket.getConvo(currentPage, convoId);
  }

  socket() {
    return this["chatSocket"];
  }

  isConnected() {
    return this.chatSocket['ioSocket']['connected'];
  }

  getInbox(userId?, page = 1, limit = 8, fromPage?) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url =
            auth["data"]["data_url"] +
            "/chat/getconvo?page=" +
            page +
            "&limit=" +
            limit;

          console.log("USER ID", userId);

          if (userId) {
            url = url + "&userid=" + userId;
          }

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
              'Authorization': 'Bearer ' + auth['data']['token'],
              'Devicetoken': auth['data']['device_token']
            })
          };
          // let request = this.http.get(url, httpOptions).pipe(
          //   timeout(this.apiService.timeout));
          let request = this.http.get(url, httpOptions);

          let groupKey = "api_posts_listing_page_" + page + "_limit_" + limit;
          if (userId) {
            groupKey += "_userid_" + userId;
          }
          if (fromPage) {
            groupKey += "_frompage_" + fromPage;
          }

          // let response = this.cache.loadFromDelayedObservable(
          //   url,
          //   request,
          //   groupKey,
          //   this.apiService.ttl,
          //   groupKey
          // );

          request.subscribe(
            result => {
              resolve(result);
            },
            err => {
              console.log("err", err);
              resolve({
                error: 1,
                message: this.componentService.generic_error_msg
              });

              // response.subscribe(
              //   result => {
              //     resolve(result);
              //   },
              //   err => {
              //     console.log("err", err);
              //     resolve({
              //       error: 1,
              //       message: this.componentService.generic_error_msg
              //     });
              //   }
              // );
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

  getConvo(userId?, page = 1, limit = 8, fromPage?) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url =
            auth["data"]["data_url"] +
            "/chat/getconvo?page=" +
            page +
            "&limit=" +
            limit;

          if (userId) {
            url = url + "&userid=" + userId;
          }

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
              'Authorization': 'Bearer ' + auth['data']['token'],
              'Devicetoken': auth['data']['device_token']
            })
          };
          // let request = this.http
          //   .get(url, httpOptions).pipe(timeout(this.apiService.timeout));
          let request = this.http
            .get(url, httpOptions);

          let groupKey = "api_posts_listing_page_" + page + "_limit_" + limit;
          if (userId) {
            groupKey += "_userid_" + userId;
          }
          if (fromPage) {
            groupKey += "_frompage_" + fromPage;
          }

          // let response = this.cache.loadFromDelayedObservable(
          //   url,
          //   request,
          //   groupKey,
          //   this.apiService.ttl,
          //   groupKey
          // );

          request.subscribe(
            result => {
              resolve(result);
            },
            err => {
              console.error(err);
              resolve({
                error: 1,
                message: this.componentService.generic_error_msg
              });

              // response.subscribe(
              //   result => {
              //     resolve(result);
              //   },
              //   err => {
              //     resolve({
              //       error: 1,
              //       message: this.componentService.generic_error_msg
              //     });
              //   }
              // );
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

  getMesages(id?, page?, limit = 15) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url =
            auth["data"]["data_url"] +
            "/chat/messages?page=" +
            page +
            "&limit=" +
            limit;

          if (id) {
            url = url + "&convoid=" + id;
          }

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
              'Authorization': 'Bearer ' + auth['data']['token'],
              'Devicetoken': auth['data']['device_token']
            })
          };
          // let request = this.http
          //   .get(url, httpOptions).pipe(timeout(this.apiService.timeout));
          let request = this.http
            .get(url, httpOptions);

          request.subscribe(
            result => {
              resolve(result);
            },
            err => {
              console.log("err", err);
              resolve({ error: 1, trace: err, request: "getMesages" });
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

  deleteConversation(type, data) {
    return new Promise(resolve => {
      this.apiService
        .getAuthentication(true)
        .then(auth => {
          if (auth["error"] == 0) {
            let url = auth["data"]["data_url"] + "";
          } else {
            resolve({ error: 1, trace: auth, request: "deleteConversation" });
          }
        })
        .catch(ex => {
          resolve({ error: 1, trace: ex, request: "deleteConversation" });
        });
    });
  }

  searchConversation(type, data) {
    return new Promise(resolve => {
      this.apiService
        .getAuthentication(true)
        .then(auth => {
          if (auth["error"] == 0) {
            // let url =
            //   auth["data"]["data_url"] +
            //   "/chat/getconvo?page=" +
            //   page +
            //   "&limit=" +
            //   limit;

            let url = auth["data"]["data_url"] + "/chat/" + type + "?q=" + data;

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
                'Authorization': 'Bearer ' + auth['data']['token'],
                'Devicetoken': auth['data']['device_token']
              })
            };
            let request = this.http
              .get(url, httpOptions);
            request.subscribe(
              result => {
                resolve(result);
              },
              ex => {
                resolve({ error: 1, trace: ex, request: "searchConversation" });
              }
            );
          } else {
            resolve({ error: 1, trace: auth, request: "searchConversation" });
          }
        })
        .catch(ex => {
          resolve({ error: 1, trace: ex, request: "searchConversation" });
        });
    });
  }

  markMessageAsRead(type, data) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/user/' + type;
          let paramData = {
            convoId: data
          }

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
              'Authorization': 'Bearer ' + auth['data']['token'],
              'Devicetoken': auth['data']['device_token']
            })
          };

          // let request = this.http.post(url, paramData, httpOptions).pipe(timeout(this.apiService.timeout), map(result => { }));
          let request = this.http.post(url, paramData, httpOptions);
          request.subscribe(result => {
            resolve(result);
          }, ex => {
            resolve({ error: 1, trace: ex, request: 'markMessageAsRead' });
          });
        }
        else {
          resolve({ error: 1, trace: auth, request: 'markMessageAsRead' });
        }
      }).catch(authError => {
        resolve({ error: 1, trace: authError, request: 'markMessageAsRead' });
      });
    });
  }

  uploadAttachment(type, photo, data) {
    console.log('Uploading attachment: ', photo);
    console.log('Received action type and data: ', type, data);

    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/chat/' + type;
          let fileUploadStatus = [];
          const fileTransfer: FileTransferObject = this.fileTransfer.create();

          let options: FileUploadOptions = {
            fileKey: 'photo',
            fileName: photo.name,
            chunkedMode: false,
            headers: {
              Accept: 'application/json',
              Authorization: "Bearer " + auth['data']['token'],
              Devicetoken: auth['data']['device_token']
            },
            params: data,
            httpMethod: 'POST'
          }

          fileTransfer.upload(photo.path, url, options).then(result => {
            fileUploadStatus = JSON.parse(result.response);
            if (fileUploadStatus['error'] == 0) {
              resolve({ error: 0, data: fileUploadStatus, message: 'Attachment uploaded successfully.' });
            }
            else {
              resolve({ error: 1, trace: fileUploadStatus, request: 'uploadAttachment - upload' });
            }
          }).catch(uploadError => {
            resolve({ error: 1, trace: uploadError, request: 'uploadAttachment - upload' });
          });
        }
        else {
          resolve({ error: 1, trace: auth, request: 'uploadAttachment - auth' });
        }
      }).catch(authError => {
        resolve({ error: 1, trace: authError, request: 'uploadAttachment - auth' });
      });
    });
  }
}
