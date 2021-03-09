import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, ActivatedRoute, Router } from '@angular/router';
import { NavController, Platform, LoadingController,IonImg  } from '@ionic/angular';
import { ComponentsService } from 'src/app/services/components/components.service';
import { EventsService } from 'src/app/services/events.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-connection-request2',
  templateUrl: './connection-request2.page.html',
  styleUrls: ['./connection-request2.page.scss'],
})
export class ConnectionRequest2Page implements OnInit {
  @ViewChild("image", {static: false}) imageDash: IonImg;
  users: any;
  total_users: any;
  currentPage: number = 1;
  infiniteScroll: any;
  show: any;
  isLoaded: any;
  isNotified: any = false;
  constructor(
    public navCtrl: NavController,
    private userService: UserService,
    private componentService: ComponentsService,
    private events: EventsService,
    private platform : Platform,
    private loading :LoadingController,
    private route: ActivatedRoute,
    private router: Router,
  ) { 

    this.route.queryParams.subscribe((params: any) => {
      if(params && params.state){
        let param = JSON.parse(params.state);
        if (param) {
          this.isNotified = param.isNotified;
        }
      }
      if(this.router.getCurrentNavigation().extras.state){
        this.isNotified = this.router.getCurrentNavigation().extras.state.isNotified;
      }
    });
  }

  ngOnInit() {
    this.getRequests();
  }
  back(){
    if(this.isNotified){
      this.navCtrl.navigateRoot('/tabs/tabs/my-stylin');
      this.events.publish("refresh-main-profile-feed");
    }else{
      this.navCtrl.navigateRoot('/tabs/tabs/my-stylin');
      this.events.publish("refresh-main-profile-feed");
    }

    

    // this.events.publish('refresh-main-profile-feed-get-connection-list');
  }

  doRefresh(event) {

  }

  doInfinite(event) {
    
  }
  goToProfile(user) {
    // console.log(user);
    // this.navCtrl.popToRoot().then(() => {
    //   this.navCtrl.push(MainProfilePage, {
    //     otherUser: {
    //       id: user.userId,
    //     },
    //     status: user
    //   });
    // });
    console.log("USERRR: ",user)
      let navigationExtras : NavigationExtras = {
        state:{
          otherUser:{ id:user.userId},
          status: user,
          isPending: true,
        }
      }
      this.navCtrl.navigateForward(['/my-stylin'],navigationExtras);
    
  }

  async connectUser(user, value) {
    let messageConnect;
    if (value == 1) {
      user.accepted = 1;
      messageConnect = "Accepting please wait...";
    } else if (value == 2) {
      user.accepted = 2;
      messageConnect = "Ignoring please wait...";
    }
    const loader = await this.loading.create({
      message: messageConnect
    });
    if (value == 1) {
      let data = {
        userId: user.userId,
        accepted: value
      }
      loader.present();
      this.events.publish('user-accepted');
      this.events.publish('stylist-tab-opened', null);
      this.events.publish('has-friend-requests', null);
      this.userService.acceptRequest2('accept', data).then(response => {
        if (response['error'] == 0) {
          console.log(response);

          this.events.publish('refresh-main-profile-feed');
          this.getRequests();
          loader.dismiss();
        }
        else {
          console.log('Error accepting request (if-else): ', response);
        }
      }).catch(ex => {
        console.log('Error accepting request: ', ex);
      });
    }
    else if (value == 2) {
      let data = {
        userId: user.userId,
        accepted: 0
      }
      loader.present();
      this.events.publish('user-accepted');
      this.userService.acceptRequest2('accept', data).then(response => {
        if (response['error'] == 0) {
          console.log(response);
          this.getRequests();
          loader.dismiss();
        }
        else {
          console.log('Error ignoring request: ', response);
        }
      }).catch(ex => {
        console.log('Error ignoring request: ', ex);
      });
    }
    else {
      console.log('Ignored or invalid param detected.');
    }
  };

  getRequests(refresher?, infiniteScroll?) {
    this.isLoaded = false;
    // this.ngProgress.start();
    this.userService.getFriendRequest(this.currentPage, 8).then(res => {
      if (res["error"] == 0) {
        this.users = res["datas"];
        this.total_users = res["total_count"];
        this.isLoaded = true;
      } else {
        this.users = null;
        this.total_users = null;
      }

      console.log(this.users.length, this.users);
      // this.ngProgress.done();
    }).catch(ex => {
      console.log('Error getting requests: ', ex);
      this.componentService.showToast('Cannot get requests at this time. Please try again.');
    }).then(() => {
      // this.ngProgress.done();
    });

    if (refresher) {
      refresher.complete();
    }

    if (infiniteScroll) {
      infiniteScroll.complete();
    }
  }
  errorLoad(item){
    console.log("erorr")
    console.log(this.imageDash.src)
    item.errorImage = true;
    this.imageDash.src = "/assets/css/imgs/empty-states/no-user-photo.png";
  }

}
