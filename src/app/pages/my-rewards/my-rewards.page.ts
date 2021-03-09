import { Component, OnInit, ViewChild } from '@angular/core';
import {  Router, NavigationExtras, ActivatedRoute} from '@angular/router'
import { IonImg, NavController } from '@ionic/angular';
import { UserService } from 'src/app/services/user/user.service';
import { RewardsService } from 'src/app/services/rewards/rewards.service';
import { Storage } from '@ionic/storage';
import { DatasourceService } from 'src/app/services/datasource/datasource.service';
import { ChallengesService } from 'src/app/services/challenges/challenges.service';
@Component({
  selector: 'app-my-rewards',
  templateUrl: './my-rewards.page.html',
  styleUrls: ['./my-rewards.page.scss'],
})
export class MyRewardsPage implements OnInit {
  // otherUser:any;
  // messageCount:any ;
  // profileInfo:any;
  // showNotificationBlip: boolean = false;
  // messageTabIcon:string = "custom-message-black";
  // exclusives:any = [];
  // rewards:any = [];
  // style_challenges:any;
  @ViewChild("image", {static: false}) imageDash: IonImg;
  loading = true;
  reward_id: any;
  rewards:any = [];
  user_id:any;
  isLoadedResult = false;
  constructor(
    private router:Router,
    private navCtrl: NavController,
    private userProvider: UserService,
    private rewardServ: RewardsService,
    private storage: Storage,
    private dataSource: DatasourceService,
    private challenges :ChallengesService,
    private activatedRoute: ActivatedRoute
  ) { 
    this.activatedRoute.queryParams.subscribe(res =>{
      try {
        this.user_id = this.router.getCurrentNavigation().extras.state.special;
      } catch (error) {
        console.log(error)
      }
      console.log("DATA: ", this.user_id)
      console.log("this.user_id", this.user_id)
      this.rewardServ.getClaimedReward(this.user_id).then( res =>{
      let e:any = res;
      console.log('itooo',e);
      this.rewards = e.data;
      // this.reward_id = res.data['id'];
        this.loading = false;
      console.log("this.reward_id", this.reward_id);
      console.log("this.rewards", this.rewards);
    })
    });
  }


  ngOnInit() {
    //this.rewardServ.claimReward(this.user_id);
    
  }
  gotoDetails(id){
    // this.dataSource.changeData({user_id:this.user_id,reward_id:id});
    let navigationExtras: NavigationExtras = {
      state: {
        user_id: this.user_id,
        reward_id: id,
      }
    };
    this.router.navigate(['/tabs/tabs/rewards/reward-detail'], navigationExtras);
  }


  ionViewDidEnter(){
    // this.getPoints();
    //   this.rewardServ.getRewardLists().then(res => {
    //     let r:any = res;
    //     console.log('rewardssss',r.all.datas);
    //     this.rewards = r.all.datas;
    //     this.exclusives = r.exclusives.datas;
    //     console.log('exclusives:',this.exclusives);
    //   });
    //   this.storage.get("user").then(user => {
    //     console.log('GET USER STORAGE', user);
    //     this.profileInfo = user;
    //   });

    //   this.challenges.getChallengeLists().then(res =>{
    //     let r:any = res;
    //     if(r.error == 0){
    //       this.style_challenges = r.data.datas;
    //       console.log('datassssss',this.style_challenges);
    //     }
    //   });
  }
  // points:number;

  // getPoints() {
  //   if (this.otherUser) {
  //     this.userProvider.getUserPoints(false, this.otherUser.id).then(res => {
  //       if (res["error"] == 0) {
  //         this.points = res["points"];
  //         console.log('points:',this.points);
  //       } else {
  //         this.points = 0;
  //       }
  //     });
  //   } else {
  //     this.userProvider.getUserPoints().then(res => {
  //       if (res["error"] == 0) {
  //         this.points = res["points"];
  //         console.log('points:',this.points);
  //       } else {
  //         this.points = 0;
  //       }
  //     });
  //   }
  // }

  gotoRewardsDetail(id){
    // console.log('asdasdasdasdasdasdasdasd',this.profileInfo.id,id);
    // this.navCtrl.push(RewardDetailsPage,{user_id:this.profileInfo.id,reward_id:id});
  }

  goToChallengeDetails(id){
    // console.log('sample',id);
    // this.navCtrl.push(PagesRewardDetailsPage,{challenge_id: id});
  }

  // getTierName(num){
  //   if(num == 2){
  //     return "SUPER STAR";
  //   } else if( num == 3 ){
  //     return "ICON";
  //   } else if ( num == 4 ){
  //     return "LEGEND";
  //   }
  // }

  goToMyClaimedRewards(){
    // this.navCtrl.push(MyRewardsPage);
  }

  doRefresh(event) {
    this.ionViewDidEnter();
    event.complete();
  }
  goToRewardsPage(){
    this.router.navigateByUrl('/tabs/tabs/rewards')
  }
  back(){
    this.navCtrl.navigateBack('/tabs/tabs/rewards');
  }
  onImgLoad(e){
    console.log(e)
  }

  onThumbLoad(e){
    console.log(e)
  }
  errorLoad(item){
    console.log("erorr")
    console.log(this.imageDash.src)
    item.errorImage = true;
    this.imageDash.src = "/assets/css/imgs/empty-states/no-user-photo.png";
  }
  ionImgDidLoadRewards(reward){
    if(reward){
      reward.isLoadedResult = true;
    } 
  }

}
