import { Component, OnInit } from '@angular/core';
import { ComponentsService } from 'src/app/services/components/components.service';
import { UserService } from 'src/app/services/user/user.service';
import { Storage } from '@ionic/storage';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.page.html',
  styleUrls: ['./privacy.page.scss'],
})
export class PrivacyPage implements OnInit {

  isLoading: boolean = true;
  isUpdated: boolean = false;
  profile: any;
  privacyToggles = {
    priv: false,
    activity: false
  }

  constructor(
    public userProvider: UserService,
    public componentsProvider: ComponentsService,
    private storage: Storage,
    private navCtrl: NavController,
  ) { }

  ngOnInit() {
    // this.routerOutlet.swipeGesture = false;
  }

  ionViewDidEnter() {
    console.log('ionViewDidLoad PrivacyPage');
    this.getSettings();
  }

  ionViewWillLeave() {
    this.update();
  }

  getSettings() {
    this.storage.get('user').then(data => {
      if (data) {
        console.log(data);
        this.profile = data;
        this.profile['account_private'] == '1' ? this.privacyToggles.priv = true : this.privacyToggles.priv = false;
        this.profile['activity_status'] == '1' ? this.privacyToggles.activity = true : this.privacyToggles.activity = false;

        console.log(this.privacyToggles);
        this.isLoading = false;
      }
    });
  }

  update() {
    let toggles = this.privacyToggles;
    console.log(toggles);

    let data = {
      account_private: toggles.priv === true ? 1 : 0,
      activity_status: toggles.activity === true ? 1 : 0
    }

    this.userProvider.updatePrivacy('status', data).then(response => {
      if (response['error'] == 0) {
        console.log('OK: ', response);
        this.profile['account_private'] = response['datas']['account_private'];
        this.profile['activity_status'] = response['datas']['activity_status'];
        this.storage.set('user', this.profile);
        console.log('Stored data updated.');
      }
      else {
        console.log('Error updating privacy settings: ', response);
        this.componentsProvider.showToast('Failed to update Privacy settings right now. Try again later.');
      }
    }).catch(ex => {
      console.log('Error updating privacy settings: ', ex);
      this.componentsProvider.showToast('Failed to update Privacy settings right now. Try again later.');
    });
  }

  gotoMuted() {
    let navigationExtras: NavigationExtras = {
      state: {
        type: "muted accounts"
      }
    };
    this.navCtrl.navigateForward(['/connection-requests'],navigationExtras);
  }

  gotoBlocked() {
    let navigationExtras: NavigationExtras = {
      state: {
        type: "blocked accounts"
      }
    };
    this.navCtrl.navigateForward(['/connection-requests'],navigationExtras);
  }
  back(){
    this.navCtrl.back();
  }

}
