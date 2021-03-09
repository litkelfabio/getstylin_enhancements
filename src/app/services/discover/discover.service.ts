import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { CacheService } from 'ionic-cache';
import { EventsService } from '../events.service';
import { ComponentsService } from '../components/components.service';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class DiscoverService {

  constructor(
    private componentService: ComponentsService,
    private apiService: ApiService,
    public storage: Storage,
    public cache: CacheService,
    public http: HttpClient
  ) { }

  getArtists(userId?, fromPage?, page = 1, limit = 8) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url =
            auth["data"]["data_url"] +
            "/discover/getstylists?page=" +
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
              'Authorization': 'Bearer ' + auth['data']['token'],
              'Devicetoken': auth['data']['device_token']
            })
          };
          // let request = this.http.get(url, httpOptions)
          //   .timeout(this.apiService.timeout)
          //   .map(result => result.json());
          let request = this.http.get(url, httpOptions);

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

  getTags(userId?, fromPage?, page = 1, limit = 18) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url =
            auth["data"]["data_url"] +
            "/discover/getpopulartags?page=" +
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
              'Authorization': 'Bearer ' + auth['data']['token'],
              'Devicetoken': auth['data']['device_token']
            })
          };
          // let request = this.http
          //   .get(url, httpOptions)
          //   .timeout(this.apiService.timeout)
          //   .map(result => result.json());
          let request = this.http
            .get(url, httpOptions);

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

  searchTags(tag) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url =
            auth["data"]["data_url"] + "/search/tags";
          let httpOptions: any = {
            headers: new HttpHeaders({
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
              'Authorization': 'Bearer ' + auth['data']['token'],
              'Devicetoken': auth['data']['device_token']
            })
          };
          let data={param: tag}
          let request = this.http
            .post(url,data, httpOptions);
          request.subscribe(
            result => {
              resolve(result);
            },
            err => {
              console.log("err", err);
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

  getStyles(userId?, fromPage?, page = 1, limit = 8) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url =
            auth["data"]["data_url"] +
            "/discover/getstyles?page=" +
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
              'Authorization': 'Bearer ' + auth['data']['token'],
              'Devicetoken': auth['data']['device_token']
            })
          };
          // let request = this.http
          //   .get(url, httpOptions)
          //   .timeout(this.apiService.timeout)
          //   .map(result => result.json());
          let request = this.http
            .get(url, httpOptions);

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

  // Get all posts related to a specific style
  // Includes pagination triggers
  async getPostsByStyles(type, styleId, page?, limit?) {
    return new Promise(resolve => {
      this.apiService
        .getAuthentication(true)
        .then(auth => {
          if (auth["error"] == 0) {
            let data = {
              styleId: styleId
            };

            let url = auth["data"]["data_url"] + "/discover/";
            //
            // Pagination switch
            if (page) {
              url = url + type + "?page=" + page + "&limit=" + limit;
            } else {
              url = url + type;
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
            //   .post(url, data, httpOptions)
            //   .timeout(this.apiService.timeout)
            //   .map(result => result.json());
            let request = this.http
              .post(url, data, httpOptions);

            // request.subscribe(
            //   result => {
            //     resolve(result);
            //   },
            //   err => {
            //     console.log("err", err);
            //     response.subscribe(
            //       result => {
            //         resolve(result);
            //       },
            //       err => {
            //         console.log("err", err);
            //         resolve({
            //           error: 1,
            //           message: this.componentService.generic_error_msg
            //         });
            //       }
            //     );
            //   }
            // );
            request.subscribe(
              result => {
                resolve(result);
              },
              ex => {
                console.log("getPostsByStyles error: ", ex);
                resolve(ex);
              }
            );
          } else {
            console.log("getPostsByStyles error");
            resolve({ error: 1, message: "getPostsByStyles error" });
          }
        })
        .catch(authError => {
          resolve(authError);
        });
    });
  }

  getUpcomingEvents(userId?, fromPage?, page = 1, limit = 8) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url =
            auth["data"]["data_url"] +
            "/discover/getupcomingevents?page=" +
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
              'Authorization': 'Bearer ' + auth['data']['token'],
              'Devicetoken': auth['data']['device_token']
            })
          };
          // let request = this.http
          //   .get(url, httpOptions)
          //   .timeout(this.apiService.timeout)
          //   .map(result => result.json());
          let request = this.http
            .get(url, httpOptions);

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

  async getStyleColumns(page = 1, limit = 8) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url =
            auth["data"]["data_url"] +
            "/discover/getstylecolumns?page=" +
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
              'Authorization': 'Bearer ' + auth['data']['token'],
              'Devicetoken': auth['data']['device_token']
            })
          };
          // let request = this.http
          //   .get(url, httpOptions)
          //   .timeout(this.apiService.timeout)
          //   .map(result => result.json());
          let request = this.http
            .get(url, httpOptions);

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

  searchStylist(data, page = 1, limit = 8) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url =
            auth["data"]["data_url"] +
            "/discover/searchstylists?page=" +
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
              'Authorization': 'Bearer ' + auth['data']['token'],
              'Devicetoken': auth['data']['device_token']
            })
          };
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

  searchPosts(query, page = 1, limit = 8) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url =
            auth["data"]["data_url"] +
            "/discover/searchposts?page=" +
            page +
            "&limit=" +
            limit;

          let data = { q: query };

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

  searchEvents(query, page = 1, limit = 8) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url =
            auth["data"]["data_url"] +
            "/discover/searchupcomingevents?page=" +
            page +
            "&limit=" +
            limit;

          let data = { q: query };

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

  searchQuestion(query, page = 1, limit = 8) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url =
            auth["data"]["data_url"] +
            "/discover/searchstylequestion?page=" +
            page +
            "&limit=" +
            limit;

          let data = { q: query };

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

  getColumnsCategories(page = 1, limit = 10) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url =
            auth["data"]["data_url"] +
            "/discover/getcolumncategory?page=" +
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
              'Authorization': 'Bearer ' + auth['data']['token'],
              'Devicetoken': auth['data']['device_token']
            })
          };
          // let request = this.http
          //   .get(url, httpOptions)
          //   .timeout(this.apiService.timeout)
          //   .map(result => result.json());
          let request = this.http
            .get(url, httpOptions);

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

  async getStyleColumnQuestion(type, data, categorized?, page?, limit?) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/discover/' + type;
          let paramData;

          if (categorized) {
            paramData = {
              styleColumnCategId: data.styleColumnCategId,
              q: data.q
            }
          }
          else {
            paramData = {
              q: data.q
            }
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
          //   .post(url, paramData, httpOptions)
          //   .timeout(this.apiService.timeout)
          //   .map(result => result.json());
          let request = this.http
            .post(url, paramData, httpOptions);

          // request.subscribe(
          //   result => {
          //     resolve(result);
          //   },
          //   ex => {
          //     console.log("getPostsByStyles error: ", ex);
          //     resolve(ex);
          //   }
          // );


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
        }
        else {
          resolve({ error: 1, trace: auth, request: 'getStyleColumnQuestion' });
        }
      }).catch(authError => {
        resolve({ error: 1, trace: authError, request: 'getStyleColumnQuestion' });
      });
    });
  }

  async getStyleColumnById(styleColumnId, action) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth['error'] == 0) {
          let url = auth['data']['data_url'] + '/discover/' + action;
          let data = {
            id: styleColumnId
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
              'Authorization': 'Bearer ' + auth['data']['token'],
              'Devicetoken': auth['data']['device_token']
            })
          };
          // let request = this.http.post(url, data, httpOptions).timeout(this.apiService.timeout).map(result => result.json());
          let request = this.http.post(url, data, httpOptions);
          request.subscribe(result => {
            resolve(result);
          }, requestError => {
            resolve({ error: 1, trace: requestError, message: this.componentService.generic_error_msg });
          });
        }
        else {
          resolve({ error: 1, trace: auth, message: this.componentService.generic_error_msg });
        }
      }).catch(authError => {
        resolve({ error: 1, trace: authError, request: 'getStyleColumnById' });
      });
    });
  }

  getStyleColumnsByCategory(id, page = 1, limit = 8) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url =
            auth["data"]["data_url"] +
            "/discover/getcolumnbycategory?page=" +
            page +
            "&limit=" +
            limit;

          let data = { styleColumnCategId: id };

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

  getPostsByTag(tag_id, page = 1, limit = 8) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url =
            auth["data"]["data_url"] +
            "/discover/getpostsbytags?page=" +
            page +
            "&limit=" +
            limit;

          let data = { tagId: tag_id, limit: limit };

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

  getSearchPopularEvents(page = 1, limit = 8) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url =
            auth["data"]["data_url"] +
            "/discover/getpopularevent?page=" +
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
              'Authorization': 'Bearer ' + auth['data']['token'],
              'Devicetoken': auth['data']['device_token']
            })
          };
          // let request = this.http
          //   .get(url, httpOptions)
          //   .timeout(this.apiService.timeout)
          //   .map(result => result.json());
          let request = this.http
            .get(url, httpOptions);

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

  viewEvent(eventId, page = 1, limit = 8) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url =
            auth["data"]["data_url"] +
            "/discover/addeventviews?page=" +
            page +
            "&limit=" +
            limit;

          let data = { eventId: eventId };

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

  getEventsByCity(page = 1, limit = 8) {
    return new Promise(resolve => {
      this.apiService.getAuthentication(true).then(auth => {
        if (auth["error"] == 0) {
          let url =
            auth["data"]["data_url"] +
            "/discover/geteventsbycity?page=" +
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
              'Authorization': 'Bearer ' + auth['data']['token'],
              'Devicetoken': auth['data']['device_token']
            })
          };
          // let request = this.http
          //   .get(url, httpOptions)
          //   .timeout(this.apiService.timeout)
          //   .map(result => result.json());
          let request = this.http
            .get(url, httpOptions);

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
}
