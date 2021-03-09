import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, NavController, IonSlides, PopoverController } from '@ionic/angular';
import { TutorialPage } from 'src/app/pages/tutorial/tutorial/tutorial.page';
import { TutorialPopoverComponent } from '../tutorial-popover/tutorial-popover.component';
import { TutorialComponent } from '../tutorial/tutorial.component';

@Component({
  selector: 'app-tutorial-modal',
  templateUrl: './tutorial-modal.component.html',
  styleUrls: ['./tutorial-modal.component.scss'],
})
export class TutorialModalComponent implements OnInit {

  constructor(
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private pop: PopoverController
  ) { }

  ngOnInit() {}

  skipTutorial(){
    this.modalCtrl.dismiss();
  }
  async goToTutorial(){
    this.modalCtrl.dismiss();
    //this.navCtrl.navigateRoot('/tutorial')
    const modal = await this.modalCtrl.create({
      mode:'ios',
      component: TutorialComponent,
      backdropDismiss: false, 
    });
    modal.present();
    
  }
}
