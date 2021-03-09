import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FileTransferObject, FileUploadOptions, FileTransfer } from '@ionic-native/file-transfer/ngx';
import { Storage } from '@ionic/storage';
import {CacheService} from 'ionic-cache';
import { ComponentsService } from '../components/components.service';
import { ApiService } from '../api/api.service';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(
    private componentService: ComponentsService,
    private apiService: ApiService,
    public storage: Storage,
    public cache: CacheService,
    public http: HttpClient,
    public platform: Platform,
    public fileTransfer:FileTransfer,
  ) { }
  
  getPosts(userId?, fromPage?, page = 1, limit = 10) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url = auth["data"]["data_url"] + "/posts/listing?page=" + page;

          let data;

          if (fromPage === "homepage") {
            data = { dashboard: "hotdog" };
          }

          if (userId) {
            data = { otherUserId: userId };
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
              'Authorization':'Bearer '+ auth['data']['token'],
              'Devicetoken':auth['data']['device_token']
            })
          };
          // let request = this.http
          //   .post(url, data, httpOptions)
          //   .timeout(this.apiService.timeout)
          //   .map(result => result.json());
          let request = this.http
            .post(url, data, httpOptions);

          let groupKey = "api_posts_listing_page_" + page + "_limit_" + limit;
          if (userId) {
            groupKey += "_userid_" + userId;
          }
          if (fromPage) {
            groupKey += "_frompage_" + fromPage;
          }
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
                },
                err => {
                  console.log("err", err);
                  resolve({
                    error: 1,
                    message: this.componentService.generic_error_msg
                  });
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
  saveNew(data) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url = auth["data"]["data_url"] + "/posts/savenew";
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
  postNotif(data) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url = auth["data"]["data_url"] + "/posts/savenewnotif";
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
  async save(photoPath?, data?, photoName?) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then((auth: any) => {
        console.log("auth", auth);
        if (auth["error"] == 0) {
          let url = auth["data"]["data_url"] + "/posts/save";

          if (this.platform.is('ios') || this.platform.is('android')) {
            let jsonifyData = JSON.stringify(data['tags']);
            data['tags'] = jsonifyData;
          }

          console.log('Performing file transfer.');
          let fileUploadStatus:any = [];
          const fileTransfer: FileTransferObject = this.fileTransfer.create();
          let options: FileUploadOptions = {
            fileKey: "photo",
            fileName: photoPath.name,
            chunkedMode: false,
            mimeType: "image/jpeg",
            headers: {
              Accept: "application/json",
              Authorization: "Bearer " + auth["data"]["token"],
              Devicetoken: auth["data"]["device_token"]
            },
            params: data,
            httpMethod: "POST"
          }

          fileTransfer
            .upload(photoPath.path, url, options)
            .then(result => {
              fileUploadStatus = JSON.parse(result.response);
              console.log("fileUploadStatus", fileUploadStatus);
              if (fileUploadStatus["error"] == 0) {
                resolve({
                  error: 0,
                  data: fileUploadStatus["data"],
                  message: "Post Successful"
                });
              } else {
                resolve({
                  error: 1,
                  data: fileUploadStatus["data"],
                  message: "Could not post OOTD. Please try again."
                });
              }
            })
            .catch(e => {
              console.log("e", e);
              resolve({
                error: 1,
                message: "Could not post OOTD. Please try again."
              });
            });
        } else {
          resolve({
            error: 1,
            message: this.componentService.generic_error_msg
          });
        }
      });
    });
  }
  changePrivacy(data) {
    return new Promise(resolve => {
      this.apiService
        .getAuthentication(true)
        .then(auth => {
          if (auth["error"] == 0) {
            let url = auth["data"]["data_url"] + "/posts/changeprivacy";

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
            // let request = this.http
            //   .post(url, data, httpOptions)
            //   .timeout(this.apiService.timeout)
            //   .map(result => result.json());
            let request = this.http
              .post(url, data, httpOptions);

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
        })
        .catch(e => {
          console.log("e", e);
          resolve({
            error: 1,
            message: this.componentService.generic_error_msg
          });
        });
    });
  }
  delete(data) {
    return new Promise(resolve => {
      this.apiService
        .getAuthentication(true)
        .then(auth => {
          if (auth["error"] == 0) {
            let url = auth["data"]["data_url"] + "/posts/delete";

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
            // let request = this.http
            //   .post(url, data, httpOptions)
            //   .timeout(this.apiService.timeout)
            //   .map(result => result.json());
            let request = this.http
            .post(url, data, httpOptions);

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
        })
        .catch(e => {
          console.log("e", e);
          resolve({
            error: 1,
            message: this.componentService.generic_error_msg
          });
        });
    });
  }

  savePost(data) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url = auth["data"]["data_url"] + "/posts/savepost";

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
          // let request = this.http
          //   .post(url, data, httpOptions)
          //   .timeout(this.apiService.timeout)
          //   .map(result => result.json());
          let request = this.http
            .post(url, data, httpOptions);

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

  // For refreshing the Post Details page after saving/unsaving from Favorites.
  // Resolves the issue on page swaps before changes are reflected.
  async getPostByIdSingular(type, data) {
    return new Promise(resolve => {
      this.apiService
        .getAuthentication(true)
        .then(auth => {
          if (auth["error"] == 0) {
            let url = auth["data"]["data_url"] + "/posts/" + type;

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

            console.log();
            let paramData = {
              postId: data
            };

            // let options = new RequestOptions({ headers: headers });
            // let request = this.http
            //   .post(url, paramData, httpOptions)
            //   .timeout(this.apiService.timeout)
            //   .map(result => result.json());
            let request = this.http
              .post(url, paramData, httpOptions);

            request.subscribe(
              result => {
                resolve(result);
              },
              ex => {
                resolve({
                  error: 1,
                  trace: ex,
                  request: "getPostByIdSingular"
                });
              }
            );
          } else {
            resolve({ error: 1, trace: auth, request: "getPostByIdSingular" });
          }
        })
        .catch(authError => {
          resolve({
            error: 1,
            trace: authError,
            request: "getPostByIdSingular"
          });
        });
    });
  }

  getPostsById(id, page = 1, limit = 10) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url = auth["data"]["data_url"] + "/posts/id";

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

          let data = { postId: id };

          // let options = new RequestOptions({ headers: headers });
          // let request = this.http
          //   .post(url, data, httpOptions)
          //   .timeout(this.apiService.timeout)
          //   .map(result => result.json());
          let request = this.http
          .post(url, data, httpOptions);

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
                },
                err => {
                  console.log("err", err);
                  resolve({
                    error: 1,
                    message: this.componentService.generic_error_msg
                  });
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

  likePost(data) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url = auth["data"]["data_url"] + "/posts/likepost";

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
          // let request = this.http
          //   .post(url, data, httpOptions)
          //   .timeout(this.apiService.timeout)
          //   .map(result => result.json());
          let request = this.http
            .post(url, data, httpOptions);

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
  likePostNotif(data) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url = auth["data"]["data_url"] + "/posts/likepostnotif";

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
          // let request = this.http
          //   .post(url, data, httpOptions)
          //   .timeout(this.apiService.timeout)
          //   .map(result => result.json());
          let request = this.http
            .post(url, data, httpOptions);

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

  likeComment(user_id, comment_id, is_reply:number = 0) {
    let data = {
      user_id,
      comment_id,
      is_reply
    }

    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url = auth["data"]["data_url"] + "/posts/likecomment";

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
          // let request = this.http
          //   .post(url, data, httpOptions)
          //   .timeout(this.apiService.timeout)
          //   .map(result => result.json());
          let request = this.http
            .post(url, data, httpOptions);

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

  // This covers both own saved posts and other users' saved posts,
  // as well as paginated requests.
  async getSavedPosts(type, data?, page?) {
    console.log(data)
    return new Promise(resolve => {
      this.apiService
        .getAuthentication(true)
        .then(auth => {
          if (auth["error"] == 0) {
            let url = auth["data"]["data_url"] + "/posts/";

            // Paginated request fork
            if (page) {
              url = url + type + "?page=" + page;
            } else {
              url = url + type;
            }

            // View other users' favorites
            let paramData;
            if (data) {
              paramData = { userId: data };
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
                'Authorization':'Bearer '+ auth['data']['token'],
                'Devicetoken':auth['data']['device_token']
              })
            };
            // let request = this.http
            //   .post(url, paramData, httpOptions)
            //   .timeout(this.apiService.timeout)
            //   .map(result => result.json());
            let request = this.http
              .post(url, paramData, httpOptions);
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
              message: this.componentService.generic_error_msg,
              trace: auth
            });
          }
        })
        .catch(authError => {
          resolve(authError);
        });
    });
  }

  // Get comments
  // Retrieving of replies is handled separately.
  async getComments(type, data, page?, limit?) {
    return new Promise(resolve => {
      this.apiService
        .getAuthentication(true)
        .then(auth => {
          if (auth["error"] == 0) {
            let url = auth['data']['data_url'] + '/posts/' + type + '?page=' + page + '&limit=' + limit;
            // let url = auth["data"]["data_url"] + "/posts/" + type;

            let paramData = {
              postId: data
            }

            // let headers = new Headers();
            // headers.append("Content-Type", "application/x-www-form-urlencoded");
            // headers.append("Accept", "application/json");
            // headers.append("Authorization", "Bearer " + auth["data"]["token"]);
            // headers.append("devicetoken", auth["data"]["device_token"]);

            // let options = new RequestOptions({ headers: headers });
            let httpOptions: any = {
              headers: new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'Authorization':'Bearer '+ auth['data']['token'],
                'Devicetoken':auth['data']['device_token']
              })
            };
            // let request = this.http
            //   .post(url, paramData, httpOptions)
            //   .timeout(this.apiService.timeout)
            //   .map(result => result.json());
            let request = this.http
              .post(url, paramData, httpOptions);
            
            request.subscribe(
              result => {
                console.log("apiResult:",result)
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
              message: this.componentService.generic_error_msg,
              trace: auth
            });
          }
        }).catch(authError => {
          resolve(authError);
        });
    });
  }

  // Retrieve replies
  // This request is only called if the getComment function in the controller
  // is successfully completed.
  async getReplies(type, data, page?, limit?) {
    console.log(data)
    return new Promise(resolve => {
      this.apiService
        .getAuthentication(true)
        .then(auth => {
          if (auth["error"] == 0) {
            let url;
            if (page) {
              url = auth['data']['data_url'] + '/posts/' + type + '?page=' + page + '&limit=' + limit;
            }
            else {
              url = auth['data']['data_url'] + '/posts/' + type;
            }

            let paramData = {
              commentId: data
            }

            // let headers = new Headers();
            // headers.append("Content-Type", "application/x-www-form-urlencoded");
            // headers.append("Accept", "application/json");
            // headers.append("Authorization", "Bearer " + auth["data"]["token"]);
            // headers.append("devicetoken", auth["data"]["device_token"]);

            // let options = new RequestOptions({ headers: headers });
            let httpOptions: any = {
              headers: new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'Authorization':'Bearer '+ auth['data']['token'],
                'Devicetoken':auth['data']['device_token']
              })
            };
            // let request = this.http
            //   .post(url, paramData, httpOptions)
            //   .timeout(this.apiService.timeout)
            //   .map(result => result.json());
            let request = this.http
              .post(url, paramData, httpOptions);
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
              message: this.componentService.generic_error_msg,
              trace: auth
            });
          }
        })
        .catch(authError => {
          resolve(authError);
        });
    });
  }

  // Post a Comment and Reply
  // This covers both posting a new comment and posting a reply to a comment.
  async postComment(type, data, reply?, edit?) {
    return new Promise(resolve => {
      this.apiService
        .getAuthentication(true)
        .then(auth => {
          if (auth["error"] == 0) {
            let url = auth["data"]["data_url"] + "/posts/" + type;

            // Fork here if this comment will be posted as a new comment,
            // or as a reply to a comment.
            let paramData;
            if (reply) {
              // posting as reply
              paramData = {
                commentId: data.commentId,
                commentReply: data.comment
              };
            } else {
              // posting as a new comment
              if (edit) {
                paramData = {
                  postId: data.postId,
                  comment: data.comment,
                  commentId: data.commentId
                };
              } else {
                paramData = {
                  postId: data.postId,
                  comment: data.comment
                };
              }
            }

            // let headers = new Headers();
            // headers.append("Content-Type", "application/x-www-form-urlencoded");
            // headers.append("Accept", "application/json");
            // headers.append("Authorization", "Bearer " + auth["data"]["token"]);
            // headers.append("devicetoken", auth["data"]["device_token"]);

            // let options = new RequestOptions({ headers: headers });
            let httpOptions: any = {
              headers: new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'Authorization':'Bearer '+ auth['data']['token'],
                'Devicetoken':auth['data']['device_token']
              })
            };
            // let request = this.http
            //   .post(url, paramData, httpOptions)
            //   .timeout(this.apiService.timeout)
            //   .map(result => result.json());
            let request = this.http
              .post(url, paramData, httpOptions);
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
            resolve({ error: 1, trace: auth });
          }
        })
        .catch(authError => {
          resolve(authError);
        });
    });
  }

  async postCommentNotif(type, data, reply?, edit?) {
    return new Promise(resolve => {
      this.apiService
        .getAuthentication(true)
        .then(auth => {
          if (auth["error"] == 0) {
            let url = auth["data"]["data_url"] + "/posts/" + type;

            // Fork here if this comment will be posted as a new comment,
            // or as a reply to a comment.
            let paramData;
            if(reply){
              paramData = {
                commentId: data.commentId,
                commentReply: data.comment
              };
            }else{
              paramData = {
                postId: data.postId,
                comment: data.comment
              };
            }
            let httpOptions: any = {
              headers: new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'Authorization':'Bearer '+ auth['data']['token'],
                'Devicetoken':auth['data']['device_token']
              })
            };
            // let request = this.http
            //   .post(url, paramData, httpOptions)
            //   .timeout(this.apiService.timeout)
            //   .map(result => result.json());
            let request = this.http
              .post(url, paramData, httpOptions);
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
            resolve({ error: 1, trace: auth });
          }
        })
        .catch(authError => {
          resolve(authError);
        });
    });
  }

  // Used for updating a reply to a comment in Post Details.
  async editReply(type, data) {
    return new Promise(resolve => {
      this.apiService
        .getAuthentication(true)
        .then(auth => {
          if (auth["error"] == 0) {
            let url = auth["data"]["data_url"] + "/posts/" + type;

            let paramData = {
              commentId: data.commentId,
              commentReply: data.commentReply,
              commentReplyId: data.commentReplyId
            };

            // let headers = new Headers();
            // headers.append("Content-Type", "application/x-www-form-urlencoded");
            // headers.append("Accept", "application/json");
            // headers.append("Authorization", "Bearer " + auth["data"]["token"]);
            // headers.append("devicetoken", auth["data"]["device_token"]);

            // let options = new RequestOptions({ headers: headers });
            let httpOptions: any = {
              headers: new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'Authorization':'Bearer '+ auth['data']['token'],
                'Devicetoken':auth['data']['device_token']
              })
            };
            // let request = this.http
            //   .post(url, paramData, httpOptions)
            //   .timeout(this.apiService.timeout)
            //   .map(result => result.json());
            let request = this.http
              .post(url, paramData, httpOptions);
              
            request.subscribe(
              result => {
                resolve(result);
              },
              err => {
                console.log("err", err);
                resolve({
                  error: 1,
                  message: this.componentService.generic_error_msg,
                  trace: err
                });
              }
            );
          } else {
            resolve({ error: 1, trace: auth, request: "editReply" });
          }
        })
        .catch(authError => {
          resolve({ error: 1, trace: authError, request: "editReply" });
        });
    });
  }

  // Delete a comment
  // This also covers the deletion of replies, if ever.
  async deleteComment(type, data, reply?) {
    return new Promise(resolve => {
      this.apiService
        .getAuthentication(true)
        .then(auth => {
          if (auth["error"] == 0) {
            let url = auth["data"]["data_url"] + "/posts/" + type;

            // Fork here if the comment being deleted is a reply or not.
            let paramData;
            if (reply) {
              paramData = {
                commentId: data.commentId,
                isDeleted: 0,
                commentReplyId: data.commentReplyId
              };
            } else {
              paramData = {
                postId: data.postId,
                isDeleted: 0,
                commentId: data.commentId
              };
            }

            // let headers = new Headers();
            // headers.append("Content-Type", "application/x-www-form-urlencoded");
            // headers.append("Accept", "application/json");
            // headers.append("Authorization", "Bearer " + auth["data"]["token"]);
            // headers.append("devicetoken", auth["data"]["device_token"]);

            // let options = new RequestOptions({ headers: headers });
            let httpOptions: any = {
              headers: new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'Authorization':'Bearer '+ auth['data']['token'],
                'Devicetoken':auth['data']['device_token']
              })
            };
            let request = this.http
              .post(url, paramData, httpOptions);
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
            resolve({ error: 1, trace: auth });
          }
        })
        .catch(authError => {
          resolve(authError);
        });
    });
  }

  async getPostLikes(id, isLiked, page?, limit = 20) {
    return new Promise(resolve => {
      this.apiService
        .getAuthentication(true)
        .then(auth => {
          if (auth["error"] == 0) {
            let url = auth["data"]["data_url"] + "/posts/getpostlikes";

            if(page) {
              url = url + "?page=" + page;
            }

            if(limit) {
              url = url + "&limit=" +limit;
            }


            let data = {
              postId: id,
              isLiked: isLiked
            };

            // let headers = new Headers();
            // headers.append("Content-Type", "application/x-www-form-urlencoded");
            // headers.append("Accept", "application/json");
            // headers.append("Authorization", "Bearer " + auth["data"]["token"]);
            // headers.append("devicetoken", auth["data"]["device_token"]);

            // let options = new RequestOptions({ headers: headers });
            let httpOptions: any = {
              headers: new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'Authorization':'Bearer '+ auth['data']['token'],
                'Devicetoken':auth['data']['device_token']
              })
            };
            let request = this.http
              .post(url, data, httpOptions);
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
            resolve({ error: 1, trace: auth });
          }
        })
        .catch(authError => {
          resolve(authError);
        });
    });
  };


  sharedForPoints(data) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url = auth["data"]["data_url"] + "/posts/shared";

          console.log('galing provider', data);

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
          // let request = this.http
          //   .post(url, data, httpOptions)
          //   .timeout(this.apiService.timeout)
          //   .map(result => result.json());
          let request = this.http
            .post(url, data, httpOptions);

          let groupKey = "api_posts_shar_page_" + 1 + "_limit_" + 1;

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
                },
                err => {
                  console.log("err", err);
                  resolve({
                    error: 1,
                    message: this.componentService.generic_error_msg
                  });
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
}
