import { Component, OnInit ,ViewChild} from '@angular/core';
import { Router,ActivatedRoute,NavigationExtras } from '@angular/router';
import { AlertController, LoadingController, NavController, ModalController,IonRefresher,IonImg } from '@ionic/angular';
import { ComponentsService } from 'src/app/services/components/components.service';
import { EventsService } from 'src/app/services/events.service';
import { FriendService } from 'src/app/services/friend/friend.service';
import { UserService } from 'src/app/services/user/user.service';
import { DiscoverService } from 'src/app/services/discover/discover.service';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { BlockedService } from 'src/app/services/blocked/blocked.service';
import { MutedService } from 'src/app/services/muted/muted.service';
import { DatasourceService } from 'src/app/services/datasource/datasource.service';
import { NgProgress,NgProgressComponent } from 'ngx-progressbar';
import {Storage} from '@ionic/storage';
import { IonRouterOutlet } from '@ionic/angular';
@Component({
  selector: 'app-connection-requests',
  templateUrl: './connection-requests.page.html',
  styleUrls: ['./connection-requests.page.scss'],
})
export class ConnectionRequestsPage implements OnInit {
  @ViewChild(NgProgressComponent) progressBar: NgProgressComponent;
  @ViewChild("refresherRef") refresherRef: IonRefresher;
  @ViewChild("image", {static: false}) imageDash: IonImg;
  search;
  errorImage = false;
  searchKey: any = null;
  show = false;
  isLoadedProfile = false;

  isLoaded = false;
  isRequesting = false; // flag this as true to disable buttons while requesting

  items: any;
  totalItems = 0;
  page = 1;
  totalPages = 0;
  limit = 8;

  hasFriends: boolean = false;

  type :any;
  otherUser:any;

  emptyState: any;
  searchedEmpty: any;
  profileInfo :any= [];
  otherUserFromInner: any;
  msg: any;
  hasRequests: any;
  requestCount: any;
  blockedBy: any;
  isBlocked: any;
  profile_about: any;
  stylist: any;
  profile_profile_pic: any ;
  profile_first_name: any[];
  profile_last_name: any;
  otherUser2: any;
  profileInfo2: any;
  isNotified: boolean = false;
  isLoadedConnectionList = false;
  constructor(
    private routerOutlet: IonRouterOutlet,
    private router: Router,
    private alertCtrl: AlertController,
    private blockedProvider: BlockedService,
    private componentsProvider: ComponentsService,
    private events: EventsService,
    private friendsProvider: FriendService,
    private loadingCtrl: LoadingController,
    private mutedProvider: MutedService,
    private navCtrl: NavController,
    // private navParams: NavParams,
    private ngProgress: NgProgress,
    private storage: Storage,
    private userProvider: UserService,
    private discover: DiscoverService,
    private notificationsProvider : NotificationService,
    private modalCtrl: ModalController,
    private dataSource: DatasourceService,
    private route : ActivatedRoute,
  ) { 
    // this.dataSource.serviceData.subscribe(data=>{
    //   console.log("connection-request: ",data);
    //   this.type = data["type"] ? data["type"] : null;
    //   this.otherUser = data["otherUser"] ? data["otherUser"] : null;
    // })
    this.route.queryParams.subscribe(params => {
      console.log("notif: ",params);
      if(params && params.state){
        let param = JSON.parse(params.state);
        this.type = param.type;
        this.otherUser = param.otherUser;
        this.isNotified = param.isNotified;
      }

      if (this.router.getCurrentNavigation().extras.state) {
        this.isNotified = this.router.getCurrentNavigation().extras.state.isNotified;
        this.type = this.router.getCurrentNavigation().extras.state.type;
        console.log("TYPE: ", this.type)
        this.otherUser = this.router.getCurrentNavigation().extras.state.otherUser;
        console.log("nyaw: ", this.otherUser)
        this.otherUser2 = this.router.getCurrentNavigation().extras.state.otherUser2;
        console.log("OtherUser2", this.otherUser2)
        this.otherUserFromInner = this.router.getCurrentNavigation().extras.state.otherUserFromInner ? this.router.getCurrentNavigation().extras.state.otherUserFromInner :null;
        if(this.otherUserFromInner != null){
          this.otherUser = this.otherUserFromInner;
        }
        this.profileInfo = this.router.getCurrentNavigation().extras.state.profileInfo ? this.router.getCurrentNavigation().extras.state.profileInfo : null
        // if(this.profileInfo){
        //   this.profileInfo = this.otherUser
        // }
        console.log("PROFILE: ", this.profileInfo)
        this.msg = this.router.getCurrentNavigation().extras.state.msg;
        console.error('this.msg', this.msg)
        
        // this.profileInfo2 = this.router.getCurrentNavigation().extras.state.profileInfo2 ? this.router.getCurrentNavigation().extras.state.profileInfo2 : null
      
        // if(this.profileInfo){
        //   this.otherUser = this.profileInfo
        // }
      }
    });
    this.hasRequests = this.notificationsProvider.hasRequests; // initial values
    this.requestCount = this.notificationsProvider.requestCount; // initial values
    this.events.subscribe("requests-updated", data => {
      console.log("Requests updated: adjusting variables accordingly.");

      this.hasRequests = data["hasRequest"];
      this.requestCount = data["requestCount"];
    });
  }

  ngOnInit() {
    this.routerOutlet.swipeGesture = false;

    if(this.isNotified) {
      this.storage.get("user").then(user => {
        this.profileInfo = user;
        console.log("User: ", this.profileInfo);
        this.getList(false, true, false);
      });
    }

  }

  // goToInnerConnectionRequest(){
  //   this.router.navigateByUrl('/inner-connection-request')
  // }


  ionViewDidLoad() {
    console.log("ionViewDidLoad UserListPage");
  }

  showsearchBar(e) {
    this.show = e;
    this.searchKey  = ''
    if (e == false) {
      this.searchKey = '';

      // Only reload the user list if the previous state is empty.
      // if (this.items.length == 0) {
        this.ionViewDidEnter();
      // }
    }
  }

  searchUser(e) {
    this.searchKey = e.target.value;
    console.log("searchKey", this.searchKey);
    // this.ionViewDidEnter();
    if(e.target.value.length == 0){
      this.ionViewDidEnter();
    }else{
      this.getList(false, true, false);
    }
  }

  ionViewDidEnter() {
    this.storage.get("user").then(user => {
      this.profileInfo = user;
      console.log("User: ", this.profileInfo);
      this.getList(false, true, false);
    });
  }

  getList(refresher?, isLoadNew?, infiniteScroll?) {
    let otherUserId = null;
    if (this.otherUser) {
      otherUserId = this.otherUser.id;
    }
    if (refresher) {
      if (Object.is(refresher, true) == true) {
        console.log('This is an event-based refresh.');
      }
      else {
        refresher.target.complete();
      }
    }
    if (!infiniteScroll || infiniteScroll == false) {
      this.progressBar.start();
    }
    if (this.type == "blocked accounts") {
      this.emptyState = "You haven't blocked any accounts yet.";

      this.blockedProvider
        .getList(otherUserId, this.page, this.limit, this.searchKey)
        .then(res => {
          if (res["error"] == 0) {
            this.totalItems = res["total_count"];
            this.totalPages = res["total_page"];
            if (!infiniteScroll || infiniteScroll === false) {
              if (!this.items || isLoadNew === true) {
                this.items = [];
              }
            }
            res["datas"].forEach(data => {
              this.items.push(data);
            });
            console.log(this.items);
          } else {
            this.items = [];
            this.totalItems = 0;
            this.totalPages = 0;
          }
          if (infiniteScroll) {
            infiniteScroll.target.complete();
          }
          this.isLoaded = true;
          this.progressBar.complete();
        });
    } else if (this.type == "connections") {
      this.emptyState = "Explore your style and make your connections.";

      if (this.otherUser) {
        this.emptyState = "Once " + this.otherUser.profile_first_name + " has made connections, you'll find them here.";
      }
      if(this.hasFriends){
        this.emptyState = "No matching connections found.";
      }
      this.friendsProvider
        .getList(otherUserId, this.page, this.limit, this.searchKey)
        .then(res => {
          if (res["error"] == 0) {
            this.hasFriends =  true;
            this.totalItems = res["total_count"];
            this.totalPages = res["total_page"];
            if (!infiniteScroll || infiniteScroll === false) {
              if (!this.items || isLoadNew === true) {
                this.items = [];
              }
            }

            if(res['admin_list']) {
              res['admin_list'].forEach(data => {
                this.items.push({
                  id: data.user_id,
                  profile_first_name: data.first_name,
                  profile_last_name: data.last_name,
                  profile_profile_pic: data.profile_pic
                })
              });
            }

            this.items = this.items.filter( this.onlyUnique );

            res["datas"].forEach(data => {
              this.items.push(data);
            });
            this.items.forEach((element : any) => {
              if(element.profile_profile_pic){

              }else{
                element.profile_profile_pic = "/assets/css/imgs/empty-states/no-user-photo.png";
              }
            });
            console.log("laman nung sa connections",this.items);

          } else {
            this.items = [];
            this.totalItems = 0;
            this.totalPages = 0;
          }
          if (infiniteScroll) {
            infiniteScroll.target.complete();
          }
          this.isLoaded = true;
          this.progressBar.complete();
        });
    } else if (this.type == "muted accounts") {
      this.emptyState = "You haven't muted any accounts yet.";
      this.mutedProvider
        .getList(otherUserId, this.page, this.limit, this.searchKey)
        .then(res => {
          if (res["error"] == 0) {
            this.totalItems = res["total_count"];
            this.totalPages = res["total_page"];
            if (!infiniteScroll || infiniteScroll === false) {
              if (!this.items || isLoadNew === true) {
                this.items = [];
              }
            }
            res["datas"].forEach(data => {
              this.items.push(data);
            });
            console.log(this.items);
          } else {
            this.items = [];
            this.totalItems = 0;
            this.totalPages = 0;
          }
          if (infiniteScroll) {
            infiniteScroll.target.complete();
          }
          this.isLoaded = true;
          this.progressBar.complete();
        });
    } else if (this.type == "find friends") {
      this.emptyState = "There are no available users to connect with.";
      this.userProvider
        .getList(this.page, this.limit, this.searchKey)
        .then(res => {
          if (res["error"] == 0) {
            this.totalItems = res["total_count"];
            this.totalPages = res["total_page"];
            if (!infiniteScroll || infiniteScroll === false) {
              if (!this.items || isLoadNew === true) {
                this.items = [];
              }
            }
            res["datas"].forEach(data => {
              this.items.push(data);
            });
            console.log(this.items);
          } else {
            this.items = [];
            this.totalItems = 0;
            this.totalPages = 0;
          }
          if (infiniteScroll) {
            infiniteScroll.target.complete();
          }
          this.isLoaded = true;
          this.progressBar.complete();
        });
    } else if (this.type == "Stylists") {
      /* userId?, fromPage?, page = 1, limit = 8 */
      this.emptyState = "There are no available users to connect with.";
      this.discover.getArtists(false, true, this.page, this.limit).then(res => {
        if (res["error"] == 0) {
          this.totalItems = res["total_count"];
          this.totalPages = res["total_page"];
          if (!infiniteScroll || infiniteScroll === false) {
            if (!this.items || isLoadNew === true) {
              this.items = [];
            }
          }

          this.items = res["datas"];
          console.log("eto ung res", this.items);

          console.log(this.items);
        } else {
          this.items = [];
          this.totalItems = 0;
          this.totalPages = 0;
        }
        if (infiniteScroll) {
          infiniteScroll.target.complete();
        }
        this.isLoaded = true;
        this.progressBar.complete();
      });
    }
  }

  onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
  }

  doRefresh(refresher?) {
    this.isLoaded = false;
    this.items = [];
    this.page = 1;
    this.getList(refresher, true, false);
  }

  doInfinite(infiniteScroll: any) {
    this.page += 1;
    console.log("item lenght: ",this.items.length);
    console.log("total item: ",this.totalItems);
    if (this.items.length < this.totalItems) {
      this.getList(false, false, infiniteScroll);
    } else {
      infiniteScroll.disabled;
      this.isLoadedConnectionList = true;
      infiniteScroll.target.complete();
    }
  }

  gotoProfile(otherUser: any) {
    console.log("Here we go:", otherUser);
    if (this.show) {
      this.show = false;
    }

    if (otherUser.id == this.profileInfo["id"]) {
      this.navCtrl.pop();
      this.events.publish("changeTab", 1);
      //   console.log('Popped to root.');
      // this.navCtrl.popToRoot().then(() => {
      //   this.events.publish("changeTab", 1);
      //   console.log('Popped to root.');
      // });
    } else {
      console.log('Pushed by gotoProfile -else.');
      console.log("profile: ", this.profileInfo)
      let navigationExtras: NavigationExtras = {
        state: {
          otherUser: this.otherUser,
          status: otherUser,
          profileInfo: this.profileInfo,
          id: this.profileInfo.id,
          type: this.type
        }
      };
      console.error("PASSSA", this.profileInfo)
      
      this.navCtrl.navigateForward(['/inner-connection-request'],navigationExtras);
      // let profileModal = this.modalCtrl.create(ProfilePage, {otherUser: otherUser});
      // profileModal.onDidDismiss(() => {
      //   console.log('Profile Modal dismissed.');
      // });
      // profileModal.present();
      // this.navCtrl.popToRoot().then(() => {
      //   this.events.publish('changeTab', 1);
      //   console.log('Popped to root.');

      //   this.navCtrl.push(MainProfilePage, {
      //     otherUser: otherUser,
      //     status: otherUser
      //   });
      // });
    }
  }

  async confirm(userInfo, type?, value?) {
    this.isRequesting = true;
    if (this.type == "blocked accounts") {
      // FOR BLOCKED ACCOUNTS / BLOCKED ACCOUNTS CONTEXT
      let title = "Block User";
      let message = "Block ";
      let content = "Blocking...";
      if (userInfo.isBlocked) {
        title = "Unblock User";
        message = "Unblock ";
        content = "Unblocking...";
      }

      const alert = await this.alertCtrl.create({
        mode: "md",
        message:
          message +
          userInfo.profile_first_name +
          " " +
          userInfo.profile_last_name +
          "?",
        buttons: [
          {
            text: "cancel",
            role: "cancel",
            handler: () => {
              console.log("Cancel clicked");
            }
          },
          {
            text: "YES",
            handler: () => {
              this.action(userInfo, content, type, value);
            }
          },
        ]
      });
       alert.present();
    }
    else if (this.type == "connections") {
      // FOR CONNECTIONS LIST / FRIENDS LIST CONTEXT
      if (type == "block") {
        let title = "Block User";
        let message = "Block ";
        let content = "Blocking...";
        if (userInfo.isBlocked) {
          title = "Unblock User";
          message = "Unblock ";
          content = "Unblocking...";
        }
        const alert = await this.alertCtrl.create({
          mode: "md",
          message:
            message +
            userInfo.profile_first_name +
            " " +
            userInfo.profile_last_name +
            "?",
          buttons: [
            {
              text: "cancel",
              role: "cancel",
              handler: () => {
                console.log("Cancel clicked");
              }
            },
            {
              text: "YES",
              handler: () => {
                this.action(userInfo, content, type, value);
              }
            },
          ]
        });
        alert.present();
      }
      else {
        // FOR OTHER ACTIONS - DISCONNECTS, RECONNECTS, CANCELLATIONS
        let content = "Disconnecting with"+ " " +  userInfo.profile_first_name +"...";

        if (value == "unconnected") {
          userInfo.isFriend = "pending";
        }
        else if (value == "pending") {
          userInfo.isFriend = "unconnected";
        }

        // else if (value == "connected") {
        //   userInfo.isFriend = "unconnected";
        // }

        if (userInfo.isFriend == "connected") {
          const alert = await this.alertCtrl.create({
            mode: "md",
            message:
              "Disconnect with " +
              userInfo.profile_first_name +
              " " +
              userInfo.profile_last_name +
              "?",
            buttons: [
              {
                text: "cancel",
                role: "cancel",
                handler: () => {}
              },
              {
                text: "YES",
                handler: () => {
                  this.action(userInfo, content, type, value);
                  userInfo.isFriend = 'unconnected';
                }
              },
            ]
          });
          alert.present();
        } else {
          content = "Connecting with"  + " " + userInfo.profile_first_name + "...";
          this.action(userInfo, content, type, value);
        }
      }
    }
    else if (this.type == "find friends") {
      // FOR FIND FRIENDS CONTEXT
      if (type == "block") {
        let title = "Block User";
        let message = "Block ";
        let content = "Blocking...";
        if (userInfo.isBlocked) {
          title = "Unblock User";
          message = "Unblock ";
          content = "Unblocking...";
        }
        const alert = await this.alertCtrl.create({
          mode: "md",
          message:
            message +
            userInfo.profile_first_name +
            " " +
            userInfo.profile_last_name +
            "?",
          buttons: [
            {
              text: "cancel",
              role: "cancel",
              handler: () => {
                console.log("Cancel clicked");
              }
            },
            {
              text: "YES",
              handler: () => {
                this.action(userInfo, content, type, value);
              }
            },
          ]
        });
        alert.present();
      }
      else {
        // FOR USER ACTIONS - RECONNECTS, DISCONNECTS, CANCELLATIONS
        if (value == "unconnected") {
          userInfo.isFriend = "pending";
        }
        else if (value == "pending") {
          userInfo.isFriend = "unconnected";
        }
        else if (value == "connected") {
          userInfo.isFriend = "unconnected";
        }

        let content =  "Disconnecting with"+ " " +  userInfo.profile_first_name +"...";
        if (userInfo.isFriend == "connected") {
          const alert = await this.alertCtrl.create({
            mode: "md",
            message:
              "Disconnect with " +
              userInfo.profile_first_name +
              " " +
              userInfo.profile_last_name +
              "?",
            buttons: [
              
              {
                text: "cancel",
                role: "cancel",
                handler: () => {
                  console.log("Cancel clicked");
                }
              },
              {
                text: "YES",
                handler: () => {
                  this.action(userInfo, content, type, value);
                }
              },
            ]
          });
          alert.present();
        }
        else if (value == 'pending') {
          content = 'Cancelling your request with ' + userInfo.profile_first_name + '...';
          this.action(userInfo, content, type, value);
        }
        else {
          content = "Connecting with" + " " + userInfo.profile_first_name + "...";
          this.action(userInfo, content, type, value);
        }
      }
    }
    else if (this.type == "muted accounts") {
      // FOR MUTED ACCOUNTS CONTEXT
      let title = "Mute User";
      let message = "Mute ";
      let content = "Muting...";
      if (userInfo.isMuted) {
        title = "Unmute User";
        message = "Unmute ";
        content = "Unmuting...";
      }
      const alert =await this.alertCtrl.create({
        mode: "md",
        message:
          message +
          userInfo.profile_first_name +
          " " +
          userInfo.profile_last_name +
          "?",
        buttons: [
          
          {
            text: "cancel",
            role: "cancel",
            handler: () => {
              console.log("Cancel clicked");
            }
          },
          {
            text: "YES",
            handler: () => {
              this.action(userInfo, content, type, value);
            }
          },
        ]
      });
      alert.present();
    }
  }

  async action(userInfo, content, type?, value?) {
    const loader = await  this.loadingCtrl.create({
      message: content
    });
    loader.present();

    if (this.type == "blocked accounts") {
      this.blockedProvider.save({ friendId: userInfo.id }).then(result => {
        loader.dismiss();
        if (result["error"] == 0) {
          userInfo.isBlocked = !userInfo.isBlocked;
          // this.componentsProvider.showToast(result["message"]);
          if (result['message'] == 'Block Successful') {
            this.componentsProvider.showAlert('User Blocked', 'You have blocked ' + userInfo.profile_first_name + '.');
          }
          else {
            this.componentsProvider.showAlert('User Unblocked', 'You have unblocked ' + userInfo.profile_first_name + '.');
          }
          this.events.publish("refresh-main-profile-feed");
          this.events.publish("refresh-home-feed");
        }
      }).then(() => {
        this.isRequesting = false;
      });
    }
    else if (this.type == "connections") {
      if (type == "block") {
        this.blockedProvider.save({ friendId: userInfo.id }).then(result => {
          loader.dismiss();
          if (result["error"] == 0) {
            userInfo.isBlocked = !userInfo.isBlocked;
            // this.componentsProvider.showToast(result["message"] , "toastAdjustment");
            if (result['message'] == 'Block Successful') {
              this.componentsProvider.showAlert('User Blocked', 'You have blocked ' + userInfo.profile_first_name + '.');
            }
            else {
              this.componentsProvider.showAlert('User Unblocked', 'You have unblocked ' + userInfo.profile_first_name + '.');
            }
            this.events.publish("refresh-main-profile-feed");
            this.events.publish("refresh-home-feed");
          }
        }).then(() => {
          this.isRequesting = false;
        });
      }
      else {
        if (value == "unconnected") {
          userInfo.isFriend = "pending";
        }
        else if (value == "pending") {
          userInfo.isFriend = "unconnected";
        }
        else if (value == "connected") {
          userInfo.isFriend = "unconnected";
        }

        this.friendsProvider.save({ friendId: userInfo.id }).then(result => {
          loader.dismiss();
          if (result["error"] == 0) {
            console.log(value);
            // this.componentsProvider.showToast(result["message"]);
            this.componentsProvider.showAlert('Connection Request', result['message']);
            this.events.publish("refresh-main-profile-feed");
            this.events.publish("refresh-home-feed");
          }
        }).then(() => {
          this.isRequesting = false;
        });
      }
    }
    else if (this.type == "find friends") {
      if (type == "block") {
        this.blockedProvider.save({ friendId: userInfo.id }).then(result => {
          loader.dismiss();
          if (result["error"] == 0) {
            userInfo.isBlocked = !userInfo.isBlocked;
            // this.componentsProvider.showToast(result["message"]);
            if (result['message'] == 'Block Successful') {
              this.componentsProvider.showAlert('User Blocked', 'You have blocked ' + userInfo.profile_first_name + '.');
            }
            else {
              this.componentsProvider.showAlert('User Unblocked', 'You have unblocked ' + userInfo.profile_first_name + '.');
            }
            this.events.publish("refresh-main-profile-feed");
            this.events.publish("refresh-home-feed");
          }
        }).then(() => {
          this.isRequesting = false;
        });
      }
      else {
        console.log("Pumasok: ", userInfo, value);

        if (value == "unconnected") {
          userInfo.isFriend = "pending";
        }
        else if (value == "pending") {
          userInfo.isFriend = "unconnected";
        }
        else if (value == "connected") {
          userInfo.isFriend = "unconnected";
        }

        this.friendsProvider.save({ friendId: userInfo.id }).then(result => {
          loader.dismiss();
          if (result["error"] == 0) {
            // this.componentsProvider.showToast(result["message"]);
            this.componentsProvider.showAlert('Connection Request', result['message']);
            this.events.publish("refresh-main-profile-feed");
            this.events.publish("refresh-home-feed");
          }
        }).then(() => {
          this.isRequesting = false;
        });
      }
    }
    else if (this.type == "muted accounts") {
      this.mutedProvider.save({ friendId: userInfo.id }).then(result => {
        loader.dismiss();
        if (result["error"] == 0) {
          userInfo.isMuted = !userInfo.isMuted;
          // this.componentsProvider.showToast(result["message"]);
          if (result['message'] == 'Mute Successful') {
            this.componentsProvider.showAlert('User Muted', 'You have muted ' + userInfo.profile_first_name + '.');
          }
          else {
            this.componentsProvider.showAlert('User Unmuted', 'You have unmuted ' + userInfo.profile_first_name + '.');
          }
          this.events.publish("refresh-main-profile-feed");
          this.events.publish("refresh-home-feed");
        }
      }).then(() => {
        this.isRequesting = false;
      });
    }
  }

  goToConnectionRequests() {
    // const connReqModal =  this.modalCtrl.create(ConnectionRequestsPage);
    // connReqModal.onDidDismiss(() => {
    //   console.log('Connection Requests modal dismissed.');
    //   this.doRefresh(true);
    // });
    // connReqModal.present();
    // // this.navCtrl.push(ConnectionRequestsPage);
  }
  dismissModal(otherUser?){
   this.navCtrl.back();
  }
  backRoot(){
    this.navCtrl.navigateRoot(['/tabs/tabs/dashboard']);
  }
  back(){
    console.log("USERINFO: ",this.otherUser )
  //  this.navCtrl.back();
    // if(this.otherUser){
    //   let navigationExtras : NavigationExtras={
    //     state:{
    //       otherUser: this.otherUser,
    //       status: this.otherUser,
    //       fromOtherConnections: true
    //     }
    //   }
    //   this.navCtrl.navigateBack(['/tabs/tabs/my-stylin'], navigationExtras)
    // }else{
      // let navigationExtras : NavigationExtras={
      //   state:{
      //     otherUser: null,
      //       status: null
      //   }
      // }
      // this.navCtrl.navigateBack(['/tabs/tabs/my-stylin'], navigationExtras)
      this.navCtrl.back();
      // }
  }

  // back(){
  //   console.log("USERINFO: ",this.otherUser )
  // //  this.navCtrl.back();
  //   if(this.otherUser){
  //     let navigationExtras : NavigationExtras={
  //       state:{
  //         otherUser: this.otherUser,
  //         status: this.otherUser,
  //         fromOtherConnections: true
  //       }
  //     }
  //     this.navCtrl.navigateBack(['/tabs/tabs/dashboard/my-stylin'], navigationExtras)
  //   }else{
  //     let navigationExtras : NavigationExtras={
  //       state:{
  //         otherUser: this.otherUser,
  //           status: this.otherUser
  //       }
  //     }
  //     this.navCtrl.navigateBack(['/tabs/tabs/my-stylin'], navigationExtras)
  //     }
  // }
  errorLoad(item){
    console.log("erorr") 
    console.log(this.imageDash.src)
    item.errorImage = true;
    // this.imageDash.src = "/assets/css/imgs/empty-states/no-user-photo.png";
    item.isLoadedProfile = true;
  }
  ionImgDidLoadProfile(item){
      item.isLoadedProfile = true;
  }
  ionViewDidLeave(){
    this.progressBar.complete();
  }
}
  

