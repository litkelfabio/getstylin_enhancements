import { Component, OnInit } from '@angular/core';
import {ModalController} from '@ionic/angular'
import { ActivatedRoute, Router } from '@angular/router'
@Component({
  selector: 'app-skip-modal',
  templateUrl: './skip-modal.component.html',
  styleUrls: ['./skip-modal.component.scss'],
})
export class SkipModalComponent implements OnInit {

  progressData: any;
  progress: any;
  data: any;
  intervalId;
  type:any;
  percent = 33;
  constructor(
    private modalCtrl: ModalController,
    private router: Router,
  ) {}

  ngOnInit() {
    this.progressData = this.data
  }

  closeModal(){
    this.modalCtrl.dismiss();
  }
  goToProfile(){
    this.router.navigateByUrl('/edit-profile')
    this.modalCtrl.dismiss();
  }
  ionViewDidEnter() {
    console.log('ionViewDidLoad SkipModalPage');
    this.getProfileProgress(this.progressData);
  }

  // dismiss(dismissedFromEvent?){
  //   dismissedFromEvent ? console.log('Dismissed via event.') : console.log('Dismissed manually.');
  //   this.viewCtrl.dismiss();
  // }

  stopPropagation(e){
    e.stopPropagation();
  }


  getProfileProgress(data) {
    // There are 12 individual values in the profile that is part of the
    // progress calculation, two of which are arrays. The brands array is counted
    // as an individual value, regardless of length; the clothing array is counted
    // per value as they represent different items.
    // Thus: 100 / 12 = 8.33 => % value per item

    // We call this static progress since this portion is comprised
    // of the username, first/last names, and sex, which are all required.
    var staticProgress = 33.32;

    if (data) {
      // Add individual values to the current static progress.
      if (data.profile_birthdate) { staticProgress += 7.4088; }
      if (data.profile_location) { staticProgress += 7.4088; }
      if (data.profile_about) { staticProgress += 7.4088; }
      if (data.brands.length > 0) { staticProgress += 7.4088; }

      var sizes = data.clothing;
      if (sizes[0]) { staticProgress += 7.4088; }
      if (sizes[1]) { staticProgress += 7.4088; }
      if (sizes[2]) { staticProgress += 7.4088; }
      if (sizes[3]) { staticProgress += 7.4088; }
      if (sizes[4]) { staticProgress += 7.4088; }

      this.progress = staticProgress.toFixed(0);
    }
    else {
      this.progress = 0;
    }
  }

}
