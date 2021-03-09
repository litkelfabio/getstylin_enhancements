import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { NavController, IonRefresher,IonImg } from '@ionic/angular';
import { UserService } from 'src/app/services/user/user.service';
import { NgProgressComponent } from 'ngx-progressbar';
import { ComponentsService } from 'src/app/services/components/components.service';
import { Storage} from '@ionic/storage';
import {NavigationExtras, ActivatedRoute, Router}from '@angular/router';
import { IonRouterOutlet } from '@ionic/angular';
@Component({
  selector: 'app-inner-connection-request',
  templateUrl: './inner-connection-request.page.html',
  styleUrls: ['./inner-connection-request.page.scss'],
})
export class InnerConnectionRequestPage implements OnInit {
  @ViewChild(NgProgressComponent) progressBar: NgProgressComponent;
  @ViewChild("refresherRef") refresherRef: IonRefresher;
  @ViewChild("image", {static: false}) imageDash: IonImg;
  img = "https://getstylin.com/public/deploy1599536530/images/lns/sb/L2ltYWdlcy91cGxvYWRzL3Byb2ZpbGVwaWMvMTQ3/type/toheight/height/500/allow_enlarge/0/1582504925_yw456vuwtejxiqxwok56.jpg";
  profileInfo: any = [];
  rankBackground: any;
  rankText: any;
  rankClass: any;
  rankIcon: any;
  points: any;
  isLoaded = false;
  save: any;
  blockedBy: any;
  isBlocked: any;
  profile_about: any;
  stylist: any;
  profile_profile_pic: any;
  profile_first_name: any;
  item: any;
  fromMyStylin: any;
  otherUser :any;
  otherUser2: any;
  otherUserFromInner: any;
  profileInfo2: any;
  fromStorage: any = 0;
  errorImage =false
  type: any;
  // For refresher
  userId: any;
  isLoad=false;
  constructor(
    private navCtrl: NavController,
    private componentsProvider: ComponentsService,
    private storage: Storage,
    private userProvider: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private routerOutlet: IonRouterOutlet,

  ) { 
    // this.dataSource.serviceData.subscribe(data=>{
    //   console.log("inner-connection-request: ",data);
    //   this.otherUser = data["otherUser"] ? data["otherUser"]: null;
    // });
    this.route.queryParams.subscribe((params: any) => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.profileInfo = this.router.getCurrentNavigation().extras.state.profileInfo;
        // if(this.profileInfo){
        //   this.profileInfo2 = this.profileInfo
        // }
        console.log("PROFILE: ", this.profileInfo2)
        this.otherUser = this.router.getCurrentNavigation().extras.state.status;
        console.log("SINO KA: ", this.otherUser)
        this.otherUser2 = this.router.getCurrentNavigation().extras.state.otherUser;
        // this.otherUser = this.otherUser2
        this.type = this.router.getCurrentNavigation().extras.state.type ? this.router.getCurrentNavigation().extras.state.type : null;
        this.otherUserFromInner = this.router.getCurrentNavigation().extras.state.otherUser2 ? this.router.getCurrentNavigation().extras.state.otherUser2 : null;
        console.log("iKAW:", this.otherUserFromInner)
        this.fromMyStylin = this.router.getCurrentNavigation().extras.state.fromMyStylin ? this.router.getCurrentNavigation().extras.state.fromMyStylin : false;
      }
      if (this.otherUser) {
        // Retrieve cached data first before requesting for a new copy.
        console.log("otherUser", this.otherUser);
        var cacheId = this.componentsProvider.userProfileCacheId + this.otherUser['id'];
        this.storage.get(cacheId).then((data: any) => {
          console.log("this.storage.get", data);
          if (data) {
            this.profileInfo = data;
            this.userId = this.otherUser['id'];
            this.getPoints(); // We still get the points here since it is not included in the cache.
            console.log("points: ", this.points);
          }
          else {
            this.profileInfo = this.otherUser;
            this.userId = this.otherUser['id'];
            this.getPoints();
            this.getProfileInfo(this.userId);
          }
        });
      }
      else {
        this.getStorageUser();
      }
  
      console.log('Profile Info on enter: ', this.profileInfo);
    });
    this.getDataFromOtherSide();
  }

  ngOnInit() {
    this.routerOutlet.swipeGesture = false;
  }
  
  back(){
    // console.log("HEYYYY", this.profileInfo)
     this.navCtrl.back();
    // if(this.profileInfo2){
    //   if(this.fromMyStylin){
    //     console.log("fromMyStylin", this.fromMyStylin)
    //     console.log("ANO? :", this.profileInfo2)
    //     let navigationExtras: NavigationExtras = {
    //       state: {
    //         type: "connections",
    //         otherUser: this.otherUser,
    //         otherUserFromInner : this.otherUserFromInner,
    //         profileInfo: this.profileInfo2,
    //         msg: 'own connection'
    //       }
    //     };
    //     this.navCtrl.navigateBack(['/tabs/tabs/dashboard/my-stylin/connection-requests'],navigationExtras);
    //   }else{
    //     this.navCtrl.back();
    //   }
    // }else{
    //   if(this.fromMyStylin){
    //     let navigationExtras: NavigationExtras = {
    //       state: {
    //         type: "connections",
    //         otherUser: this.otherUser,
    //         otherUserFromInner : this.otherUserFromInner,
    //         profileInfo: this.profileInfo
    //       }
    //     };
    //     this.navCtrl.navigateBack(['/tabs/tabs/dashboard/my-stylin/connection-requests'],navigationExtras);
    //   }else{
    //     this.navCtrl.back();
    //   }
    // }
  }
  ionViewDidEnter() {
    // if (this.otherUser) {
    //   // Retrieve cached data first before requesting for a new copy.
    //   var cacheId = this.componentsProvider.userProfileCacheId + this.otherUser['id'];
    //   this.storage.get(cacheId).then(data => {
    //     if (data) {
    //       this.profileInfo = data;
    //       this.userId = this.otherUser['id'];
    //       this.getPoints(); // We still get the points here since it is not included in the cache.
    //       console.log("points: ", this.points);
    //     }
    //     else {
    //       this.profileInfo = this.otherUser;
    //       this.userId = this.otherUser['id'];
    //       this.getPoints();
    //       this.getProfileInfo(this.userId);
    //     }
    //   });
    // }
    // else {
    //   this.getStorageUser();
    // }

    // console.log('Profile Info on enter: ', this.profileInfo);
  }


  async getDataFromOtherSide(){
    if (this.otherUser) {
      // Retrieve cached data first before requesting for a new copy.
      var cacheId = await this.componentsProvider.userProfileCacheId + this.otherUser.id;
       await this.storage.get(cacheId).then(async data => {
        if (data) {
          this.profileInfo = data;
          this.userId = this.otherUser['id'];
          await this.getPoints(); // We still get the points here since it is not included in the cache.
          console.log("points: ", this.points);
          // this.getProfileInfo(this.userId);
        }else { 
          this.profileInfo = this.otherUser;
          this.userId = this.otherUser['id'];
          await this.getPoints();
          await  this.getProfileInfo(this.userId);
        }
        console.log('Profile Info on enter: ', this.profileInfo);
      }).catch(data=>{
      });
    }
    else {
      this.getStorageUser();
      // this.profileInfo = this.otherUser;
    }

    console.log('Profile Info on enter: ', this.profileInfo);
  }
  getStorageUser(refresher?) {
    if (refresher) {
      refresher.target.complete();
      this.getProfileInfo(this.userId);
      
    }
    else {
      // this.storage.get("user").then(user => {
      //   this.profileInfo = user;
      //   this.userId = user.id;
      //   this.progressBar.complete();
      //   this.getPoints();
      // });
      // this.storage.get("temp-inner").then(user => {
      //   this.profileInfo = user;
      //   this.userId = user.id;
      //   this.fromStorage = 2;
      //   this.progressBar.complete();
      //   this.getPoints();
      // });
    }
  }
  ionViewDidLeave(){
    this.storage.set('temp-inner', this.profileInfo);
  }

  gotoDetails(item) {

  }

  checkBackground() {
    if (this.points <= 5000) {
      // this.rankBackground = "rank-rising_star";
      this.rankText = 'Rising Star';
      this.rankClass = 'rising_star';
      // this.rankIcon = 'custom-rank';
    } else if (this.points >= 5001 && this.points <= 15000) {
      this.rankText = 'Superstar';
      this.rankClass = 'super_star';
      // this.rankBackground = "rank-super_star";
      // this.rankIcon = 'custom-superstar-icon';
    } else if (this.points >= 15001 && this.points <= 20000) {
      this.rankText = 'Icon';
      this.rankClass = 'icon';
      // this.rankBackground = "rank-icon";
      // this.rankIcon = 'custom-iconic-icon';
    } else if (this.points >= 20001) {
      this.rankText = 'Legend';
      this.rankClass = 'legend';
      // this.rankBackground = "rank-legend";
      // this.rankIcon = 'custom-legends-icon';
    }
  }

  // Get points

  async getPoints() {
    await this.userProvider.getUserPoints(false, this.userId).then(response => {
      if (response['error'] == 0) {
        this.points = response['points'];
        this.checkBackground();
        console.log("points: ",this.points);
      }
      else {
        console.log('Error getting user points: ', response);
        this.points = 0;
        this.rankText = 'Rising Star';
      }
    }).catch(ex => {
      console.log('Error getting user points: ', ex);
      this.points = 0;
      this.rankText = 'Rising Star';
    }).then(() => {
      this.isLoaded = true;

      // Preload the rewards cache, but only yours.
      if (!this.otherUser) {
        let rewardsCacheId = "rewards-" + this.userId;
        this.storage.get(rewardsCacheId).then(data => {
          if (data) {
            if (data['rank'] != this.rankText) {
              this.userProvider
                .getRewards("rewards")
                .then(response => {
                  if (response["error"] == 0) {
                    let userPoints = parseInt(this.points);
                    let lastKnownRank = this.rankClass;
                    let progressData = response["datas"];
                    this.storage.set(rewardsCacheId, {
                      points: userPoints,
                      rank: lastKnownRank,
                      rewards: progressData
                    });
                  }
                })
                .catch(getTierRewardsError => {
                  console.log(
                    "Error getting privileges: ",
                    getTierRewardsError
                  );
                });
            }
            else {
              console.log('Rewards in cache; not getting new data.');
            }
          }
          else {
            this.userProvider
              .getRewards("rewards")
              .then(response => {
                if (response["error"] == 0) {
                  let userPoints = parseInt(this.points);
                  let lastKnownRank = this.rankClass;
                  let progressData = response["datas"];
                  this.storage.set(rewardsCacheId, {
                    points: userPoints,
                    rank: lastKnownRank,
                    rewards: progressData
                  });
                }
              })
              .catch(getTierRewardsError => {
                console.log("Error getting privileges: ", getTierRewardsError);
              });
          }
        });
      }
    });
  }

  // This will now simply work to get the full profile information of the user.
  // All initial data shown by the page will be carried over from the parameter passed.
  getProfileInfo(userId, refresher?) {
    this.userProvider.getProfileInfo(userId).then(res => {
      if (res["error"] == 0) {
        console.log('Get Full Profile Info: ', res);
        this.profileInfo = res["userinfo"];
        this.userId = this.profileInfo["id"];

        /*
          Since the user's own profile is already in cache,
          we will only cache profile details of other users.
        */
        if (this.otherUser) {
          let cacheId = this.componentsProvider.userProfileCacheId + this.userId;
          this.cacheProfileData(cacheId, res['userinfo']);
        }
      }
      else {
        // Retrieve cached profile data if ever this returns an error.
        console.log('Error getting full profile info: ', res);
        var cacheId = this.componentsProvider.userProfileCacheId + this.userId;
        this.storage.get(cacheId).then(data => {
          if (data) {
            this.profileInfo = data;
            this.userId = this.profileInfo['id'];
          }
        });
      }
      this.progressBar.complete();
    }).catch(ex => {
      // Retrieve cached profile data if ever this returns an error.
      console.log('Error requesting full profile info: ', ex);
      var cacheId = this.componentsProvider.userProfileCacheId + this.userId;
      this.storage.get(cacheId).then(data => {
        if (data) {
          this.profileInfo = data;
          this.userId = this.profileInfo['id'];
        }
      });
    });

    if (refresher) {
      refresher.target.complete();
    }
  }

  cacheProfileData(cacheId, cacheData) {
    this.storage.get(cacheId).then(data => {
      if (data) {
        console.log('Updating profile cache for: ', cacheId);
        this.storage.set(cacheId, cacheData);
      }
      else {
        console.log('Creating profile cache for: ', cacheId);
        this.storage.set(cacheId, cacheData);
      }
    });
  }

  regexPoints(points) {
    return this.componentsProvider.separatePoints(points);
  }

  doRefresh(refresher?) {
    this.isLoaded = false;
    this.progressBar.start();
    this.getPoints();

    if (this.otherUser) {
      this.getProfileInfo(this.userId, refresher);
    } else {
      this.getStorageUser(refresher); 
    }
  }

  // Add a context before passing off to the main profile view.
  gotoMainProfile(context?) {
    // this.dataSource.changeData({
    //   otherUser: this.otherUser,
    //   context: context,
    //   points: this.points, 
    //   rank: this.rankBackground,
    //   status: this.profileInfo
    // });
    console.log("HOY: ", this.profileInfo) 
    let navigationExtras: NavigationExtras = {
      state: {
        otherUser: this.profileInfo,
        context: context,
        points: this.points,
        rank: this.rankBackground,
        status: this.profileInfo,
        fromInnerConnection: true,
        type: this.type
        // otherUser2 : this.otherUser2,
        // profileInfo2: this.profileInfo2
      }
    };
    this.navCtrl.navigateForward(['/tabs/tabs/my-stylin'],navigationExtras);
  }

  // trustResource(url) {
  //   return (this.sanitizer.bypassSecurityTrustResourceUrl(url));
  // }
  errorLoad(profileInfo){
    profileInfo.errorImage = true
    profileInfo.isLoad = true;
    // this.imageDash.src = "/assets/css/imgs/empty-states/fallback.svg";
  }
  // imgLoad(profileInfo){
  //   profileInfo.isLoad = true;
  // }
  // ngAfterViewInit() {
  //   this.imageDash = this.profileInfo.profile_profile_pic;
  //  }
   back2(){
     console.log("back2")
     this.navCtrl.navigateBack('/tabs/tabs/my-stylin');
   }
   isLoadedImg(){
    this.isLoad = true;
   }
}
