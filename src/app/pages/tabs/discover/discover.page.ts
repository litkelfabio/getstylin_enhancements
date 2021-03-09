// import { Route } from '@angular/compiler/src/core';
import { Component, OnInit,ViewChild, ViewChildren, ElementRef  } from '@angular/core';
import {Router, ActivatedRoute,NavigationExtras} from '@angular/router';
import { MenuController, NavController, IonRefresher, IonImg, LoadingController} from '@ionic/angular';
import {ModalController} from '@ionic/angular'
// import {EditPostModalComponent} from '../../../components/modals/edit-post-modal/edit-post-modal.component'
// import { PostDetailsComponent } from 'src/app/components/modals/post-details/post-details.component';
import {ComponentsService} from '../../../services/components/components.service'
// import { SkipModalComponent } from 'src/app/components/modals/skip-modal/skip-modal.component';
import { PostService } from 'src/app/services/post/post.service';
// import { FriendService } from 'src/app/services/friend/friend.service';
// import { NotificationService } from 'src/app/services/notification/notification.service';
import { Storage } from '@ionic/storage';
import { EventsService } from 'src/app/services/events.service';
import { UserService } from 'src/app/services/user/user.service';
import { LikesDislikesComponent } from 'src/app/components/modals/likes-dislikes/likes-dislikes.component';

import { ChatService } from 'src/app/services/chat/chat.service';
import { DatasourceService } from 'src/app/services/datasource/datasource.service';
import { NgProgress,NgProgressComponent } from 'ngx-progressbar';
import { Observable } from 'rxjs/Observable';
import * as jwt_decode from 'jwt-decode';
import { PostDetailPage } from '../../post/post-detail/post-detail.page';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { DiscoverService } from 'src/app/services/discover/discover.service';
@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit {
  @ViewChild(NgProgressComponent) progressBar: NgProgressComponent;
  @ViewChild("refresherRef") refresherRef: IonRefresher;
  @ViewChild("image", {static: false}) imageDash: IonImg;
  @ViewChild("image2", {static: false}) imageDash2: IonImg;
  // @ViewChild("imageStyle", {static: false}) imageStyle: IonImg;
  artists: any;
  total_artists: string = "0";
  total_artists_page: any;
  styles: any;
  total_styles: string = "0";
  events: any = [];
  total_events: string = "0";
  styleColumns: any;
  total_styleColumns: string = "0";
  counter: number = 0;
  profileInfo: any;
  errorImageUserResult = false;

  tagsUpper: any;
  tagsLower: any;

  searchQuery: string = "";
  skeletonItem: any = [1, 2, 3, 4, 5];
  tags: any;
  total_tags: string = "0";
  searching: boolean = false;
  discoverContext = "base"; // change this context depending if Base or Events (DEFAULT: 'base')
  searchHistory: any; // container for search history by the current user; search history will be cleared on logout.
  isSearching: any = false;
  stylistResults: any =[];
  total_stylist_results: any = 0;
  total_stylist_page: any = 0;
  userResults: any = [];
  total_user_results: string;
  total_user_page: any = 0;
  postResults: any = [];
  total_post_results: string;
  total_post_page: any = 0;
  eventResults: any = [];
  total_events_results: string;
  total_events_page: any = 0;
  questionResults: any = [];
  total_question_results: string;
  total_question_page: any = 0;

  isLoadedProfileArtist =false;
  isLoadedStyle =false;
  isLoadedEvent=false;
  isLoadedStyleColumn = false;
  isLoadedstylistResult = false;
  isLoadedUserResult = false;
  isLoadedPostResult = false;
  isLoadedEventResult = false;
  isLoadedQuestionResult = false;

  isLoaded: boolean = true;
  progress: number = 0;
  items: any;
  page: number;
  slideOpts = {
    slidesPerView: 4.5,
    spaceBetween: 4.5,
  };
  slideOpts1 = {
    slidesPerView: 4.5,
    spaceBetween: 4.5,
  };
  slideBrowseStyle = {
    slideToClickedSlide: true,

    slidesPerView:3.7 ,
    spaceBetween: 10,
    
  };
  slideBrowseEvent = {
    slidesPerView:3.9 ,
    spaceBetween: 10
  };
  slideBrowseStyleColumun={
    slidesPerView:2.3 ,
    spaceBetween: 10
  }
  slideBrowseStylePost={
    slidesPerView:3.5 ,
    spaceBetween: 9
  }
  slideEventSearch={
    slidesPerView:3.5 ,
    spaceBetween: 6
  }
  slideStyleColumnSearch={
    slidesPerView:2.5 ,
    spaceBetween: 2.5
  }
  constructor(
    private menuCtrl: MenuController,
    private storage: Storage,
    private keyboard: Keyboard,
    public watch: EventsService,
    public navCtrl: NavController,
    private ngProgress: NgProgress,
    private discover: DiscoverService,
    private postsProvider: PostService,
    private userProvider: UserService,
    private componentsProvider: ComponentsService,
    private modalCtrl: ModalController,
    private dataSource: DatasourceService,
    private route: ActivatedRoute,
    private router: Router,
    private loadingCtrl: LoadingController
    ) {
      this.getAll();
      this.storage.get("user").then(user => {
        console.log(user);
        this.profileInfo = user;
      });
    this.menuCtrl.close();
    this.menuCtrl.enable(false, 'content')
    this.watch.subscribe('searchValue',(data)=>{
      this.search(data.searchValue,'Enter');
    })
    this.watch.subscribe('getAllDiscover',()=>{
      this.getAll();
    })
   }

  ngOnInit() {
    
  }
  ionViewDidEnter() {
  
    console.log("Loaded Discovery Page.");
  }

  ionViewDidLeave() {
    this.progressBar.complete();
    // this.content.ionScroll.unsubscribe();
  }

  ngAfterViewInit() {
    // this.content.ionScroll.subscribe((event) => {
    //   this.dismissOnScroll();
    // });
  }

  getAll(referesher?) {
    this.getArtists();
    this.getTags();
    this.getStyles();
    this.getEvents();
    this.getStyleColumns();

    if (referesher) {
      referesher.target.complete();
    }
  }

  clearAll() {
    this.progressBar.set(0);
    this.artists = [];
    this.tags = [];
    this.styles = [];
    this.events = [];
    this.styleColumns = [];
  }

  clearSearch() {
    this.stylistResults = [];
    this.postResults = [];
    this.eventResults = [];
    this.questionResults = [];
    this.userResults = [];
  }

  keyup() {
    this.searching = false;
    this.total_stylist_results = 0;
    this.total_post_results = "0";
    this.total_events_results = "0";
    this.total_question_results = "0";
    this.clearSearch(); 
  }

  clearSearchField(event) {
    this.isLoaded = false;
    this.keyup();
    this.searchQuery = "";
    this.isLoaded = true;
    this.doRefresh();
    // this.watch.publish('getAllDiscover');
  }

  search(event, key?) {
    this.isLoaded = false;
    console.log(this.searchQuery);
    if ((event && event.key === "Enter") || key == "Enter") {
      let value;
      if (!event['target']) {
        value = event;  
      }
      else {
        value = event.target.value;
      }
  
      this.searchQuery = value;
      if (value === "") {
        this.searching = false;
        this.clearSearch();
      } else {
        this.searching = true;
        this.clearSearch();
        // this.getAllSearchies(event.target.value);
        this.getAllSearchies(value);
        
        // Place the last search string into a search history store in Storage.
        this.storage.get('search_history').then(data => {
          if (data) {
            let searchHistory = data;
            searchHistory.push(this.searchQuery);
            this.storage.set('search_history', searchHistory);
          }
          else {
            this.storage.set('search_history', [this.searchQuery]);
          }
        });
      }
    }
    
    setTimeout(() => {
      this.isLoaded = true;
    }, 500);
  }

 
  getAllSearchies(key, refresher?) {
    this.keyboard.hide();

    this.discover.searchStylist({ q: key, type: true }).then(res => {
      if (res["error"] == 0) {
        // console.log("stylust result: ",res['datas']);
        this.total_stylist_results = 0;
        let tempStylist = res["datas"];
        // let total_count = res["total_count"];
        let total_page = res["total_page"];
        let count = 0;
        tempStylist.forEach((element:any) => {
          if(element.stylist == 1){
            this.stylistResults.push(element);
            count++;
          }
        });
        if(count > 0 ){
        this.total_stylist_results = count;
        this.total_stylist_page = total_page;
        }
      } else {
        this.stylistResults = [];
        this.total_stylist_results = 0;
        this.total_stylist_page = 0;
      }
      this.progress = this.progress + 20;
      this.progressBar.inc(20);
      this.checkIfDone();

      if (refresher) {
        refresher.target.complete();
      }
    });

    this.discover.searchStylist({ q: key }).then(res => {
      if (res["error"] == 0) {
        console.log(res['datas']);
        this.userResults = res["datas"];
        this.total_user_results = res["total_count"];
        this.total_user_page = res["total_page"];
      } else {
        this.userResults = null;
        this.total_user_results = "0";
        this.total_user_page = 0;
      }
      this.progress = this.progress + 20;
      this.progressBar.inc(20);
      this.checkIfDone();

      if (refresher) {
        refresher.target.complete();
      }
    });

    this.discover.searchPosts(key).then(res => {
      if (res["error"] == 0) {
        console.log(res['datas']);
        this.postResults = res["datas"];
        this.total_post_results = res["total_count"];
        this.total_post_page = res["total_page"];
        console.log(this.postResults);
      } else {
        this.postResults = null;
        this.total_post_results = "0";
        this.total_post_page = 0;
      }
      this.progress = this.progress + 20;
      this.progressBar.inc(20);
      this.checkIfDone();
    });

    this.discover.searchEvents(key).then(res => {
      if (res["error"] == 0) {
        console.log(res['datas']);
        this.eventResults = res["datas"];
        this.total_events_results = res["total_count"];
        this.total_events_page = res["total_page"];
      } else {
        this.eventResults = null;
        this.total_events_results = "0";
        this.total_events_page = 0;
      }
      this.progress = this.progress + 20;
      this.progressBar.inc(20);
      this.checkIfDone();
    });

    this.discover.searchQuestion(key).then(res => {
      if (res["error"] == 0) {
        console.log(res['datas']);
        this.questionResults = res["datas"];
        this.total_question_results = res["total_count"];
        this.total_question_page = res["total_page"];
      } else {
        this.questionResults = null;
        this.total_question_results = "0";
        this.total_question_page = 0;
      }
      this.progress = this.progress +20;
      this.progressBar.inc(20);
      this.checkIfDone();
    });
    
  }

  getArtists() {
    this.discover.getArtists().then(res => {
      if (res["error"] == 0) {
        console.log(res['datas']);
        this.artists = res["datas"];
        this.total_artists = res["total_count"];
        this.total_artists_page = res["total_page"];

        let cacheData = {
          totalArtists: this.total_artists,
          totalPages: this.total_artists_page,
          data: this.artists
        }
        this.cacheThisData(this.componentsProvider.stylistsCacheId, cacheData);
      }
      else {
        let cacheId = this.componentsProvider.stylistsCacheId;
        this.storage.get(cacheId).then(data => {
          if (data) {
            var cachedData = data;
            this.total_artists = cachedData['totalArtists'];
            this.total_artists_page = cachedData['totalPages'];
            this.artists = cachedData['data'];
          }
          else {
            this.artists = [];
            this.total_artists = "0";
            this.total_artists_page = 0;
          }
        });
      }
      this.progress = this.progress + 20;
      this.progressBar.inc(20);
      this.checkIfDone();
    }).catch(ex => {
      console.log('Error getting stylist listing: ', ex);
      let cacheId = this.componentsProvider.stylistsCacheId;
      this.storage.get(cacheId).then(data => {
        if (data) {
          var cachedData = data;
          this.total_artists = cachedData['totalArtists'];
          this.total_artists_page = cachedData['totalPages'];
          this.artists = cachedData['data'];
        }
        else {
          this.artists = [];
          this.total_artists = "0";
          this.total_artists_page = 0;
        }
      });
    });
  }

  getTags() {
    this.discover.getTags().then(res => {
      if (res["error"] == 0) {
        this.total_tags = res["total_count"];

        this.tags = [];

        res["datas"].map(data => {
          this.tags.push({
            tag_id: data.tag_id,
            tag_name: data.tag_name.substr(1)
          });
        });

        let halfWayThough = Math.floor(this.tags.length / 2);
        this.tagsUpper = this.tags.slice(0, halfWayThough);
        this.tagsLower = this.tags.slice(halfWayThough, this.tags.length);

        this.cacheThisData(this.componentsProvider.tagsListingCacheId, this.tags);
      }
      else {
        let cacheId = this.componentsProvider.tagsListingCacheId;
        this.storage.get(cacheId).then(data => {
          if (data) {
            this.tags = data;
            let halfWayThough = Math.floor(this.tags.length / 2);
            this.tagsUpper = this.tags.slice(0, halfWayThough);
            this.tagsLower = this.tags.slice(halfWayThough, this.tags.length);
          }
          else {
            this.tags = [];
            this.total_tags = "0";
          }
        });
      }

      this.progress = this.progress + 20;
      this.progressBar.inc(20);
      this.checkIfDone();
    }).catch(ex => {
      let cacheId = this.componentsProvider.tagsListingCacheId;
      this.storage.get(cacheId).then(data => {
        if (data) {
          this.tags = data;
          let halfWayThough = Math.floor(this.tags.length / 2);
          this.tagsUpper = this.tags.slice(0, halfWayThough);
          this.tagsLower = this.tags.slice(halfWayThough, this.tags.length);
        }
        else {
          this.tags = [];
          this.total_tags = "0";
        }
      });
    });
  }

  getStyles() {
    this.discover.getStyles().then(res => {
      if (res["error"] == 0) {
        this.styles = res["datas"];
        this.total_styles = res["total_count"];

        this.cacheThisData(this.componentsProvider.stylesListingCacheId, res['datas']);
      }
      else {
        let cacheId = this.componentsProvider.stylesListingCacheId;
        this.storage.get(cacheId).then(data => {
          if (data) {
            this.styles = data;
            this.total_styles = data.length;
          }
          else {
            this.styles = [];
            this.total_styles = "0";
          }
        });
      }
      this.progress = this.progress + 20;
      this.progressBar.inc(20);
      this.checkIfDone();
    }).catch(ex => {
      console.log('Error getting styles: ', ex);
      let cacheId = this.componentsProvider.stylesListingCacheId;
      this.storage.get(cacheId).then(data => {
        if (data) {
          this.styles = data;
          this.total_styles = data.length;
        }
        else {
          this.styles = [];
          this.total_styles = "0";
        }
      });
    });
  }

  getEvents() {
    this.discover.searchEvents('').then(res => {
      if (res["error"] == 0) {
        var today = new Date();
        let tempEvent = res["datas"];
        tempEvent.forEach((element:any )=> {
          var end_date = new Date(element.end_date);
          var compare_dates = function(today,end_date){
            if (end_date>today) return ('not expired');
          else if (end_date<today) return ("expired");
          else return ("not expired"); 
         }
        // console.log(today)
         var show = compare_dates(today, end_date)
         if(show == 'not expired'){
          if(element.publish == 1){
            this.events.push(element);
            console.log("events here: ",element);
          }
         }else{
        //  do nothing....
         }
        });
    
        this.total_events = res["total_count"];
        
        this.cacheThisData(this.componentsProvider.eventsListingCacheId, res["datas"]);
      }
      else {
        let cacheId = this.componentsProvider.eventsListingCacheId;
        this.storage.get(cacheId).then(data => {
          if (data) {
            this.events = data;
            this.total_events = data.length;
          }
          else {
            this.events = [];
            this.total_events = "0";
          }
        });
      }
      this.progress = this.progress + 20;
      this.progressBar.inc(20);
      this.checkIfDone();
    }).catch(ex => {
      console.log('Error getting events: ', ex);
      let cacheId = this.componentsProvider.eventsListingCacheId;
      this.storage.get(cacheId).then(data => {
        if (data) {
          this.events = data;
          this.total_events = data.length;
        }
        else {
          this.events = [];
          this.total_events = "0";
        }
      });
    });
  }

  getStyleColumns() {
    this.discover.getColumnsCategories().then(res => {
      if (res["error"] == 0) {
        this.styleColumns = res["datas"];
        this.total_styleColumns = res["total_count"];
        console.log(this.styleColumns);

        // Cache the returned style column categories.
        this.cacheThisData(this.componentsProvider.styleColumnCategoryListingCacheId, res['datas']);
      }
      else {
        // this.styleColumns = null;
        // this.total_styleColumns = "0";

        // Retrieve data from cache if an error occurs.
        let cacheId = this.componentsProvider.styleColumnCategoryListingCacheId;
        this.storage.get(cacheId).then(data => {
          if (data) {
            this.styleColumns = data;
            this.total_styleColumns = data.length;
          }
          else {
            // Only invalidate the request if there are no cached data as well.
            this.styleColumns = null;
            this.total_styleColumns = '0';
          }
        });
      }

      this.progress = this.progress +20;
      this.progressBar.inc(20);
      this.checkIfDone();
    }).catch(ex => {
      console.log('Error getting style column categories on load: ', ex);
      // Retrieve data from cache if an error occurs.
      let cacheId = this.componentsProvider.styleColumnCategoryListingCacheId;
      this.storage.get(cacheId).then(data => {
        if (data) {
          this.styleColumns = data;
          this.total_styleColumns = data.length;
        }
        else {
          // Only invalidate the request if there are no cached data as well.
          this.styleColumns = null;
          this.total_styleColumns = '0';
        }
      });
    });
  }

  doRefresh(refresher?) {
    this.isLoaded =false;
    if (this.searching) {
      this.clearAll();
      this.clearSearch();
      this.getAllSearchies(this.searchQuery, refresher);
    } else {
      this.clearAll();
      this.clearSearch();
      this.getAll(refresher);
    }
    setTimeout(() => {
      this.isLoaded = true;
    }, 500);
  }

  checkIfDone() {
    if (this.progress <= 100) {
      this.progressBar.complete();
    }else{
      this.progressBar.complete();
    }
  }

  // Push to inner pages
  pushInnerStylists(searchkey, isStylist?) {
    if (searchkey && this.searching) {
      // this.dataSource.changeData({
      //   context: "stylists",
      //   search: searchkey,
      //   isStylist: isStylist ? isStylist : null
      // });
      let navigationExtras: NavigationExtras = {
        state: {
          context: "stylists",
          search: searchkey,
          isStylist: isStylist ? isStylist : null
        }
      }
      this.navCtrl.navigateForward(['/tabs/tabs/discover/discover-inner'],navigationExtras );
    } else {
      let navigationExtras: NavigationExtras = {
        state: { context: "stylists", othercontext: 'stylist' }
      }
      // this.dataSource.changeData({ context: "stylists", othercontext: 'stylist' });
      this.navCtrl.navigateForward(['/tabs/tabs/discover/discover-inner'],navigationExtras);
    }
  }

  pushInnerPosts(searchkey?) {
    // this.dataSource.changeData( {
    //   context: "posts",
    //   search: searchkey
    // });
    let navigationExtras: NavigationExtras = {
      state:  {
        context: "posts",
        search: searchkey
      }
    }
    this.navCtrl.navigateForward(['/tabs/tabs/discover/discover-inner'],navigationExtras );
  }

  // View Tags or Styles/Categories
  pushInnerCategories() {
    if (this.searching) {
      let navigationExtras: NavigationExtras = {
        state:  { context: "tags" }
      }
      // this.dataSource.changeData({ context: "tags" });
      this.navCtrl.navigateForward(['/tabs/tabs/discover/discover-inner'] ,navigationExtras);
    } else {
      // this.dataSource.changeData({ context: "categories" });
      let navigationExtras: NavigationExtras = {
        state:  { context: "categories" }
      }
      this.navCtrl.navigateForward(['/tabs/tabs/discover/discover-inner'],navigationExtras );
    }
  }

  pushEvents(searchkey?) {
    if (searchkey) {
      // this.dataSource.changeData({
      //   context: "events",
      //   search: searchkey
      // });
      let navigationExtras: NavigationExtras = {
        state:  {
          context: "events",
          search: searchkey
        }
      }
      this.navCtrl.navigateForward(['/tabs/tabs/discover/discover-inner'],navigationExtras );
      
    } else {
      let navigationExtras: NavigationExtras = {
        state:  {
          context: "events"
        }
      }
      // this.dataSource.changeData({
      //   context: "events"
      // });
      this.navCtrl.navigateForward(['/tabs/tabs/discover/discover-inner'],navigationExtras );
    }
  }

  pushStyle() {
    // this.dataSource.changeData({ context: "stylecolumn" });
    let navigationExtras: NavigationExtras = {
      state:  { context: "stylecolumn" }
    }
    this.navCtrl.navigateForward(['/tabs/tabs/discover/discover-inner'],navigationExtras );
  }

  // Direct push to Style Grid on thumbnail tap
  viewStyles(styleId, pageTitle) {

    let navigationExtras: NavigationExtras = {
      state:  {
        context: "categories",
        title: pageTitle,
        id: styleId
      }
    }
    // this.dataSource.changeData({
    //   context: "categories",
    //   title: pageTitle,
    //   id: styleId
    // });
    this.navCtrl.navigateForward(['/tabs/tabs/discover/discover-inner'],navigationExtras );
  }

  pushTag(tag) {
    let navigationExtras: NavigationExtras = {
      state:  { context: "tags", item: tag }
    }
    // this.dataSource.changeData( { context: "tags", item: tag });
    this.navCtrl.navigateForward(['/tabs/tabs/discover/discover-inner'],navigationExtras );
  }

  async goToPost(postResult ) {
    this.progressBar.start();
    this.counter++;

    if (this.counter == 1) {
      this.postsProvider
        .getPostsById(postResult['id'])
        .then(res => {
          if (res["error"] == 0) {
            if (postResult['user_id'] == this.profileInfo['id']) {
              let navigationExtras: NavigationExtras = {
                state: {item: res['datas']}
              }
              // this.dataSource.changeData({item: res['datas']});
              this.navCtrl.navigateForward(['/post-detail'],navigationExtras); 
              // this.navCtrl.push(PostDetailsPage, {
              //   item: res["datas"]
              // });
            }
            else {
              let navigationExtras: NavigationExtras = {
                state: {item: res['datas'], otherUser: postResult['userinfo']}
              };
              this.navCtrl.navigateForward(['/post-detail'],navigationExtras);
              // this.dataSource.changeData({item: res['datas'], state: postResult['userinfo']});
               
              
              // this.navCtrl.push(PostDetailsPage, {
              //   item: res["datas"],
              //   state: postResult['userinfo']
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

  async goToProfile(user) {
    console.log(user);
    // if(user.user.isFriend){
    //   let friend = user.user.isFriend
    // }
    if(this.profileInfo.id == user.user_id) {
      this.watch.publish("changeTab", 1);
    } else {
      // this.profileInfo = user
      if(user.isBlocked == undefined){
        let loader = await this.loadingCtrl.create({
          message: 'Almost there...'
        })
        loader.present();
        this.userProvider.getProfileInfo(user.user_id).then( res =>{
        console.log(res)
        let navigationExtras: NavigationExtras = {
          state: {
            otherUser: res['userinfo'],
            status: res['userinfo'],
            isDiscovery:true,
            isDiscoverySearch:this.searchQuery,
          }
        };
        this.navCtrl.navigateForward(['/tabs/tabs/my-stylin'],navigationExtras);
        loader.dismiss(); 
      })
      }else{
        let navigationExtras: NavigationExtras = {
          state: {
            otherUser: {
              id: user.user_id,
              profile_about: "",
              profile_first_name: user.user_first_name,
              profile_last_name: user.user_last_name,
              profile_profile_pic: user.user_profile_pic_url,
              // isBlocked: user.isBlocked,
              //isFriend: user.isFriend
            },
            // otherUser: user,
            status: user,
            isDiscovery:true,
            isDiscoverySearch:this.searchQuery,
          }
        };
        // this.watch.publish('refresh-main-profile-feed');
        this.navCtrl.navigateForward(['/tabs/tabs/my-stylin'],navigationExtras);
      }
    }
  }


 

  // Direct push to Event Details on thumbnail tap
  viewEventDetails(event) {
    // this.dataSource.changeData( {
    //   context: "event",
    //   data: event
    // });
    let navigationExtras: NavigationExtras = {
      state: {
        context: "event",
        data: event
      }
    };
    this.navCtrl.navigateForward(['/post-detail'],navigationExtras);
    
    // this.pageIsLoading = false;
    // // this.getArtists();
  }

  pushStyleColumn(item?, type?) {
    console.log("Pushing page...");
    if (type === "category") {
      let navigationExtras: NavigationExtras = {
        state: {
          context: "stylecolumn",
          columnCategory: item
        }
      };
      
      this.navCtrl.navigateForward(['/tabs/tabs/discover/discover-inner'],navigationExtras);
    } else {
      let navigationExtras: NavigationExtras = {
        state: { question: item }
      };
      // this.dataSource.changeData({ question: item });
      this.navCtrl.navigateForward(['/style-column'],navigationExtras);
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
  onImgLoad(e)
  {
      
  }
  onThumbLoad(e)
  {
     
  }
  errorLoad(artist){
    console.log("erorr")
    console.log(this.imageDash.src)
    artist.errorImage = true;
    this.imageDash.src = "/assets/css/imgs/empty-states/no-user-photo.png";
  }
  errorLoad2(style){
    console.log("erorr")
    console.log(this.imageDash.src)
    style.errorImage = true;
    this.imageDash.src = "/assets/css/imgs/empty-states/no-user-photo.png";
  }
  ionImgDidLoad(){
    console.log("didLoad")
  }
  errorLoadStyleColumn(styleColumn){
    console.log("erorr")
    console.log(this.imageDash.src)
    styleColumn.errorImage = true;
    this.imageDash.src = "/assets/css/imgs/empty-states/no-user-photo.png";
  }
  errorLoadEvent(event){
    console.log("erorr")
    console.log(this.imageDash.src)
    event.errorImage = true;
    this.imageDash.src = "/assets/css/imgs/empty-states/no-user-photo.png";
  }
  errorLoadEventResult(eventResult){
    console.log("erorr")
    console.log(this.imageDash.src)
    eventResult.errorImage = true;
    this.imageDash.src = "/assets/css/imgs/empty-states/no-user-photo.png";
  }
  errorLoadPostResult(postResult){
    console.log("erorr")
    console.log(this.imageDash.src)
    postResult.errorImage = true;
    this.imageDash.src = "/assets/css/imgs/empty-states/no-user-photo.png";
  }
  errorLoadArtist(artist){
    console.log("erorr")
    console.log(this.imageDash.src)
    artist.errorImage = true;
    this.imageDash.src = "/assets/css/imgs/empty-states/no-user-photo.png";
  }
  errorLoadStylistResult(stylistResult){
    console.log("erorr")
    console.log(this.imageDash.src)
    stylistResult.errorImage = true;
    this.imageDash.src = "/assets/css/imgs/empty-states/no-user-photo.png";
  }
  isLoadedArtist(artist){
    console.log("isLoaded image...");
    if(artist){
      artist.isLoadedProfileArtist = true;
    } 
  }
  ionImgDidLoadStyle(style){
    console.log("isLoaded image...");
    if(style){
      style.isLoadedStyle = true;
    } 
  }
  ionImgDidLoadEvent(event){
    if(event){
      event.isLoadedEvent = true;
    } 
  }
  ionImgDidLoadStyleColumn(styleColumn){
    if(styleColumn){
      styleColumn.isLoadedStyleColumn = true;
      const a = document.getElementById('imageStyle');
      // a.style.setProperty('backgroundImage', 'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0, #fff 100%)')
      // a.style.backgroundImage = 'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0, #fff 100%)';
    } 
  }
  isLoadedStylistResult(stylistResult){
    if(stylistResult){
      stylistResult.isLoadedstylistResult = true;
    } 
  }
  isLoadeduserResult(userResult){
    if(userResult){
      userResult.isLoadedUserResult = true;
    } 
  }
  ionImgDidLoadPostResult(postResult){
    if(postResult){
      postResult.isLoadedPostResult = true;
    } 
  }
  ionImgDidLoadEventResult(eventResult){
    if(eventResult){
      eventResult.isLoadedEventResult = true;
    } 
  }
  errorLoadQuestionResult(questionResult){
    console.log("erorr")
    console.log(this.imageDash.src)
    questionResult.errorImage = true;
    this.imageDash.src = "/assets/css/imgs/empty-states/no-user-photo.png";
  }
  ionImgDidLoadQuestionResult(questionResult){
    if(questionResult){
      questionResult.isLoadedQuestionResult = true;
    } 
  }
  errorLoadUserResult(userResult){
    userResult.errorImageUserResult = true
    console.log("error to", userResult.errorImageUserResult)
    userResult.isLoadedUserResult = true
  }
}

