import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { FileTransferObject, FileUploadOptions, FileTransfer } from '@ionic-native/file-transfer/ngx';
import { Platform } from '@ionic/angular';
import { ComponentsService } from '../components/components.service';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  constructor(
    private componentsProvider: ComponentsService,
    private apiProvider: ApiService,
    public http: HttpClient,
    public platform: Platform,
    public fileTransfer:FileTransfer,
    public apiService : ApiService,
    public componentService: ComponentsService,
  ) { }



  postQuestionNew(type,data) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url = auth["data"]["data_url"] + '/stylecolumn/' + type;
          let httpOptions: any = {
            headers: new HttpHeaders({
              /* 'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json', */
              'Authorization':'Bearer '+ auth['data']['token'],
              'Devicetoken':auth['data']['device_token']
            })
          };
          // let request = this.http.post(url, data, httpOptions).timeout(this.apiProvider.timeout).map(result => result.json());
          let request = this.http.post(url, data, httpOptions);
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
  async postQuestion(type, photo?, data?) {
    return new Promise(resolve => {
      this.apiProvider.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/stylecolumn/' + type;
          let fileUploadStatus:any = [];

          console.log('Photo received: ', photo);
          console.log('Data received: ', data);

          if (this.platform.is('ios')) {
            let jsonifyData = JSON.stringify(data['tags']);
            data['tags'] = jsonifyData;
          }

          const fileTransfer: FileTransferObject = this.fileTransfer.create();
          let uploadOptions;
          if (this.platform.is('ios')) {
            let options: FileUploadOptions = {
              fileKey: 'photo',
              fileName: photo.name,
              chunkedMode: false,
              headers: {
                Accept: 'application/json',
                Authorization: 'Bearer ' + auth['data']['token'],
                Devicetoken: auth['data']['device_token']
              },
              params: data,
              httpMethod: 'POST'
            }

            uploadOptions = options;
          }
          else {
            let options: FileUploadOptions = {
              fileKey: 'photo',
              fileName: photo.name,
              chunkedMode: false,
              mimeType: 'image/jpeg',
              headers: {
                Accept: 'application/json',
                Authorization: 'Bearer ' + auth['data']['token'],
                Devicetoken: auth['data']['device_token']
              },
              params: data,
              httpMethod: 'POST'
            }
            uploadOptions = options;
          }

          // Upload photo as well as the params
          fileTransfer.upload(photo.path, url, uploadOptions).then(result => {
            fileUploadStatus = JSON.parse(result.response);
            console.log("fileUploadStatus", fileUploadStatus);
            if(fileUploadStatus['error'] == 0) {
              resolve({error: 0, data: fileUploadStatus['data'], message: "Post successful."});
            } else {
              resolve({error: 1, data: fileUploadStatus['data'], message: "Could not post style question. Please try again later."});
            }
          }).catch(e => {
            console.log("e", e);
            resolve({ error: 1, message: "Could not post style question. Please try again later." });
          });
        }
        else {
          resolve({error: 1, message: this.componentsProvider.generic_error_msg, trace: auth, request: 'postQuestion'});
        }
      }).catch(authError => {
        resolve({error: 1, message: this.componentsProvider.generic_error_msg, trace: authError, request: 'postQuestion'});
      });
    });
  }

  // POST A PARENT COMMENT TO A STYLE QUESTION
  // Will also handle if the comment is a reply to a comment.
  async postAnswer(type, data, reply?, edit?) {
    return new Promise(resolve => {
      this.apiProvider.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/column/' + type;

          // Fork here depending if this is a new answer,
          // or a reply to an answer.
          let paramData;
          if (reply) {
            // posting as a reply
            paramData = {
              column_commentId: data.column_commentId,
              reply: data.reply
            }
          }
          else {
            // posting as a new answer, or editing an answer
            if (edit) {
              paramData = {
                columnId: data.columnId,
                comment: data.comment,
                commentId: data.commentId
              }
            }
            else {
              paramData = {
                columnId: data.columnId,
                comment: data.comment
              }
            }
          }

          // let headers = new Headers();
          // headers.append("Content-Type", "application/x-www-form-urlencoded");
          // headers.append("Accept", "application/json");
          // headers.append("Authorization", "Bearer " + auth["data"]["token"]);
          // headers.append("Devicetoken", auth["data"]["device_token"]);
          let httpOptions: any = {
            headers: new HttpHeaders({
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
              'Authorization':'Bearer '+ auth['data']['token'],
              'Devicetoken':auth['data']['device_token']
            })
          };

          // let options = new RequestOptions({headers: headers});

          // let request = this.http.post(url, paramData, httpOptions).timeout(this.apiProvider.timeout).map(result => result.json());
          let request = this.http.post(url, paramData, httpOptions);

          request.subscribe(result => {
            resolve(result);
          }, err => {
            resolve(err);
          });
        }
        else {
          resolve({error: 1, trace: auth, request: 'postAnswer'});
        }
      }).catch(ex => {
        resolve({error: 1, trace: ex, request: 'postAnswer'});
      });
    });
  }

  // GET PARENT COMMENTS FOR A STYLE QUESTION.
  async retrieveComments(type, data, page?, limit?) {
    return new Promise(resolve => {
      this.apiProvider.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url;
          if (page) {
            url = auth['data']['data_url'] + '/column/' + type + '?page=' + page + '&limit=' + limit;
          }
          else {
            url = auth['data']['data_url'] + '/column/' + type;
          }

          let paramData = {
            columnId: data
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
          }, err => {
            resolve(err);
          });
        }
        else {
          resolve({error: 1, trace: auth, request: 'getStyleColumnComments'});
        }
      }).catch(ex => {
        resolve({error: 1, trace: ex, request: 'getStyleColumnComments'});
      })
    });
  }

  // GET CHILD COMMENTS FOR A STYLE QUESTION RESPONSE.
  async retrieveReplies(type, data, page?, limit?) {
    return new Promise(resolve => {
      this.apiProvider.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url;
          if (page) {
            url = auth['data']['data_url'] + '/column/' + type + '?page=' + page + '&limit=' + limit;
          }
          else {
            url = auth['data']['data_url'] + '/column/' + type;
          }

          let paramData = {
            column_commentId: data
          }

          // let headers = new Headers();
          // headers.append('Content-Type', 'application/x-www-form-urlencoded');
          // headers.append('Accept', 'application/json');
          // headers.append('Authorization', 'Bearer ' + auth['data']['token']);
          // headers.append('devicetoken', auth['data']['device_token']);

          // let options = new RequestOptions({ headers: headers });
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
          }, err => {
            resolve({ error: 1, message: this.componentsProvider.generic_error_msg, trace: err });
          });
        }
        else {
          resolve({error: 1, trace: auth, request: 'getStyleColumnCommentsReplies'});
        }
      }).catch(authError => {
        resolve({error: 1, trace: authError, request: 'getStyleColumnCommentsReplies'});
      });
    });
  }

  // Used for updating a reply to a comment in Style Column.
  async editReply(type, data) {
    return new Promise(resolve => {
      this.apiProvider.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/column/' + type;

          let paramData = {
            column_commentId: data.column_commentId,
            reply: data.reply,
            commentReplyId: data.commentReplyId
          }

          // let headers = new Headers();
          // headers.append('Content-Type', 'application/x-www-form-urlencoded');
          // headers.append('Accept', 'application/json');
          // headers.append('Authorization', 'Bearer ' + auth['data']['token']);
          // headers.append('devicetoken', auth['data']['device_token']);

          // let options = new RequestOptions({ headers: headers });
          let httpOptions: any = {
            headers: new HttpHeaders({
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
              'Authorization':'Bearer '+ auth['data']['token'],
              'Devicetoken':auth['data']['device_token']
            })
          };
          // let request = this.http.post(url, paramData, httpOptions).timeout(this.apiProvider.timeout).map(result => result.json());
          let request = this.http.post(url, paramData, httpOptions);
          request.subscribe(result => {
            resolve(result);
          }, err => {
            console.log('err', err);
            resolve({ error: 1, message: this.componentsProvider.generic_error_msg, trace: err });
          });
        }
        else {
          resolve({error: 1, trace: auth, request: 'editReply'});
        }
      }).catch(authError => {
        resolve({error: 1, trace: authError, request: 'editReply'});
      });
    });
  }

  // Delete parent and/or child comments.
  async deleteResponse(type, data, reply?) {
    console.log(data);
    return new Promise(resolve => {
      this.apiProvider.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/column/' + type;

          let paramData;
          if (reply) {
            url = auth['data']['data_url'] + '/column/savecommentreplies';

            paramData = {
              column_commentId: data.column_commentId,
              isDeleted: 0,
              commentReplyId: data.commentReplyId
            }
          }
          else {
            paramData = {
              columnId: data.columnId,
              isDeleted: 0,
              commentId: data.commentId
            }
          }

          // let headers = new Headers();
          // headers.append('Content-Type', 'application/x-www-form-urlencoded');
          // headers.append('Accept', 'application/json');
          // headers.append('Authorization', 'Bearer ' + auth['data']['token']);
          // headers.append('devicetoken', auth['data']['device_token']);

          // let options = new RequestOptions({ headers: headers });
          let httpOptions: any = {
            headers: new HttpHeaders({
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
              'Authorization':'Bearer '+ auth['data']['token'],
              'Devicetoken':auth['data']['device_token']
            })
          };
          // let request = this.http.post(url, paramData, httpOptions).timeout(this.apiProvider.timeout).map(result => result.json());
          let request = this.http.post(url, paramData, httpOptions);

          request.subscribe(result => {
            resolve(result);
          }, err => {
            resolve({ error: 1, message: this.componentsProvider.generic_error_msg, trace: err });
          });
        }
        else {
          resolve({error: 1, trace: auth, request: 'deleteResponse'});
        }
      }).catch(authError => {
        resolve({error: 1, trace: authError, request: 'deleteResponse'});
      });
    });
  }
}
