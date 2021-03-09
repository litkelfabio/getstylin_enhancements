import { Component, OnInit } from '@angular/core';
import {
  MenuController,
  Platform,
  ModalController, LoadingController, AlertController
} from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { FCM } from 'cordova-plugin-fcm-with-dependecy-updated/ionic/ngx';
// import {  FCM } from '@ionic-native/fcm/ngx'
import { Storage } from '@ionic/storage';
import { EventsService } from './services/events.service';
import { Network } from "@ionic-native/network/ngx";
import { NavController } from '@ionic/angular'
import { NavigationExtras, Router } from '@angular/router'
import { TutorialModalComponent } from './components/modals/tutorial-modal/tutorial-modal.component';
import { DatasourceService } from './services/datasource/datasource.service';

import { ComponentsService } from './services/components/components.service';
import { MutedService } from './services/muted/muted.service';
import { ConnectFriendsModalComponent } from './connect-friends-modal/connect-friends-modal.component';
import { NotificationService } from './services/notification/notification.service';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { BlockedService } from './services/blocked/blocked.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Market } from '@ionic-native/market/ngx';
import { VersionService } from 'src/app/services/version/version.service';
import { ApiService } from './services/api/api.service';
import { ChatService } from './services/chat/chat.service';
import { environment } from 'src/environments/environment';
import { Adjust, AdjustConfig, AdjustEnvironment, AdjustLogLevel } from '@ionic-native/adjust/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {

  // @ViewChild() nav;
  rootPage: any;
  userAccount: any;
  isAndroid: any;
  ios: any;
  // Friend Requests Checks
  // We place this here so we could try and determine whether to show
  // badges on pages even if we are not on it.
  stylinTabOpened: boolean = false;
  requestCount = 0;
  hasApplied: boolean = false; // flag this to true once
  status: any;
  otherUser: any;
  link_android: string = 'https://play.google.com/store/apps/details?id=com.getstylin.app';
  link_ios: string = 'https://apps.apple.com/ph/app/get-stylin-app/id1487783216';

  options: InAppBrowserOptions = {
    location: 'yes',//Or 'no' 
    hidden: 'no', //Or  'yes'
    clearcache: 'yes',
    clearsessioncache: 'yes',
    zoom: 'yes',//Android only ,shows browser zoom controls 
    hardwareback: 'yes',
    mediaPlaybackRequiresUserAction: 'no',
    shouldPauseOnSuspend: 'no', //Android only 
    closebuttoncaption: 'Close', //iOS only
    disallowoverscroll: 'no', //iOS only 
    toolbar: 'yes', //iOS only 
    enableViewportScale: 'no', //iOS only 
    allowInlineMediaPlayback: 'no',//iOS only 
    presentationstyle: 'pagesheet',//iOS only 
    fullscreen: 'yes',//Windows only    
  };
  currentVersion;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private fcm: FCM,
    private storage: Storage,
    private eventService: EventsService,
    private network: Network,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private router: Router,
    private menu: MenuController,
    private events: EventsService,
    private dataSource: DatasourceService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private componentsService: ComponentsService,
    private muteService: MutedService,
    private notificationProvider: NotificationService,
    private inAppBrowser: InAppBrowser,
    private blockService: BlockedService,
    private appVersion: AppVersion,
    private market: Market,
    private versionService: VersionService,
    private apiService: ApiService,
    private chatService: ChatService,
    private adjust: Adjust
  ) {
    this.isAndroid = this.platform.is('android');
    // this.ios = this.platform.is('ios');
    this.initializeApp();
    this.dataSource.serviceData.subscribe((res: any) => {
      console.log("res", res);
      this.otherUser = res['otherUser'];
      console.log(this.otherUser)
      this.userAccount = res['userAccount'];
    })
    console.log(this.userAccount)

  }

  async checkVersion(apiVersionNumber) {
    if (environment.production == true) {
      try {
        let currentVersion = await this.appVersion.getVersionNumber();
        console.log(currentVersion);
        if (apiVersionNumber !== currentVersion) {
          this.showAlertForVersion(apiVersionNumber);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  async forceUpdate(version){
    let loader = await this.loadingCtrl.create({
      mode: 'ios',
      message: "Loading..."
    });


    let alert = await this.alertCtrl.create({
      message: 'Major updates available! \n Your app needs to be updated',
      mode: "md",
      cssClass:'updateAlert',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Update',
          handler: async () => {
            loader.present();
            console.log('Updating...');
            this.goToMarket();
            loader.dismiss();
          }
        }
      ]
    });
    alert.present();
    alert.onDidDismiss().then(data => {
      let currentVersion = this.currentVersion;
      if(version != currentVersion){
        this.forceUpdate(version)
      }
    });
  }

  async maintenance(){
    let alert = await this.alertCtrl.create({
      message: 'The app is currently on maintenance. Please try again in several hour',
      mode: "md",
      cssClass:'updateAlert',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Okay',
          handler: async () => {
            navigator['app'].exitApp();
          }
        }
      ]
    });
    alert.present();
  }

  async showAlertForVersion(apiVersionNumber) {
    let loader = await this.loadingCtrl.create({
      mode: 'ios',
      message: "Loading..."
    });


    let alert = await this.alertCtrl.create({
      message: 'Oh no! Your app is outdated. It needs to be updated',
      mode: "md",
      cssClass:'updateAlert',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Later',
          role: 'cancel'
        },
        {
          text: 'Update',
          handler: async () => {
            loader.present();
            console.log('Updating...');
            this.goToMarket();
            // this.platform.is('android') ? this.inAppBrowser.create(this.link_android,'_blank', this.options) : this.inAppBrowser.create(this.link_ios,'_blank', this.options)
            // this.eventService.publish("clearing-out");
            // this.navCtrl.navigateRoot('/login')
            // this.storage.clear().then(data => {

            //   console.log("DATA: ", data);
            // })
            loader.dismiss();
          }
        }
      ]
    });
    alert.present();
    alert.onDidDismiss().then(data => {
      // this.checkVersion(apiVersionNumber);
    });
  }

  async initializeApp() {
    this.platform.ready().then(async () => {
      console.log("Platform ready; running on: ", this.platform.platforms());
      this.apiService.getDeviceToken().then(data => {
        this.apiService.getGuestAccessToken().then(async data => {
          const adjustConfig = new AdjustConfig('APP-TOKEN-HERE', AdjustEnvironment.Sandbox);
          console.log(adjustConfig)
          // adjustConfig.setLogLevel(AdjustLogLevel.Verbose); 
          adjustConfig.setLogLevel(AdjustLogLevel.Debug); 
          this.adjust.create(adjustConfig);
          let platform;
          this.currentVersion = await this.appVersion.getVersionNumber()
          
          if (this.isAndroid) {
            platform = 'android'
            try {
              let version_from_api = await this.versionService.getVersion(platform);
              if(version_from_api['data']['maintenance'] == 'true'){
                this.maintenance();
              }else{
                if(version_from_api['data']['force_update'] == 'true'){
                  if(version_from_api['data']['version_id'] != this.currentVersion){
                    this.forceUpdate(version_from_api['data']['version_id']);
                  }
                }else{
                  this.checkVersion(version_from_api['data']['version_id']);
                }
              }
            } catch (e) {
              console.error(e);
            }


            // await this.versionService.getVersion(platform).then( res =>{
            //   console.log('from api',res);
            //   this.appVersion.getVersionNumber().then( res=>{
            //     console.log('current app version',res)
            //   })
            // })
          } else {
            console.log("ios is here!");
            platform = 'ios';
            try {
              this.versionService.getVersion(platform).then((res: any) => {
                if(res['data']['maintenance'] == 'true'){
                  this.maintenance();
                }else{
                  if(res['data']['force_update'] == 'true'){
                    if(res['data']['version_id'] != this.currentVersion){
                      this.forceUpdate(res['data']['version_id']);
                    }
                  }else{  
                    this.checkVersion(res['data'].version_id);
                  }
                }
              });
            } catch (e) {
              console.error(e);
            }
          }
          console.log("guess_token received: ", data);
        });
        console.log("token received: ", data);
      });


      try {
        console.log("fired firebase");
        this.initializeFirebase();

      } catch (error) {
        console.log("error", error);
      }

      // splashScreen.hide();
      // this.statusBar.styleDefault();

      // setTimeout(() => {
      //   this.splashScreen.hide();
      //   // this.checkVersion();
      // }, 200);
      // this.events.publish("init-socket");
      this.storage
        .ready()
        .then(async () => {
          console.log("Storage ready.");
          this.storage
            .get("user")
            .then((val: any) => {
              if (!val) {
                this.navCtrl.navigateRoot(['/login']);
                // this.rootPage = LoginPage;
              } else {
                // this.chatService.initChatSocket(val.id);
                try {
                  this.fcm.getInitialPushPayload().then(data => {
                    if (data) {
                      console.log('getInitialPushPayload', data);

                      if (data.push_action == "friend_request") {
                        let navigationExtras: NavigationExtras = {
                          state: { isNotified: true }
                        }
                        this.navCtrl.navigateRoot(['/connection-request2'], navigationExtras);
                      } else if (data.push_action == "friend_accept") {
                        let navigationExtras: NavigationExtras = {
                          state: {
                            type: "connections",
                            otherUser: null,
                            isNotified: true
                          }
                        }
                        this.navCtrl.navigateRoot(['/connection-requests'], navigationExtras);
                      } else if (data.push_action == "post_liked") {
                        let navigationExtras: NavigationExtras = {
                          state: { postId: data.item_id, isNotified: true }
                        }
                        this.navCtrl.navigateRoot(['/post-detail'], navigationExtras);
                      } else if (data.push_action == "post_disliked") {
                        let navigationExtras: NavigationExtras = {
                          state: { postId: data.item_id, isNotified: true }
                        }
                        this.navCtrl.navigateRoot(['/post-detail'], navigationExtras);
                      } else if (data.push_action == "post_comment" || data.push_action == "comment_reply") {
                        let navigationExtras: NavigationExtras = {
                          state: { postId: data.item_id, isNotified: true }
                        }
                        this.navCtrl.navigateRoot(['/post-detail'], navigationExtras);
                      } else if (data.push_action == "new_post") {
                        let navigationExtras: NavigationExtras = {
                          state: { postId: data.item_id, isNotified: true }
                        }
                        this.navCtrl.navigateRoot(['/post-detail'], navigationExtras);
                      } else if (data.push_action == "approved_stylist") {
                        // Own profile
                        this.events.publish("update-stylist-status", data);
                        // this.nav.parent.select(1);
                        // } else if (data.push_action == "approved_question") {
                        //   // Style Column question?
                        //   let navigationExtras:NavigationExtras={
                        //     state:{ context: "stylecolumn",hideSearch: "true",isNotified:true }
                        //   }
                        //   this.navCtrl.navigateRoot(['/discover-inner'],navigationExtras);
                      } else if (data.push_action == "answer_reply" || data.push_action == "approved_question") {
                        // Style Question post details
                        let navigationExtras: NavigationExtras = {
                          state: { context: "notification", data: data, isNotified: true }
                        }
                        // postData = { context: "notification", data: data };
                        this.navCtrl.navigateRoot(['/style-column'], navigationExtras);
                      } else if (data.push_action == "comment_reply") {
                        // Post Details
                        let navigationExtras: NavigationExtras = {
                          state: { postId: data.item_id, isNotified: true }
                        }
                        this.navCtrl.navigateRoot(['/post-detail'], navigationExtras);
                        // postData = { postId: data.item_id };
                        // this.nav.push(PostDetailsPage, postData);
                      } else if (data.push_action == "followed_question") {
                        // Style Question post details
                        let navigationExtras: NavigationExtras = {
                          state: { context: "notification", data: data, isNotified: true }
                        }
                        this.navCtrl.navigateRoot(['/style-column'], navigationExtras);
                        // postData = { context: "notification", data: data };
                        // this.nav.push(StyleColumnPage, postData);
                      } else if (data.push_action == "messages") {
                        console.log("Message notification: ", data);
                        let navigationExtras: NavigationExtras = {
                          state: { data: data, isNotified: true }
                        }
                        this.navCtrl.navigateRoot(['/tabs/tabs/dashboard/messages'], navigationExtras);
                        // this.nav.push(MessagesPage,data);
                        // this.events.publish("changeTab", 3);
                        // this.nav.parent.select(3);
                        // const messagingModal = this.modalCtrl.create(InsideMessagingPage);
                        // messagingModal.present();
                      }
                    } else {
                      let navigationExtras: NavigationExtras = {
                        state: {
                          context: 'from login'
                        }
                      }
                      this.navCtrl.navigateRoot(['/tabs/tabs/dashboard'], navigationExtras);
                    }
                  })
                } catch (error) {
                  console.error(error);
                  let navigationExtras: NavigationExtras = {
                    state: {
                      context: 'from login'
                    }
                  }
                  this.navCtrl.navigateRoot(['/tabs/tabs/dashboard'], navigationExtras);
                }
                // this.rootPage = TabsPage;

              }
            })
            .catch((ex) => {
              console.log("Storage.get error: ", ex);
            });

        })
        .catch((ex) => {
          console.log("Storage ready error: ", ex);
        });

      this.storage.get("user").then((data) => {
        if (data) {
          if (data["stylist"] > 0 && data["stylist"] != 4) {
            this.hasApplied = true;
            this.status = data["stylist"];
          }
        }
      });
      // this.events.publish("init-socket");
      this.subscribeToActions(); // subscribe to user actions  // COMMENT THIS OUT - FOR REWORK
      this.checkNetworkEvents(); // subscribe to network events
      // this.subscribeToPushNotifications();

      // On Android, register the back button action to minimize the app in root page.
      // if (platform.is('android')) {
      //   console.log('Platform is Android; registering back button.');
      //   platform.registerBackButtonAction(() => {
      //     let currentNav = this.appCtrl.getActiveNavs()[0];
      //     let activeView = currentNav.getActive();
      //     console.log('Current nav: ', currentNav);
      //     console.log('Active view: ', activeView);
      //
      //     if (
      //       activeView.id == 't0-0-0' ||
      //       activeView.id == 't0-1-0' ||
      //       activeView.id == 't0-3-0' ||
      //       activeView.id == 't0-4-0'
      //     ) {
      //       this.appMinimize.minimize();
      //     }
      //     else {
      //       if (activeView.isOverlay == true) {
      //         activeView.dismiss();
      //       }
      //       else {
      //         currentNav.pop();
      //       }
      //     }
      //
      //     // if (this.nav.canGoBack()) {
      //     //   this.nav.pop();
      //     // }
      //     // else {
      //     //   this.appMinimize.minimize();
      //     // }
      //   });
      // }
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  ngOnInit() {
    this.removeCache();

    // this.storage.get('user').then(data=>{
    //   this.userAccount= data;
    //   console.log(this.userAccount.stylist);
    // })
  }

  async subscribeToPushNotifications() {
    if (this.isAndroid) {
      this.fcm.onNotification().subscribe((data) => {
        console.log('Push data: ', data);

        this.eventService.publish("fcm-notified", data);

        // Determine what action the notification is for before
        // pushing it to the respective page. This notification will
        // also contain the ID of the post it refers to; pass this as an additional
        // parameter to the page.
        if (data.wasTapped == true) {
          let postData; // bind the item_id parameter here then pass this as a page param
          // console.log("Notification tapped: ", data);
          if (data.push_action == "friend_request") {
            let navigationExtras: NavigationExtras = {
              state: { isNotified: true }
            }
            this.navCtrl.navigateRoot(['/connection-request2'], navigationExtras);
          } else if (data.push_action == "friend_accept") {
            let navigationExtras: NavigationExtras = {
              state: {
                type: "connections",
                otherUser: null,
                isNotified: true
              }
            }
            this.navCtrl.navigateRoot(['/connection-requests'], navigationExtras);
          } else if (data.push_action == "post_liked") {
            let navigationExtras: NavigationExtras = {
              state: { postId: data.item_id, isNotified: true }
            }
            this.navCtrl.navigateRoot(['/post-detail'], navigationExtras);
          } else if (data.push_action == "post_disliked") {
            let navigationExtras: NavigationExtras = {
              state: { postId: data.item_id, isNotified: true }
            }
            this.navCtrl.navigateRoot(['/post-detail'], navigationExtras);
          } else if (data.push_action == "post_comment" || data.push_action == "comment_reply") {
            let navigationExtras: NavigationExtras = {
              state: { postId: data.item_id, isNotified: true }
            }
            this.navCtrl.navigateRoot(['/post-detail'], navigationExtras);
          } else if (data.push_action == "new_post") {
            let navigationExtras: NavigationExtras = {
              state: { postId: data.item_id, isNotified: true }
            }
            this.navCtrl.navigateRoot(['/post-detail'], navigationExtras);
          } else if (data.push_action == "approved_stylist") {
            // Own profile
            this.events.publish("update-stylist-status", data);
            // this.nav.parent.select(1);
            // } else if (data.push_action == "approved_question") {
            //   // Style Column question?
            //   let navigationExtras:NavigationExtras={
            //     state:{ context: "stylecolumn",hideSearch: "true",isNotified:true }
            //   }
            //   this.navCtrl.navigateRoot(['/discover-inner'],navigationExtras);
          } else if (data.push_action == "answer_reply" || data.push_action == "approved_question") {
            // Style Question post details
            let navigationExtras: NavigationExtras = {
              state: { context: "notification", data: data, isNotified: true }
            }
            // postData = { context: "notification", data: data };
            this.navCtrl.navigateRoot(['/style-column'], navigationExtras);
          } else if (data.push_action == "comment_reply") {
            // Post Details
            let navigationExtras: NavigationExtras = {
              state: { postId: data.item_id, isNotified: true }
            }
            this.navCtrl.navigateRoot(['/post-detail'], navigationExtras);
            // postData = { postId: data.item_id };
            // this.nav.push(PostDetailsPage, postData);
          } else if (data.push_action == "followed_question") {
            // Style Question post details
            let navigationExtras: NavigationExtras = {
              state: { context: "notification", data: data, isNotified: true }
            }
            this.navCtrl.navigateRoot(['/style-column'], navigationExtras);
            // postData = { context: "notification", data: data };
            // this.nav.push(StyleColumnPage, postData);
          } else if (data.push_action == "messages") {
            console.log("Message notification: ", data);
            let navigationExtras: NavigationExtras = {
              state: { data: data, isNotified: true }
            }
            this.navCtrl.navigateRoot(['/messages'], navigationExtras);
            // this.nav.push(MessagesPage,data);
            // this.events.publish("changeTab", 3);
            // this.nav.parent.select(3);
            // const messagingModal = this.modalCtrl.create(InsideMessagingPage);
            // messagingModal.present();
          }
        } else {
          // TODO: In-app notification toast
          console.log("Foreground notification: ", data);
          if (data.push_action == "messages") {
            let msgData = {
              body: "You have a new message.",
              push_action: "messages",
            };
            if (this.router.url == '/tabs/tabs/dashboard/messages' || this.router.url == '/messages') {
              this.events.publish('new-message')
            } else {
              this.eventService.publish("fcm-notified-foreground", msgData);
            }
          } else {
            this.eventService.publish("fcm-notified-foreground", data);
          }
        }
      });
    } else {
      this.fcm.onNotification().subscribe(async (data) => {
        console.log('Push data ios: ', data);

        this.eventService.publish("fcm-notified", data);

        // Determine what action the notification is for before
        // pushing it to the respective page. This notification will
        // also contain the ID of the post it refers to; pass this as an additional
        // parameter to the page.
        if (data.wasTapped == true) {
          let postData; // bind the item_id parameter here then pass this as a page param
          // console.log("Notification tapped: ", data);
          if (data.push_action == "friend_request") {
            let state = { type: "connections", otherUser: null, isNotified: true };
            let navigationExtras: NavigationExtras = {
              queryParams: {
                state: JSON.stringify(state)
              }
            }
            this.router.navigate(['/connection-request2'], navigationExtras);
          } else if (data.push_action == "friend_accept") {
            let state = { type: "connections", otherUser: null, isNotified: true };
            let navigationExtras: NavigationExtras = {
              queryParams: {
                state: JSON.stringify(state)
              }
            }
            this.router.navigate(['/connection-requests'], navigationExtras);
          } else if (data.push_action == "post_liked") {
            let state = { postId: data.item_id, isNotified: true }
            let navigationExtras: NavigationExtras = {
              queryParams: {
                state: JSON.stringify(state)
              }
            }
            this.router.navigate(['/post-detail'], navigationExtras);
          } else if (data.push_action == "post_disliked") {
            let state = { postId: data.item_id, isNotified: true }
            let navigationExtras: NavigationExtras = {
              queryParams: {
                state: JSON.stringify(state)
              }
            }
            this.router.navigate(['/post-detail'], navigationExtras);
          } else if (data.push_action == "post_comment" || data.push_action == "comment_reply") {
            let state = { postId: data.item_id, isNotified: true }
            let navigationExtras: NavigationExtras = {
              queryParams: {
                state: JSON.stringify(state)
              }
            }
            this.router.navigate(['/post-detail'], navigationExtras);
          } else if (data.push_action == "new_post") {
            let state = { postId: data.item_id, isNotified: true }
            let navigationExtras: NavigationExtras = {
              queryParams: {
                state: JSON.stringify(state)
              }
            }
            this.router.navigate(['/post-detail'], navigationExtras);
          } else if (data.push_action == "approved_stylist") {
            // Own profile
            this.events.publish("update-stylist-status", data);
            // this.nav.parent.select(1);
            // } else if (data.push_action == "approved_question") {
            //   // Style Column question?
            //   let state = {context: "stylecolumn",hideSearch: "true",isNotified:true }
            //   let navigationExtras:NavigationExtras={
            //     queryParams:{
            //       state: JSON.stringify(state)
            //     }
            //   }
            //   this.router.navigate(['/discover-inner'],navigationExtras);
          } else if (data.push_action == "answer_reply" || data.push_action == "approved_question") {
            // Style Question post details
            let state = { context: "notification", data: data, isNotified: true }
            let navigationExtras: NavigationExtras = {
              queryParams: {
                state: JSON.stringify(state)
              }
            }
            // postData = { context: "notification", data: data };
            this.router.navigate(['/style-column'], navigationExtras);
          } else if (data.push_action == "comment_reply") {
            // Post Details
            let state = { postId: data.item_id, isNotified: true }
            let navigationExtras: NavigationExtras = {
              queryParams: {
                state: JSON.stringify(state)
              }
            }
            this.router.navigate(['/post-detail'], navigationExtras);
            // postData = { postId: data.item_id };
            // this.nav.push(PostDetailsPage, postData);
          } else if (data.push_action == "followed_question") {
            // Style Question post details
            let state = { context: "notification", data: data, isNotified: true }
            let navigationExtras: NavigationExtras = {
              queryParams: {
                state: JSON.stringify(state)
              }
            }
            this.router.navigate(['/style-column'], navigationExtras);
            // postData = { context: "notification", data: data };
            // this.nav.push(StyleColumnPage, postData);
          } else if (data.push_action == "messages") {
            console.log("Message notification: ", data);
            let state = { data: data, isNotified: true }
            let navigationExtras: NavigationExtras = {
              queryParams: {
                state: JSON.stringify(state)
              }
            }
            this.router.navigate(['/messages'], navigationExtras);
            // this.nav.push(MessagesPage,data);
            // this.events.publish("changeTab", 3);
            // this.nav.parent.select(3);
            // const messagingModal = this.modalCtrl.create(InsideMessagingPage);
            // messagingModal.present();
          }
        } else {
          // TODO: In-app notification toast
          console.log("Foreground notification: ", data);
          if (data.push_action == "messages") {
            let msgData = {
              body: "You have a new message.",
              push_action: "messages",
            };
            if (this.router.url == '/tabs/tabs/dashboard/messages' || this.router.url == '/messages') {
              this.events.publish('new-message')
            } else {
              this.eventService.publish("fcm-notified-foreground", msgData);
            }
          } else {
            this.eventService.publish("fcm-notified-foreground", data);
          }
          // const toast = await this.toastCtrl.create({
          //   message: 'Your settings have been saved.',
          //   duration: 2000,

          // });
          // toast.present();
        }
      });
    }
  }
  initializeFirebase() {
    this.platform.is('android') ? this.initializeFirebaseAndroid() : this.initializeFirebaseIOS();
  }
  initializeFirebaseAndroid() {
    this.fcm.getToken().then(token => { });
    this.fcm.onTokenRefresh().subscribe(token => { })
    this.subscribeToPushNotifications();
  }
  initializeFirebaseIOS() {
    this.fcm.requestPushPermission().then(() => {
      this.fcm.getToken().then(token => { });
      this.fcm.onTokenRefresh().subscribe(token => { })
      this.subscribeToPushNotifications();
    })
      .catch((error) => {
        console.log("error", error);
      });
  }

  removeCache() {
    this.storage.keys().then(keys => {
      console.log(keys);
      keys.forEach((key) => {
        if (key !== "user" && key !== "device_token" && key !== "user_token") {
          this.storage.remove(key);
        }
      })
    });
  }
  notificationSubscriber: any;
  subscribeToActions() {
    console.log("Subscribing to user actions.");
    /* Subscribe globally to the getFriendRequests event.
    This event will also emit an event if a friend request is received. */
    this.eventService.subscribe("has-friend-requests", (count, refreshed?) => {
      console.log(count, refreshed, this.stylinTabOpened);
      if (refreshed) {
        this.stylinTabOpened = false;

        if (count > 0 && this.stylinTabOpened == false) {
          // this.notificationsProvider.hasRequests = true;
          // this.notificationsProvider.requestCount = count;
          this.requestCount = count;
          this.eventService.publish("requests-found", count);

          // Publish an additional event for the notifications provider
          // and pass it the data it's supposed to be assigned with.
          let data = {
            from: "refresh",
            hasRequests: true,
            requestCount: count,
          };
          this.eventService.publish("requests-found-for-notifications", data);
        }
      } else {
        if (count > 0 && this.stylinTabOpened == false) {
          // Flag the notifications provider's variables.
          // Only the Profile, Main Profile, and Profile Sidebars may override
          // these values so that the badges on those pages will remain persistent if
          // no action is done on pending requests.
          // this.notificationsProvider.hasRequests = true;
          // this.notificationsProvider.requestCount = count;
          this.requestCount = count;

          // Publish this event so the TabsPage could update the Stylin tab icon.
          console.log("Friend requests found.");
          this.eventService.publish("requests-found", count);

          // Publish an additional event for the notifications provider
          // and pass it the data it's supposed to be assigned with.
          let data = {
            from: "load",
            hasRequests: true,
            requestCount: count,
          };
          this.eventService.publish("requests-found-for-notifications", data);
        } else {
          // Remove the badge from the menu drawer if there are no requests.
          if (this.requestCount > 0) {
            this.requestCount = 0;
          } else {
            this.requestCount = count;
          }
          console.log(
            "Stylin Tab has been opened already or maybe you have no requests."
          );
        }
      }
    });

    // Event fired to switch back the Stylin tab icon to normal (no notifications).
    this.eventService.subscribe("stylist-tab-opened", () => {
      // prevents the notification badge being shown again if the Stylin tab is already opened
      this.stylinTabOpened = true;
    });

    this.eventService.subscribe("clearing-out", (force?) => {
      // Clear the notificationsProvider variables
      this.stylinTabOpened = false;
      this.requestCount = 0;
      this.notificationProvider.hasRequests = false;
      this.notificationProvider.requestCount = 0;
      if (force) {
        console.log("Not closing anything; forced logout.");
      } else {
        // this.menuCtrl.close();
      }
      // this.appCtrl.getRootNav().setRoot(LoginPage);
    });

    // Event fired to update the requestCount without reloading the Home page.
    this.eventService.subscribe("requests-updated", (data) => {
      console.log("Requests updated: adjusting variables accordingly.");
      this.requestCount = data["requestCount"];
    });

    if (this.notificationSubscriber) {
      console.log(
        "Not resubscribing; already subscribed to notification actions."
      );
    } else {
      //FOREGROUND NOTIFS
      this.notificationSubscriber = this.eventService.subscribe(
        "notification-toast-dismissed",
        (fcmData?) => {
          let postData;
          if (this.isAndroid) {
            //FOREGROUND NOTIFS FOR ANDROID
            if (fcmData.push_action == "friend_request") {
              let navigationExtras: NavigationExtras = {
                state: { isNotified: true }
              }
              this.navCtrl.pop().then(() => {
                this.navCtrl.navigateRoot(['/connection-request2'], navigationExtras);
              })
            } else if (fcmData.push_action == "friend_accept") {
              let navigationExtras: NavigationExtras = {
                state: {
                  type: "connections",
                  otherUser: null,
                  isNotified: true
                }
              }
              this.navCtrl.pop().then(() => {
                this.navCtrl.navigateRoot(['/connection-requests'], navigationExtras);
              })
            } else if (fcmData.push_action == "new_post") {
              let state = { postId: fcmData.item_id, isNotified: true }
              let navigationExtras: NavigationExtras = {
                state: { postId: fcmData.item_id, isNotified: true }
              }
              this.navCtrl.pop().then(() => {
                this.navCtrl.navigateRoot(['/post-detail'], navigationExtras);
              })
            } else if (fcmData.push_action == "post_liked") {
              let navigationExtras: NavigationExtras = {
                state: { postId: fcmData.item_id, isNotified: true }
              }
              this.navCtrl.pop().then(() => {
                this.navCtrl.navigateForward(['/post-detail'], navigationExtras);
              })
            } else if (fcmData.push_action == "post_comment" || fcmData.push_action == "comment_reply") {
              let navigationExtras: NavigationExtras = {
                state: { postId: fcmData.item_id, isNotified: true }
              }
              this.navCtrl.pop().then(() => {
                this.navCtrl.navigateRoot(['/post-detail'], navigationExtras);
              })
              // postData = { postId: fcmData.item_id };
              // this.nav.push(PostDetailsPage, postData);
            } else if (fcmData.push_action == "approved_stylist") {
              // this.events.publish('fcm-notified-foreground', data);
              this.events.publish("update-stylist-status", fcmData);
              // this.events.publish("changeTab", 1);
              // } else if (fcmData.push_action == "approved_question") {
              //   let navigationExtras: NavigationExtras = {
              //     state: { context: "stylecolumn", hideSearch: "true", isNotified: true }
              //   }
              //   this.navCtrl.navigateRoot(['/discover-inner'], navigationExtras);
              // this.nav.push(DiscoverInnerPage, {
              //   context: "stylecolumn",
              //   hideSearch: "true",
              // });
            } else if (fcmData.push_action == "answer_reply" || fcmData.push_action == "approved_question") {
              // this.events.publish('fcm-notified-foreground', data);
              let navigationExtras: NavigationExtras = {
                state: { context: "notification", data: fcmData, isNotified: true }
              }
              // postData = { context: "notification", data: data };
              this.navCtrl.pop().then(() => {
                this.navCtrl.navigateRoot(['/style-column'], navigationExtras);
              })
              // postData = { context: "notification", data: fcmData };
              // this.nav.push(StyleColumnPage, postData);
            } else if (fcmData.push_action == "comment_reply") {
              let navigationExtras: NavigationExtras = {
                state: { postId: fcmData.item_id, isNotified: true }
              }
              this.navCtrl.pop().then(() => {
                this.navCtrl.navigateRoot(['/post-detail'], navigationExtras);
              })
              postData = { postId: fcmData.item_id };
              // this.nav.push(PostDetailsPage, postData);
            } else if (fcmData.push_action == "followed_question") {
              // this.events.publish('fcm-notified-foreground', data);

              let navigationExtras: NavigationExtras = {
                state: { context: "notification", data: fcmData, isNotified: true }
              }
              this.navCtrl.pop().then(() => {
                this.navCtrl.navigateRoot(['/style-column'], navigationExtras);
              })
              // postData = { context: "notification", data: fcmData };
              // this.nav.push(StyleColumnPage, postData);
            } else if (fcmData.push_action == "messages") {
              // let msgData = {body: 'You have a new message.'}
              // this.events.publish('fcm-notified-foreground', msgData);

              // let convoData = [{ convo: { id: data['item_id'] } }];
              // this.events.publish('has-messages', convoData);
              // Do not send a foreground notification for messages since we cannot preview this anyway.
              // this.nav.parent.select(3);
              // console.log("Message receive: "+postData);
              let navigationExtras: NavigationExtras = {
                state: { data: fcmData, isNotified: true }
              }
              this.navCtrl.navigateRoot(['/messages'], navigationExtras);
              // this.nav.push(MessagesPage, postData);
              // this.events.publish("changeTab", 3);
            }
          } else {
            //FOREGROUND NOTIFS FOR IOS
            if (fcmData.push_action == "friend_request") {
              let state = { isNotified: true };
              let navigationExtras: NavigationExtras = {
                queryParams: {
                  state: JSON.stringify(state)
                }
              }
              this.router.navigate(['/connection-request2'], navigationExtras);
            } else if (fcmData.push_action == "new_post") {
              let state = { postId: fcmData.item_id, isNotified: true }
              let navigationExtras: NavigationExtras = {
                queryParams: {
                  state: JSON.stringify(state)
                }
              }
              this.navCtrl.pop().then(() => {
                this.router.navigate(['/post-detail'], navigationExtras);
              })
            } else if (fcmData.push_action == "friend_accept") {
              let state = { type: "connections", otherUser: null, isNotified: true };
              let navigationExtras: NavigationExtras = {
                queryParams: {
                  state: JSON.stringify(state)
                }
              }
              this.router.navigate(['/connection-requests'], navigationExtras);
            } else if (fcmData.push_action == "post_liked") {
              let state = { postId: fcmData.item_id, isNotified: true }
              let navigationExtras: NavigationExtras = {
                queryParams: {
                  state: JSON.stringify(state)
                }
              }
              this.navCtrl.pop().then(() => {
                this.router.navigate(['/post-detail'], navigationExtras);
              })
            } else if (fcmData.push_action == "post_comment" || fcmData.push_action == "comment_reply") {
              let state = { postId: fcmData.item_id, isNotified: true }
              let navigationExtras: NavigationExtras = {
                queryParams: {
                  state: JSON.stringify(state)
                }
              }
              this.navCtrl.pop().then(() => {
                this.router.navigate(['/post-detail'], navigationExtras);
              })
              // postData = { postId: fcmData.item_id };
              // this.nav.push(PostDetailsPage, postData);
            } else if (fcmData.push_action == "approved_stylist") {
              // this.events.publish('fcm-notified-foreground', data);
              this.events.publish("update-stylist-status", fcmData);
              // this.events.publish("changeTab", 1);
              // } else if (fcmData.push_action == "approved_question") {
              //   let state = { context: "stylecolumn", hideSearch: "true", isNotified: true }
              //   let navigationExtras: NavigationExtras = {
              //     queryParams: {
              //       state: JSON.stringify(state)
              //     }
              //   }
              //   this.router.navigate(['/discover-inner'], navigationExtras);
              // this.nav.push(DiscoverInnerPage, {
              //   context: "stylecolumn",
              //   hideSearch: "true",
              // });
            } else if (fcmData.push_action == "answer_reply" || fcmData.push_action == "approved_question") {
              // this.events.publish('fcm-notified-foreground', data);
              let state = { context: "notification", fcmData: fcmData, isNotified: true, data: fcmData }
              let navigationExtras: NavigationExtras = {
                queryParams: {
                  state: JSON.stringify(state)
                }
              }
              // postData = { context: "notification", data: data };
              this.router.navigate(['/style-column'], navigationExtras);
              // postData = { context: "notification", data: fcmData };
              // this.nav.push(StyleColumnPage, postData);
            } else if (fcmData.push_action == "comment_reply") {
              let state = { postId: fcmData.item_id, isNotified: true }
              let navigationExtras: NavigationExtras = {
                queryParams: {
                  state: JSON.stringify(state)
                }
              }
              this.navCtrl.pop().then(() => {
                this.router.navigate(['/post-detail'], navigationExtras);
              })
              postData = { postId: fcmData.item_id };
              // this.nav.push(PostDetailsPage, postData);
            } else if (fcmData.push_action == "followed_question") {
              // this.events.publish('fcm-notified-foreground', data);

              let state = { context: "notification", data: fcmData, isNotified: true }
              let navigationExtras: NavigationExtras = {
                queryParams: {
                  state: JSON.stringify(state)
                }
              }
              this.router.navigate(['/style-column'], navigationExtras);
              // postData = { context: "notification", data: fcmData };
              // this.nav.push(StyleColumnPage, postData);
            } else if (fcmData.push_action == "messages") {
              // let msgData = {body: 'You have a new message.'}              
              // this.events.publish('fcm-notified-foreground', msgData);

              // let convoData = [{ convo: { id: data['item_id'] } }];
              // this.events.publish('has-messages', convoData);
              // Do not send a foreground notification for messages since we cannot preview this anyway.
              // this.nav.parent.select(3);
              // console.log("Message receive: "+postData);
              let state = { data: fcmData, isNotified: true }
              let navigationExtras: NavigationExtras = {
                queryParams: {
                  state: JSON.stringify(state)
                }
              }
              this.router.navigate(['/messages'], navigationExtras);
              // this.nav.push(MessagesPage, postData);
              // this.events.publish("changeTab", 3);
            }
          }
        }
      );
    }
  }

  // Subscribe to network events.
  // We could also make the api and auth providers subscribe to events emitted
  // here since majority of our requests pass through thhose providers first.
  checkNetworkEvents() {
    console.log("Subscribing to network events.");

    this.network.onDisconnect().subscribe(() => {
      console.log("Network disconnected: ", this.network);
      this.eventService.publish("app:connection", "disconnected");
    });

    this.network.onConnect().subscribe(() => {
      console.log("Network connected: ", this.network);
      this.eventService.publish("app:connection", "connected");
    });
  }
  async logout() {
    this.events.publish("logout");
    // let loader = await this.loadingCtrl.create({
    //   mode: 'ios',
    //   message:"Logging out..."
    // });
    // let alert = await this.alertCtrl.create({
    //   message:'Are sure do you want to log out?',
    //   mode: "md",
    //   buttons:[
    //     {
    //       text: 'YES',
    //       handler: async() =>{
    //         loader.present();
    //         this.eventService.publish("clearing-out");
    //         this.navCtrl.navigateRoot('/login')
    //         this.storage.clear().then( data =>{

    //           console.log("DATA: ", data);
    //         })
    //         loader.dismiss();
    //       }
    //     },
    //     {
    //       text: 'NO',
    //       role: 'cancel'
    //     }
    //   ]
    // });
    // alert.present();

  }
  goToConnectionRequests2() {
    this.router.navigateByUrl('/connection-request2')
    // let navigationExtras: NavigationExtras={
    //   state:{
    //     from
    //   }
    // }
  }
  goToAccountSettings() {
    this.router.navigateByUrl('/account-settings');
    this.menu.close();
  }
  ionDidClose() {
    this.menu.enable(false, 'content')
  }
  goToStylist() {
    this.router.navigateByUrl('/stylist-application')
  }
  goToConnectFriends() {
    this.router.navigateByUrl('/connection-requests')
  }
  async goToTutorialModal() {
    const modal = await this.modalCtrl.create({
      cssClass: 'tutorialModal',
      mode: 'ios',
      component: TutorialModalComponent,
      backdropDismiss: true,
    });
    modal.present();
  }
  async blockUser(otherUser) {
    let title = "Block User";
    let message = "Are you sure you want to block this account?";
    if (otherUser.isBlocked) {
      title = "Unblock User";
      message = "Unblock this account?";
    }
    let alert = await this.alertCtrl
      .create({
        mode: "md",
        cssClass: 'blockAlert',
        message: message,
        buttons: [
          {
            text: "CANCEL",
            role: "cancel"
          },
          {
            text: "YES",
            handler: async () => {
              let loader = await this.loadingCtrl.create({
                message: "Blocking your connection..."
              });
              loader.present();
              this.blockService
                .save({ friendId: otherUser.id })
                .then(res => {
                  loader.dismiss();
                  console.log("try 2.0", res);

                  if (res["error"] == 0) {
                    otherUser.isBlocked = !otherUser.isBlocked;
                    // this.componentsProvider.showToast(res["message"]);
                    if (res['message'] == 'Block Successful') {
                      this.componentsService.showAlert('User Blocked', 'You have blocked ' + otherUser['profile_first_name'] + '.');
                    }
                    else {
                      this.componentsService.showAlert('User Unblocked', 'You have unblocked ' + otherUser['profile_first_name'] + '.');
                    }
                    // this.ionViewDidEnter();
                    this.events.publish("refresh-home-feed");
                    this.events.publish("refresh-main-profile-feed");
                  } else {
                    console.log(res["message"]);
                  }
                });
            }
          },
        ]
      })
    alert.present();
  }

  // blockUser() {
  //   this.events.publish("is-blocked");
  //   this.menu.close();
  // }
  async muteUser(otherUser) {
    /* this.navCtrl.pop().then(async () => { */
    let title = "Mute User";
    let message =
      "Are you sure you want to mute this user? You will not see posts and notifications related to this person but you will remain connected.";
    if (otherUser.isMuted) {
      title = "Unmute User";
      message = "Unmute this account?";
    }
    const alert = await this.alertCtrl
      .create({
        mode: "md",
        /*   title: title, */
        message: message,
        cssClass: 'muteAlertModal',
        buttons: [
          {
            text: "Cancel",
            role: "cancel"
          },
          {

            text: "Yes",
            handler: async () => {
              let loader = await this.loadingCtrl.create({
                message: "Updating mute status..."
              });
              alert.present();
              loader.present();
              this.muteService.save({ friendId: otherUser.id }).then(res => {
                loader.dismiss();
                console.log("try 2.0", res);

                if (res["error"] == 0) {
                  otherUser.isMuted = !otherUser.isMuted;
                  /* this.navCtrl.pop().then(() => {
                  this.componentsProvider.showToast(res['message']);
                  this.events.publish('refresh-home-feed');
                  }); */
                  this.componentsService.showToast(res["message"]);
                  this.events.publish("refresh-home-feed");
                  this.modalCtrl.dismiss();
                } else {
                  console.log(res["message"]);
                }
              });
            }
          },
        ]
      })
    alert.present();
    /* }); */
  }
  gotoConnections(otherUser?) {
    console.log("OTHERUSERRR: ", otherUser)
    let navigationExtras: NavigationExtras = {
      state: {
        type: "connections",
        otherUser: otherUser
      }
    };
    this.navCtrl.navigateForward(['/connection-requests'], navigationExtras);
    this.menu.close();
  }

  async openConnectModal() {
    let modal = await this.modalCtrl.create({
      component: ConnectFriendsModalComponent,
      cssClass: 'connectFriendsModal'
    });
    modal.present();
  }

  goToMarket() {
    if (this.isAndroid) {
      this.market.open('com.getstylin.app');
    } else {
      this.market.open('id1487783216');
    }

  }
  goToFaqs() {
    this.navCtrl.navigateForward('/tabs/tabs/my-stylin/faqs');
  }
  goToTalkToUs() {
    this.navCtrl.navigateForward('tabs/tabs/my-stylin/talk-to-us');
  }
}
