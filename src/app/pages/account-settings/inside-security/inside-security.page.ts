import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-inside-security',
  templateUrl: './inside-security.page.html',
  styleUrls: ['./inside-security.page.scss'],
})
export class InsideSecurityPage implements OnInit {
  userData: any;
  click= false;
  constructor(
    private route : ActivatedRoute,
    private navCtrl: NavController,
    private router: Router
  ) { 
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.userData = this.router.getCurrentNavigation().extras.state.userData;
      }
    });
  }

  ngOnInit() {
    
  }

  goToInnerSetting(){
    let navigationExtras: NavigationExtras = {
      state: {
        context: "password"
      }
    };
    this.navCtrl.navigateForward(['/account-settings-inside'],navigationExtras);
    // this.navCtrl.push(AccountSettingsInnerPage, {context: "password"});
  }
  goToInnerHistory(){
    let navigationExtras: NavigationExtras = {
      state: {
        context: "history"
      }
    };
    this.navCtrl.navigateForward(['/account-settings-inside'],navigationExtras);
    // this.navCtrl.push(AccountSettingsInnerPage, {context: "history"})
  }
  goToHistory(){
    let navigationExtras: NavigationExtras = {
      state: {
        context: "search"
      }
    };
    this.navCtrl.navigateForward(['/other-inner-settings/search'],navigationExtras);
    // this.navCtrl.push(OtherInnerSettingsPage, {context: "search"});
  }
  back(){
    this.click = true;
    this.navCtrl.navigateBack('/account-settings')
  }
  ionViewDidLeave(){
    this.click = false;
  }

}
