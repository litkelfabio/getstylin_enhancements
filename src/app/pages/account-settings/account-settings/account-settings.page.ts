import { Component, NgZone, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { EventsService } from 'src/app/services/events.service';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.page.html',
  styleUrls: ['./account-settings.page.scss'],
})
export class AccountSettingsPage implements OnInit {

  userData: any;

  constructor(
    private router: Router,
    private storage: Storage,
    private navCtrl: NavController,
    private events: EventsService,
    private platform : Platform,
    private ngZone : NgZone
  ) {
    // this.platform.backButton.subscribe(() => {
    //   console.log('Back button clicked here!');
    //   this.ngZone.run(() =>{
    //     this.navCtrl.navigateBack('/tabs/tabs/my-stylin');
    //   })
    // });
   }

  ngOnInit() {
    // this.routerOutlet.swipeGesture = false;
  }

  ionViewDidLeave(){
  }
  
  goToProfileSettings(){
    this.router.navigateByUrl('/profile-settings');
  }
  goToInsideNotification(){
    this.router.navigateByUrl('/inside-notification');
  }
  goToPrivacy(){


    this.router.navigateByUrl('/privacy');
  }
  async goToInsideSecurity(){
    let userData = await this.storage.get('user');

    if(!('isSocial' in userData)) {
      userData['isSocial'] = false;
    }

    let navigationExtras: NavigationExtras = {
      state: {
        userData
      }
    };
    this.router.navigateByUrl('/inside-security', navigationExtras);
  }
  goToAbout(){
      let navigationExtras: NavigationExtras = {
        state: {
          context: "about"
        }
      };
      this.router.navigateByUrl('/other-inner-settings/about', navigationExtras);
  }
  back(){
    this.navCtrl.navigateBack('/tabs/tabs/my-stylin');
    this.events.publish('refresh-main-profile-feed');
  }

}
