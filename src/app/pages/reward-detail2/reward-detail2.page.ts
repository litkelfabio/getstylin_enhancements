import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonImg, LoadingController, ModalController, NavController } from '@ionic/angular';
import { JoinModalComponent } from 'src/app/components/modals/join-modal/join-modal.component';
import { DatasourceService } from 'src/app/services/datasource/datasource.service';
import { RewardsService } from 'src/app/services/rewards/rewards.service';
import { UserService } from 'src/app/services/user/user.service';
//import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { ComponentsService } from 'src/app/services/components/components.service';
@Component({
  selector: 'app-reward-detail2',
  templateUrl: './reward-detail2.page.html',
  styleUrls: ['./reward-detail2.page.scss'],
})
export class RewardDetail2Page implements OnInit {

  @ViewChild("image2") imageDash: IonImg;
  options : InAppBrowserOptions = {
    location : 'yes',//Or 'no' 
    hidden : 'no', //Or  'yes'
    clearcache : 'yes',
    clearsessioncache : 'yes',
    zoom : 'yes',//Android only ,shows browser zoom controls 
    hardwareback : 'yes',
    mediaPlaybackRequiresUserAction : 'no',
    shouldPauseOnSuspend : 'no', //Android only 
    closebuttoncaption : 'Close', //iOS only
    disallowoverscroll : 'no', //iOS only 
    toolbar : 'yes', //iOS only 
    enableViewportScale : 'no', //iOS only 
    allowInlineMediaPlayback : 'no',//iOS only 
    presentationstyle : 'pagesheet',//iOS only 
    fullscreen : 'yes',//Windows only    
};

isLoadedReward = false;
  reward_id:any;
  user_id:any;
  reward:any;
  hideJoinButton:any;
  data: any;
  otherUser: any;
  aff_link:any;
  reward_tier: any;
  reward_tier_text: any;
  forAll: boolean = false;
  current_tier: any;
  expired = false;
  constructor(
    private userService: UserService,
    private navCtrl: NavController,
    private rewards: RewardsService,
    private modalCtrl: ModalController,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private theInAppBrowser: InAppBrowser,
    private clipBoard: Clipboard,
    private componentService: ComponentsService,
    private loadingCtrl : LoadingController,
    private alertCtrl: AlertController
  ) {
    this.activatedRoute.queryParamMap.subscribe( res=>{
      this.user_id = this.router.getCurrentNavigation().extras.state.user_id;
      this.reward_id = this.router.getCurrentNavigation().extras.state.reward_id;
    })
   }

   points:number;

    getPoints() {
      if (this.otherUser) {
        this.userService.getUserPoints(false, this.user_id).then(res => {
          console.log("if res",res);
          if (res['error']== 0) {
            this.points = parseInt(res['points']);
            console.log('points:',this.points);
          } else {
            this.points = 0;
          }
        });
      } else {
        this.userService.getUserPoints().then(res => {
          console.log("else res",res);
          if (res['error'] == 0) {
            this.points = parseInt(res['points']);
            console.log('points:',this.points);
          } else {
            this.points = 0;
          }
        });
     }
   }  

  ngOnInit() {
    this.hideJoinButton = false;
    //this.generateQR();
     // this.reward_id = this.navParams.get('reward_id');
      // console.log('reward_id:', this.reward_id);
      // console.log('user_id:', this.user_id);
  }
  ionViewWillEnter(){
      
  }
  hideButton(bool){
    this.hideJoinButton = bool;
  }
  ionViewWillLeave(){
    this.hideJoinButton = true;
  }

  ionViewDidEnter() {
    console.log('ionViewDidLoad RewardDetailsPage');
    let params = {
      reward_id: this.reward_id,
      user_id: this.user_id
    };
    this.getPoints();
    this.getReward(params);
  }
  claimed:boolean = false;
  remainingPoints:any;
  insufficientPoints:any = false;

  getReward(params){
    console.log(params);
    this.rewards.getDetails(params).then( res => {
      let e:any = res;
      this.reward_tier = e.data.tier;
      if(e.error == '0'){
        this.reward = e.data;
        this.aff_link = e.data.aff_link
        let today = new Date();
          let tempExpireDate = new Date(this.reward.expiration_date)
          if(tempExpireDate < today){
            this.expired = true;
          }
        console.log("E ", e)
        console.log('reward points:',this.reward.point_value);
        if(this.reward_tier == '1'){
          this.reward_tier_text = "Rising Star";
        }else if(this.reward_tier == '2'){
          this.reward_tier_text = 'Superstar'
        }else if(this.reward_tier == '3'){
          this.reward_tier_text = 'Icon'
        }else if(this.reward_tier == '4'){
          this.reward_tier_text = "Legend";
        }
        console.log(this.reward_tier)
        if(this.reward.claimed_rewards.find(element => element == this.reward_id)){
          console.log('already claimed');
          this.claimed = true;
        } else {
          this.remainingPoints = this.points - parseInt(this.reward.point_value);
          console.log('else1');
        }
        if(this.reward_tier == '0'){
          console.log("all tier ", this.reward_tier)
          this.current_tier = this.reward_tier; 
          console.log("hayss ", this.reward_tier , this.current_tier)
          this.forAll = true;
        }else if(this.points < 15000 && this.points > 5000 ){
          this.current_tier = "2";
        }else if(this.points < 20000 && this.points > 15000){
          this.current_tier = "3";
        }else if(this.points >= 20000){
          this.current_tier = "4";
        }else{
          this.current_tier = "1";
          console.log(this.current_tier)
          console.log("reward tier: ", e.data.tier)
        }
        if(this.points >= parseInt(this.reward.point_value)){
          console.log("LINE 104",this.points)
          if(this.reward.claimed_rewards.find(element => element == this.reward_id)){
            console.log('already claimed');
            this.claimed = true;
            this.reward.isLoadedReward = true;
          } else {
            this.remainingPoints = this.points - parseInt(this.reward.point_value);
            console.log('else1');
          }
        } else {
          console.log('else2');
          this.insufficientPoints = true;
        }
      }
    }, err =>{
      console.log('error', err);
    });
    
  }


  counter:number = 0;
  async claimNow(){
    let loader = await this.loadingCtrl.create({
      message: 'Almost there...'
      
    });
    loader.present();
    try {
      let obj = {
        reward_id: this.reward_id,
        id: this.user_id
      }
      console.log('obj:',obj);
      if(this.rewards.lastClaimedReward != this.reward_id){
        this.rewards.claimReward(obj).then(async res =>{
          console.log('resulttttt',res);
          let r:any = res;
          if(r.error == 0){
            this.counter++;
            console.log('page reward:',this.counter);
            let params = {
                purpose: 'join-challenge',
                title:'Congratulations!',
                sub_text: "You can view this in your MY REWARDS"
              }  
              const modal = await this.modalCtrl.create({
                cssClass: 'joinModal',
                component: JoinModalComponent,
                componentProps:{
                  params
                }
              });
              modal.present();
              this.ionViewDidEnter();
              loader.dismiss();
          }
        })
      }
    } catch (error) {
     let alert = await this.alertCtrl.create({
        message: error
      });
      loader.dismiss();
      alert.present();
    }
    
  }

  onImgLoad(e){
    console.log(e);
  }
  onThumbLoad(e){
    console.log(e);
  }

  back(){
    this.navCtrl.back();
  }
  openUrl(){ 
    let target = "_blank";
    this.theInAppBrowser.create(this.aff_link, target, this.options);
  }

  // generateQR(){
  //   console.log('aff_link: ', this.aff_link)
  //   this.barcodeScanner
  //     .encode(this.barcodeScanner.Encode.TEXT_TYPE, this.aff_link)
  //     .then(
  //       encodedData => {
  //         console.log(encodedData);
  //         this.aff_link = encodedData;
  //       },
  //       err => {
  //         console.log("Error occured : " + err);
  //       }
  //     );
  // }
  copyUrl() {
    if(this.aff_link) {
       this.clipBoard.copy(this.aff_link);
       this.componentService.showToast('Link was copied to clipboard!');
    }
  }
  errorLoad(item){
    console.log("erorr")
    console.log(this.imageDash.src)
    item.errorImage = true;
    this.imageDash.src = "/assets/css/imgs/empty-states/no-user-photo.png";
  }

  ionImgDidLoadReward(reward){
      reward.isLoadedReward = true;
      console.log("trigerred?")
  }

}
