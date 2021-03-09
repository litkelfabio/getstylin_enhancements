import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-page-view-privileges',
  templateUrl: './page-view-privileges.page.html',
  styleUrls: ['./page-view-privileges.page.scss'],
})
export class PageViewPrivilegesPage implements OnInit {

  points: any;
  tierData: any;
  selectedTier: any;
  ranking: any = 'rising_star';
  rewards: any = 'rising_star';
  isLoaded: boolean = false;

  message: any;
  constructor(
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private router: Router
  ) {
    this.activatedRoute.queryParams.subscribe(res => {
      this.points = this.router.getCurrentNavigation().extras.state.points;
      this.tierData = this.router.getCurrentNavigation().extras.state.tierData;
    })
  }

  ngOnInit() {
    console.log("tierData", this.tierData);
    console.log("points", this.points);
    this.checkPoints();
  }
  ionViewDidEnter() {
    console.log('POINTS ', this.points);
    console.log('TIER DATA, ', this.tierData);

    console.log('ionViewDidLoad PagesViewPrivilegePage');
  }

  changeRank() {
    this.isLoaded = false;
    switch (this.rewards) {
      case 'rising_star':

        this.selectedTier = this.tierData[0]
        this.nextTier = this.tierData[1];
        break;
      case 'super_star':
        this.selectedTier = this.tierData[1]
        this.nextTier = this.tierData[2];
        break;
      case 'icon':
        this.selectedTier = this.tierData[2]
        this.nextTier = this.tierData[3];
        break;
      case 'legend':
        this.selectedTier = this.tierData[3]
        this.nextTier = this.tierData[3];
        break;
      default:
        break;
    }


    console.log('SELECTED TIER ', this.selectedTier);
    console.log('SELECTED RANK ', this.rewards);

    this.isLoaded = true;
    this.checkMessage();
  }


  nextTier: any;
  checkPoints() {

    console.log("points", this.points);

    if (this.points < 5000) {

      this.ranking = "rising_star";
      this.selectedTier = this.tierData[0]
      this.nextTier = this.tierData[1];
    } else if (this.points >= 5000 && this.points < 15000) {
      this.ranking = 'super_star';
      this.selectedTier = this.tierData[1]
      this.nextTier = this.tierData[2];
    } else if (this.points >= 15000 && this.points < 20000) {
      this.ranking = "icon";
      this.selectedTier = this.tierData[2]
      this.nextTier = this.tierData[3];
    } else if (this.points >= 20000) {
      this.ranking = "legend";
      this.selectedTier = this.tierData[3]
      this.nextTier = this.tierData[3];
    }

    this.isLoaded = true;

    this.rewards = this.ranking;
    this.checkMessage();

    console.log('SELECTED TIER ', this.selectedTier);
    console.log('NEXT TIER ', this.nextTier);
  }

  checkMessage() {
    // if(this.selectedTier['value'] <= this.points) {
    //   this.message = 'You’ve unlocked this tier.';
    // } else {
    //   this.message = "You need to earn "+(this.selectedTier['value'] - this.points)+" PTS to unlock.";
    // }
    //

    if (this.selectedTier['name'] == 'RISING STAR' && this.points >= 0) {
      this.message = 'You’ve unlocked this tier.';
    } else if (this.selectedTier['name'] == 'SUPERSTAR' && this.points > 4999) {
      this.message = 'You’ve unlocked this tier.';
    } else if (this.selectedTier['name'] == 'ICON' && this.points > 14999) {
      this.message = 'You’ve unlocked this tier.';
    } else if (this.selectedTier['name'] == 'LEGEND' && this.points > 19999) {
      this.message = 'You’ve unlocked this tier.';
    } else {
      var needdedPoints = (this.selectedTier['value'] - this.points);
      if (needdedPoints > 1) {
        this.message = "You need to earn " + (this.selectedTier['value'] - this.points) + " PTS to unlock.";
      } else {
        this.message = "You need to earn " + (this.selectedTier['value'] - this.points) + " PT to unlock.";
      }
    }
  }

  back() {
    this.navCtrl.back();
  }

}
