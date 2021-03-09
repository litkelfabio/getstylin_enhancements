import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ChallengesService } from 'src/app/services/challenges/challenges.service';
import { ComponentsService } from 'src/app/services/components/components.service';
import { UserService } from 'src/app/services/user/user.service';
import { Storage } from '@ionic/storage';
import { IonImg, NavController } from '@ionic/angular';
import { DatasourceService } from 'src/app/services/datasource/datasource.service';
import { IonRouterOutlet } from '@ionic/angular';
@Component({
  selector: 'app-member-privileges',
  templateUrl: './member-privileges.page.html',
  styleUrls: ['./member-privileges.page.scss'],
})
export class MemberPrivilegesPage implements OnInit {
  @ViewChild("image", {static: false}) imageDash: IonImg;
  @ViewChild("image2") imageDash2: ElementRef;
  isLoaded: boolean = false;
  current_rank: any;
  pageContext: any;
  pageRank: any;
  rewards: any;
  ranking: any;
  style_challenges: any;
  style_challenges_count: any;
  isLoadedStyleChallenges = false;
  profile: any;
  points: any;
  tierData: any;
  slideReward = {
    slidesPerView:1.3 ,
    spaceBetween: 20,
    
  };

  ranks: any = {
    rising_star: {
      title: "Rising Star",
      description: "YOU ARE A RISING STAR!",
      min_points: 0,
      max_points: 5000
    },
    super_star: {
      title: "Super Star",
      description: "YOU ARE A SUPER STAR!",
      min_points: 5001,
      max_points: 15000
    },
    icon: {
      title: "Icon",
      description: "YOU ARE AN ICON!",
      min_points: 15001,
      max_points: 20000
    },
    legend: {
      title: "Legend",
      description: "YOU ARE A LEGEND!",
      min_points: 20001
    }
  };
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private componentService: ComponentsService,
    private storage: Storage,
    private challengeService: ChallengesService,
    private navCtrl: NavController,
    private dataSource: DatasourceService,
    private routerOutlet: IonRouterOutlet
  ) {
    this.activatedRoute.queryParams.subscribe( res =>{
      this.profile = this.router.getCurrentNavigation().extras.state.profileInfo;
      this.points = this.router.getCurrentNavigation().extras.state.points;
    })
   }

  ngOnInit() {
    this.routerOutlet.swipeGesture = false;
    console.log("this.profile", this.profile)
    console.log("this.points", this.points)
    this.activatedRoute.queryParams.subscribe( res =>{
      this.pageContext = this.router.getCurrentNavigation().extras.state.context;
    });
    if (this.pageContext == "rising") {
      this.pageRank = "RISING STAR PRIVILEGES";
    }
    this.checkPoints();
    this.challengeService.getChallengeLists().then(res =>{
      let r:any = res;
      if(r.error == 0){
        this.style_challenges = r.data.datas;
        this.style_challenges_count = this.style_challenges.length;
        console.log('datassssss',this.style_challenges);
      }
    });
  }
  checkPoints() {
    if (!this.points) {
      this.userService.getUserPoints().then(res => {
        this.points = parseInt(res["points"]);
      });
    }

    console.log("points", this.points);

    if(this.points < 5000) {
      this.ranking = "rising_star";
    } else if (this.points >= 5000 && this.points < 15000) {
      this.ranking = 'super_star';
    } else if (this.points >= 15000 && this.points < 20000) {
      this.ranking = "icon";
    } else if (this.points >= 20000) {
      this.ranking = "legend";
    }

    this.rewards = this.ranking;
    this.current_rank = this.ranks[this.ranking];
    console.log(this.rewards);
    console.log("ranks", this.ranks[this.ranking]);
    console.log("ranks", this.current_rank.description);
  }

  ionViewDidEnter() {
    this.getTierPrivilege();
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad MemberPrivilegesPage");
  }

  regexPoints(points) {
    return (this.componentService.separatePoints(points));
  }

  getTierPrivilege(userId?) {
    console.log(this.profile);
    let rewardsCacheId = 'rewards-' + this.profile['id'];
    console.log(rewardsCacheId);

    this.storage.get(rewardsCacheId).then(data => {
      if (data) {
        if (data['rank'] != this.ranking) {
          this.getTierPrivilegeData();
        }
        else {
          console.log("Not getting tier rewards; already in cache.");
          this.tierData = data['rewards'];

          console.log('Tier data: ', this.tierData);
          
        }
        this.isLoaded = true;
      }
      else {
        this.getTierPrivilegeData();
      }
    }).then(() => {
      
    });
  }

  getTierPrivilegeData() {
    let rewardsCacheId = "rewards-" + this.profile["id"];
    this.userService.getRewards("rewards").then(response => {
      if (response["error"] == 0) {
        console.log(response["datas"]);
        this.tierData = response["datas"];
        let userPoints = this.points;
        let lastKnownRank = this.ranking;
        let progressData = response["datas"];
        this.storage.set(rewardsCacheId, {
          points: userPoints,
          rank: lastKnownRank,
          rewards: progressData
        }).then(() => {
          this.isLoaded = true;
        });
      } else {
        console.log("Error getting privileges: ", response);
      }
    }).catch(ex => {
      console.log("Error getting privileges: ", ex);
    });
  }

  // goToRisingStar() {
  //   this.navCtrl.push(MemberPrivilegesPage, { context: "rising" });
  // }

  goToViewPrevilege() {
    let navigationExtras: NavigationExtras = {
      state: {
        tierData: this.tierData,
        points: this.points
      }
    };
    this.navCtrl.navigateForward('/tabs/tabs/my-stylin/page-view-privileges', navigationExtras);
  }
  // goToRewardDetails(id){
  //   console.log('sample',id);
  //   this.navCtrl.push(PagesRewardDetailsPage,{challenge_id: id});
  // }

  // goToMyRewards(){
  //   this.navCtrl.push(MyRewardsPage);
  // }
  // doRefresh(event) {
  //   this.checkPoints();
  //   this.challenges.getChallengeLists().then(res =>{
  //     let r:any = res;
  //     if(r.error == 0){
  //       this.style_challenges = r.data.datas;
  //       console.log('datassssss',this.style_challenges);
  //       event.complete();
  //     }
  //   });
  // }
  goToStyleChallenges(id){
    console.log("IDD: ", id);
    this.dataSource.changeData(id);
    this.navCtrl.navigateForward(['/tabs/tabs/rewards/style-challenges']);
  }
  onThumbLoad(e){
    console.log(e);
  }
  onImgLoad(e){
    console.log(e);
  }
  goToMyClaimedRewards(){
    let navigationExtras: NavigationExtras = {
      state: {
        special: this.profile.id
      }
    };
    this.router.navigate(['/my-rewards2'], navigationExtras);
  }

  rewardButton(){
    console.log(this.rewards)
  }
  back(){
    this.navCtrl.navigateBack('tabs/tabs/my-stylin');
  }
  errorLoad(item){
    console.log("erorr")
    console.log(this.imageDash.src)
    item.errorImage = true;
    this.imageDash.src = "/assets/css/imgs/empty-states/no-user-photo.png";
  }
  ionImgDidLoad(){
    console.log("didLoad?");
    const image = document.getElementById('image2')
    // image.shadowRoot.innerHTML = '<style> img{ border-radius: 10px}</style>';
     
    console.log(image)
  }
  ionImgDidLoadStyleChallenges(carousel){
    if(carousel){
      carousel.isLoadedStyleChallenges = true;
    } 
  }
}
