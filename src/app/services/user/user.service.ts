import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse  } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import {CacheService} from 'ionic-cache';
import { AbstractControl } from '@angular/forms';
import { EventsService } from '../events.service';
import { ComponentsService } from '../components/components.service';
import { ApiService } from '../api/api.service';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { AuthService } from '../auth/auth.service';
import { Facebook } from '@ionic-native/facebook/ngx';
import { FileTransferObject, FileUploadOptions, FileTransfer } from '@ionic-native/file-transfer/ngx';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private events: EventsService,
    private componentService: ComponentsService,
    private apiService: ApiService,
    public storage: Storage,
    
    public http: HttpClient,
    public alertCtrl: AlertController,
    public loadingCtrl :LoadingController,
    public authService: AuthService,
    public facebook: Facebook,
    private fileTransfer: FileTransfer,
    private cache: CacheService,
    private gplus :GooglePlus,
    private navCtrl: NavController,
  ) { 
    console.log("UserProvider ready.");
    this.subscribeToLogout();
  }
  subscribeToLogout() {
    console.log("Subscribing to logout event.");
    this.events.subscribe("logout", () => {
      console.log("Logout event fired.");
      this.logoutMe();
    });

    console.log('Subscribing to force logout event.');
    this.events.subscribe('forcelogout', () => {
      console.log('Forcing logout event.');
      this.forceLogout();
    });
  }

  async logoutMe() {
  let alert =  await this.alertCtrl.create({
     /*  title: "Logout", */
     mode: "md",
     cssClass:'logout',
      message: "Are you sure you want to logout?",
      buttons: [
        {
          text: "NO",
          role: "cancel"
        },
        {

          text: "YES",
          handler: () => {
            this.logoutForReals();
          }
        },
      ]
    });
    alert.present();
  }

  async logoutForReals() {
    const loader = await this.loadingCtrl.create({
      message: "Logging out... 'Til next time!"
    });
    loader.present();

    this.authService
      .auth("logout", null, true)
      .then(response => {
        if (response["error"] == 0) {
          this.storage.get('user').then(data => {
            var userData = data;
            if (userData['isSocial']) {
              // userData['isSocial'] == 'google' ? this.gplus.logout() : this.facebook.logout();
              if(userData['isSocial'] == 'google'){
                this.gplus.logout() 
              }else if(userData['isSocial'] == 'facebook'){
                this.facebook.logout();
              }else if(userData['isSocial'] == 'apple'){
                console.log("Logging out with ",userData['isSocial'])
              }
              console.log('Social logged out.');
            }
          });

          this.storage.remove("user").then(() => {
            console.log("User data removed.");

            this.storage.remove("conversations");

            this.storage.remove("user_token").then(() => {
              console.log("User token removed.");

              loader.dismiss();
              this.events.publish("clearing-out");
              // this.eventService.publish("clearing-out");
            
            });
          });
          this.navCtrl.navigateRoot('/login');
        }
      }).then(() => {
        this.storage.clear();
      })
      .catch(ex => {
        console.log("Logout error: ", ex);
      });
  }

  forceLogout() {
    this.storage.remove("user").then(() => {
      console.log("User data removed.");

      this.storage.remove("conversations");

      this.storage.remove("user_token").then(() => {
        console.log("User token removed.");

        // loader.dismiss();
        this.events.publish("clearing-out", true);

        this.storage.clear();
        
      });
    });
    this.navCtrl.navigateRoot('/login');
  }

  x = 0;
  updateProfile(attachments, data) {
    console.log("updateProfile", attachments);
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url = auth["data"]["data_url"] + "/user/updateprofile";
          if (attachments) {
            let dataLength = attachments.length - 1;
            let fileUploadStatus = [];

            const fileTransfer: FileTransferObject = this.fileTransfer.create();
            if (attachments.length == 0) {
              resolve({
                message: "Success",
                items: []
              });
            }
            else {
              attachments.forEach((element, index) => {
                let options: FileUploadOptions = {
                  fileKey: "attachment",
                  fileName: element.name,
                  chunkedMode: false,
                  mimeType: "image/jpeg",
                  headers: {
                    Accept: "application/json",
                    Authorization: "Bearer " + auth["data"]["token"],
                    Devicetoken: auth["data"]["device_token"]
                  },
                  params: data,
                  httpMethod: "POST"
                };
                fileTransfer.upload(element.path, url, options).then(
                  result => {
                    fileUploadStatus[index] = JSON.parse(result.response);
                    if (dataLength == index) {
                      if (fileUploadStatus[0]["error"] === 0) {
                        resolve({
                          error: 0,
                          data: fileUploadStatus[0]["data"],
                          message:
                            "Successfully Updated your Profile Photo and Details"
                        });
                      } else {
                        resolve({
                          error: 1,
                          data: fileUploadStatus[0]["data"],
                          message:
                            "Successfully Updated your Profile Photo and Details"
                        });
                      }
                    }
                  },
                  err => {
                    console.log('Error uploading photo: ', err);
                    if (this.x < 3) {
                      this.updateProfile(attachments, data);
                      this.x++;
                    }
                    else {
                      this.x = 0;
                      resolve({error: 1, trace: err, request: 'updateProfile'});
                    }
                  }
                );
              });
            }
          }
          else {
            let httpOptions: any = {
              headers: new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'Authorization':'Bearer '+ auth['data']['token'],
                'Devicetoken':auth['data']['device_token']
              })
            };
            // let headers = new Headers();
            
            // headers.append("Content-Type", "application/x-www-form-urlencoded");
            // headers.append("Accept", "application/json");
            // headers.append("Authorization", "Bearer " + auth["data"]["token"]);
            // headers.append("Devicetoken", auth["data"]["device_token"]);
            
            // let options = new RequestOptions({ headers: headers });
            // let request = this.http.post(url, data, httpOptions).timeout(this.apiProvider.timeout).map(res => res.json());
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
          }
        }
        else {
          resolve({
            error: 1,
            message: this.componentService.generic_error_msg
          });
        }
      });
    });
  }

  updateProfileNew(data) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url = auth["data"]["data_url"] + "/user/updateprofile";
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
  validateEmail(data) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url = auth["data"]["data_url"] + "/email/validate";

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

  validateUsername(data) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url = auth["data"]["data_url"] + "/username/validate";

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

  updateUsername(type, data, loggedIn) {
    return new Promise(resolve => {
      this.apiService
        .getAuthentication(loggedIn)
        .then(auth => {
          if (auth["error"] == 0) {
            let url = auth["data"]["data_url"] + "/user/" + type;
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
            let paramData = {
              username: data.username
            };

            // let options = new RequestOptions({ headers: headers });
            // let request = this.http.post(url, paramData, httpOptions).timeout(this.apiProvider.timeout).map(result => result.json());
            let request = this.http.post(url, paramData, httpOptions);
            request.subscribe(
              result => {
                resolve(result);
              },
              ex => {
                resolve({ error: 1, trace: ex, request: "updateUsername" });
              }
            );
          } else {
            resolve({ error: 1, trace: auth, request: "updateUsername" });
          }
        })
        .catch(ex => {
          resolve({ error: 1, trace: ex, request: "updateUsername" });
        });
    });
  }

  updatePassword(data, isLogged?) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(isLogged).then(auth => {
        let url = auth["data"]["data_url"];
        if (auth["error"] == 0) {
          if (isLogged) {
            url += "/user/changepassword";
          } else {
            url += "/user/fchangepassword";
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

  getProfileInfo(userId) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url =
            auth["data"]["data_url"] + "/user/view/otherUserId/" + userId;

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
          // let request = this.http.get(url, httpOptions).timeout(this.apiProvider.timeout).map(result => result.json());
          let request = this.http.get(url, httpOptions);

          let groupKey = "api_user_view_otheruserid_" + userId;

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

  getUserInfo(userId) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url =
            auth["data"]["data_url"] + "/user/userinfo";
          let data = {id:userId}
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
          // let request = this.http.get(url, httpOptions).timeout(this.apiProvider.timeout).map(result => result.json());
          let request = this.http.post(url,data ,httpOptions);

          let groupKey = "api_user_view_otheruserid_" + userId;

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

  getList(page = 1, limit = 10, search?) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url =
            auth["data"]["data_url"] +
            "/user/listing/page/" +
            page +
            "/limit/" +
            limit;
          if (search) {
            url += "?search=" + search;
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
          // let request = this.http.get(url, httpOptions).timeout(this.apiProvider.timeout).map(result => result.json());
          let request = this.http.get(url, httpOptions);

          let groupKey = "api_user_listing_page_" + page + "_limit_" + limit;

          if (search) {
            groupKey += "_search_" + search;
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

  // Type 2 - used for getting all users in Message a User context (DiscoverInnerPage from MessagesPage)
  async getUserListings(type, data?, page?, limit?) {
    return new Promise(resolve => {
      this.apiService
        .getAuthentication(true)
        .then(auth => {
          if (auth["error"] == 0) {
            let url =
              auth["data"]["data_url"] +
              "/user/" +
              type +
              "?page=" +
              page +
              "&limit=" +
              limit;
            let paramData;

            if (data) {
              paramData = {
                search: data.query
              };
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
            let request;
            if (data) {
              // request = this.http.post(url, paramData, httpOptions).timeout(this.apiProvider.timeout).map(result => result.json());
              request = this.http.post(url, paramData, httpOptions);
            } else {
              // request = this.http.get(url, httpOptions).timeout(this.apiProvider.timeout).map(result => result.json());
              request = this.http.get(url, httpOptions);
            }

            request.subscribe(
              result => {
                resolve(result);
              },
              ex => {
                resolve({ error: 1, trace: ex, request: "getUserListings" });
              }
            );
          } else {
            resolve({ error: 1, trace: auth, request: "getUserListings" });
          }
        })
        .catch(ex => {
          resolve({ error: 1, trace: ex, request: "getUserListings" });
        });
    });
  }

  async applyAsStylist(type, data?) {
    return new Promise(resolve => {
      this.apiService
        .getAuthentication(true)
        .then(auth => {
          if (auth["error"] == 0) {
            let url = auth["data"]["data_url"] + "/user/" + type;

            let paramData = data;

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
            // let request = this.http.post(url, data, httpOptions).timeout(this.apiProvider.timeout).map(result => result.json());
            let request = this.http.post(url, data, httpOptions);

            request.subscribe(
              result => {
                resolve(result);
              },
              err => {
                resolve({ error: 1, trace: err });
              }
            );
          } else {
            resolve({
              error: 1,
              trace: auth,
              message: this.componentService.generic_error_msg
            });
          }
        })
        .catch(stylistApplyError => {
          resolve({
            error: 1,
            trace: stylistApplyError,
            request: "applyAsStylist"
          });
        });
    });
  }

  getFriendRequest(page = 1, limit = 10) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url =
            auth["data"]["data_url"] +
            "/user/getrequests?page=" +
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
          // let request = this.http.get(url, httpOptions).timeout(this.apiProvider.timeout).map(result => result.json());
          let request = this.http.get(url, httpOptions);

          let groupKey = "api_user_listing_page_" + page + "_limit_" + limit;

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

  // This request is currently the one used for accepting Connection Requests.
  acceptRequest2(type, data) {
    return new Promise(resolve => {
      this.apiService
        .getAuthentication(true)
        .then(auth => {
          if (auth["error"] == 0) {
            let url = auth["data"]["data_url"] + "/friends/" + type;
            let paramData = {
              userId: data.userId,
              accepted: data.accepted
            };

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
            // let request = this.http.post(url, paramData, httpOptions).timeout(this.apiProvider.timeout).map(result => result.json());
            let request = this.http.post(url, paramData, httpOptions);

            request.subscribe(
              result => {
                resolve(result);
              },
              ex => {
                resolve({ error: 1, trace: ex, request: "acceptRequest2" });
              }
            );
          } else {
            resolve({ error: 1, trace: auth, request: "acceptRequest2" });
          }
        })
        .catch(authError => {
          resolve({ error: 1, trace: authError, request: "acceptRequest2" });
        });
    });
  }

  acceptRequest(userId, accepted, page = 1, limit = 10) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url = auth["data"]["data_url"] + "/friends/accept";

          let data = { userId: userId, accepted: accepted };

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

  // Handles fetching and updating the notification settings.
  getNotificationSettings(type, data?, update?) {
    return new Promise(resolve => {
      this.apiService
        .getAuthentication(true)
        .then(auth => {
          if (auth["error"] == 0) {
            // api/settings/getnotifsettings
            let url = auth["data"]["data_url"] + "/settings/" + type;
            let paramData;

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
            let request;

            // Fork here depending on what context is the request.
            if (update) {
              paramData = {
                muteAll: data.muteAll,
                postNotif: data.postNotif,
                styleColumnNotif: data.styleColumnNotif
              };

              // request = this.http.post(url, paramData, httpOptions).timeout(this.apiProvider.timeout).map(result => result.json());
              request = this.http.post(url, paramData, httpOptions);
            } else {
              // request = this.http.get(url, httpOptions).timeout(this.apiProvider.timeout).map(result => result.json());
              request = this.http.get(url, httpOptions);
            }

            request.subscribe(
              result => {
                resolve(result);
              },
              ex => {
                resolve({
                  error: 1,
                  trace: ex,
                  request: "getNotificationSettings"
                });
              }
            );
          } else {
            resolve({
              error: 1,
              trace: auth,
              request: "getNotificationSettings"
            });
          }
        })
        .catch(authError => {
          resolve({
            error: 1,
            trace: authError,
            request: "getNotificationSettings"
          });
        });
    });
  }

  getEmailLink(type) {
    return new Promise(resolve => {
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

            // let request = this.http.get(url, httpOptions).timeout(this.apiProvider.timeout).map(result => result.json());
            let request = this.http.get(url, httpOptions);

            request.subscribe(
              result => {
                resolve(result);
              },
              ex => {
                resolve({ error: 1, trace: ex, request: "sendEmailInvite" });
              }
            );
          } else {
            resolve({ error: 1, trace: auth, request: "sendEmailInvite" });
          }
        })
        .catch(ex => {
          resolve({ error: 1, trace: ex, request: "sendEmailInvite" });
        });
    });
  }

  sendEmailInvite(type, data) {
    return new Promise(resolve => {
      this.apiService
        .getAuthentication(true)
        .then(auth => {
          if (auth["error"] == 0) {
            let url = auth["data"]["data_url"] + "/user/" + type;

            let paramData = {
              email: data.email
            };

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
            // let request = this.http.post(url, paramData, httpOptions).timeout(this.apiProvider.timeout).map(result => result.json());
            let request = this.http.post(url, paramData, httpOptions);

            request.subscribe(
              result => {
                resolve(result);
              },
              ex => {
                resolve({ error: 1, trace: ex, request: "sendEmailInvite" });
              }
            );
          } else {
            resolve({ error: 1, trace: auth, request: "sendEmailInvite" });
          }
        })
        .catch(ex => {
          resolve({ error: 1, trace: ex, request: "sendEmailInvite" });
        });
    });
  }

  getUserPoints(isRewards?, userId?, page = 1, limit = 10, search?) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url =
            auth["data"]["data_url"] +
            "/user/points?page=" +
            page +
            "&limit=" +
            limit;



          // FOR LOGS
          let data = { isRewards: null, userId: null };
          if(isRewards) {
            data.isRewards = true;
          }

          if(userId) {
            data.userId = userId;
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
          // let request = this.http.post(url, data, httpOptions).timeout(this.apiProvider.timeout).map(result => result.json());
          let request = this.http.post(url, data, httpOptions);

          let groupKey = "api_user_listing_page_" + page + "_limit_" + limit;

          if (search) {
            groupKey += "_search_" + search;
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

  getRewards(type, userId?) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/user/' + type;

          let paramData;
          if (userId) {
            paramData = { userId: userId }
          }
          else {
            paramData = null;
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
          // let request = this.http.post(url, paramData, httpOptions).timeout(this.apiProvider.timeout).map(result => result.json());
          let request = this.http.post(url, paramData, httpOptions);
          let groupKey = "api_user_rewards";
          let response = this.cache.loadFromDelayedObservable(url, request, groupKey, this.apiService.ttl, groupKey);
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
        }
        else {
          resolve({error: 1, trace: auth, request: 'getRewards - auth, inner'});
        }
      }).catch(authError => {
        resolve({error: 1, trace: authError, request: 'getRewards - auth'});
      });
    });
  }

  updatePrivacy(type, data) {
    console.log(type, data)
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/settings/' + type;

          let paramData = {
            account_private: data.account_private,
            activity_status: data.activity_status
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
          // let request = this.http.post(url, paramData, httpOptions).timeout(this.apiProvider.timeout).map(result => result.json());
          let request = this.http.post(url, paramData, httpOptions);
          request.subscribe(result => {
            resolve(result);
          }, ex => {
            resolve({error: 1, trace: ex, request: 'updatePrivacy - request'});
          });
        }
        else {
          resolve({error: 1, trace: auth, request: 'updatePrivacy'});
        }
      }).catch(authError => {
        resolve({error: 1, trace: authError, request: 'updatePrivacy'});
      });
    });
  }

  validateReferral(data) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url = auth["data"]["data_url"] + "/user/getuniqueid";
          console.log("DATA ", data)
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

}
