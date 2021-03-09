import { Component, OnInit,ViewChild, ViewChildren, ElementRef  } from '@angular/core';
import {Router, ActivatedRoute,NavigationExtras} from '@angular/router'
import { MenuController, NavController, IonRefresher, AlertController, Platform, IonImg, IonInfiniteScroll} from '@ionic/angular';
import {ModalController} from '@ionic/angular'
import {EditPostModalComponent} from '../../../../components/modals/edit-post-modal/edit-post-modal.component'
import { PostDetailsComponent } from 'src/app/components/modals/post-details/post-details.component';
import {ComponentsService} from '../../../../services/components/components.service'
import { SkipModalComponent } from 'src/app/components/modals/skip-modal/skip-modal.component';
import { PostService } from 'src/app/services/post/post.service';
import { FriendService } from 'src/app/services/friend/friend.service';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { Storage } from '@ionic/storage';
import { EventsService } from 'src/app/services/events.service';
import { UserService } from 'src/app/services/user/user.service';
import { LikesDislikesComponent } from 'src/app/components/modals/likes-dislikes/likes-dislikes.component';

import { ChatService } from 'src/app/services/chat/chat.service';
import { DatasourceService } from 'src/app/services/datasource/datasource.service';
import { NgProgress,NgProgressComponent } from 'ngx-progressbar';
import { Observable } from 'rxjs/Observable';
import * as jwt_decode from 'jwt-decode';
import { PostDetailPage } from '../../../post/post-detail/post-detail.page';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { DiscoverService } from 'src/app/services/discover/discover.service';
import { HttpClient } from '@angular/common/http';
import { NgxMasonryComponent, NgxMasonryOptions } from 'ngx-masonry';
import { QuestionModalComponent } from 'src/app/components/modals/question-modal/question-modal.component';
@Component({
  selector: 'app-discovery-inner',
  templateUrl: './discovery-inner.page.html',
  styleUrls: ['./discovery-inner.page.scss'],
})
export class DiscoveryInnerPage implements OnInit {
  @ViewChild(NgProgressComponent) progressBar: NgProgressComponent;
  @ViewChild("refresherRef") refresherRef: IonRefresher;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @ViewChild("image", {static: false}) imageDash: IonImg;
  @ViewChild(NgxMasonryComponent) masonry: NgxMasonryComponent;
  currentPage: number = 1; // for pagination purposes
  pageIsLoading: boolean = true; // set this to false once the page is done loading
  isPushedFromSelection: boolean = false; // set this to true if the inner page is pushed from a specific selection
  page: any;
  totalPages: any;

  pageContext: any; // set context for the page
  pageTitle: any; // set title for the page
  artists: any = [];
  item: any = [];
  posts: any = [];
  total_post: string = "0";
  skeletons: any = [1, 2, 3, 4];
  counter: number = 0;
  totalItems: any;
  totalPage: any;
  profileInfo: any;
  cities: any;
  disableInfinite: boolean = false;
  isNotified :boolean = false;
  // Discover Styles
  styleId: any; // key for style retrieval
  styles = []; // container for all retrieved styles
  endText: any;

  // Discover Events parent and child variables
  isSubmitted: boolean = false; // set this to true once the search box is submitted
  searchQuery: any ; // will trigger context switch from landing to search results
  isStylist: any ;
  othercontext: any ;
  tempEvents: any;

  events = []; // container for Most Popular events
  searchEvents = []; // container for Search Events
  searchkey: any;
  autoSuggest = [];

  isLoadedProfile= false;
  errorImage= false;

  stylecolumnsCategoryName: any;
  stylecolumns: any = [];
  images: any = [];
  columnCategory: any;
  hideSearch: any;
  thisTitle :any;
  styleKey :any;
  // For Message A User context
  searching: boolean = false;
  userListing: any;
  maxListingPages = 0;
  findMeAUser: any;
  from:any;
  // These variables are used during searching mode.
  previousResults: any; // used to hold the previous retrieved prior to searching
  previousMaxListingPages: any; // used to hold the previous maximum pages prior to searching
  previousPage: any; // used to hold the previous page the user is at prior to searching
  slideEventSearch={
    slidesPerView:3.5 ,
    spaceBetween: 3.5
  }
  isAndroid:any;
  public masonryOptions: NgxMasonryOptions = {
    originLeft: true,
    gutter: 10,
    resize: true,
    initLayout: true,
    columnWidth: ".grid-sizer",
    itemSelector: ".grid-item",
    percentPosition: true
  };
  constructor(
    public http: HttpClient,
    private keyboard: Keyboard,
    public navCtrl: NavController,
    public ngProgress: NgProgress,
    private discover: DiscoverService,
    public storage: Storage,
    private eventsIon: EventsService,
    private componentsProvider: ComponentsService,
    private postsProvider: PostService,
    public modalCtrl: ModalController,
    private userProvider: UserService,
    private friendsProvider: FriendService,
    private alertCtrl: AlertController,
    private dataSource: DatasourceService,
    private chatProvider: ChatService,
    private route: ActivatedRoute,
    private router: Router,
    private platform: Platform,
  ) { 
    this.isAndroid = this.platform.is('android');
    // this.dataSource.serviceData.subscribe(data=>{
    //   this.searchQuery = data["search"] ? data["search"]:null ; // will trigger context switch from landing to search results
    //   this.isStylist= data["isStylist"] ? data["isStylist"]:null;
    //   this.othercontext= data["othercontext"] ? data["othercontext"]: null;
    //   this.pageContext = data["context"] ? data["context"] : null;
    //   this.searchkey = data["search"] ? data["search"] : null;
    //   this.hideSearch = data["hideSearch"] ? data["hideSearch"] : null;
    //   this.columnCategory = data["columnCategory"] ? data["columnCategory"] : null;
    //   this.item = data["item"] ? data["item"] : null;
    //   this.thisTitle = data["title"] ? data["title"] : null;
    //   this.styleKey =  data["id"] ? data["id"] : null;
      
    // });
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.searchQuery = this.router.getCurrentNavigation().extras.state.search ; // will trigger context switch from landing to search results
        this.isStylist= this.router.getCurrentNavigation().extras.state.isStylist;
        this.othercontext= this.router.getCurrentNavigation().extras.state.othercontext;
        this.pageContext = this.router.getCurrentNavigation().extras.state.context;
        this.searchkey = this.router.getCurrentNavigation().extras.state.search;
        this.hideSearch = this.router.getCurrentNavigation().extras.state.hideSearch;
        this.columnCategory = this.router.getCurrentNavigation().extras.state.columnCategory;
        this.item =this.router.getCurrentNavigation().extras.state.item;
        this.thisTitle = this.router.getCurrentNavigation().extras.state.title;
        this.styleKey =  this.router.getCurrentNavigation().extras.state.id;
        this.isNotified = this.router.getCurrentNavigation().extras.state.isNotified;
        this.from = this.router.getCurrentNavigation().extras.state.from;
        console.log(this.pageContext);
      }
      if(params && params.state){
        let param = JSON.parse(params.state);
        if(param){
          this.pageContext = param.context;
          this.hideSearch = param.hideSearch;
          this.isNotified = param.isNotified;
          
        }
      }
      this.currentPage = 1;
      if (this.pageContext == "stylists") {
        if (this.searchQuery && this.isStylist) {
          this.pageTitle = "Stylists";
          this.findMeAUser = this.searchQuery;
        } else if (this.searchQuery) {
          this.pageTitle = "Users";
          this.findMeAUser = this.searchQuery;
        } else {
          this.pageTitle = "Meet our Stylists";
        }
      } else if (this.pageContext == "posts") {
        this.pageTitle = "Posts";
        this.getPostResults();
      } else if (this.pageContext == "tags") {
        if (this.item) {
          this.pageTitle = this.item.tag_name;
          this.getTagResults();
        }
      } else if (this.pageContext == "stylecolumn") {
        this.pageTitle = "Style Column";
        this.stylecolumnsCategoryName = this.columnCategory.name;
        // this.stylecolumnsCategoryName = this.columnCategory['']
      } else if (this.pageContext == "categories") {
        // replace this title by passing a custom title depending on
        // category selected
        // this.pageTitle = "Styles";
        
        if (this.thisTitle) {
          this.pageTitle = this.thisTitle;
        }
  
        // Initialize ID
        if (this.styleKey) {
          this.styleId = this.styleKey;
        }
      } else if (this.pageContext == "messages") {
        this.pageTitle = "Message a User";
        this.getArtists();
      } else{
        this.storage.get('temp-page').then(page =>{
          console.log(page.page)
          this.pageTitle = "Style Column";
          this.stylecolumnsCategoryName = page.stylecolumnsCategoryName;
          this.pageContext = page.page
          this.columnCategory = page.columnCategory
        })
      }
    });


    
   

    // if (this.pageContext != "events") {
    //   if (this.pageContext == "stylists") {
    //     this.getArtists();
    //     console.log("Artistsss");
    //   } else if (this.pageContext == "categories") {
    //     this.getPostsByStyles();
    //   } else if (this.pageContext == "stylecolumn") {
    //     this.getAllStyleQuestions();
    //   }
    // } else {
    //   if (this.searchQuery) {
    //     this.beginSearch();
    //   } else {
    //     this.getCities();
    //     this.getPopularEvents();
    //   }
    // }
  }

  // ngOnInit() {
  //   // this.ionViewDidLoad();
  // }
  onImgLoad(e)
  {
      
  }
  onThumbLoad(e)
  {
     
  }
  ngOnInit() {
    this.totalItems = null;
    /// call the ionViewDidEnter because at first it does not go to first if else 
    if(this.pageContext == undefined){
      this.storage.get('temp-page').then(page =>{
        console.log(page.page)
        this.pageTitle = "Style Column";
        this.stylecolumnsCategoryName = page.stylecolumnsCategoryName;
        this.pageContext = page.page
        this.columnCategory = page.columnCategory
        this.ngOnInit();
      })
    }
    console.log("ionViewDidLoad DiscoverInnerPage");
    this.storage.get("user").then(user => {
      console.log('Profile data: ', user);
      if (user) {
        this.profileInfo = user;
        // console.log('Direct from storage: ', user, ' Assigned: ', this.profileInfo);
      } else {
        console.log("No profile data found.");
      }
    });

    // this.progressBar.start();
    // this.mapData();

    if (this.pageContext != "events") {
      if (this.pageContext == "stylists") {
        this.getArtists();
        console.log("Artistsss");
      } else if (this.pageContext == "categories") {
        this.getPostsByStyles();
      } else if (this.pageContext == "stylecolumn") {
        this.getAllStyleQuestions();
      }
    } else {
      if (this.searchQuery) {
        this.beginSearch();
      } else {
        this.getCities();
        this.getPopularEvents();
      }
    }

    
    // this.progressBar.complete();
  }

  ionViewDidLeave() {
    // this.endText = false;
    // alert("this.totalItems"+this.totalItems)
    // this.currentPage = null;
    // this.totalItems = null
    // alert(this.infiniteScroll.disabled)
    // this.infiniteScroll.disabled = false;
    // alert(this.infiniteScroll.disabled)
    // alert("this.totalItems"+this.totalItems)
    // this.chatProvider.socketEmitGetConvo(1);
    this.progressBar.complete();
    // this.doInfinite(this.infiniteScroll)
    // this.storage.get("previousListingState").then(data => {
    //   if (data) {
    //     this.storage.remove("previousListingState");
    //   }
    // });
    //
    // this.storage.get("previousDiscoverUserListingState").then(data => {
    //   if (data) {
    //     this.storage.remove("previousDiscoverUserListingState");
    //   }
    // });
  }
  suggestEvents(e){
    console.log(e.target.value);
    if(e.target.value != '') {
      this.discover
      .searchEvents(e.target.value, 1)
      .then(response => {
        console.log("Events: ", response);
        this.autoSuggest = response["datas"];
        console.log("ggg", this.autoSuggest);
      })
      .catch(ex => {
        console.log("Something went wrong: ", ex);
      })

      this.toggleList = true;
    } else {
      this.toggleList = false;
    }

  }

  toggleList: boolean = false;
  selectEvent(item) {
    console.log(item);
    this.toggleList = false;
    this.searchkey = item;
    this.searchQuery = item;
    this.searchEventsSwitch();
  }
  getFormatFromProvider(stamp) {
    if (this.componentsProvider.currentPlatform == 'ios') {
      // return (this.componentsProvider.getMomentFormat(stamp, 'YYYY-MM-DD', 'events'));
      return (stamp);
    }
    else {
      return (stamp);
    }
  }
  gotoDetails(item) {
    this.gotoPostDetails(item);
  }
  gotoPostDetails(id) {
    console.log('Checking details: ', id);
    this.progressBar.start();
    this.counter++;

    if (this.counter == 1) {
      this.postsProvider
        .getPostsById(id['id'])
        .then(res => {
          if (res["error"] == 0) {
            // let itemModal = this.modalCtrl.create(PostDetailsPage, {item: res['datas']});
            // itemModal.present();
            if (id['user_id'] == this.profileInfo['id']) {
              let navigationExtras: NavigationExtras = {
                state: {item: res['datas']}
              };
              // this.dataSource.changeData({item: res['datas']});
              this.navCtrl.navigateForward(['/post-detail'],navigationExtras);
              // let itemModalOwner = this.modalCtrl.create(PostDetailsPage, {item: res['datas']});
              // itemModalOwner.present();
              // this.navCtrl.push(PostDetailsPage, {
              //   item: res["datas"]
              // });
            }
            else {
              let navigationExtras: NavigationExtras = {
                state: {item: res['datas'], otherUser: id['userinfo']}
              };
              // this.dataSource.changeData({item: res['datas'], state: id['userinfo']});
              this.navCtrl.navigateForward(['/post-detail'],navigationExtras);
              // let itemModal = this.modalCtrl.create(PostDetailsPage, {item: res['datas'], state: id['userinfo']});
              // itemModal.present();
              // this.navCtrl.push(PostDetailsPage, {
              //   item: res["datas"],
              //   state: id['userinfo']
              // });
            }
          }
        })
        .then(() => {
          this.counter = 0;
          this.progressBar.complete();
        });
    }
  }
  getArtists(refresher?, infiniteScroll?) {
    if (this.searchkey) {
      if (this.isStylist) {
        this.discover
          .searchStylist({ q: this.searchkey, type: true }, this.currentPage, 8)
          .then(res => {
            if (res["error"] == 0) {
              // Filter search results
              let prefilteredArtists = res['datas'];
              let filteredArtists = [];
              prefilteredArtists.forEach(artist => {
                // Filter results only to include users that are not blocked by the current user
                // AND is not blocked by the other user.
                if (artist['blockedBy'] === false && artist['isBlocked'] === false) {
                  filteredArtists.push(artist);
                }
                else {
                  console.log('Blocked user found: ', artist);
                }
              });

              if (infiniteScroll) {
                // this.artists = this.artists.concat(res["datas"]);
                let tempArtist = res["datas"];
                tempArtist.forEach((element:any) => {
                  if(element.stylist == 1){
                    this.artists.push(element);
                  }
                });
              } else {
                let tempArtist = res["datas"];
                tempArtist.forEach((element:any) => {
                  if(element.stylist == 1){
                    this.artists.push(element);
                  }
                });
                // this.artists = res["datas"];
              }

              this.totalItems = res["total_count"];
              this.totalPage = res["total_page"];
              console.log("eto ung artists", this.artists);
             
            } else {
              this.totalPage = null;
              this.artists = null;
              this.totalPage = null;
            }

            if (refresher) {
              this.progressBar.complete();
              refresher.target.complete();
            }

            if (infiniteScroll) {
              this.progressBar.complete();
              infiniteScroll.target.complete();
            }
            this.pageIsLoading = false;
          });
      } else {
        this.discover
          .searchStylist({ q: this.searchkey }, this.currentPage, 8)
          .then(res => {
            if (res["error"] == 0) {
              // Filter search results
              let prefilteredArtists = res['datas'];
              let filteredArtists = [];
              prefilteredArtists.forEach(artist => {
                // Filter results only to include users that are not blocked by the current user
                // AND is not blocked by the other user.
                if (artist['blockedBy'] === false && artist['isBlocked'] === false) {
                  filteredArtists.push(artist);
                }
                else {
                  console.log('Blocked user found: ', artist);
                }
              });

              if (infiniteScroll) {
                this.artists = this.artists.concat(res["datas"]);
              } else {
                this.artists = res["datas"];
              }

              this.totalItems = res["total_count"];
              this.totalPage = res["total_page"];
              console.log("eto ung artists", this.artists);
             
            } else {
              this.totalPage = null;
              this.artists = null;
              this.totalPage = null;
            }

            if (refresher) {
              this.progressBar.complete();
              refresher.target.complete();
            }

            if (infiniteScroll) {
              this.progressBar.complete();
              infiniteScroll.target.complete();
            }
            this.pageIsLoading = false;
          });
      }
    } else if (this.pageContext == "messages") {
      if (refresher) {
        this.currentPage = 1;
        this.refresherRef.disabled = false;
      }

      console.log("Message context: getting all users.");
      console.log("Current page: ", this.currentPage);
      console.log("Current max page: ", this.maxListingPages);

      this.friendsProvider.getFriendsForMessaging('listing', this.currentPage).then(response => {
        if (response['error'] == 0) {
          let connectionsData = response['datas'];
          if (infiniteScroll) {
            connectionsData.forEach(item => {
              this.userListing.push(item);
            });

            if (this.currentPage >= this.maxListingPages) {
              this.refresherRef.disabled = true;
            }

            infiniteScroll.target.complete();
          }
          else {
            this.userListing = connectionsData;
            this.maxListingPages = response['total_page'];
          }

          if (refresher) {
            refresher.complete();
          }
        }
        else {
          console.log("Error getting user listings for messages: ", response);
          // this.userListing = [];
          if (refresher) {
            refresher.complete();
          }

          if (infiniteScroll) {
            if (this.currentPage >= this.maxListingPages) {
              infiniteScroll.disabled = true;
            }

            infiniteScroll.target.complete();
          }
        }
      }).catch(ex => {
        console.log("Error getting user listings for messages: ", ex);
      }).then(() => {
        this.progressBar.complete();
      });

      // this.userProvider
      //   .getUserListings("listing", null, this.currentPage, 10)
      //   .then(response => {
      //     if (response["error"] == 0) {
      //       // Filter search results
      //       let prefilteredArtists = response['datas'];
      //       let filteredArtists = [];
      //       prefilteredArtists.forEach(artist => {
      //         // Filter results only to include users that are not blocked by the current user
      //         // AND is not blocked by the other user.
      //         if (artist['blockedBy'] === false && artist['isBlocked'] === false) {
      //           filteredArtists.push(artist);
      //         }
      //         else {
      //           console.log('Blocked user found: ', artist);
      //         }
      //       });
      //
      //       // let users = response["datas"];
      //       let users = filteredArtists;
      //       let maxPages = response["total_page"];
      //
      //       if (infiniteScroll) {
      //         users.forEach(item => {
      //           this.userListing.push(item);
      //         });
      //         console.log("Updated user listing: ", this.userListing);
      //
      //         if (this.currentPage >= this.maxListingPages) {
      //           this.infiniteScroll.enable(false);
      //         }
      //
      //         infiniteScroll.complete();
      //       } else {
      //         this.userListing = users;
      //         this.maxListingPages = maxPages;
      //       }
      //
      //       if (refresher) {
      //         refresher.complete();
      //       }
      //     } else {
      //       console.log("Error: ", response);
      //       if (refresher) {
      //         refresher.complete();
      //       }
      //
      //       if (infiniteScroll) {
      //         infiniteScroll.complete();
      //       }
      //     }
      //   })
      //   .catch(ex => {
      //     console.log("Error getting user listings for messages: ", ex);
      //   })
      //   .then(() => {
      //     this.ngProgress.done();
      //   });
    } else {
      this.discover
        .searchStylist({ q: '', type: true }, this.currentPage, 8)
        .then(res => {
          if (res["error"] == 0) {
            // Filter search results
            let prefilteredArtists = res['datas'];
            let filteredArtists = [];
            prefilteredArtists.forEach(artist => {
              // Filter results only to include users that are not blocked by the current user
              // AND is not blocked by the other user.
              if (artist['blockedBy'] === false && artist['isBlocked'] === false) {
                filteredArtists.push(artist);
              }
              else {
                console.log('Blocked user found: ', artist);
              }
            });

            if (infiniteScroll) {
              this.artists = this.artists.concat(res["datas"]);
            } else {
              this.artists = res["datas"];
            }

            this.totalItems = res["total_count"];
            this.totalPage = res["total_page"];
            console.log("eto ung artists", this.artists);

            let previousDiscoverUserListingState = {
              previousResults: this.artists,
              previousMaxListingPages: this.totalPage,
              previousPage: this.currentPage,
              previousTotal: this.totalItems
            };

            this.storage.set(
              "previousDiscoverUserListingState",
              previousDiscoverUserListingState
            );

          } else {
            this.totalPage = null;
            this.artists = null;
            this.totalPage = null;
          }

          if (refresher) {
            this.progressBar.complete();
            refresher.target.complete();
          }

          if (infiniteScroll) {
            this.progressBar.complete();
            infiniteScroll.target.complete();
          }
          this.pageIsLoading = false;
        })
        .catch(ex => {
          console.log("Error getting artists: ", ex);
          this.progressBar.complete();
        })
        .then(() => {
          this.progressBar.complete();
        });
    }
  }

  isCity = false;
  async getEventsByCity(city) {
    this.progressBar.start();
    this.pageIsLoading = true;
    this.isSubmitted = true;
    this.searchQuery = city;
    this.isCity = true;

    // Clear current search array first.
    this.searchEvents = [];

    await this.discover
      .searchEvents(city, this.currentPage)
      .then(response => {
        console.log("Events: ", response);
        if (response['error'] == 0) {
          let searchResult = response['datas'];
          searchResult.forEach(result => {
            this.searchEvents.push(result);
          });
          this.totalItems = response['total_count'];

          let cacheId = this.componentsProvider.eventByCityCacheId + city;
          let cacheData = {
            totalItems: this.totalItems,
            data: this.searchEvents
          }
          this.cacheThisData(cacheId, cacheData);
        }
        else {
          // If request fails, load from cache.
          let cacheId = this.componentsProvider.eventByCityCacheId + city;
          this.storage.get(cacheId).then(data => {
            if (data) {
              var cachedData = data;
              this.searchEvents = cachedData['data'];
              this.totalItems = cachedData['totalItems'];
            }
            else {
              this.searchEvents = [];
            }
          });
        }
      })
      .catch(ex => {
        console.log("Something went wrong: ", ex);
        // If request fails, load from cache.
        let cacheId = this.componentsProvider.eventByCityCacheId + city;
        this.storage.get(cacheId).then(data => {
          if (data) {
            var cachedData = data;
            this.searchEvents = cachedData['data'];
            this.totalItems = cachedData['totalItems'];
          }
          else {
            this.searchEvents = [];
          }
        });
      })
      .then(() => {
        this.progressBar.complete();
        this.pageIsLoading = false;
      });
  }
  getPostResults(refresher?, infiniteScroll?) {
    if (this.searchkey) {
      this.discover
        .searchPosts(this.searchkey, this.currentPage, 8)
        .then(res => {
          if (res["error"] == 0) {
            if (infiniteScroll) {
              this.posts = this.posts.concat(res["datas"]);
            } else {
              this.posts = res["datas"];
            }

            this.totalItems = res["total_count"];
            this.totalPage = res["total_page"];

            this.totalItems = res["total_count"];
            this.totalPage = res["total_page"];
            console.log("eto ung artists", this.artists);
          } else {
            this.totalPage = null;
            this.posts = null;
            this.totalPage = null;
          }

          if (refresher) {
            this.progressBar.complete();
            refresher.target.complete();
          }

          if (infiniteScroll) {
            this.progressBar.complete();
            infiniteScroll.target.complete();
          }
          this.pageIsLoading = false;
        });
    }
  }
  connectUser(item, value) {
    let id = 0;
    if (item.id) {
      id = item.id;
    } else {
      id = item.user_id;
    }

    this.friendsProvider.save({ friendId: id }).then(result => {
      if (result["error"] == 0) {
        if (value == "unconnected") {
          // Unconnected => Request Sent
          item.isFriend = "pending";
        } else if (value == "pending") {
          // Request Sent => Remove Request
          item.isFriend = "unconnected";
        } else if (value == "connected") {
          // Connected => Remove Connection
          this.eventsIon.publish("refresh-main-profile-feed");
          this.eventsIon.publish("refresh-home-feed");
          item.isFriend = "unconnected";
        }

        this.componentsProvider.showToast(result["message"]);
        // this.eventsIon.publish("refresh-main-profile-feed");
        // this.eventsIon.publish("refresh-home-feed");
      }
    });
  }
  // For Discover Styles context
  async getPostsByStyles(refresher?, infiniteScroll?) {
    await this.discover
      .getPostsByStyles("getpostsbystyle", this.styleId, this.currentPage, 8)
      .then(response => {
        if (response["error"] == 0) {
          // this.posts = response["datas"];
          response['datas'].forEach((res)=>{
            this.posts.push(res);
          })
          this.totalItems = response["total_count"];
          this.totalPage = response["total_page"];
        } else {
          this.posts = null;
          this.totalItems = null;
          this.totalPage = null;
          console.log("getpostsbystyle error: ", response);
        }
      })
      .catch(ex => {
        console.log("getPostsByStyles error: ", ex);
      })
      .then(() => {
        this.progressBar.complete();
        this.pageIsLoading = false;
      });

    if (infiniteScroll) {
      this.progressBar.complete();
      infiniteScroll.target.complete();
    }

    if (refresher) {
      this.progressBar.complete();
      refresher.target.complete();
    }
  }
  getPopularEvents(refresher?) {
    this.disableInfinite = true;
    this.discover.getSearchPopularEvents().then(res => {
      if (res["error"] == 0) {
        console.log(res);
        this.tempEvents = res;
        console.log("tempEvents ", this.tempEvents)
        this.events = res["datas"];
        this.pageIsLoading = false;
      }
      else {
        // Use the cached results from Discover tab in case this request fails.
        this.storage.get(this.componentsProvider.eventsListingCacheId).then(data => {
          if (data) {
            this.events = data;
            this.pageIsLoading = false;
          }
          else {
            this.events = [];
            this.pageIsLoading = false;
            this.componentsProvider.showAlert('', 'Cannot retrieve events at the moment. Please try again later.');
          }
        });
      }
    }).catch(ex => {
      console.log('Error getting popular events: ', ex);
      // Use the cached results from Discover tab in case this request fails.
      this.storage.get(this.componentsProvider.eventsListingCacheId).then(data => {
        if (data) {
          this.events = data;
          this.pageIsLoading = false;
        }
        else {
          this.events = [];
          this.pageIsLoading = false;
          this.componentsProvider.showAlert('', 'Cannot retrieve events at the moment. Please try again later.');
        }
      });
    }).then(() => {
      this.progressBar.complete();
    });

    if (refresher) {
      this.progressBar.complete();
      refresher.target.complete();
    }
  }
  async getTagResults(refresher?, infiniteScroll?) {
    await this.discover
      .getPostsByTag(this.item.tag_id, this.currentPage)
      .then(res => {
        if (res["error"] == 0) {
          if (infiniteScroll) {
            this.posts = this.posts.concat(res["datas"]);
          } else {
            this.posts = res["datas"];
          }
          console.log("MERON? ", this.posts)
          this.totalItems = res["total_count"];
          this.totalPage = res["total_page"];
        } else {
          this.posts = null;
          this.totalItems = null;
          this.totalPage = null;

          this.progressBar.complete();
        }
      }).then(() => {
        this.progressBar.complete();
        this.pageIsLoading = false;
      });

    if (infiniteScroll) {
      this.progressBar.complete();
      infiniteScroll.target.complete();
    }

    if (refresher) {
      this.progressBar.complete();
      refresher.target.complete();
    }
  }
  async getEvents() {
    await this.discover
      .getUpcomingEvents()
      .then(response => {
        console.log("Events: ", response);
        let eventData = response["datas"];
        eventData.forEach(event => {
          this.events.push(event);
        });
        this.progressBar.complete();
        this.pageIsLoading = false;
      })
      .catch(ex => {
        console.log("Something went wrong: ", ex);
      });
  }

  // Get additional events
  async getPagedEvents() {}

  // Get all cities
  async getCities(refresher?) {
    this.discover.getEventsByCity().then(res => {
      if (res['error'] == 0) {
        this.cities = res["datas"];
        this.cacheThisData(this.componentsProvider.eventsByCityListingCacheId, res['datas']);
      }
      else {
        // If the request fails, load a cache.
        this.storage.get(this.componentsProvider.eventsByCityListingCacheId).then(data => {
          if (data) {
            this.cities = data;
          }
          else {
            this.cities = [];
          }
        });
      }
    }).catch(ex => {
      console.log('Error getting events by city: ', ex);
      // If the request fails, load a cache.
      this.storage.get(this.componentsProvider.eventsByCityListingCacheId).then(data => {
        if (data) {
          this.cities = data;
        }
        else {
          this.cities = [];
        }
      });
    });

    if (refresher) {
      refresher.target.complete();
    }
  }

  // Get paged cities
  async getPagedCities() {}

  viewEventDetails(event) {
    console.log(event);
    // this.dataSource.changeData({ context: "event", data: event });
    let navigationExtras: NavigationExtras ={
      state:{
        context: 'event',
        data: event
      }
    }
    
    this.navCtrl.navigateForward(['/post-detail'], navigationExtras);
    // this.pageIsLoading = false;
    // // this.getArtists();
  }
   // SEARCH EVENTS AND FUNCTIONS
  // Search context switcher
  searchEventsSwitch(event?) {

    if(event && event.key != "Enter") {
      return event.preventDefault();
    }

    console.log(this.searchQuery);
    this.disableInfinite = false;
    this.toggleList = false;
    this.beginSearch();
  }

  cancelSearch() {
    this.searchQuery = null;
    this.isSubmitted = false;
    this.isCity = false;
  }

  // Search events
  async beginSearch(refresher?, infiniteScroll?) {
    this.keyboard.hide();
    if (this.searchQuery == null) {
      return;
    } else {
      this.progressBar.start();
      this.pageIsLoading = true;
      this.isSubmitted = true;

      // Clear current search array first.
      this.searchEvents = [];

      await this.discover
        .searchEvents(this.searchQuery, this.currentPage)
        .then(response => {
          console.log("Events: ", response);
          if (response) {
            if (response["datas"].length > 0) {
              let searchResult = response["datas"];

              searchResult.forEach(result => {
                this.searchEvents.push(result);
              });

              this.totalItems = response["total_count"];
            } else if (response["name"] && response["name"] == "TimeoutError") {
              // Handle timeouts
            }
          }
        })
        .catch(ex => {
          console.log("Something went wrong: ", ex);
        })
        .then(() => {
          this.progressBar.complete();
          this.pageIsLoading = false;
        });
    }

    if (refresher) {
      this.progressBar.complete();
      refresher.target.complete();
    }

    if (infiniteScroll) {
      this.progressBar.complete();
      infiniteScroll.target.complete();
    }
  }

  searchStyleColumnSwitch(event?) {
    console.log(this.styleColumnQuery);
    this.isSubmitted = false

      if(event && event.key != "Enter") {
        return event.preventDefault();
      }

      this.getSearchedQuestion("getcolumnbycategory", this.styleColumnQuery);

      this.searchQuestion = []; // clear the previous query results prior to starting another one.
  }

  searchQuestion = []; // container for queried style columns; separated from searchEvents due to context differences.
  styleColumnQuery: any; // container for style column query; separated from searchQuery in order to avoid conflicts.
  async getSearchedQuestion(type, data, refresher?, infiniteScroll?) {
    this.keyboard.hide();

    var paramData;
    if (this.styleColumnQuery == null) {
      return;
    } else {
      this.progressBar.start();
      this.pageIsLoading = true;
      this.isSubmitted = true;

      // Fork between searching for category questions or general ones.
      if (this.columnCategory) {
        let categoryId = this.columnCategory.id;
        let query = data;

        paramData = {
          styleColumnCategId: categoryId,
          q: query
        };

        console.log(paramData);
        await this.discover
          .getStyleColumnQuestion(type, paramData, true)
          .then(response => {
            if (response["error"] == 0) {
              console.log(response);
              this.searchQuestion = response["datas"];
              this.styleQuestions = this.searchQuestion;
            } else {
              console.log("Error getting queried style questions: ", response);
            }
          })
          .catch(ex => {
            console.log("Error getting queried style questions: ", ex);
          })
          .then(() => {
            this.progressBar.complete();
            this.pageIsLoading = false;
          });
      } else {
        paramData = {
          q: data
        };

        console.log(paramData);
        await this.discover
          .getStyleColumnQuestion(type, paramData)
          .then(response => {
            if (response["error"] == 0) {
              console.log(response);
              this.searchQuestion = response["datas"];
            } else {
              console.log("Error getting queried style questions: ", response);
            }
          })
          .catch(ex => {
            console.log("Error getting queried style questions: ", ex);
          })
          .then(() => {
            this.progressBar.complete();
            this.pageIsLoading = false;
          });
      }
    }
    
  }

   // STYLE COLUMN FUNCTIONS
   styleQuestions = []; // container for all style questions
   myQuestion: any; // variable for holding a new style question
   myTags: any = []; // container for all tags for a new question
   isPosting: boolean = false; // flag this as true if the user submits a question using the input group
   isPostingSuccessful: boolean = false; // flag this as true then reset it to false after a timeout
   async getAllStyleQuestions(refresher?, infiniteScroll?) {
     if (!infiniteScroll) {
       this.pageIsLoading = true;
     }
 
     if (refresher) {
       refresher.target.complete();
     }
 
     // Discover > Style Column Category context.
     
     if (this.columnCategory) {
       console.log('Getting questions by category.');
       await this.discover
         .getStyleColumnsByCategory(this.columnCategory.id, this.currentPage)
         .then(response => {
           console.log(response);
           if (response["error"] == 0) {
             this.stylecolumnsCategoryName = response['category_name'];
            //  this.masonry.layout();
            //  this.masonry.reloadItems();
             console.log("Category",this.stylecolumnsCategoryName);
             if (infiniteScroll) {
               this.styleQuestions = this.styleQuestions.concat(
                 response["datas"]
               );
             } else {
               this.styleQuestions = response["datas"];
             }
 
             this.totalItems = response["total_count"];
             console.log(this.styleQuestions);
 
             // Cache the retrieved questions
             let categoryCacheId = this.componentsProvider.styleColumnSingleCategoryListingCacheId + this.columnCategory['id'];
             this.cacheThisData(categoryCacheId, this.styleQuestions);
           }
           else {
             // this.styleQuestions = [];
             // this.totalItems = null;
             // console.log("Error getting style questions: ", response);
 
             // In case of errors, retrieve data from cache.
             let categoryCacheId = this.componentsProvider.styleColumnSingleCategoryListingCacheId + this.columnCategory['id'];
             this.storage.get(categoryCacheId).then(data => {
               if (data) {
                 this.styleQuestions = data;
               }
               else {
                 // Only invalidate and return an empty response if there is also no cached data.
                 this.styleQuestions = [];
                 this.totalItems = null;
                 console.log("Error getting style questions: ", response);
               }
             }).catch(ex => {
               console.log('Error loading cached data: ', ex);
               this.styleQuestions = [];
               this.totalItems = null;
             });
 
             this.componentsProvider.showToast('Cannot get or update Style Questions at this time.');
           }
         })
         .catch(ex => {
           console.log("Error getting style questions: ", ex);
           // In case of errors, retrieve data from cache.
           let categoryCacheId = this.componentsProvider.styleColumnSingleCategoryListingCacheId + this.columnCategory['id'];
           this.storage.get(categoryCacheId).then(data => {
             if (data) {
               this.styleQuestions = data;
             }
             else {
               // Only invalidate and return an empty response if there is also no cached data.
               this.styleQuestions = [];
               this.totalItems = null;
               console.log("Error getting style questions (Promise, catch): ", ex);
             }
           }).catch(ex => {
             console.log('Error loading cached data: ', ex);
             this.styleQuestions = [];
             this.totalItems = null;
           });
 
           this.componentsProvider.showToast('Cannot get Style Questions at this time.');
 
           this.pageIsLoading = false;
           this.progressBar.complete();
         })
         .then(() => {
           this.pageIsLoading = false;
           this.progressBar.complete();
         });
     }
     else {
       // Dashboard > Style Column context
       console.log('Getting all questions.');
       await this.discover
         .getStyleColumns(this.currentPage)
         .then(response => {
           if (response["error"] == 0) {
             this.stylecolumnsCategoryName = response['category_name'];
             if (infiniteScroll) {
               this.styleQuestions = this.styleQuestions.concat(response["datas"]);
             }
             else {
               this.styleQuestions = response["datas"];
             }
 
             this.totalItems = response["total_count"];
             console.log(this.styleQuestions);
 
             // Cache the retrieved questions
             this.cacheThisData(this.componentsProvider.styleColumnGenListingCacheId, this.styleQuestions);
           }
           else {
             // this.styleQuestions = null;
             // this.totalItems = null;
             // console.log("Error getting style questions: ", response);
 
             // In case of errors, retrieve data from cache.
             let allColumnsCacheId = this.componentsProvider.styleColumnGenListingCacheId;
             this.storage.get(allColumnsCacheId).then(data => {
               if (data) {
                 this.styleQuestions = data;
               }
               else {
                 // Only invalidate and return an empty response if there is also no cached data.
                 this.styleQuestions = [];
                 this.totalItems = null;
                 console.log("Error getting all style questions: ", response);
               }
             }).catch(ex => {
               console.log('Error loading cached data: ', ex);
               this.styleQuestions = [];
               this.totalItems = null;
             });
 
             this.componentsProvider.showToast('Cannot get or update Style Questions at this time.');
           }
         })
         .catch(ex => {
           let allColumnsCacheId = this.componentsProvider.styleColumnGenListingCacheId;
           this.storage.get(allColumnsCacheId).then(data => {
             if (data) {
               this.styleQuestions = data;
             }
             else {
               // Only invalidate and return an empty response if there is also no cached data.
               this.styleQuestions = [];
               this.totalItems = null;
               console.log("Error getting all style questions (Promise, catch): ", ex);
             }
           }).catch(ex => {
             console.log('Error loading cached data: ', ex);
             this.styleQuestions = [];
             this.totalItems = null;
           });
 
           this.componentsProvider.showToast('Cannot get or update Style Questions at this time.');
 
           this.pageIsLoading = false;
           this.progressBar.complete();;
         })
         .then(() => {
           this.pageIsLoading = false;
           this.progressBar.complete();;
         });
     }
 
     if (refresher) {
       refresher.target.complete();
     }
 
     if (infiniteScroll) {
      this.progressBar.complete();
       infiniteScroll.target.complete();
     }
   }
 
   doRefresh(refresher) {
     this.pageIsLoading = true;
     this.isMasornyisLoaded = false;
     this.currentPage = 1;
     if (refresher) this.refresherRef.disabled = false;

     if (this.pageContext === "stylists") {
         this.artists = [];
         this.progressBar.start();
         this.getArtists(refresher);
     }
 
     if (this.pageContext === "tags") {
       this.posts = [];
       this.progressBar.start();
       this.getTagResults(refresher);
     }
 
     if (this.pageContext === "categories") {
       this.posts = [];
       this.progressBar.start();
       this.getPostsByStyles(refresher);
     }
 
     if (this.pageContext === "posts") {
       this.posts = null;
       this.progressBar.start();
       this.getPostResults(refresher);
     }
 
     if (this.pageContext === "stylecolumn") {
       this.posts = null;
       this.progressBar.start();
       this.getAllStyleQuestions(refresher);
     }
 
     if (this.pageContext === "events") {
       this.posts = null;
       this.cities = null;
       this.pageIsLoading = true;
       this.progressBar.start();
       if (this.searchQuery) {
         this.beginSearch(refresher);
       } else {
         this.getCities(refresher);
         this.getPopularEvents(refresher);
       }
     }
 
     if (this.pageContext == "messages") {
      this.progressBar.start();
       this.getArtists(refresher);
     }
     this.pageIsLoading = false
   }
 
   doInfinite(infiniteScroll: any) {
     this.currentPage++;
     this.endText = false;
     if (this.pageContext === "stylists") {
       if (this.searching === true) {
         if (this.artists.length < this.totalItems) {
           console.log(this.currentPage);
           this.finder(null, infiniteScroll);
         } else {
           infiniteScroll.disabled = true;
           infiniteScroll.target.complete();
           this.endText = true;
         }
       } else {
         if (this.artists.length < this.totalItems) {
           this.getArtists(false, infiniteScroll);
         } else {
           infiniteScroll.disabled = true;
            infiniteScroll.target.complete();
            this.endText = true;
         }
       }
     }
 
     if (this.pageContext === "tags") {
       if (this.posts.length < this.totalItems) {
        this.isMasornyisLoaded = false
         this.getTagResults(false, infiniteScroll);
       } else {
        infiniteScroll.disabled = true;
        infiniteScroll.target.complete();
        this.endText = true;
       }
     }
 
     if (this.pageContext === "categories") {
       if (this.posts.length < this.totalItems) {
        this.isMasornyisLoaded = false
         this.getPostsByStyles(false, infiniteScroll);
       } else {
        infiniteScroll.disabled = true;
        infiniteScroll.target.complete();
        this.endText = true;
       }
     }
 
     if (this.pageContext === "posts") {
       if (this.posts.length < this.totalItems) {
         this.isMasornyisLoaded = false
         this.getPostResults(false, infiniteScroll);
       } else {
        infiniteScroll.disabled = true;
        infiniteScroll.target.complete();
        this.endText = true;
       }
     }
 
     if (this.pageContext === "stylecolumn") {
       if (this.styleQuestions.length < this.totalItems) {
        this.isMasornyisLoaded = false
         this.getAllStyleQuestions(false, infiniteScroll);
       } else {
        infiniteScroll.disabled = true;
        infiniteScroll.target.complete();
        this.endText = true;
       }
     }
 
     if (this.pageContext === "events" && this.searchQuery) {
       if (this.searchEvents.length < this.totalItems) {
         this.beginSearch(false, infiniteScroll);
       } else {
        infiniteScroll.disabled = true;
        infiniteScroll.target.complete();
        this.endText = true;
       }
     }
 
     if (this.pageContext == "messages") {
       if (this.searching === false) {
         this.getArtists(null, infiniteScroll);
       } else {
         if (this.currentPage >= this.maxListingPages) {
          infiniteScroll.disabled = true;
          infiniteScroll.target.complete();
          this.endText = true;
         }
         else {
           this.finder(null, infiniteScroll);
         }
       }
     }
   }
 
   async goToModal() {
     let modal = await this.modalCtrl.create({
       component: QuestionModalComponent,
       cssClass: 'questionModal'
     });
     modal.present();
    //  let modal = await this.modalCtrl.create(QuestionModalPage);
    //  modal.onDidDismiss(status => {
    //    if (status) {
    //      console.log(status);
    //      if (status["posting"] == "success") {
    //        this.showSuccessMessage();
    //      }
    //    } else {
    //      console.log("No data received.");
    //    }
    //  });
    //  modal.present();
   }

  goInsideStyle(question) {
    let navigationExtras:NavigationExtras = {
      state:{question: question,stylecolumnsCategoryName:this.stylecolumnsCategoryName}
    }
    let saveTostorage ={
      page: this.pageContext,
      stylecolumnsCategoryName: this.stylecolumnsCategoryName,
      columnCategory : this.columnCategory
    }
    // this.storage.set('temp-page', this.pageContext)
    this.storage.set('temp-page', saveTostorage)
      this.navCtrl.navigateForward(['/style-column'], navigationExtras);
    // let styleColumnModal = this.modalCtrl.create(StyleColumnPage, {question: question,stylecolumnsCategoryName:this.stylecolumnsCategoryName});
    // styleColumnModal.present();

    // styleColumnModal.onDidDismiss(() => {
    //   console.log('Style Column modal dismissed.');
    // });
  }


  questionAdded: boolean = false; // flag this as true to show message.
  // showSuccessMessage() {
  //   if (this.questionAdded = true){
  //     let postQuestionAlert = this.alertCtrl.create({
  //       message: "   Thank you for sending a question, " + this.profileInfo['profile_first_name'] +"! It is now being reviewed by our team.",
  //       mode: "md",
  //       buttons:[
  //         {
  //           text: 'Okay',
  //           handler: () => {}
  //         }
  //       ]
  //     });
  //     postQuestionAlert.present();
  //   }
  // }

  goToProfile(user, fromMessages?) {
    console.log("From user search: ", user);
    if (this.searchkey && !this.searching || this.othercontext == 'stylist') {
      
      let navigationExtras: NavigationExtras = {
        state: {
          otherUser: {
            id: user.user_id,
            profile_about: "",
            profile_first_name: user.user_first_name,
            profile_last_name: user.user_last_name,
            profile_profile_pic: user.user_profile_pic_url
          },
          status: user
        }
      };
      // this.dataSource.changeData(
      //   {
      //     otherUser: {
      //       id: user.user_id,
      //       profile_about: "",
      //       profile_first_name: user.user_first_name,
      //       profile_last_name: user.user_last_name,
      //       profile_profile_pic: user.user_profile_pic_url
      //     },
      //     status: user
      //   }
      // );
      this.navCtrl.navigateForward(['/tabs/tabs/my-stylin'],navigationExtras);
    } else if (fromMessages) {  
      let navigationExtras: NavigationExtras = {
        state: {
          otherUser: {
            otherUser: user,
            status: user
          },
          status: user
        }
      };
      this.navCtrl.navigateForward(['/tabs/tabs/my-stylin'],navigationExtras);
      
    } else if (this.searching && this.othercontext != 'stylist') {
      let navigationExtras: NavigationExtras = {
        state: {
          otherUser: {
            id: user.user_id,
            profile_about: "",
            profile_first_name: user.user_first_name,
            profile_last_name: user.user_last_name,
            profile_profile_pic: user.user_profile_pic_url
            // id: user.id,
            // profile_about: "",
            // profile_first_name: user.profile_first_name,
            // profile_last_name: user.profile_last_name,
            // profile_profile_pic: user.profile_profile_pic
          },
          status: user
        }
      };
      // this.dataSource.changeData(
      //   {
      //     otherUser: {
      //       id: user.user_id,
      //       profile_about: "",
      //       profile_first_name: user.user_first_name,
      //       profile_last_name: user.user_last_name,
      //       profile_profile_pic: user.user_profile_pic_url
      //       // id: user.id,
      //       // profile_about: "",
      //       // profile_first_name: user.profile_first_name,
      //       // profile_last_name: user.profile_last_name,
      //       // profile_profile_pic: user.profile_profile_pic
      //     },
      //     status: user
      //   }
      // );
      this.navCtrl.navigateForward(['/tabs/tabs/my-stylin'],navigationExtras);
    }
  }

  // For Message User purposes
  // pushToMessagingThread(user) {
  //   this.viewCtrl.dismiss().then(() => {
  //     this.chatProvider.getInbox(user.id).then(res => {
  //       if (res["error"] == 0) {
  //         this.navCtrl.push(InsideMessagingPage, {
  //           user: user,
  //           convo: res["data"],
  //           context: "userlist"
  //         });
  //       }
  //     });
  //   });
  // }
  clearSearchField() {
    this.refresherRef.disabled = false;

    if (this.pageContext == "messages") {
      this.findMeAUser = null;
      this.searching = false;

      this.storage.get("previousListingState").then(data => {
        let restoreState = data;
        this.userListing = restoreState["previousResults"];
        this.currentPage = restoreState["previousPage"];
        this.maxListingPages = restoreState["previousMaxListingPages"];
      });
    } else {
      this.findMeAUser = null;
      this.searching = false;

      this.storage.get("previousDiscoverUserListingState").then(data => {
        let restoreState = data;
        this.artists = restoreState["previousResults"];
        this.currentPage = restoreState["previousPage"];
        this.totalPage = restoreState["previousMaxListingPages"];
        this.totalItems = restoreState['previousTotal'];
      });
    }
  }

  // Used to search the DiscoverInner page when context is user listing or message user.
  async finder(isRefresh?, isInfinite?, newSearch?, event?) {
    if(event && event.key != "Enter") {
      return event.preventDefault();
    }
    
    console.log(this.findMeAUser);
    let data = {
      query: this.findMeAUser
    };

    if(newSearch) {
      this.currentPage = 1;
      this.refresherRef.disabled = false;
    }

    
    this.searching = true; // set this to true until set false otherwise.
    if (this.searching === true && this.pageContext == "messages") {
      // Store previous results, page, and maxPage to Storage.
      // Do this only if the searching flag is false and context is messages.
      // previousResults: any;
      // previousMaxListingPages: any;
      // previousPage: any;
      this.storage.get("previousListingState").then(data => {
        console.log(data);
        if (!data) {
          let previousListingState = {
            previousResults: this.userListing,
            previousMaxListingPages: this.maxListingPages,
            previousPage: this.currentPage,
            previousTotal: this.totalItems
          };
          this.storage.set("previousListingState", previousListingState);
        }
        // else {
        //   let previousListingState = {
        //     previousResults: this.userListing,
        //     previousMaxListingPages: this.maxListingPages,
        //     previousPage: this.currentPage,
        //     previousTotal: this.totalItems
        //   };
        //   this.storage.set("previousListingState", previousListingState);
        // }
      });

      this.progressBar.start();

      console.log('OTHER CONTEXT ',this.othercontext);

      await this.userProvider
        .getUserListings("listing", data, this.currentPage, 20)
        .then(response => {
          if (response["error"] == 0) {
            console.log("Search for user to message: ", response);
            let prefilteredArtists = response['datas'];
            let filteredArtists = [];
            prefilteredArtists.forEach(artist => {
              if (artist['blockedBy'] === false && artist['isBlocked'] === false) {
                filteredArtists.push(artist);
              }
              else {
                console.log('Blocked user found: ', artist);
              }
            });

            if (isInfinite) {
              let newEntries = filteredArtists;
              newEntries.forEach(entry => {
                this.userListing.push(entry);
              });
            } else {
              this.userListing = filteredArtists;
            }
            this.progressBar.complete();
            this.maxListingPages = response['total_page'];
          } else {
            console.log("Error getting user listing: ", response);
            if (response["message"] == "No Friends Found" && !isInfinite) {
              this.userListing = [];
            } else if (
              response["message"] == "No Friends Found" &&
              isInfinite
            ) {
              console.log(
                "Are you infinite scrolling and no more results are found? Let's disable the infinite scroll."
              );
              isInfinite.enable(false);
            }
            this.progressBar.complete();
          }
        })
        .catch(ex => {
          console.log("Error getting user search in messages: ", ex);
        })
        .then(() => {
          if (isInfinite) {
            isInfinite.target.complete();
          }
        });

    } else {
      this.storage.get("previousDiscoverUserListingState").then(data => {
        console.log(data);
        if (!data) {
          let previousDiscoverUserListingState = {
            previousResults: this.artists,
            previousMaxListingPages: this.totalPage,
            previousPage: this.currentPage
          };
          this.storage.set(
            "previousDiscoverUserListingState",
            previousDiscoverUserListingState
          );
        }
        // else {
        //   let previousDiscoverUserListingState = {
        //     previousResults: this.artists,
        //     previousMaxListingPages: this.totalPage,
        //     previousPage: this.currentPage
        //   };
        //   this.storage.set(
        //     "previousDiscoverUserListingState",
        //     previousDiscoverUserListingState
        //   );
        // }
      });

      this.searching = true;
      this.progressBar.start();

      if (this.othercontext == 'stylist') {
        this.discover
          .searchStylist({ q: this.findMeAUser, type: true }, this.currentPage)
          .then(res => {
            if (res["error"] == 0) {
              if (isInfinite) {
                res['datas'].map(data => {
                  this.artists.push(data);
                });
              } else {
                this.artists = res["datas"];
              }

              this.totalItems = res['total_count'];
            } else {
              this.artists = null;
              this.totalItems = 0;
            }

            this.progressBar.complete();
            if (isRefresh) {
              isRefresh.target.complete();
            }
          });
      } else {
      /* Old search for users */
      /* await this.userProvider.getUserListings("listing", data, this.currentPage, 8) */
      console.log(this.currentPage);
      await this.discover.searchStylist({ q: this.findMeAUser }, this.currentPage)
        .then(response => {
          if (response["error"] == 0) {
            console.log("Search for user: ", response);
            if (isInfinite) {
              let newEntries = response["datas"];
              newEntries.forEach(entry => {
                this.artists.push(entry);
              });
            } else {
              this.artists = response["datas"];
            }

            this.progressBar.complete();
            this.totalPage = response['total_page'];
            this.totalItems = response['total_count'];
          } else {
            console.log("Error getting user listing: ", response);
            if (response["message"] == "No Friends Found" && !isInfinite) {
              this.userListing = [];
            } else if (
              response["message"] == "No Friends Found" &&
              isInfinite
            ) {
              console.log(
                "Are you infinite scrolling and no more results are found? Let's disable the infinite scroll."
              );
              isInfinite.enable(false);
            }
            this.progressBar.complete();
          }

          if (isInfinite) {
            isInfinite.target.complete();
          }
        })
        .catch(ex => {
          console.log("Error getting user search in Users: ", ex);
        })
      }

    }
  }

  // Cache all the data in this view.
  // Please refer to the componentsProvider which ID to use for which cache.
  cacheThisData(cacheId, listingData, isInfiniteScroll?) {
    this.storage.get(cacheId).then(data => {
      if (data) {
        // Update an existing cache with new data.
        // let currentData = data;
        // let newData = listingData;
        // newData.forEach(item => {
        //   currentData.push(item);
        // });

        // Set the updated cache values.
        console.log('Updating cached values for ' + cacheId);
        this.storage.set(cacheId, listingData);
      }
      else {
        // Create a new cache entry for a given cache ID.
        console.log('Creating new cache entry for ' + cacheId);
        this.storage.set(cacheId, listingData);
      }
    });
  }
  back(){
    console.log(this.pageContext)
    if(this.from == 'from dashboard'){
      this.navCtrl.back();
    }else{
      this.storage.remove('temp-page').then( res =>{
        this.navCtrl.navigateBack('/tabs/tabs/discover');
      })
    }
    
  }
  goToStyleColumn(){
    this.navCtrl.navigateForward(['/style-column']);
  }
 

  isMasornyisLoaded: boolean = false;
  completeMasonry() {
    this.isMasornyisLoaded = true;
  }

  cancelStyleSearch(){
    this.styleColumnQuery = null;
    this.isSubmitted = false;
    this.isCity = false;
    // this.getAllStyleQuestions();
    // this.styleColumnQuery = null;
    // this.pageTitle = "Style Column";
    // this.stylecolumnsCategoryName = this.columnCategory.name;
    this.ngOnInit();
  }
  
  backDashboard(){
    this.navCtrl.navigateRoot(['/tabs/tabs/dashboard']);
  }
  errorLoad(artist){
    console.log("erorr")
    console.log(this.imageDash.src)
    artist.errorImage = true;
    this.imageDash.src = "/assets/css/imgs/empty-states/no-user-photo.png";
    artist.isLoadedProfile = true;
  }
  isLoadedImg2(artist){
    console.log("isLoaded image...");
    if(artist){
      artist.isLoadedProfile = true;
    } 
  }
}
