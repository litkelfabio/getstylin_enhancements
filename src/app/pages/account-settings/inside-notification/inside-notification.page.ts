import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { ComponentsService } from 'src/app/services/components/components.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-inside-notification',
  templateUrl: './inside-notification.page.html',
  styleUrls: ['./inside-notification.page.scss'],
})
export class InsideNotificationPage implements OnInit {
  pageIsLoading: boolean = true;   // flag as false when the getNotificationSettings resolves
  notificationModel = [
    { type: 'all', isMuted: false },
    { type: 'post', isMuted: false },
    { type: 'styleColumn', isMuted: false }
  ]
  settingsChanged: boolean = false;

  constructor(
    private userProvider: UserService,
    private componentsProvider: ComponentsService,
    private navCtrl: NavController
    // public ngProgress: NgProgress
  ) { }

  ngOnInit() {
    // this.routerOutlet.swipeGesture = false;
  }

  ionViewDidEnter() {
    console.log('ionViewDidLoad InsideNotificationPage');
    this.getNotificationSettings();
  }

  ionViewWillLeave() {
    this.getNotificationSettings(true);
  }

  async getNotificationSettings(update?) {
    if (update) {
      let data = {
        muteAll: this.notificationModel[0].isMuted === false ? 0 : 1,
        postNotif: this.notificationModel[1].isMuted === false ? 0 : 1,
        styleColumnNotif: this.notificationModel[2].isMuted === false ? 0 : 1
      }

      // this.ngProgress.start();
      await this.userProvider.getNotificationSettings('getnotifsettings', data, true).then(response => {
        if (response['error'] == 0) {
          console.log('Updated: ', response);
          this.pageIsLoading = false;
        }
        else {
          console.log('Error getting response: ', response);
        }
      }).catch(ex => {
        console.log('Error updating notification settings: ', ex);
        this.componentsProvider.showToast('Cannot update notification settings at this time. Please try again later.');
      }).then(() => {
        // this.ngProgress.done();
      });
    }
    else {
      // this.ngProgress.start();
      await this.userProvider.getNotificationSettings('getnotifsettings').then(response => {
        if (response['error'] == 0) {
          this.pageIsLoading = false;
          console.log(response);
          // Assign current values
          response['muteAll'] == 1 ? this.notificationModel[0]['isMuted'] = true : this.notificationModel[0]['isMuted'] = false;
          response['postNotif'] == 1 ? this.notificationModel[1]['isMuted'] = true : this.notificationModel[1]['isMuted'] = false;
          response['styleColumnNotif'] == 1 ? this.notificationModel[2]['isMuted'] = true : this.notificationModel[2]['isMuted'] = false;

          // this.notificationModel[0]['isMuted'] = response['muteAll'];
          // this.notificationModel[1]['isMuted'] = response['postNotif'];
          // this.notificationModel[2]['isMuted'] = response['styleColumnNotif'];
        }
        else {
          console.log('Error getting notification settings: ', response);
        }
      }).catch(ex => {
        console.log('Error getting notification settings: ', ex);
        // this.navCtrl.pop(); // pop the notification settings page if an error occurred
        // this.ngProgress.done();
      }).then(() => {
        this.pageIsLoading = false;
        // this.ngProgress.done();
      });
    }
  }
  back(){
    this.navCtrl.back();
  }

}
