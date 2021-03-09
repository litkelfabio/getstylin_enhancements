import { Component, OnInit, ViewChild } from '@angular/core';
import {  Router, NavigationExtras} from '@angular/router'
import { IonImg, NavController } from '@ionic/angular';
import { UserService } from 'src/app/services/user/user.service';
import { RewardsService } from 'src/app/services/rewards/rewards.service';
import { Storage } from '@ionic/storage';
import { DatasourceService } from 'src/app/services/datasource/datasource.service';
import { ChallengesService } from 'src/app/services/challenges/challenges.service';
import { DomSanitizer } from '@angular/platform-browser';
import { NgProgressComponent } from 'ngx-progressbar';
@Component({
  selector: 'app-rewards',
  templateUrl: './rewards.page.html',
  styleUrls: ['./rewards.page.scss'],
})
export class RewardsPage implements OnInit {
  @ViewChild("image", {static: false}) imageDash: IonImg;
  @ViewChild("image2", {static: false}) imageDash2: IonImg;
  @ViewChild(NgProgressComponent) progressBar: NgProgressComponent;
  otherUser:any;
  showRewardExclusive: any;
  messageCount:any ;
  profileInfo:any;
  showNotificationBlip: boolean = false;
  messageTabIcon:string = "custom-message-black";
  exclusives:any = [];
  rewards:any = [];
  style_challenges_count: any;
  style_challenges:any;
  isLoaded: boolean = false;
  isLoadedStyleMarket = false;
  isLoadedExclusive = false;
  isLoadedStyleChallenges = false;
  title;
  slideReward = {
    slidesPerView:1.2 ,
    spaceBetween: 15,
  };
  slideChallenges= {
    slidesPerView:1.3,
    spaceBetween: 10,
  };
  constructor(
    private navController: NavController,
    private router:Router,
    private navCtrl: NavController,
    private userProvider: UserService,
    private rewardServ: RewardsService,
    private storage: Storage,
    private dataSource: DatasourceService,
    private challenges :ChallengesService,
    private sanitizer: DomSanitizer
  ) { 
    this.dataSource.serviceData.subscribe(data=>{
      this.otherUser = data['otherUser'] ?data['otherUser']:null; 
    });
  }

  ngOnInit() {
    
  }

  ionViewDidEnter(){
    
    this.getPoints();
      this.rewardServ.getRewardLists().then((r : any) => {
        // r.all.forEach(element => {
        //   element.datas.name = this.sanitizer.bypassSecurityTrustHtml(element.datas.name)
        //   element.datas.promo = this.sanitizer.bypassSecurityTrustHtml(element.datas.promo)
        // });
        console.log('rewardssss',r.all.datas);
        this.rewards = r.all.datas ? r.all.datas : null ;
        this.rewards.forEach(element => {
          element.name = element.name.replace(/<p( \/|\/|)>/gm, '');
          element.promo = element.promo.replace(/<p( \/|\/|)>/gm, '');
        });
        this.exclusives = r.exclusives.datas ? r.exclusives.datas : null;
        console.log('exclusives:',this.exclusives.isShow);
        console.error('EXCLUSIVES:',this.exclusives.length);
        this.exclusives.forEach((element : any)=> {
          console.log('ELEMENT ', element);
          if(element.isShow == '1'){
            this.showRewardExclusive = true;
          }else{
            this.showRewardExclusive = false
          }
        });
      });
      this.storage.get("user").then(user => {
        console.log('GET USER STORAGE', user);
        this.profileInfo = user;
      });

      this.challenges.getChallengeLists().then(res =>{
        this.progressBar.complete();
        let r:any = res;
        if(r.error == 0){
          this.style_challenges = r.data.datas;
          this.style_challenges_count = this.style_challenges.length
          console.log('datassssss',this.style_challenges);
          console.log("LENGTH: ", this.style_challenges.length)
        }
      });
      this.isLoaded =true;
      // 
      this.progressBar.start();
  }
  points:number;

  getPoints() {
    if (this.otherUser) {
      this.userProvider.getUserPoints(false, this.otherUser.id).then(res => {
        if (res["error"] == 0) {
          this.points = res["points"];
          console.log('points:',this.points);
        } else {
          this.points = 0;
        }
      });
    } else {
      this.userProvider.getUserPoints().then(res => {
        if (res["error"] == 0) {
          this.points = res["points"];
          console.log('points:',this.points);
        } else {
          this.points = 0;
        }
      });
    }
  }

  gotoRewardsDetail(id){
    // console.log('asdasdasdasdasdasdasdasd',this.profileInfo.id,id);
    // this.navCtrl.push(RewardDetailsPage,{user_id:this.profileInfo.id,reward_id:id});
  }

  goToChallengeDetails(id){
    // console.log('sample',id);
    // this.navCtrl.push(PagesRewardDetailsPage,{challenge_id: id});
  }

  getTierName(num){
    if(num == 2){
      return "SUPER STAR";
    } else if( num == 3 ){
      return "ICON";
    } else if ( num == 4 ){
      return "LEGEND";
    }
  }

  goToMyClaimedRewards(){
    let navigationExtras: NavigationExtras = {
      state: {
        special: this.profileInfo.id
      }
    };
    this.router.navigate(['tabs/tabs/rewards/my-rewards'], navigationExtras); 
  }

  doRefresh(event) {
    this.ionViewDidEnter();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
  goToMyrewards(){
    this.navController.navigateForward('/tabs/tabs/rewards/my-rewards')
  }
  onImgLoad(e)
  {
      
  }
  onThumbLoad(e)
  {
     
  }
  goToStyleChallenges(id){
    console.log("carousel ID",id)
    this.dataSource.changeData(id);
    this.navCtrl.navigateForward(['/tabs/tabs/rewards/style-challenges']);
  }
  goToStyleMarket(id){
    let navigationExtras: NavigationExtras = {
      state: {
        user_id: this.profileInfo.id,
        reward_id: id,
        context: 'from-market'
      }
    };
    this.router.navigate(['/tabs/tabs/rewards/reward-detail'], navigationExtras);
  }
  goToMyRewards(){
    let navigationExtras: NavigationExtras = {
      state: {
        special: this.profileInfo.id
      }
    };
    this.router.navigate(['tabs/tabs/rewards/my-rewards'], navigationExtras);
  }
  errorLoad(item){
    console.log("erorr")
    console.log(this.imageDash.src)
    item.errorImage = true;
    this.imageDash.src = "/assets/css/imgs/empty-states/no-user-photo.png";
  }
  errorLoad2(item){
    console.log("erorr")
    console.log(this.imageDash.src)
    item.errorImage = true;
    this.imageDash2.src = "/assets/css/imgs/empty-states/no-user-photo.png";
  }
  ionImgDidLoadStyleMarket(item){
    if(item){
      item.isLoadedStyleMarket = true;
    } 
  }
  ionImgDidLoadExclusive(item){
    if(item){
      item.isLoadedExclusive = true;
    } 
  }
  ionImgDidLoadStyleChallenge(carousel){
    if(carousel){
      carousel.isLoadedStyleChallenges = true;
    } 
  }
}

