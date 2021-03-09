import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, LoadingController, ModalController, NavController, IonImg } from '@ionic/angular';
import { ChallengesService } from 'src/app/services/challenges/challenges.service';
import { DatasourceService } from 'src/app/services/datasource/datasource.service';
import { Storage } from '@ionic/storage';
import { JoinModalComponent } from 'src/app/components/modals/join-modal/join-modal.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-style-challenges',
  templateUrl: './style-challenges.page.html',
  styleUrls: ['./style-challenges.page.scss'],
})
export class StyleChallengesPage implements OnInit {
  @ViewChild("image2") imageDash: IonImg;
  img;
  seeTerms = false;
  items: any = [];
    itemHeight: number = 0;
    challenge_id:any;
  constructor(
    private challengesService: ChallengesService,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private storage: Storage,
    private dataSource: DatasourceService,
    private domSanitizer: DomSanitizer,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) { 
    
    this.items = [
      {expanded: false},
  ];
  }

  expandItem(item){
 
    this.items.map((listItem) => {

        if(item == listItem){
            listItem.expanded = !listItem.expanded;
        } else {
            listItem.expanded = false;
        }

        return listItem;

    });

  }
  hideJoinButton:any;
  ngOnInit() {
    this.getChallengeDetails();
    this.hideJoinButton = false;
    
    console.log('constructor');
  }
  hideButton(bool){
    this.hideJoinButton = bool;
  }
  ionViewWillLeave(){
    this.hideJoinButton = true;
  }

  profileInfo:any;
  ionViewWillEnter() {
    // console.log('ionViewDidLoad PagesRewardDetailsPage');
    this.storage.get("user").then(user => {
      console.log(user);
      this.profileInfo = user;
      this.getJoinedChallenges();
    });
    
  }
  challenge_details:any;
  getChallengeDetails(){
    //this.challenge_id = this.navParams.get('challenge_id');
    this.dataSource.serviceData.subscribe(data=>{
      this.domSanitizer.bypassSecurityTrustHtml(data);
      this.challenge_id = data
      console.log('challenge_id',this.challenge_id);
      this.challengesService.getDetails(this.challenge_id).then(res => {
        let r:any = res;
        if(r.error == 0){
          this.challenge_details = r.data;
          this.img = this.challenge_details.photo;
          console.log('details:',this.challenge_details);
        }
      });
    });
  }
  joinedChallenges:any;
  alreadyJoined = false;
  getJoinedChallenges(){
    console.log('id join:',this.profileInfo.id);
    this.challengesService.getJoined(this.profileInfo.id).then(res => {
      let r:any = res;
      if(r.error == 0){
        this.joinedChallenges = r.data;
        if(this.joinedChallenges.find(element => element == this.challenge_id)){
          console.log('already joined');
          this.alreadyJoined = true;
        }
        console.log('joined:',this.joinedChallenges);
      }
    });

  }

  // getImgBg(){
  //   return "url(" + this.challenge_details.photo + ")";
  // }
  counter:number = 0;
  async joinNowButton(){
    let loader = await this.loadingCtrl.create({
      message: 'Almost there...'
      
    });
    loader.present();
    try {
      let obj = {
        challenge_id: this.challenge_id,
        user_id: this.profileInfo.id
      }
      if(this.challengesService.lastChallengeJoined != this.challenge_id){
  
       await this.challengesService.joinChallenge(obj).then(async res =>{
          console.log('resulttttt',res);
          let r:any = res;
          if(r.error == 0){
            this.counter++;
            console.log('page reward:',this.counter);
            let params = {
                purpose: 'join-challenge',
                title:'Thank You!',
                sub_text: "You're now part of this challenge."
              }
              const modal = await this.modalCtrl.create({
                cssClass: 'joinModal',
                component: JoinModalComponent,
                componentProps:{
                  params
                }
              });
              modal.present();
              this.getJoinedChallenges();
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
  clickTerms(){
    if(this.seeTerms == false){
      this.seeTerms = true
    }else{
      this.seeTerms=false
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
  errorLoad(item){
    console.log("erorr")
    console.log(this.imageDash.src)
    item.errorImage = true;
    this.imageDash.src = "/assets/css/imgs/empty-states/no-user-photo.png";
  }
}
