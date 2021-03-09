import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router , ActivatedRoute ,NavigationExtras} from '@angular/router';
import { ModalController, NavController, IonRefresher, IonImg, LoadingController } from '@ionic/angular';
import { DatasourceService } from 'src/app/services/datasource/datasource.service';
import { EventsService } from 'src/app/services/events.service';
import { PostService } from 'src/app/services/post/post.service';
import { NgProgress,NgProgressComponent } from 'ngx-progressbar';
import { Storage } from '@ionic/storage';
import { UserService } from 'src/app/services/user/user.service';
@Component({
  selector: 'app-likes-dislikes',
  templateUrl: './likes-dislikes.component.html',
  styleUrls: ['./likes-dislikes.component.scss'],
})
export class LikesDislikesComponent implements OnInit {

  progress:any
  title: string = "Likes";
  currentPage: number = 1;
  profileInfo: any;
  isFromMain: any;
  item: any;
  //item: any = this.navParams.get("item");
  actions: string = "likes";
  like_users: any;
  like_total: any;
  dislike_users: any;
  dislike_total: any;
  user: any;
  isLoadedProfile = false;

  @ViewChild(NgProgressComponent) progressBar: NgProgressComponent;
  @ViewChild("refresherRef") refresherRef: IonRefresher;
  @ViewChild("likesDislikes", { read: ElementRef })
  @ViewChild("image", {static: false}) imageDash: IonImg;;
  private segmentLD: ElementRef;
  constructor(
    private modalCtrl: ModalController,
    private router:Router,
    private storage: Storage,
    private events: EventsService,
    private postService: PostService,
    public ngProgress: NgProgress,
    private navCtrl: NavController,
    private dataSource: DatasourceService,
    private route: ActivatedRoute,
    private userProvider : UserService,
    private loadingCtrl: LoadingController
  ) {
    // this.dataSource.serviceData.subscribe(data =>{
    // this.item = data;
    // console.log("loob",this.item)
    // })
    this.storage.get('user').then(data => {
      this.profileInfo = data;
    });
    console.log("labas",this.item)
   }

  ngOnInit() {
    console.log("This is LikeDislikeComponent");
  
  }

  dismissModal(){
    this.modalCtrl.dismiss();
  }
  // goToProfile(){
  //   this.modalCtrl.dismiss();
  //   this.router.navigateByUrl('/my-stylin')
  // }
  ionViewDidEnter() {
    console.log(this.item);
    // this.progressBar.start();
    this.getLikes();
    this.getDislikes();
    console.log("ionViewDidLoad LikesDislikesPage");

    //this.isFromMain = this.navParams.get('fromMain') ? this.navParams.get('fromMain') : null;
    this.dataSource.serviceData.subscribe(data=>{
      this.isFromMain = data['fromMain'] ? data['fromMain'] : null;
    // this.progressBar.complete();

    });
  }

  async goToProfile(user) {
    this.modalCtrl.dismiss();
    if (user.user_id == this.profileInfo['id']) {
      // this.navCtrl.pop().then(() => {
      //   if (!this.isFromMain) {
      //     this.navCtrl.pop();
      //   }
      //   this.events.publish('changeTab', 1);
      // });

      this.navCtrl.navigateForward(['/tabs/tabs/my-stylin']);
    }
    else {
    //   this.navCtrl.pop().then(() => {
    //     this.navCtrl.push(MainProfilePage, {
    //       otherUser: {
    //         id: user.user_id,
    //         profile_about: '',
    //         profile_first_name: user.user_first_name,
    //         profile_last_name: user.user_last_name,
    //         profile_profile_pic: user.user_profile_pic_url
    //       },
    //       status: user
    //     });
    //   });
    // let navigationExtras : NavigationExtras = {
    //     state:{
    //       otherUser: {
    //         id: user.user_id,
    //         profile_about: '',
    //         profile_first_name: user.user_first_name,
    //         profile_last_name: user.user_last_name,
    //         profile_profile_pic: user.user_profile_pic_url
    //       },status: user}
    //   }
    // // this.dataSource.changeData({
    // //   otherUser: {
    // //     id: user.user_id,
    // //     profile_about: '',
    // //     profile_first_name: user.user_first_name,
    // //     profile_last_name: user.user_last_name,
    // //     profile_profile_pic: user.user_profile_pic_url
    // //   },status: user}
    // //   );
    //   this.navCtrl.navigateForward(['/tabs/tabs/my-stylin'],navigationExtras);
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
          }
        };
        this.navCtrl.navigateForward(['/tabs/tabs/my-stylin'],navigationExtras);
        loader.dismiss(); 
      })
    }
    
  }

  getLikes(refresher?, infiniteScroll?) {
    this.progressBar.start();
    this.postService
      .getPostLikes(this.item.id, 1, this.currentPage)
      .then(res => {
        console.log(res);
        if (res["error"] == 0) {
          if (infiniteScroll) {
            this.like_users = this.like_users.concat(res["datas"]);
          } else {
            this.like_users = res["datas"];
          }
          this.like_total = res["total_count"];
        } else {
          this.like_users = null;
          this.like_total = 0;
        }
       this.progressBar.inc(0.5);
       this.progress +=0.5;
        this.checkIfDone();
      })
      .catch(err => {
        this.like_users = null;
        this.like_total = 0;
       this.progressBar.inc(0.5);
       this.progress +=0.5;
        this.checkIfDone();
        console.log(err);
      });

    if (this.refresherRef) {
      this.refresherRef.complete();
      this.progressBar.complete();
    }


    if (infiniteScroll) {
      infiniteScroll.complete();
      this.progressBar.complete();
    }
  }

  checkIfDone() {
     if (this.progress <= 0.9) {
      this.progressBar.complete();
    }else{
      this.progressBar.complete();
    }
  }

  getDislikes(refresher?, infiniteScroll?) {
    this.postService
      .getPostLikes(this.item.id, 0, this.currentPage)
      .then(res => {
        console.log(res);
        if (res["error"] == 0) {
          if (infiniteScroll) {
            this.dislike_users = this.dislike_users.concat(res["datas"]);
          } else {
            this.dislike_users = res["datas"];
          }
          this.dislike_total = res["total_count"];
        } else {
          this.dislike_users = null;
          this.dislike_total = 0;
        }

        this.progressBar.inc(0.5);
        this.progress += 0.5
        this.checkIfDone();
      })
      .catch(err => {
        this.dislike_users = null;
        this.dislike_total = 0;
       this.progressBar.inc(0.5);
       this.progress += 0.5
        this.checkIfDone();
        console.log(err);
      });

    if (this.refresherRef) {
      this.refresherRef.complete();
    }

    if (infiniteScroll) {
      infiniteScroll.complete();
    }
  }

  infiniteScroll: any;
  doInfinite(infiniteScroll: any, type) {
    this.currentPage += 1;
    this.infiniteScroll = infiniteScroll;

    if (type == "likes") {
      if (this.like_users.length < this.like_total) {
        this.getLikes(false, infiniteScroll);
      } else {
        infiniteScroll.enable(false);
      }
    }

    if (type == "dislikes") {
      if (this.dislike_users.length < this.dislike_total) {
        this.getDislikes(false, infiniteScroll);
      } else {
        infiniteScroll.enable(false);
      }
    }
  }

  doRefresh(refresher: any) {
    this.progressBar.start();
    this.currentPage = 1;
    this.getLikes(refresher);
    this.getDislikes(refresher);
  }
  back(){
    this.modalCtrl.dismiss();
  }
  onThumbLoad(e){
    // console.log(e)
  }
  onImgLoad(e){
    // console.log(e)
  }
  likesDislike(){
    console.log(this.actions)
  }
  errorLoad(user){
    console.log("erorr")
    console.log(this.imageDash.src)
    user.errorImage = true;
    this.imageDash.src = "/assets/css/imgs/empty-states/no-user-photo.png";
  }
  ionImgDidLoad(user){
   if(user){
     console.log("loaded")
    user.isLoadedProfile = true;
   }
  }
}
