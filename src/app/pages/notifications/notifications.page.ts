import { Component, OnInit,ViewChild } from '@angular/core';
import { Platform ,IonRefresher, NavController, AlertController, LoadingController, ToastController} from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { ComponentsService } from 'src/app/services/components/components.service';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { EventsService } from 'src/app/services/events.service';
import { UserService } from 'src/app/services/user/user.service';
import { FriendService } from 'src/app/services/friend/friend.service';
import { NgProgressComponent } from 'ngx-progressbar';
import { NavigationExtras, Router } from '@angular/router';
import { PostService } from 'src/app/services/post/post.service';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {
  @ViewChild(NgProgressComponent) progressBar: NgProgressComponent;
  @ViewChild("refresherRef") refresherRef: IonRefresher;
  currentPage: number = 1;
  items: any;
  total_items: number = 0;
  profileInfo: any;
  isLoaded = false;
  info: any;
  endText: any = false;
  constructor(
    private notificationsProvider: NotificationService,
    private componentsProvider: ComponentsService,
    private platform: Platform,
    private storage: Storage,
    private events: EventsService,
    private userProvider: UserService,
    private friendsProvider: FriendService,
    private navCtrl: NavController,
    private postsProvider: PostService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private router: Router,
    private userService : UserService
  ) { 
    this.storage.get("user").then(user => {
      this.profileInfo = user;
    });
  }
  ionViewDidEnter() {
    this.events.publish('notifications-page-opened');
  }
  ngOnInit() {
    this.storage.get(this.componentsProvider.notificationCacheId).then(data => {
      if (data) {
        this.items = data;
      }
    }).then(() => {
      this.getNotifs();
    });
  }

  cacheNotifications(notificationListing) {
    this.storage.get(this.componentsProvider.notificationCacheId).then(data => {
      if (data) {
        console.log('Updating cached data.');
        let currentCacheData = data;
        let newCacheData = notificationListing;

        newCacheData.forEach(notification => {
          currentCacheData.push(notification);
        });

        // Set updated cache.
        this.storage.set(this.componentsProvider.notificationCacheId, currentCacheData);
      }
      else {
        console.log('Setting notification cache.');
        this.storage.set(this.componentsProvider.notificationCacheId, notificationListing);
      }
    });
  }

  
async confirmMessage(type?){
  if(type == 1){
    let alert =  await this.alertCtrl.create({
      /*  title: "Logout", */
      mode: "md",
       message: "Are you sure you want to clear your notification? This cannot be undone. ",
       buttons: [
         
         {
           text: "cancel",
           role: "cancel"
         },
         {
  
          text: "YES",
          handler: () => {
           this.clearNotif();
          }
        },
       ]
     });
     alert.present();
  }else{
    let alert =  await this.alertCtrl.create({
      /*  title: "Logout", */
      mode: "md",
       message: "Are you sure you want to mark all your notification as read? ",
       buttons: [
         
         {
           text: "cancel",
           role: "cancel"
         },
         {
  
          text: "YES",
          handler: () => {
           this.markAllAsRead();
          }
        },
       ]
     });
     alert.present();
  }
 
 }


  async getNotifs(refresher?, infiniteScroll?) {
    this.progressBar.start();
    await this.notificationsProvider.getNotifications(this.currentPage).then(res => {
      if (res["error"] == 0) {
        console.log("get notif: ",res)
        if (infiniteScroll) {
          this.items = this.items.concat(res["datas"]);
          this.cacheNotifications(this.items);
        } else {
          this.items = res["datas"];
          this.cacheNotifications(res['datas']);
        }
        this.total_items = res["total_count"];
        console.log('Notifications: ', this.items);
      }
      else {
        console.log('Error on pulling notifications: ', res);
        this.componentsProvider.showToast('Cannot get new notifications right now.');
      }

      if (infiniteScroll) {
        infiniteScroll.target.complete();
      }

      if (refresher) {
        refresher.target.complete();
      }
      this.progressBar.complete();
    }).catch(ex => {
      console.log('Error pulling notifications: ', ex);
      this.componentsProvider.showToast('Cannot get new notifications right now.');
    });
    this.isLoaded = true
  }
  ionViewDidLeave(){
    this.progressBar.complete();
  }

  getMomentFormat(stamp) {
    if (this.platform.is('ios')) {
      return (this.componentsProvider.getTimestampFormat(stamp, 'YYYY-MM-DD hh:mm:ss'));
      // return (this.componentsProvider.getMomentFormat(stamp, 'MM/DD/YYYY HH:MM:SS'));
    }
    else {
      return (stamp);
    }
  }

  doSomething(data, position?) {
    // Mark this notification as read.
    console.log('This notification\'s position: ', position);
    console.log('Incoming data: ', data, 'Notification data from array: ', this.items[position]);

    if (data.type == "connect_to") {
      this.gotoProfile(data);
    }

    if (data.type == "approved_stylist"){
      this.navCtrl.pop().then(() => {
        let navigateExtras:NavigationExtras = {
          state:{
            context: "stylecolumn",
            hideSearch: 'true'
          }
        }
        this.navCtrl.navigateForward(['/discover-inner'], navigateExtras);
      });
    }
    // if (data.type == "connect_to" && data.data != "You are now connected with ") {
    //   this.navCtrl.push(ConnectionRequestsPage);
    // }

    if (data.type == "disconnect" && data.data == " wants to connect with you!") {
      this.gotoConnections();
    }

    if (data.type == 'followed_question' || data.type == 'answer_reply') {
      this.goToStyleColumn(data);
    }
    if (data.type == 'comment_reply') {
      this.goToPost(data);
      // console.log("1",data)
      // this.postsProvider.getPostByIdSingular('id', data.item_id).then( res =>{
      //   console.log("ME", res)
      //   this.postsProvider.getComments('getcomments', data.item_id, 1, 8).then( comments =>{
      //     console.log("Comments", comments)
      //   })
      // })
      // this.goToCommentTree(data);
    }

    if (data.type == 'liked' || data.type == 'disliked' || data.type == 'post_comment' || data.type == 'post_unpublished' || data.type == 'new_post' || data.type == 'saved_post') {
      this.goToPost(data);
    }
    if(data.type == "approved_question"){
      this.goToStyleColumn(data);
    }

    // if (data.type != "connect_to" && data.type != "approved_stylist" && data.type != 'welcome') {
    //   this.goToPost(data);
    // }

    if (data.type == 'welcome') {
      this.navCtrl.pop();
    }

    if (!data.read_at) {
      this.markAsRead(data, position);
    }
    else {
      console.log('Notification is already read.');
    }
  }

  gotoProfile(item) {
    console.log("ITEM", item)
    if (this.profileInfo.id == item.user_id) {
      this.events.publish("changeTab", 1);
    } else { 
      this.getProfileInfo(item.item_id)
    }
  }



  gotoConnections() {
    let navigateExtras:NavigationExtras={
      state: {
        type: "connections"
      }
    }
    this.navCtrl.navigateForward(['/connection-request2'],navigateExtras);
  }

  goToCommentTree(data){
    let navigationExtras : NavigationExtras ={
      state:{
        commentTree: data,
        profile: this.profileInfo
      }
    }
    this.navCtrl.navigateForward('/comment-tree', navigationExtras)
  }


  goToStyleColumn(questionData) {
    let params = {
      context: 'notifications',
      data: questionData
    }
    let navigationExtras : NavigationExtras ={
      state:{
        context: 'notifications',
        data: questionData
      }
    }
    this.navCtrl.navigateForward('/style-column', navigationExtras)

    // const styleColumnFromNotificationsModal = this.modalCtrl.create(StyleColumnPage, params);
    // styleColumnFromNotificationsModal.present();
  }
  state = true;
  async goToPost(item) {
    let loader = await this.loadingCtrl.create({
      message: 'Almost there...'
    });
    loader.present();
    if (this.state) {
      this.state = false;
      this.postsProvider
        .getPostsById(item.item_id)
        .then(res => {
          if (res["error"] == 0) {
            let navigationExtras:NavigationExtras={
              state:{item: res['datas']}
            }
            this.navCtrl.navigateForward(['/post-detail'],navigationExtras);
            loader.dismiss();
            // let postFromNotificationsModal = this.modalCtrl.create(PostDetailsPage, {item: res['datas']});
            // postFromNotificationsModal.present();
          } else {
            let navigationExtras:NavigationExtras={
              state:{error: true}
            }
            this.navCtrl.navigateForward(['/post-detail'],navigationExtras);
            loader.dismiss();
            // this.navCtrl.push(PostDetailsPage, {
            //   error: true
            // });

            // let postErrorFromNotificationsModal = this.modalCtrl.create(PostDetailsPage, {error: true});
            // postErrorFromNotificationsModal.present();
          }
        })
        .then(() => {
          this.state = true;
          this.progressBar.complete();
        });
    }
  }

  async markAsRead(data, position?) {
    let notifData = {
      notifId: data['id']
    }
    await this.notificationsProvider.markNotificationAsRead('readat', notifData).then(response => {
      if (response['error'] == 0) {
        console.log(response);
        this.items[position]['read_at'] = true;
      }
      else {
        console.log('Error marking this notification as read: ', response);
      }
    }).catch(ex => {
      console.log('Error marking this notification as read: ', ex);
    });
  }

  async markAllAsRead() {
    let userId;
    let loader = await this.loadingCtrl.create({
      message: 'Processing...'
    });
    loader.present();
    this.storage.get('user').then(async (res:any)=>{
      userId = res.id;
      console.log(userId);
      let data = {
        user_id: userId
      }
     
      await this.notificationsProvider.markAllNotificationAsRead('readallat', data).then(async response => {
        if (response['error'] == 0) {
          if(response['status'] == true){
            let options;
            options = {
              animated:true,
              message: response['message'],
              position: 'top',
              mode: 'ios',
              duration: 5000
            }
           let toast = await this.toastCtrl.create(options);
            this.events.publish('notifications-page-opened');
            this.getNotifs();
            loader.dismiss();
            toast.present();
            this.getNotifs();
          }else{
            let options;
            options = {
              animated:true,
              message: response['message'],
              position: 'top',
              mode: 'ios',
              duration: 5000
            }
            let toast = await this.toastCtrl.create(options);
            this.events.publish('notifications-page-opened');
            loader.dismiss();
            toast.present();
            this.getNotifs();
          }
        }
        else {
          console.log('Error marking this notification as all read: ', response);
        }
      }).catch(ex => {
        console.log('Error marking this notification as all read: ', ex);
      });
    });
  }


  async clearNotif() {
    let userId;
    let loader = await this.loadingCtrl.create({
      message: 'Processing...'
    });
    loader.present();
    this.storage.get('user').then(async (res:any)=>{
      userId = res.id;
      console.log(userId);
      let data = {
        user_id: userId
      }
     
      await this.notificationsProvider.clearNotification('clearnotif', data).then(async response => {
        if (response['error'] == 0) {
          if(response['status'] == true){
            let options;
            options = {
              animated:true,
              message: response['message'],
              position: 'top',
              mode: 'ios',
              duration: 5000
            }
           let toast = await this.toastCtrl.create(options);
            this.events.publish('notifications-page-opened');
            loader.dismiss();
            toast.present();
            this.getNotifs();
          }else{
            let options;
            options = {
              animated:true,
              message: response['message'],
              position: 'top',
              mode: 'ios',
              duration: 5000,
            }
            let toast = await this.toastCtrl.create(options);
            this.events.publish('notifications-page-opened');
            this.getNotifs();
            loader.dismiss();
            toast.present();
            this.getNotifs();
          }
        }
        else {
          console.log('Error marking this notification as all read: ', response);
        }
      }).catch(ex => {
        console.log('Error marking this notification as all read: ', ex);
      });
    });
  }



  acceptUser(user_id, value) {
    this.events.publish("user-accepted");

    if (this.state) {
      this.state = false;
      this.userProvider
        .acceptRequest(user_id, value)
        .then(response => {
          if (response["error"] == 0) {
            console.log(response);
          } else {
            console.log("Error accepting request (if-else): ", response);
          }
          this.state = true;
        })
        .catch(ex => {
          console.log("Error accepting request: ", ex);
          this.state = true;
        });
    }
  }

  connectUser(id) {
    this.friendsProvider.save({ friendId: id }).then(result => {
      if (result["error"] == 0) {
        this.componentsProvider.showToast(result["message"]);
        this.events.publish("refresh-main-profile-feed");
        this.events.publish("refresh-home-feed");
      }
    });
  }
  doRefresh(refresher: any) {
    this.progressBar.start();
    this.currentPage = 1;
    if (this.refresherRef) {
      this.refresherRef.disabled = false;
    }
    this.getNotifs(refresher);
  }

  doInfinite(infiniteScroll: any) {
    this.currentPage += 1;
    this.refresherRef = infiniteScroll;
    console.log("items/length", this.items.length)
    console.log("total_items", this.total_items)
    if (this.items.length < this.total_items) {
      console.log("items/length")
      console.log("IF")
      this.getNotifs(false, infiniteScroll);
    } else {
      console.log("ELSE")
      infiniteScroll.disabled;
      this.endText = true
      infiniteScroll.target.complete();
    }
  }
  back(){
    this.navCtrl.navigateBack('/tabs/tabs/dashboard');
  }

  async getProfileInfo(userId) {
    let loader = await this.loadingCtrl.create({
      message: 'Almost there...'
    });
    loader.present();
    this.userService.getProfileInfo(userId).then(async (res: any) => {
      if (res.error == 0) {
        console.log(res.userinfo)
        this.info = res.userinfo
        // let navigateExtras:NavigationExtras={
        //   state:{
        //     // otherUser: {
        //     //   id: item.owner_user_id,
        //     //   profile_about: "",
        //     //   otherUser: item
        //     //   // profile_first_name: item.user_first_name,
        //     //   // profile_last_name: item.user_last_name,
        //     //   // profile_profile_pic: item.user_profile_photo
        //     // },
        //     status: this.info,
        //     otherUser: this.info
        //   }
        // }
        // this.navCtrl.navigateForward(['/my-stylin'],navigateExtras );
        let navigationExtras : NavigationExtras = {
          state:{
            otherUser: this.info,
            status: this.info
          }
        }
        this.navCtrl.navigateForward(['tabs/tabs/my-stylin'],navigationExtras);
        loader.dismiss();
      }else{
        loader.dismiss();
        let alert = await this.alertCtrl.create({
          message: 'Something went wrong'
        });
        alert.present();
      }
    });
  }
}
