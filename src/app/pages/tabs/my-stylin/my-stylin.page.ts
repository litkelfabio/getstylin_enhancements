import { AfterViewInit, Component, OnInit,ViewChild, NgZone } from '@angular/core';
import {  MenuController, NavController, ModalController,IonRefresher, LoadingController, AlertController,IonImg, Platform} from '@ionic/angular';
import { PostService } from './../../../services/post/post.service';
import { Storage } from "@ionic/storage";
import { NgProgress,NgProgressComponent} from "ngx-progressbar";
import { ComponentsService } from '../../../services/components/components.service'
import { UserService } from './../../../services/user/user.service';
import { NotificationService } from './../../../services/notification/notification.service';
import { DatasourceService } from 'src/app/services/datasource/datasource.service';
import { EventsService } from 'src/app/services/events.service';
import {NavigationExtras, ActivatedRoute, Router}from '@angular/router';
import { NgxMasonryComponent, NgxMasonryOptions } from "ngx-masonry";
import { ChatService } from 'src/app/services/chat/chat.service';
import _ from 'lodash';
import { MessageModalComponent } from 'src/app/components/modals/message-modal/message-modal.component';
import { BlockedService } from 'src/app/services/blocked/blocked.service';
import { FriendService } from 'src/app/services/friend/friend.service';
import { MutedService } from 'src/app/services/muted/muted.service';
// import { userInfo } from 'os';
// import { LikesDislikesComponent } from 'src/app/components/modals/likes-dislikes/likes-dislikes.component';
@Component({
  selector: 'app-my-stylin',
  templateUrl: './my-stylin.page.html',
  styleUrls: ['./my-stylin.page.scss'],
})
export class MyStylinPage implements OnInit {
  
  @ViewChild(NgProgressComponent) progressBar: NgProgressComponent;
  @ViewChild("refresherRef") refresherRef: IonRefresher;
  @ViewChild("image", {static: false}) imageDash: IonImg;
  @ViewChild(NgxMasonryComponent) masonry: NgxMasonryComponent;
  // img = "https://getstylin.com/public/deploy1599536530/images/lns/sb/L2ltYWdlcy91cGxvYWRzL3Byb2ZpbGVwaWMvMTQ3/type/toheight/height/500/allow_enlarge/0/1582504925_yw456vuwtejxiqxwok56.jpg";
  errorProfile = false;
  isLoaded = false;
  userAccount:any;
  profileInfo: any = [];
  rankBackground: any;
  //status: any=[];
  items: any = [];
  convos: any;
  currentPage: number = 1;
  lastOpenedThread: any; 
  isFaulted: boolean = false;
  pageIsLoading: boolean = true;
  totalItems: number = 0;
  page: number = 1;
  totalPages: number = 0;
  limit: number = 10;
  otherUser: any;
  item: any;
  otherUser2: any;
  profileInfo2: any;
  points: any;
  isBlocked = false;
  isPending: boolean = false;
  blockedMe: boolean = false;
  isLoadedProfile =false;
  userState: any;
  fromInnerConnection: any;
  fromNotif: any;
  isBeingDetermined: boolean = true;
  tempOtherUser:any;
  faveItems: any = [];
  type: any;
  pointsPassed: any;
  context: any;
  rank: any;
  hasRequests:any;
  requestCount:any;
  activeContext = "posts";
  areFavesLoaded:boolean = false;
  status: any;
  fromOtherConnections: any;
  isDiscovery:any;
  isDiscoverySearch:any;
  otherUserPoints: any;
  public masonryOptions: NgxMasonryOptions = {
    originLeft: true,
    gutter: 10,
    resize: true,
    initLayout: true,
    columnWidth: ".grid-sizer",
    itemSelector: ".grid-item",
    percentPosition: true,
    fitWidth: true
  };
  isMasornyisLoaded: boolean = false;
  pop : any;

  constructor(
    private menuCtrl: MenuController,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private route :ActivatedRoute,
    private postService: PostService,
    private storage: Storage,
    private ngProgress: NgProgress,
    private componentsService: ComponentsService,
    private userService: UserService,
    private notificationService: NotificationService,
    private dataSource: DatasourceService,
    private events: EventsService,
    private notificationsProvider : NotificationService,
    private router : Router,
    private chatService: ChatService,
    private blockedService: BlockedService, 
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private friendService: FriendService,
    private muteService: MutedService,
    private platform: Platform,
    private _zone: NgZone,
  ) {
    this.events.subscribe("refresh-main-profile-feed", () =>{
      this.progressBar.start();
      this.ionViewDidEnter();
      // this.getFavoritePosts();
      this.progressBar.complete();
    });
    this.events.subscribe("refresh-main-profile-feed-get-connection-list", () =>{
      this.doRefresh();
    });
    //    this.platform.backButton.subscribeWithPriority(0, () => {
    //   console.log('Back button to dashboard!');
    //   this.navCtrl.back();
    // });
    this.events.subscribe('reload-masonry', () =>{
      this.masonry.reloadItems();
      this.masonry.layout();
    })
    // this.dataSource.serviceData.subscribe(data=>{
    //   console.log("my-stylin: ",data);
    //   this.otherUser = data["otherUser"] ? data["otherUser"] : null;
    //   this.item = data["item"] ? data["item"] : null;
    //   this.context = data["context"] ? data["context"] : null;
    //   this.pointsPassed = data["points"] ? data["points"] : null;
    //   this.rank = data["rank"] ? data["rank"] : null;
    //   this.userState = data["status"] ? data["status"] : null;
    // });
   

    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.profileInfo2 = this.router.getCurrentNavigation().extras.state.profileInfo2 ? this.router.getCurrentNavigation().extras.state.profileInfo2 : null;
        // console.log("PROFILE: ", this.profileInfo2)
        this.rankBackground = this.router.getCurrentNavigation().extras.state.rank ? this.router.getCurrentNavigation().extras.state.rank : null;
        this.points = this.router.getCurrentNavigation().extras.state.points ? this.router.getCurrentNavigation().extras.state.points : null;
        this.otherUser = this.router.getCurrentNavigation().extras.state.otherUser;
        this.fromNotif = this.router.getCurrentNavigation().extras.state.fromNotif ? this.router.getCurrentNavigation().extras.state.fromNotif: null;
        // if(this.fromNotif){
        //   this.getProfileInfo(this.fromNotif["item_id"]);
        //   console.log("1", this.fromNotif , "2", this.fromNotif["item_id"])
        // }
        // console.log("PROFILE: ", this.otherUser)
        // if(this.otherUser){
        //   this.profileInfo = this.otherUser
        //   this.getProfileInfo(this.otherUser["id"]);
        //   this.getFriendRequests();
        // }
        this.type = this.router.getCurrentNavigation().extras.state.type ? this.router.getCurrentNavigation().extras.state.type : null;
        if(this.type !=null){
          // 
            this.profileInfo = this.otherUser
            this.getProfileInfo(this.otherUser["id"]);
            this.getFriendRequests();
          }
        this.item = this.router.getCurrentNavigation().extras.state.item;
        this.context = this.router.getCurrentNavigation().extras.state.context;
        this.pointsPassed = this.router.getCurrentNavigation().extras.state.points;
        this.rank = this.router.getCurrentNavigation().extras.state.rank;
        this.userState = this.router.getCurrentNavigation().extras.state.status;
        this.otherUser2 = this.router.getCurrentNavigation().extras.state.otherUser2
        // console.log("OtherUser2: ", this.otherUser2)
        // if(this.fromOtherConnections){
          this.fromOtherConnections = this.router.getCurrentNavigation().extras.state.fromOtherConnections ? this.router.getCurrentNavigation().extras.state.fromOtherConnections : false;
          console.log(this.fromOtherConnections)
          // console.log("fromOtherConnections", this.fromOtherConnections);
        // }
        // if(this.fromInnerConnection){
          this.fromInnerConnection = this.router.getCurrentNavigation().extras.state.fromInnerConnection ? this.router.getCurrentNavigation().extras.state.fromInnerConnection : false;
        // }
        this.isPending = this.router.getCurrentNavigation().extras.state.isPending ? this.router.getCurrentNavigation().extras.state.isPending : false;
        this.pop = this.router.getCurrentNavigation().extras.state.pop ? this.router.getCurrentNavigation().extras.state.pop : false;
        this.isDiscovery = this.router.getCurrentNavigation().extras.state.isDiscovery ? this.router.getCurrentNavigation().extras.state.isDiscovery : false;
        this.isDiscoverySearch = this.router.getCurrentNavigation().extras.state.isDiscoverySearch ? this.router.getCurrentNavigation().extras.state.isDiscoverySearch : false;
          console.log("isDiscovery", this.isDiscovery);
          console.log("isDiscoverySearch", this.isDiscoverySearch);
      }
      this.hasRequests = this.notificationsProvider.hasRequests; // initial values
      this.requestCount = this.notificationsProvider.requestCount; // initial values
      console.log("OTHERUSER ", this.otherUser);
      console.log("USERSTATE ", this.userState);
    });


    this.events.subscribe("requests-updated", data => {
      console.log("Requests updated: adjusting variables accordingly.");
      this.updateNotifications(data);
    });
    this.events.subscribe('refresh-fav', () =>{
      this.getFavoritePosts();
    });

    // Check if a context is passed to the main profile view.
    // This is only done if the main profile view is accessed by
    // tapping on the Favorites button outside the view.
    if (this.context) {
      console.log("context type: ",this.context);
      this.activeContext = this.context;

      // Load Favorites if this view is accessed
      // by tapping the Favorites button.
      if (this.context == "faves") {
        this.isMasornyisLoaded = false
        if (this.otherUser != null) {
          if (!this.otherUser.isBlocked) {
            this.getFavoritePosts(this.otherUser.id);
          } else {
            this.faveItems = [];
          }
        } else {
          this.getFavoritePosts();
        }
        this.isMasornyisLoaded = true
        // flag load
        this.areFavesLoaded = true;
      }
    }

    
    if (this.userState) {
      console.log('User state: ', this.userState);
      this.userState = this.userState;
    }

    
    console.log('Points passed: ', this.pointsPassed);
    this.pointsPassed = parseInt(this.pointsPassed);
    console.log("HOY ", this.otherUser)

  }
  // ngAfterViewInit() {
  //   this.imageDash = this.profileInfo['photo'];
  //  }
  ionViewWillEnter(){
    this.isLoaded = false;
    this.isMasornyisLoaded = false;
  }

  ngOnInit() {
    this.storage.get('user').then(data=>{
      this.userAccount= data;
      console.log(this.userAccount.stylist);
    });
  }
  updateNotifications(data) {
    this.hasRequests = data["hasRequest"];
    this.requestCount = data["requestCount"];
  }
  async getPostById(postId) {
    this.progressBar.start();
    console.log("Getting post: ", postId);
    await this.postService
      .getPostsById(postId)
      .then(response => {
        console.log(response);
        if (response["error"] == 0) {
          let post = response["datas"];
          console.log(post);

          this.gotoDetails(post).then(() => {
            this.progressBar.complete();
          });
        } else {
          console.log("Something went wrong getting post: ", response);
        }
      })
      .catch(ex => {
        console.log("Error getting post: ", ex);
      })
      .then(() => {
        this.progressBar.complete();
      });
      // this.progressBar.start();
  }

  contextSwitcher(context) {
    // Switch context
    this.activeContext = context;

    // Load favorites if favorites are not yet loaded.
    // This is done so that images will only be loaded once per view.
    // To update favorites, a refresher will be provided.

    if (context == "faves" && Object.is(this.areFavesLoaded, false) == true) {
      this.isLoaded = false
      this.isMasornyisLoaded = false;
      // Check if this page is viewed as owner or other user
      if (this.otherUser != null) {
        this.getFavoritePosts(this.otherUser.id);
        this.profileInfo.isLoadedProfile = true;
        this.isLoaded = true
      } else {
        this.getFavoritePosts();
        this.isLoaded = true
      }
      

      // flag load
      this.areFavesLoaded = true;
    }
  } 
  async ionViewDidEnter(){
    this.menuCtrl.enable(true, 'content');
    this.isLoaded = false;
    this.page = 1;
    if (!this.otherUser) {
      await this.storage.get("user").then(user => {
        console.log('GET USER STORAGE', user);
        this.profileInfo = user;
        // if(user.profile_profile_pic != null){
        //   let lastword = user.profile_profile_pic.split("/");
        //   let image = lastword[lastword.length - 1];
        //   if(image == 'google' || image =='facebook'){
        //     this.userService.getUserInfo(user.id);
        //   }
        // }
        this.otherUser= null;
        this.userState =  null;
        // this.getUserInfo(user.id)
        if(user.profile_profile_pic == null){
          this.profileInfo.isLoadedProfile = true;
        }
        this.getPosts(false, true, false);
        this.getPoints();
      });
    }else {
      console.log("ISBLOCKED? ", this.otherUser.isBlocked)
      this.profileInfo = this.otherUser;
      if(this.type == null){
        this.getProfileInfo(this.otherUser["id"]);
        this.getFriendRequests();
        this.getPoints();
      }
    }
    console.error("otherUser: ", this.otherUser)
    this.tempOtherUser = this.otherUser
    console.error("profileInfo: ", this.profileInfo)
    console.error("status: ", this.userState)
    if(this.userState){
      if((this.userState['isFriend'] == 'unconnected' || this.userState['isFriend'] == 'pending')&& this.otherUser){
        this.isMasornyisLoaded = true;
      }
    }
    this.events.subscribe("is-muted", () => {
      this.muteUser(this.otherUser);
    });

    this.events.subscribe("is-blocked", () => {
      this.blockUser(this.otherUser);
      console.log(this.otherUser);
    });
  }
  
  ionViewWillLeave(){
    console.log("otheruser: ", this.otherUser);
    this.otherUser= null;
    this.activeContext = 'posts';
    this.isMasornyisLoaded = false
    this.isLoaded = false
    this.otherUserPoints = null
    // let cacheId = this.componentsService.userPostsCacheId + this.profileInfo['id'];
    // this.storage.remove(cacheId)    // this.progressBar.complete();
  }


  getProfileInfo(userId, refresher?) {
    this.userService.getProfileInfo(userId).then(async (res: any) => {
      if (res.error == 0) {
        console.error(res)
        this.profileInfo = res.userinfo;
        this.userState = res.userinfo;



        
        this.otherUser = this.userState
        console.log("PRIVATE ",this.userState['account_private'])
        if(this.userState['account_private'] == 1 && this.userState["isFriend"] != 'connected'){
          this.isMasornyisLoaded = true;
          this.pageIsLoading = false;
        }
        // if(this.userState['account_private'] == '1'){
        //   this.isMasornyisLoaded = true;
        //   this.isLoaded = true;
        // }
        this.getPosts(false, true, false);
      } else {
        let alert = await this.alertCtrl.create({
          message: 'Unexpected error occured. Please try again.',
          mode: 'md',
          buttons:[
            {
              text: 'Okay',
            }
          ]
        });
        alert.present();
        this.navCtrl.back();
      }
      // if (refresher) {
      //   if (refresher["ionRefresh"]) {
      //     refresher.target.complete();
      //   } else {
      //     console.log("This is an event-based refresh.");
      //   }
      // }
    }).catch(async ()=>{
      let alert = await this.alertCtrl.create({
        message: 'Unexpected error occured. Please try again.',
        mode: 'md',
        buttons:[
          {
            text: 'Okay',
          }
        ]
      });
      alert.present();
      this.navCtrl.back();
    });
  }

  getUserInfo(userId, refresher?) {
    this.userService.getUserInfo(userId).then((res: any) => {
      if (res.error == 0) {
        this.storage.remove('user');
        this.storage.set('user', res.user).then(res =>{
          this._zone.run(()=>{
            this.profileInfo = res;
            console.log('save to storage', res)
            this.isLoadedImg2(this.profileInfo);
          });
        });
      } else {
        
      }
      if (refresher) {
        if (refresher["ionRefresh"]) {
          refresher.target.complete();
        } else {
          console.log("This is an event-based refresh.");
        }
      }
    });
  }
  
  async getPosts(refresher?, isLoadNew?, infiniteScroll?) {
    
    console.log("refresher", refresher);
    // this.progressBar.start();
    if (refresher) {
      refresher.target.disabled = true;
      // refresher.target.complete();
      setTimeout(() => {
        refresher.target.disabled = false;
      }, 100);
    }
    if (!infiniteScroll || infiniteScroll == false) {
      this.isLoaded = false;
      // this.progressBar.complete();
    }
    let id;
    if (this.otherUser) {
      id = this.profileInfo["id"];
    }
    await this.postService.getPosts(id, null, this.page, this.limit).then((res: any) => {
      // this.progressBar.complete();
      this.isLoaded = true;
      console.log("ISLOADED? ", this.isLoaded)
      if (res.error == 0) {
        this.totalItems = res.total_count;
        this.totalPages = res.total_page;
        console.log(this.totalItems)
        if(this.totalItems <= 0){
          this.isMasornyisLoaded = true;
          console.log(this.isMasornyisLoaded)
        }
        if (!infiniteScroll || infiniteScroll === false) {
          if (!this.items || isLoadNew === true) {
            this.items = [];
          }
        }
        res.datas.forEach(data => {
          if (data.filter.brightness == 0) {
            data.filter.brightness = 0.0;
          }
          if (data.filter.contrast == 0) {
            data.filter.contrast = 0.0;
          }
          if (data.filter.saturation == 0) {
            data.filter.saturation = 0.0;
          }
          this.items.push(data);
        });
        // console.log(this.items);
        // Cache the retrieved posts
        let cacheId = this.componentsService.userPostsCacheId + this.profileInfo['id'];
        let cacheData = {
          totalItems: this.totalItems,
          totalPages: this.totalPages,
          data: this.items
        }
        this.cachePostsData(cacheId, cacheData);
      }
      else {
        // If the request fails, load data from cache.
        let cacheId = this.componentsService.userPostsCacheId + this.profileInfo['id'];
        this.loadPostsFromCache(cacheId).then(response => {
          console.log('CACHEID 2', cacheId)
          if (response['error'] == 0) {
            
            var cachedData = response['cachedData'];
            console.log("No internet data: ",cachedData);
            this.totalItems = cachedData['totalItems'];
            this.totalPages = cachedData['totalPages'];
            this.items = cachedData['data'];
          }
          else {
            // Invalidate the request if there is no network and no cache data.
            this.items = [];
            this.totalItems = 0;
            this.totalPages = 0;
            this.blockedMe = res['blockedMe'] ? res['blockedMe'] : false;
            console.log('Am I blocked? ', this.blockedMe);
          }
        }).catch(loadFromCacheError => {
          console.log('Error getting Posts from cache: ', loadFromCacheError);
          this.componentsService.showAlert('', 'Posts cannot be loaded at this time. Please try again later.');
        });
      }
      if (infiniteScroll) {
        infiniteScroll.target.complete();
      }
      // this.progressBar.complete();
       
    }).catch(e => {
      // this.progressBar.complete(); 
      // At any point the request fails, load data from cache.
      let cacheId = this.componentsService.userPostsCacheId + this.profileInfo['id'];
      this.loadPostsFromCache(cacheId).then(response => {
        console.log("CACHEID ", cacheId)
        if (response['error'] == 0) {
          var cachedData = response['cachedData'];
          console.log("No internet data: ",cachedData);
          this.totalItems = cachedData['totalItems'];
          this.totalPages = cachedData['totalPages'];
          this.items = cachedData['data'];
        }
        else {
          // Invalidate the request if there is no network and no cache data.
          this.items = [];
          this.totalItems = 0;
          this.totalPages = 0;
          this.blockedMe = response['blockedMe'] ? response['blockedMe'] : false;
          console.log('Am I blocked? ', this.blockedMe);
        }
      }).catch(loadFromCacheError => {
        console.log('Error getting Posts from cache: ', loadFromCacheError);
        this.componentsService.showAlert('', 'Posts cannot be loaded at this time. Please try again later.');
        // this.progressBar.complete(); 
      });

      this.isLoaded = true;
      
      //  this.progressBar.complete(); 

      if (infiniteScroll) {
        infiniteScroll.target.complete();
      }

      console.log("Error: ", e);
      console.log("From catch: ", refresher);
      if (refresher) {
        if (refresher["ionRefresh"]) {
          refresher.target.complete();
        } else {
          console.log("This is an event-based refresh.");
        }
      }
    });
  }
  cachePostsData(cacheId, dataForCache) {
    this.storage.get(cacheId).then(data => {
      if (data) {
        console.log('Updating cache data for: ', cacheId);
        this.storage.set(cacheId, dataForCache);
      }
      else {
        console.log('Setting new cache data for: ', cacheId);
        this.storage.set(cacheId, dataForCache);
      }
    });
  }
  loadPostsFromCache(cacheId) {
    return new Promise(resolve => {
      this.storage.get(cacheId).then(data => {
        console.log("LoadpostCache",cacheId);
        console.log("DATA",data);
        if (data) {
          resolve({error: 0, cachedData: data});
        }
        else {
          // Fully invalidate the request if and only if there is also no cache.
          resolve({error: 1, cachedData: null});
        }
      });
    });
  }
  async getFriendRequests(event?) {
    await this.notificationService
      .getFriendRequests("getrequests")
      .then(response => {
        console.log("RESPONSE: ", response)
        // console.log('Your friend requests: ', response);
        // console.log('This user profile info: ', this.profileInfo);
        // console.log("EVENT: ", event)
        if (event) {
          this.isBeingDetermined = true;
          this.isPending = false;

          this.doRefresh(true);
        } else {
          let pendingRequests = response["datas"];
          console.log("ELSE: ", pendingRequests)
          pendingRequests.forEach(item => {
            console.log("ITEMMM: ", item)
            if (item["userId"] == this.profileInfo["id"]) {
              console.log("EVENT ELSE: ", event)
              this.isPending = true; // flag the isPending variable as true if any of the pending requests' ID is equal to the current profile ID
            }else{

            }

          });
          console.log("Is pending? ", this.isPending);
        }
      })
      .catch(getFriendRequestsError => {
        console.log(
          "Error determining friend requests: ",
          getFriendRequestsError
        );
      })
      .then(() => {
        this.isBeingDetermined = false;
      });
      console.log(this.isPending)
  }
  doRefresh(refresher?) {
    this.isLoaded = false;
    this.isMasornyisLoaded = false;
    this.items = [];
    this.page = 1;
    if (this.otherUser) {
      console.log(this.otherUser)
      this.blockedMe = false;
      this.getProfileInfo(this.otherUser.id, refresher);
      this.getFavoritePosts(this.otherUser.id, refresher);
      console.log("herer ", this.otherUser)
    } else {
      this.getPosts(refresher, true, false);
      this.faveItems = null;
      this.getFavoritePosts(null, refresher, null);
      this.getUserInfo(this.profileInfo.id);
      // this.getProfileInfo(this.profileInfo.id);
      // console.log('hey ', this.profileInfo)
      
    }
    this.getPoints();
  }
  getPoints() {
    if (this.otherUser) {
      this.userService.getUserPoints(false, this.otherUser.id).then((res: any) => {
        if (res.error == 0) {
          this.pointsPassed = res.points;
          this.otherUserPoints = res.points
        } else {
          this.pointsPassed = 0;
        }
      });
    } else {
      this.userService.getUserPoints().then(res => {
        if (res["error"] == 0) {
          this.pointsPassed = res["points"];
        } else {
          this.pointsPassed = 0;
        }
      });
    }
  }
  doInfinite(infiniteScroll: any) {
    console.log('do')
    this.page += 1;
    if (this.items.length < this.totalItems) {
      this.getPosts(false, false, infiniteScroll);
    } else {
      infiniteScroll.disable = false;
      infiniteScroll.target.complete();
    }
  }
  
  async getFavoritePosts(userId?, refresher?, infiniteScroll?) {
    // this.progressBar.start();
    // getsavedposts
    console.log("Favorite of other user? ", userId);

    
    if (userId) {
     
      // Load favorites if user is not blocked.
      if (!this.otherUser.isBlocked) {
        console.log("Requesting for other user's favorites.");
        await this.postService.getSavedPosts("getsavedposts", userId, this.page).then(response => {
          // this.progressBar.complete(); 
          if (response["error"] == 0) {
            let posts = response["datas"];
            this.faveItems = [];

            posts.forEach(post => {
              this.faveItems.push(post);
            });
            console.log("Saved items: ", this.faveItems);

            // Cache the retrieved posts
            let cacheId = this.componentsService.userFavesCacheId + this.profileInfo['id'];
            let cacheData = {
              totalItems: response['total_count'],
              totalPages: response['total_page'],
              data: this.faveItems
            }
            this.cachePostsData(cacheId, cacheData);
          }
          else {
            console.log("Something went wrong in getting saved posts: ", response);
            // If the request fails, load from cache.
            let cacheId = this.componentsService.userFavesCacheId + this.profileInfo['id'];
            this.loadPostsFromCache(cacheId).then(response => {
              if (response['error'] == 0) {
                var cacheData = response['cachedData'];
                this.faveItems = cacheData['data'];
              }
              else {
                this.faveItems = [];
              }
            }).catch(loadFromCacheError => {
              console.log('Error getting Favorites from cache: ', loadFromCacheError);
              this.componentsService.showAlert('', 'Favorites cannot be loaded at this time. Please try again later.');
            
            });
          }
        }).catch(ex => {
          console.log(ex);
          // If the request fails, load from cache.
          let cacheId = this.componentsService.userFavesCacheId + this.profileInfo['id'];
          this.loadPostsFromCache(cacheId).then(response => {
            console.log("CACHE ID 3", cacheId)
            // this.progressBar.complete(); 
            if (response['error'] == 0) {
              var cacheData = response['cachedData'];
              this.faveItems = cacheData['data'];
            }
            else {
              this.faveItems = [];
            }
          }).catch(loadFromCacheError => {
            console.log('Error getting Favorites from cache: ', loadFromCacheError);
            this.componentsService.showAlert('', 'Favorites cannot be loaded at this time. Please try again later.');
          });
        }).then(() => {
          //  this.progressBar.complete(); 
        });
      }
      else {
        // this.progressBar.complete(); 
      }
    }
    else {
      // this.progressBar.start();
      console.log("Requesting for your favorites.");
      await this.postService.getSavedPosts("getsavedposts").then(response => {
        // this.progressBar.complete(); 
        
        if (response["error"] == 0) {
          let posts = response["datas"];
          this.faveItems = [];

          posts.forEach(post => {
            this.faveItems.push(post);
          });
          if(this.faveItems.length < 1){
            this.areFavesLoaded = true;
            this.isMasornyisLoaded = true;
            this.isLoaded = true
          }
          console.log("Saved items: ", this.faveItems);
          // Cache the retrieved posts
          let cacheId = this.componentsService.userFavesCacheId + this.profileInfo['id'];
          let cacheData = {
            totalItems: response['total_count'],
            totalPages: response['total_page'],
            data: this.faveItems
          }
          this.cachePostsData(cacheId, cacheData);
        }
        else {
          console.log("Something went wrong in getting saved posts: ", response);
          // If the request fails, load from cache.
          let cacheId = this.componentsService.userFavesCacheId + this.profileInfo['id'];
          this.loadPostsFromCache(cacheId).then(response => {
            console.log("CACHE ID 3 ", cacheId)
            // this.progressBar.complete(); 
            if (response['error'] == 0) {
              var cachedData = response['cachedData'];
              this.faveItems = cachedData['data'];
            }
            else {
              this.faveItems = [];
            }
          }).catch(loadFromCacheError => {
            console.log('Error getting Favorites from cache: ', loadFromCacheError);
            this.componentsService.showAlert('', 'Favorites cannot be loaded at this time. Please try again later.');
          });
        }
      }).catch(ex => {
        console.log(ex);
        // If the request fails, load from cache.
        let cacheId = this.componentsService.userFavesCacheId + this.profileInfo['id'];
        this.loadPostsFromCache(cacheId).then(response => {
          console.log("CACHE ID 4 ", cacheId)
          // this.progressBar.complete(); 
          if (response['error'] == 0) {
            var cachedData = response['cachedData'];
            this.faveItems = cachedData['data'];
          }
          else {
            this.faveItems = [];
          }
        }).catch(loadFromCacheError => {
          console.log('Error getting Favorites from cache: ', loadFromCacheError);
          this.componentsService.showAlert('', 'Favorites cannot be loaded at this time. Please try again later.');
        });
      }).then(() => {
        // this.progressBar.complete(); 
      });
    }

    if (refresher) {
      refresher.target.complete();
    }

    if (refresher) {
      if (refresher["ionRefresh"]) {
        refresher.target.complete();
      } else {
        console.log("This is an event-based refresh.");
      }
    }

    if (infiniteScroll) {
      infiniteScroll.target.complete();
    }
    
  }
  showMenu(otherUser?){
    console.log("OTHERUSER?: ", this.otherUser)
    if(otherUser){
      this.dataSource.changeData({ otherUser: this.otherUser});
    }else{
      this.dataSource.changeData({ userAccount: this.userAccount.stylist});
    }
    this.menuCtrl.enable(true, 'content')
    this.menuCtrl.open();
  }
  ionDidClose(){
    this.menuCtrl.enable(false, 'content')
    
  }
  back(){
    
    if(this.fromInnerConnection){
      let navigationExtras : NavigationExtras={
        state:{
          otherUser: this.otherUser,
          context: this.context,
          points: this.points,
          rank: this.rankBackground,
          status: this.profileInfo,
          fromInnerConnection: true,
          profileInfo: this.profileInfo
        }
      }
      this.navCtrl.navigateBack('/inner-connection-request', navigationExtras)
    }else{
      this.navCtrl.back(); 
    }
    // console.log("fromInnerConnection? : ", this.fromInnerConnection)
    // console.log("fromOTherconnection?: ", this.fromOtherConnections)

    // if(this.fromOtherConnections){
    //   // let navigationExtras: NavigationExtras = {
    //   //   state: {
    //   //     status: this.otherUser,
    //   //     profileInfo: this.profileInfo
    //   //   }
    //   // };
    //   let navigationExtras: NavigationExtras = {
    //     state: {
    //       context: 'from my stylin'
    //     }
    //   };
    //   this.navCtrl.navigateBack(['/tabs/tabs/dashboard'], navigationExtras);
    //   console.log("from other connecction")
    // }else if(this.fromInnerConnection){
    //   let navigationExtras: NavigationExtras = {
    //     state: {
    //       status: this.otherUser,
    //       profileInfo: this.profileInfo2,
    //       fromMyStylin: true,
    //       otherUser2: this.otherUser2
    //     }
    //   };
    //   this.navCtrl.navigateBack(['/inner-connection-request'],navigationExtras);
    //   console.log("from inner  connecction")
    // }else if(this.isDiscovery){
    //   if(this.isDiscoverySearch){
    //     this.events.publish('searchValue',{searchValue:this.isDiscoverySearch});
    //     this.navCtrl.back();
    //   }else{
    //     this.events.publish('getAllDiscover');
    //     this.navCtrl.back();
    //   }
    // }
    // else{
    //   console.log("else back: ")
    //   this.navCtrl.back();
      
    // }
    // 
  }
  gotoConnections(otherUser?) {
    if(otherUser){
      let navigationExtras: NavigationExtras = {
      state: {
        type: "connections",
        otherUser: this.profileInfo 
      }
    };
    this.navCtrl.navigateForward(['/tabs/tabs/my-stylin/connection-requests'],navigationExtras);
    }else{
      console.log("true?: ", this.profileInfo)
      let navigationExtras: NavigationExtras = {
        state: {
          type: "connections",
          profileInfo: this.profileInfo
        }
      };
      this.navCtrl.navigateForward(['/tabs/tabs/my-stylin/connection-requests'],navigationExtras);
    }
  }
  async gotoDetails(item) {
    let otherUser = this.userState
    // this.navCtrl.push(PostDetailsPage, {
    //   item: item
    // });
    // let postDetailModal;
    if (this.otherUser) {
      let navigationExtras: NavigationExtras = {
        state: {item: item, otherUser: otherUser, state: this.userState}
      };
      this.navCtrl.navigateForward(['/post-detail'],navigationExtras);
      // postDetailModal = this.modalCtrl.create(PostDetailsPage, {item: item, otheruser: this.otherUser, state: this.userState});
    }
    else {
      let navigationExtras: NavigationExtras = {
        state: {item: item}
      };
      // postDetailModal = this.modalCtrl.create(PostDetailsPage, {item: item});
      this.navCtrl.navigateForward(['/post-detail'],navigationExtras);
    }
    // postDetailModal.present();
  }
  gotoEditProfile(){
    this.navCtrl.navigateForward('/edit-profile');
  }

  async openMessageModal(otherUser){
    let loader = await this.loadingCtrl.create({
      message:'Please wait...'
    });
    loader.present();
    console.log("TEST", otherUser['id'])
     this.chatService.getInbox(otherUser['id']).then (async res =>{
      let convo = otherUser;
      const modal = await this.modalCtrl.create({
      mode:'ios',
      component: MessageModalComponent,
      backdropDismiss: true,
      componentProps: {
        convo: res["data"],
        otherUser: convo,
        context: "userlist"
      }
    });
    
    await modal.present();
    loader.dismiss();
    console.log("PROFILEINFO: ", convo)
    });
   
  }

  total_count: any;
  myUnreads: any;
  getInbox(infiniteScroll?, isRefresh?) {
    this.chatService
      .getInbox(null, this.currentPage, 15)
      .then((res:any)=> {
        if (res) {
          this.total_count = res["total_count"];

          if (!infiniteScroll) {
            console.log('Convo listing: ', res['datas']);
            let unfilteredConvos = res['datas'];
            let filteredConvos = [];
            unfilteredConvos.map(cnv => {
              if (cnv['blockedBy'] === false && cnv['isBlocked'] === false) {
                if (this.lastOpenedThread && cnv['id'] == this.lastOpenedThread) {
                  cnv['read_at'] = new Date();
                }
                filteredConvos.push(cnv);
              }
              else {
                console.log('Blocked conversation found: ', cnv);
              }
            });

            // this.convos = res['datas'];
            this.convos = filteredConvos;

            if (isRefresh) {
              this.cacheConversationList(res["datas"], true);
            }
            else {
              this.cacheConversationList(res["datas"]);
            }

            // Negate the isFaulted state if the page is refreshed.
            this.isFaulted = false;

            // console.log('Updated convo list: ', rawConvoData);
            // this.convos = rawConvoData;
          }
          else {
            this.convos.concat(res['datas']);

            res['datas'].map(convo => {
              this.convos.push(convo);
            })

            console.log('PUMASOK', res['datas']);
            this.cacheConversationList(this.convos, true);
          }
        } else {
          console.log("Error getting conversations: ", res);
          this.isFaulted = true;
        }

        this.pageIsLoading = false;

        if (isRefresh) {
          isRefresh.target.complete();
        }

        if (infiniteScroll) {
          infiniteScroll.complete();
        }
        console.log("Is the load request faulted? ", this.isFaulted);

      })
      .catch(ex => {
        console.log("Error getting conversations: ", ex);
        this.isFaulted = true;
      })
  }

  async cacheConversationList(listData, isRefresh?) {
    console.log('Caching conversations.');
    this.storage
      .get("conversations")
      .then(data => {
        if (isRefresh) {
          console.log("Page refreshed; replacing/updating cached data.");
          this.storage.set("conversations", listData);
        } else if (data) {
          console.log("Conversation cache present; trying to append.");
          if (data.length < 20) {
            // Append new data here if cache length is less than 20.
            this.storage.set("conversations", listData);
          } else {
            // Reject this cache request.
          }
        }
        else {
          console.log('No convo cache data found.');
          this.storage.set('conversations', listData);
        }
      })
      .catch(ex => {
        console.log("Cannot access Storage; not creating/accessing cache.");
      });
  }
  // async blockUser(otherUser) {
  //   let title = "Block User";
  //   let message = "Are you sure you want to block this account?";
  //   if (otherUser.isBlocked ) {
  //     title = "Unblock User";
  //     message = "Unblock this account?";
  //   }else if(otherUser.blockedBy){
  //     title = "Unblock User";
  //     message = "Unblock this account?";
  //   }
  //   const alert = await this.alertCtrl
  //     .create({
  //       mode: "md",
  //       message: message,
  //       cssClass: 'blockAlert',
  //       buttons: [
  //         {
  //           text: "YES",
  //           handler: async () => {
  //             let loader = await this.loadingCtrl.create({
  //               message: "Blocking your connection..."
  //             });
  //             loader.present();
  //             this.blockedService
  //               .save({ friendId: otherUser.id })
  //               .then(res => {
  //                 loader.dismiss();
  //                 console.log("try 2.0", res);

  //                 if (res["error"] == 0) {
  //                   otherUser.isBlocked = !otherUser.isBlocked;
  //                   // this.componentsProvider.showToast(res["message"]);
  //                   if (res['message'] == 'Block Successful') {
  //                     this.componentsService.showAlert('User Blocked', 'You have blocked ' + otherUser['profile_first_name'] + '.');
  //                   }
  //                   else {
  //                     this.componentsService.showAlert('User Unblocked', 'You have unblocked ' + otherUser['profile_first_name'] + '.');
  //                   }
  //                   this.ionViewDidEnter();
  //                   this.events.publish("refresh-home-feed");
  //                 } else {
  //                   console.log(res["message"]);
  //                 }
  //               });
  //           }
  //         },
  //         {
  //           text: "CANCEL",
  //           role: "cancel"
  //         }
  //       ]
  //     })
  //     alert.present();
  // }
  async blockUser(otherUser) {
    let title = "Block User";
    let message = "Are you sure you want to block this account?";
    if (otherUser.isBlocked) {
      title = "Unblock User";
      message = "Unblock this account?";
    }
   let alert =await  this.alertCtrl
      .create({
        mode: "md",
        cssClass:'blockAlert',
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
              this.blockedService
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
                    this.ionViewDidEnter();
                    this.events.publish("refresh-home-feed");
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


  async save(pending?) {
    if (this.profileInfo["isFriend"] === "connected") {
      let content = "Disconnecting with"+ " " + this.profileInfo["profile_first_name"]+ "...";
      let alert = await this.alertCtrl.create({
        mode: "md",
        message:
          "Disconnect with " +
          this.profileInfo["profile_first_name"] +
          " " +
          this.profileInfo["profile_last_name"] +
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
              this.proceedSave(content);
            }
          },
        ]
      });
      alert.present();
    }
    else if (this.profileInfo["isFriend"] === "pending") {
      let content = "Cancelling the request...";
      let alert =  await this.alertCtrl.create({
        mode: "md",
        message:
          "Do you want to cancel the request for " +
          this.profileInfo["profile_first_name"] +
          " " +
          this.profileInfo["profile_last_name"] +
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
              this.proceedSave(content);
            }
          },
        ]
      });
      alert.present();
    }
    else {
      if (pending) {
        console.log("This is a pending request.");
        let cnt = "Approving...";
        this.connectUser(cnt);
      } else {
        let content = "Connecting with "+ " "+ this.profileInfo["profile_first_name"] +"...";
        this.proceedSave(content);
      }
    }
  }
  async proceedSave(content) {
    let loader = await this.loadingCtrl.create({
      message: content
    });
    loader.present();
    this.friendService
      .save({ friendId: this.profileInfo["id"] })
      .then(result => {
        loader.dismiss();
        if (result["error"] == 0) {
          this.isPending = false;
          this.profileInfo["isFriend"] = !this.profileInfo["isFriend"];
          this.otherUser.isFriend == 'unconnected';
          this.userState.isFriend == 'unconnected';
          this.componentsService.showAlert('Connection Request', result['message']);
          this.events.publish("refresh-main-profile-feed");
          this.events.publish("refresh-home-feed");
          if (this.otherUser) {
            this.getProfileInfo(this.otherUser.id);
            // this.events.publish("refresh-main-profile-feed");
          }
        }
      });
  }

  async connectUser(content) {
    let loader =await this.loadingCtrl.create({ message: content });
    loader.present();

    // If the otherUser variable is filled up, which is the case in viewing
    // other profiles, this block should be fired.
    if (this.otherUser) {
      console.log("This user's ID: ", this.otherUser["id"]);

      let data = {
        userId: this.otherUser["id"],
        accepted: 1
      };

      this.progressBar.start();
      await this.userService
        .acceptRequest2("accept", data)
        .then(response => {
          if (response["error"] == 0) {
            console.log(response);
            this.events.publish("refresh-main-profile-feed");
            this.events.publish("refresh-home-feed");
            this.events.publish("user-accepted");
          } else {
            console.log(
              "Error approving request from Profile Viewer: ",
              response
            );
            this.componentsService.showToast(
              "Cannot approve request at this time. Please try again later."
            );
          }
        })
        .catch(ex => {
          console.log("Error approving request from Profile Viewer: ", ex);
          this.componentsService.showToast(
            "Cannot approve request at this time. Please try again later."
          );
        })
        .then(() => {
          loader.dismiss();
          this.progressBar.complete();
          // this.doRefresh(true);
        });
    } else {
      console.log("otherUser variable is null.");
    }
  }

goToMemberPrivileges(){
  let navigationExtras: NavigationExtras = {
    state: {
      points: this.pointsPassed,
      profileInfo: this.profileInfo
    }
  };
  this.navCtrl.navigateForward(['/tabs/tabs/my-stylin/member-privileges'],navigationExtras);
  //this.navCtrl.navigateForward('/tabs/tabs/my-stylin/member-privileges');
}

onImgLoad(e) {

}

onThumbLoad(e) {

}


completeMasonry() {
  this.isMasornyisLoaded = true;
}
  async muteUser(otherUser) {
  let title = "Mute User";
  let message =
    "Are you sure you want to mute this user? You will not see posts and notifications related to this person but you will remain connected. ";
  if (otherUser.isMuted) {
    title = "Unmute User";
    message = "Unmute this account?";
  }
  let alert = await this.alertCtrl
    .create({
      mode: "md",
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
              message: "Muting your connection..."
            });
            loader.present();

            this.muteService.save({ friendId: otherUser.id }).then(res => {
              loader.dismiss();
              console.log("try 2.0", res);

              if (res["error"] == 0) {
                otherUser.isMuted = !otherUser.isMuted;
                if (res['message'] == 'Mute Successful') {
                  this.componentsService.showAlert('User Muted', 'You have muted ' + otherUser['profile_first_name'] + '.');
                }
                else {
                  this.componentsService.showAlert('User Unmuted', 'You have unmuted ' + otherUser['profile_first_name'] + '.');
                }
                this.componentsService.showToast(res["message"]);
                this.ionViewDidEnter();
                this.events.publish("refresh-home-feed");
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
isLoadedImg(item){
  console.log("isLoaded image...");
  if(item){
    item.isLoaded = true;
  } 
}
// errorLoad(){
//   this.imageDash.src = "/assets/css/imgs/empty-states/fallback.svg";
// }
isLoadedImg2(profileInfo){
  console.log("isLoaded image...");
  if(profileInfo){
    profileInfo.isLoadedProfile = true;
  } 
}
  errorLoad(profileInfo){
      console.log("error")
      profileInfo.isLoadedProfile = true;
      console.log(this.imageDash.src)
      profileInfo.errorProfile = true;
      console.log(profileInfo.errorProfile )
  }

}
