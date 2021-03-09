import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonRouterOutlet, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.page.html',
  styleUrls: ['./profile-settings.page.scss'],
})
export class ProfileSettingsPage implements OnInit {

  hasApplied: boolean = false;  // flag this to true once
  status: any;

  constructor(
    private router: Router,
    private routerOutlet: IonRouterOutlet,
    private storage: Storage,
    private navCtrl: NavController
    ){}

  ngOnInit() {
    this.routerOutlet.swipeGesture = false;
  }
  
  ionViewWillEnter() {
    this.storage.get('user').then(data => {
      if (data['stylist'] > 0 && data['stylist'] != 4) {
        this.hasApplied = true;
        this.status = data['stylist'];
        console.log("STATUS: ", this.status)
      }
    });
  }
  goToUsername(){
    this.router.navigateByUrl('/username')
  }
  goToEmail(){
    this.router.navigateByUrl('/e-mail')
  }

  goToPrivacy() {
    this.router.navigateByUrl('/stylist-application');
  }
  back(){
    this.navCtrl.back();
  }
}
