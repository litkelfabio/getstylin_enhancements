import { Component, OnInit, ViewChild, ViewChildren, ElementRef, NgZone, AfterViewInit, QueryList, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router'
import { MenuController, NavController, IonRefresher, IonRouterOutlet, Platform, IonImg, IonSlides } from '@ionic/angular';
import { ModalController } from '@ionic/angular'
import { EditPostModalComponent } from '../../../components/modals/edit-post-modal/edit-post-modal.component'
import { PostDetailsComponent } from 'src/app/components/modals/post-details/post-details.component';
import { ComponentsService } from '../../../services/components/components.service'
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
import { NgProgress, NgProgressComponent } from 'ngx-progressbar';
import { Observable } from 'rxjs/Observable';
import { TutorialModalComponent } from 'src/app/components/modals/tutorial-modal/tutorial-modal.component';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, AfterViewInit {
  @ViewChild('slides') slides: IonSlides
  slidePage = 1;


  @ViewChildren("likeButton") likeButton: any;
  @ViewChildren("dislikeButton") dislikeButton: any;
  @ViewChild('imageContainer') imageContainer: ElementRef;
  @ViewChild('imahe') private imahe: ElementRef;
  @ViewChild(NgProgressComponent) progressBar: NgProgressComponent;
  @ViewChild("refresherRef") refresherRef: IonRefresher;
  @ViewChild("thisImage", { read: ElementRef }) thisImage: ElementRef;
  @ViewChild("image", { static: false }) imageDash: IonImg;


  isLoading = true;
  isLoaded = false;
  isAndroid: any;
  items = [];
  totalItems = 0;
  convo: any;
  page = 1;
  totalPages = 0;
  limit = 10;
  notif: any;
  messageCount: any;
  messageTabIcon: string = "/assets/css/icon/message-black.svg";
  isLoadedProfile = false;
  profileInfo = [];
  hasFriends: boolean = false;
  fromRegister: any = "";
  // For notifications purposes only
  // Flag this as true when there are NEW notifications
  // then flag again as FALSE if the notifications page is opened.
  showNotificationBlip: boolean = false;
  data = false;
  context: any = "";
  dontShow: any;
  time: any = 10;
  tempFirstPhoto: any[];
  constructor(
    private events: EventsService,
    private router: Router,
    private menu: MenuController,
    private modalCtrl: ModalController,
    private componentsService: ComponentsService,
    private postService: PostService,
    private storage: Storage,
    private navCtrl: NavController,
    private chatService: ChatService,
    private dataSource: DatasourceService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private routerOutlet: IonRouterOutlet,
    private zone: NgZone,
    private platform: Platform,
  ) {
    this.isAndroid = this.platform.is('android');
    this.platform.backButton.subscribe(() => {
      console.log('Back button clicked here!');
    });
    this.route.queryParams.subscribe(res => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.context = this.router.getCurrentNavigation().extras.state.context ? this.router.getCurrentNavigation().extras.state.context : null;
        this.fromRegister = this.router.getCurrentNavigation().extras.state.fromRegister ? this.router.getCurrentNavigation().extras.state.fromRegister : null;
        this.dontShow = this.router.getCurrentNavigation().extras.state.dontShow ? this.router.getCurrentNavigation().extras.state.dontShow : false;
      }
    });
    //  setInterval(() => {

    //  }, 100);

    this.events.subscribe("refresh-home-feed", () => {
      this.zone.run(() => {
        this.ngOnInit();
      });
    });
    this.events.subscribe('refresh-dashboard', () => {
      this.scrollToView();
      // console.log(this.refresherRef.ionPull)
      // this.doRefresh(this.refresherRef);
      // console.log('im here') 
    });

    this.storage.get("user").then(async user => {
      // console.log(user);
      this.profileInfo = user;
      if (!this.fromRegister) {
        if (this.context) {
          if (this.context == 'from register') {
            console.log(this.context)
            let modal = await this.modalCtrl.create({
              component: TutorialModalComponent,
              cssClass: 'tutorialModal'
            });
            modal.present();
            modal.onWillDismiss().then(() => {
              if (Object.is(this.profileInfo['progress'], false) == true ||
                this.profileInfo['brands'].length == 0 ||
                this.profileInfo['profile_about'] == null ||
                this.profileInfo['profile_birthdate'] == null ||
                this.profileInfo['profile_location'] == null ||
                this.profileInfo['clothing'][0] === null ||
                this.profileInfo['clothing'][1] === null ||
                this.profileInfo['clothing'][2] === null ||
                this.profileInfo['clothing'][3] === null ||
                this.profileInfo['clothing'][4] === null) {
                // this.skipmodal();
              }
            })
          } else if (this.context == 'from login') {
            if (Object.is(this.profileInfo['progress'], false) == true ||
              this.profileInfo['brands'].length == 0 ||
              this.profileInfo['profile_about'] == null ||
              this.profileInfo['profile_birthdate'] == null ||
              this.profileInfo['profile_location'] == null ||
              this.profileInfo['clothing'][0] === null ||
              this.profileInfo['clothing'][1] === null ||
              this.profileInfo['clothing'][2] === null ||
              this.profileInfo['clothing'][3] === null ||
              this.profileInfo['clothing'][4] === null) {
              this.skipmodal();
            }
          }
        }
      } else {
        if (this.context) {
          if (this.context == 'from register') {
            console.log(this.context)
            let modal = await this.modalCtrl.create({
              component: TutorialModalComponent,
              cssClass: 'tutorialModal'
            });
            modal.present();
            modal.onWillDismiss().then(() => {
              if (Object.is(this.profileInfo['progress'], false) == true ||
                this.profileInfo['brands'].length == 0 ||
                this.profileInfo['profile_about'] == null ||
                this.profileInfo['profile_birthdate'] == null ||
                this.profileInfo['profile_location'] == null ||
                this.profileInfo['clothing'][0] === null ||
                this.profileInfo['clothing'][1] === null ||
                this.profileInfo['clothing'][2] === null ||
                this.profileInfo['clothing'][3] === null ||
                this.profileInfo['clothing'][4] === null) {
                // this.skipmodal();
              }
            })
          } else if (this.context == 'from login') {
            if (Object.is(this.profileInfo['progress'], false) == true ||
              this.profileInfo['brands'].length == 0 ||
              this.profileInfo['profile_about'] == null ||
              this.profileInfo['profile_birthdate'] == null ||
              this.profileInfo['profile_location'] == null ||
              this.profileInfo['clothing'][0] === null ||
              this.profileInfo['clothing'][1] === null ||
              this.profileInfo['clothing'][2] === null ||
              this.profileInfo['clothing'][3] === null ||
              this.profileInfo['clothing'][4] === null) {
              this.skipmodal();
            }
          }
        }
      }
    });

    // This event is published from the appComponent controller.
    this.events.subscribe('fcm-notified', (data?) => {
      this.zone.run(() => {
        if (data.push_action == 'messages') {
          console.log('Not showing notification blip; this is a message push notif.');
        }
        else {
          this.showNotificationBlip = true;
        }
      });
    });

    // This event is published from the notifications page controller.
    this.events.subscribe('notifications-page-opened', () => {
      this.showNotificationBlip = false;
    });

    this.storage.get("unread_conversations").then(data => {
      this.zone.run(() => {
        if (data) {
          if (data.length > 0) {
            this.messageCount = data.length;
            console.log("messagecount ", this.messageCount)
            this.messageTabIcon = "/assets/css/icon/message-tab-gold.svg";
          }
        }
      });
    });

    // for message
    this.events.subscribe('init-convo-subscribe', () => {
      console.log('Init convo subscribe fired.');
      this.zone.run(() => {
        this.subscribeToMessages().subscribe(result => {

          this.events.publish('has-message')
          this.convo = result;
          console.log('Message result (Global, events): ', result);
          if (result) {
            this.events.publish('has-messages', result);
            this.events.publish('new-message')
            console.log(result)
            this.messageTabIcon = "/assets/css/icon/message-tab-gold.svg";

            // Push this new message record as a storage value.
            let unreadData = result;
            this.storage.get("unread_conversations").then(data => {
              console.log('Cached conversations: ', data);
              if (data) {
                // Push the new unread conversation data into
                // the storage key store if the conversation record
                // is not yet in the key store.
                let currentUnreads = data;
                let isPresent = false; // flag this as true if the conversation is found in the keystore.
                currentUnreads.forEach(unread => {
                  if (unread["convo"]["id"] == unreadData["convo"]["id"]) {
                    console.log(
                      "Conversation already in key store; not bumping count."
                    );
                    unread = unreadData; // This will replace the existing record with an updated one, since it is already present.
                    isPresent = true;
                  }
                });

                // Push the new unread if the conversation is not yet marked as unread.
                if (isPresent === false) {
                  currentUnreads.push(unreadData);
                }

                this.storage.set("unread_conversations", currentUnreads);
                if (this.messageCount == 0 || !this.messageCount) {
                  this.messageCount = currentUnreads.length;
                }
              } else {
                // Create a storage entry for all unread conversations
                // if nothing exists yet.
                console.log("No unread records yet; adding one now.");
                let unreads = [];
                unreads.push(unreadData);
                this.storage.set("unread_conversations", unreads);
                this.messageCount = unreads.length;
              }
            });
          }
          else {
            console.log('Message result: ', result);
          }
        }, subscribeError => {
          console.log('Message subscription error (Global, events): ', subscribeError);
        });
      });

    });

  }
  ngAfterViewInit() {
    this.imageDash = this.items['photo'];
  }
  subscribeToMessages() {
    let observable = new Observable(observer => {
      this.chatService.socket().on("emit otheruser convo", data => {
        observer.next(data);
      });
    });
    return observable;
  }

  ngOnInit() {
    this.routerOutlet.swipeGesture = false;
    this.menu.enable(false, 'content')
    console.log("ionViewDidLoad HomePage");
    this.page = 1;

    /*
      Check first if there is a cached dashboard listing in storage;
      if there is, populate the current item listing with it. If there's none,
      wait for the actual get request to populate the list.

      The actual get request for Posts will overwrite the items and update
      the cache if the request is successful, and by default will fall back
      to the cached listing if not.

      This applies for both onLoad and infinitely scrolled items.
    */
    this.storage.get(this.componentsService.dashboardListingCacheId).then(data => {
      if (data) {
        this.zone.run(() => {
          this.items = data;
          this.isLoaded = true; // flip the isLoaded flag here to hide the skeleton loaders
          console.log('Cached data loaded.');
        });
      }
      else {
        console.log('No Dashboard listing cache found; waiting for network to populate list.');
      }
    }).then(() => {
      this.zone.run(() => {
        this.items = null;
        this.getPosts(false, true, false);
      });

    });
  }
  ionViewDidEnter() {
    // Request for friend requests and notifications after 2s

    console.log('Requesting for friend reqs and notifs.');
    this.getFriendRequests();
    this.getNotifications();
  }
  // doRefresh(event) {
  //   console.log('Begin async operation');

  //   setTimeout(() => {
  //     console.log('Async operation has ended');
  //     event.target.complete();
  //   }, 1000);
  // }
  goToProfile(otherUser) {
    console.log('User: ', otherUser, this.profileInfo);
    if (otherUser.id == this.profileInfo["id"]) {
      // this.events.publish("changeTab", 1);
      this.navCtrl.navigateForward(['/tabs/tabs/my-stylin']);

    }
    else {
      let navigationExtras: NavigationExtras = {
        state: {
          otherUser: otherUser,
          status: otherUser
        }
      }
      this.navCtrl.navigateForward(['/tabs/tabs/my-stylin'], navigationExtras);
    }
  }

  // async goToLikesDislikes(item) {
  //   const modal = await this.modalCtrl.create(LikesDislikesPage, {
  //     item: item,
  //     fromMain: true
  //   });
  //   modal.present();
  //   this.events.subscribe("dismissmodal", () => {
  //     modal.dismiss().then(() => {
  //       this.navCtrl.pop();
  //     });
  //   });
  // }

  gotoTagsRelatedPosts(tag) {

    let retag = {
      tag_id: tag['id'],
      tag_name: tag['tags'].slice(1, tag['tags'].length)
    }
    let navigationExtras: NavigationExtras = {
      state: { context: "tags", item: retag, from: 'from dashboard' }
    }
    // this.dataSource.changeData( { context: "tags", item: retag });
    this.navCtrl.navigateForward(['/tabs/tabs/discover/discover-inner'], navigationExtras);

  }

  // goToMessages(){
  //   this.messageTabIcon = 'custom-message-black';
  //   this.messageCount = null;
  //   this.navCtrl.push(MessagesPage);
  // }

  getMoment(stamp) {
    return (this.componentsService.getTimestampFormat(stamp, 'YYYY-MM-DD hh:mm:ss'));
  }

  async getFriendRequests(isRefresh?) {
    await this.notificationService.getFriendRequests('getrequests').then(response => {
      if (response['error'] == 0) {
        console.log(response);
        console.log('You have ', response['total_count'], ' requests.');
        this.notif = response['total_count']
        if (isRefresh) {
          this.events.publish('has-friend-requests', response['total_count']);
        }
        else {
          this.events.publish('has-friend-requests', response['total_count']);
        }
      }
      else {
        console.log('Error getting friend requests: ', response);
        if (response['message'] == 'Invalid device token') {
          // Only invalid token errors has the message key in the response,
          // so we place this here.
          this.componentsService.showToast('Your session was expired.');
          this.events.publish('forcelogout');
        }
        else {
          // TimeoutErrors does not have a message key in its response, so we could
          // simply put a faulting value here to trigger an error state.

        }
      }
    }).catch(getFriendRequestsError => {
      console.log('getFriendRequestsError: ', getFriendRequestsError);
      this.componentsService.showToast('Could not get friend requests at this time.');
    });
  }

  async getPosts(refresher?, isLoadNew?, infiniteScroll?) {
    if (this.dontShow != true) {
      this.progressBar.start();
    }
    if (refresher) {
      setTimeout(() => {
        this.refresherRef.complete();
      }, 500);
    }
    // if (!infiniteScroll || infiniteScroll == false) {
    //   this.progressBar.start();
    // }

    await this.postService.getPosts(null, "homepage", this.page, this.limit).then(res => {
      console.log(res)
      this.progressBar.complete();
      if (res["error"] == 0) {
        this.totalItems = res["total_count"];
        // console.log("totalItem ", this.totalItems)
        this.totalPages = res["total_page"];
        if (!infiniteScroll || infiniteScroll === false) {
          if (!this.items || isLoadNew === true) {
            this.items = [];
          }
        }

        res["datas"].forEach(data => {
          if (data.filter.brightness == 0) {
            data.filter.brightness = 0.0;
          }
          if (data.filter.contrast == 0) {
            data.filter.contrast = 0.0;
          }
          if (data.filter.saturation == 0) {
            data.filter.saturation = 0.0;
          }
          // data.photo = this.componentsProvider.photoCompressDefault(data.photo);
          data.comments = [];
          if(data.is_multiple){
            this.tempFirstPhoto = [];
            this.tempFirstPhoto['photo'] = data['photo'];
            this.tempFirstPhoto['filter'] = data['filter'];
            data.multiplePics.unshift(this.tempFirstPhoto)
          }

          this.items.push(data);
        });

        // Cache the whole post listing response.
        this.cachePostsListing(this.items);
      }
      else {
        // this.items = [];
        // this.totalItems = 0;
        // this.totalPages = 0;

        if (res['message'] == 'Invalid device token') {
          // Only invalid token errors has the message key in the response,
          // so we place this here.
          this.componentsService.showToast('Your session was expired.');
          this.events.publish('forcelogout');
        }
        else {
          // TimeoutErrors does not have a message key in its response, so we could
          // simply put a faulting value here to trigger an error state.
          this.componentsService.showToast('Cannot get new Posts right now.');
        }
      }

      if (infiniteScroll) {
        setTimeout(() => {
          infiniteScroll.target.complete();
        }, 500);
      }

      return (this.items);
    }).catch(e => {
      this.isLoaded = true;

      console.log('Error getting posts: ', e);
      this.componentsService.showToast('Cannot get new Posts right now.');
    }).then(() => {
      this.isLoaded = true;
    });
    this.isLoading = false;
    this.progressBar.complete();
  }

  // Get the comments for the post then attach them to the card.
  async getPostComments(postId, itemIndex) {
    let data = postId;
    let paramData = {
      postId: data
    }
    await this.postService.getComments('getcomments', paramData).then(response => {
      let parentComments = response['datas'];
      this.items[itemIndex].comments = parentComments;
      // console.log(itemIndex, parentComments, this.items[itemIndex]);
    }).catch(ex => {
      console.log('Error getting comments: ', ex);
    });
  }

  // Get notifications.
  async getNotifications() {
    await this.notificationService.getNotifications(1).then(response => {
      // This request is only to determine if there are unread notifications on startup.
      // But this does not necessarily mean that they are new notifications.
      // Covered notifications are only the first page of notifications. Subsequent
      // pages are not factored in to keep the initial request small.
      let notificationData = response['datas'];
      let hasNotif = false;
      notificationData.forEach(notif => {
        if (!notif['read_at']) {
          hasNotif = true;
        }
      });

      if (hasNotif) {
        this.showNotificationBlip = true;
      }

      // We could also pre-cache the notifications returned here.
      this.storage.set(this.componentsService.notificationCacheId, notificationData);
    }).catch(ex => {
      console.log('Error getting notifications (Home page): ', ex);
    });
  }

  cachePostsListing(listingData, isInfiniteScroll?) {
    console.log(listingData);
    this.storage.get(this.componentsService.dashboardListingCacheId).then(data => {
      if (data && isInfiniteScroll) {
        console.log('Updating Dashboard cache from infiniteScroll.');
        let currentCacheData = data;
        let newData = listingData;
        newData.forEach(item => {
          currentCacheData.push(item);
        });

        // Update the current cache entry.
        this.storage.set(this.componentsService.dashboardListingCacheId, currentCacheData);
      }
      else if (data && !isInfiniteScroll) {
        console.log('Updating Dashboard cache from refresh/infinite data.');
        this.storage.set(this.componentsService.dashboardListingCacheId, listingData);
      }
      else {
        console.log('Setting new Dashboard cache.');
        this.storage.set(this.componentsService.dashboardListingCacheId, listingData);
      }
    });
  }

  async doRefresh(refresher: IonRefresher) {
    // Check again for friend requests; this also fires the events for showing the notifications
    await this.getFriendRequests(true);

    // this.isLoaded = false;
    // this.items = [];
    this.page = 1;
    await this.getPosts(refresher, true, false);
  }


  doInfinite(infiniteScroll: any) {
    this.page += 1;
    if (this.items.length < this.totalItems) {
      this.getPosts(false, false, infiniteScroll);
      console.log("true");
    }
    else {
      console.log("false");
      infiniteScroll.disabled;
    }
  }

  async gotoDetails(item) {
    item.multiplePics.shift();
    // this.navCtrl.push(PostDetailsPage, {
    //   item: item
    // });
    let postModal;
    let mine = item.userId == this.profileInfo['id'] ? true : false;
    if (mine === true) {
      let navigationExtras: NavigationExtras = {
        state: {
          item: item,
          isMultiple: item.is_multiple ? item.is_multiple : null,
          multiplePics: item.multiplePics ? item.multiplePics : null
         }
      }
      // this.dataSource.changeData({item: item});
      this.navCtrl.navigateForward(['/post-detail'], navigationExtras)
      //  this.modalCtrl.create({
      //   mode:'ios',
      //   component: PostDetailPage,
      //   backdropDismiss: false,
      //   componentProps:{
      //     item: item
      //   }
      //  }).then(postModal => {
      //   postModal.present();
      //   postModal.onDidDismiss().then(() => {
      //     console.log('Post Details modal dismissed.');
      //   });
      //  });
    }
    else {
      let navigationExtras: NavigationExtras = {
        state: { 
          item: item,
          otherUser: item['userinfo'],
          isMultiple: item.is_multiple ? item.is_multiple : null,
          multiplePics: item.multiplePics ? item.multiplePics : null
        }
      }
      // this.dataSource.changeData({item: item, state: item['userinfo']});
      this.navCtrl.navigateForward(['/post-detail'], navigationExtras)
      // this.modalCtrl.create({
      //   mode:'ios',
      //   component: PostDetailPage,
      //   backdropDismiss: false,
      //   componentProps:{
      //     item: item, state: item['userinfo']
      //   }
      //  }).then(postModal => {
      //   postModal.present();
      //   postModal.onDidDismiss().then(() => {
      //     console.log('Post Details modal dismissed.');
      //   });
      //  });
    }

  }
  goToModal(item) {
    // let modal;
    // let mine = item.userId == this.profileInfo['id'] ? true : false;
    // if (mine === true) {



    //   modal = this.modalCtrl.create(PromptModalPage, {
    //     item: item,
    //     isMine: item.userId == this.profileInfo["id"] ? true : false
    //   });
    // }
    // else {
    //   modal = this.modalCtrl.create(PromptModalPage, {
    //     item: item,
    //     isMine: item.userId == this.profileInfo["id"] ? true : false,
    //     otherUser: item['userinfo']
    //   });
    // }
    // modal.present();
  }

  gotoFindFriends() {
    // this.navCtrl.push(UserListPage, {
    //   type: "find friends"
    // });
  }

  // goToNotifications(){
  //   // this.navCtrl.push(NotificationsPage);
  // }

  isReacting: boolean = false;
  isReactingTo: any;
  message_notif: any = "";
  async like(value, item) {
    let action = value;
    let currentReact = item['isLiked'];

    console.log('Action: ', action);
    console.log('Item is currently: ', currentReact);
    if (action == '1') {
      // Trap first if the item is already liked.
      // If the item is already liked, no request will be sent.
      if (item['isLiked'] == 1) {
        this.isReacting = true;
        await this.postService
          .likePost({ postId: item.id, isLiked: null })
          .then(response => {
            console.log("Dislike: ", response);
            if (response["error"] == 0) {
              item.isLiked = null;
              item.no_of_likes = parseInt(item.no_of_likes) - 1;
            } else {
              console.log("Error unliking post: ", response);
            }
          })
          .catch(dislikeError => {
            console.log("Error unliking post: ", dislikeError);
          });
      }
      else {
        this.isReactingTo = item['id'];
        this.isReacting = true;

        // If the item is not yet liked, request for it to be liked.
        await this.postService.likePost({ postId: item.id, isLiked: 1 }).then(response => {
          console.log('Like: ', response);
          this.message_notif = response['message_notif'];
          if (response['error'] == 0) {
            item.isLiked = 1;
            // If the item is previously unreacted to, simply add to the
            // respective counter. Else, add and deduct to the respective counters.
            if (currentReact == null) {
              item.no_of_likes = parseInt(item.no_of_likes) + 1;
            }
            else if (currentReact != null) {
              item.no_of_likes = parseInt(item.no_of_likes) + 1;
              item.no_of_dislikes = parseInt(item.no_of_dislikes) - 1;
              console.log('No. of dislikes: ', item.no_of_dislikes);
            }
          }
          else {
            console.log('Error liking post: ', response);
          }
        }).catch(likeError => {
          console.log('Error liking post: ', likeError);
        }).then(async () => {
          this.isReacting = false;
          this.isReactingTo = null;
          // after liking the post this function will push notif to all connected friends.
          await this.postService.likePostNotif({ postId: item.id, isLiked: 1, message_notif: this.message_notif }).then(res => {
            console.log(res);
          });
        });
      }
    }
    else if (action == '0') {
      // Similar to likes, trap first if the item is already disliked.
      if (item['isLiked'] == 0) {
        this.isReacting = true;
        await this.postService.likePost({ postId: item.id, isLiked: null }).then(response => {
          console.log('Dislike: ', response);
          if (response['error'] == 0) {
            item.isLiked = null;
            item.no_of_dislikes = parseInt(item.no_of_dislikes) - 1;
          }
          else {
            console.log('Error unliking post: ', response);
          }
        }).catch(dislikeError => {
          console.log('Error unliking post: ', dislikeError);
        });
      }
      else {
        this.isReactingTo = item['id'];
        this.isReacting = true;

        await this.postService.likePost({ postId: item.id, isLiked: 0 }).then(response => {
          console.log('Dislike: ', response);
          this.message_notif = response['message_notif'];
          if (response['error'] == 0) {
            item.isLiked = 0;
            if (currentReact == null) {
              item.no_of_dislikes = parseInt(item.no_of_dislikes) + 1;
            }
            else if (currentReact != null) {
              item.no_of_dislikes = parseInt(item.no_of_dislikes) + 1;
              item.no_of_likes = parseInt(item.no_of_likes) - 1;
              console.log('No. of likes: ', item.no_of_dislikes);
            }
          }
          else {
            console.log('Error unliking post: ', response);
          }
        }).catch(dislikeError => {
          console.log('Error unliking post: ', dislikeError);
        }).then(async () => {
          this.isReacting = false;
          this.isReactingTo = null;
          await this.postService.likePostNotif({ postId: item.id, isLiked: 1, message_notif: this.message_notif }).then(res => {
            console.log(res);
          });
        });
      }
    }
  }

  goToStyleColumns() {
    // this.navCtrl.push(DiscoverInnerPage, {
    //   context: "stylecolumn",
    //   hideSearch: 'true'
    // });
  }

  goToSkip() {
    // this.modalCtrl.create(SkipModalPage).present();
  }

  goToInviteFriends() {
    //  this.modalCtrl.create(InviteFriendsModalPage).present();
  }

  async editPostModal(item) {

    let mine = item.userId == this.profileInfo['id'] ? true : false;
    if (mine === true) {
      // this.dataSource.changeData({
      //   item: item,
      //   isMine: item.userId == this.profileInfo["id"] ? true : false
      // });
      const modal = await this.modalCtrl.create({
        componentProps: {
          item: item,
          isMine: item.userId == this.profileInfo["id"] ? true : false
        },
        cssClass: 'editOwnPostModal',
        mode: 'ios',
        component: EditPostModalComponent,
        backdropDismiss: true,
      });
      await modal.present();
      // }else if(item['']){

    } else if (item['userinfo']['is_style_concierge'] == '1' && item['userinfo']['isFriend'] == 'connected') {
      const modal = await this.modalCtrl.create({
        componentProps: {
          item: item,
          isMine: item.userId == this.profileInfo["id"] ? true : false,
          otherUser: item['userinfo']
        },
        cssClass: 'editFriendStyleConceirgePostModal',
        mode: 'ios',
        component: EditPostModalComponent,
        backdropDismiss: true,
      });
      await modal.present();
    } else if (item['userinfo']['isFriend'] == 'connected') {
      const modal = await this.modalCtrl.create({
        componentProps: {
          item: item,
          isMine: item.userId == this.profileInfo["id"] ? true : false,
          otherUser: item['userinfo']
        },
        cssClass: 'editFriendPostModal',
        mode: 'ios',
        component: EditPostModalComponent,
        backdropDismiss: true,
      });
      await modal.present();

    } else if (item['userinfo']['isFriend'] == 'pending') {
      const modal = await this.modalCtrl.create({
        componentProps: {
          item: item,
          isMine: item.userId == this.profileInfo["id"] ? true : false,
          otherUser: item['userinfo']
        },
        cssClass: 'editFriendPostModal',
        mode: 'ios',
        component: EditPostModalComponent,
        backdropDismiss: true,
      });
      await modal.present();
    } else if (item['userinfo']['is_style_concierge'] == '1') {
      const modal = await this.modalCtrl.create({
        componentProps: {
          item: item,
          isMine: item.userId == this.profileInfo["id"] ? true : false,
          otherUser: item['userinfo']
        },
        cssClass: 'editStyleConceirge',
        mode: 'ios',
        component: EditPostModalComponent,
        backdropDismiss: true,
      });
      await modal.present();
    }



    else {
      console.log("USERINFO: ", item['userinfo']['isFriend'])
      const modal = await this.modalCtrl.create({
        componentProps: {
          item: item,
          isMine: item.userId == this.profileInfo["id"] ? true : false,
          otherUser: item['userinfo']
        },
        cssClass: 'editPostModal',
        mode: 'ios',
        component: EditPostModalComponent,
        backdropDismiss: true,
      });
      await modal.present();

    }

  }
  async goToPostDetails() {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      component: PostDetailsComponent,
      backdropDismiss: true
    });
    await modal.present();
  }

  async skipmodal() {
    const modal = await this.modalCtrl.create({

      cssClass: 'skipModal modal-dialog-cantered',
      mode: 'ios',
      component: SkipModalComponent,
      backdropDismiss: true,
      componentProps: {
        data: this.profileInfo
      }
    });
    await modal.present();
  }
  // gotoLikesDislikes(item){
  //   this.router.navigateByUrl('/likes-dislikes')
  // }

  async likesDislikesModal(item) {
    this.dataSource.changeData(item);
    const modal = await this.modalCtrl.create({
      componentProps: {
        item: item
      },
      mode: 'ios',
      component: LikesDislikesComponent,
      backdropDismiss: true,
    });

    await modal.present();
  }

  goToMessages() {
    this.messageTabIcon = '/assets/css/icon/message-black.svg';
    this.messageCount = null;
    this.events.publish('init-subscribers');
    this.router.navigateByUrl('/tabs/tabs/dashboard/messages');
  }
  goToNotifications() {
    this.router.navigateByUrl('/tabs/tabs/dashboard/notifications')
  }
  onImgLoad(e, item) {
    if (e.loaded == true) {
      item.isLoaded = true;
    }
  }
  isLoadedImg(item) {
    if (item) {
      item.isLoaded = true;
    }
  }
  isLoadedImg2(item) {
    if (item) {
      item.isLoadedProfile = true;
    }
  }
  errorLoad() {
    this.imageDash.src = "/assets/css/imgs/empty-states/fallback.svg";
  }
  errorLoadAvatar(item) {
    console.log("erorr")
    item.errorImage = true;
    item.isLoadedProfile = true;
    // this.imageDash.src = "/assets/css/imgs/empty-states/no-user-photo.png";
  }
  ionViewDidLeave() {
    this.progressBar.complete();
  }
  scrollToView() {
    document
      .getElementById("feed")
      .scrollIntoView({ behavior: "smooth", block: "start" });
  }


  ionSlideDidChange(e, index) {
    this.slides.getActiveIndex().then(res => {
      this.items[index].slidePage = res + 1;
      console.log('res', res);
      console.log('index', index);
      console.log('item index', this.items[index].slidePage);
    })
  }

}
