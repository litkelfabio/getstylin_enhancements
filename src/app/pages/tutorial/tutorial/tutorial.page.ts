import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, PopoverController, IonSlides } from '@ionic/angular';
import { TutorialPopoverComponent } from 'src/app/components/modals/tutorial-popover/tutorial-popover.component';
import { EventsService } from 'src/app/services/events.service';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.page.html',
  styleUrls: ['./tutorial.page.scss'],
})
export class TutorialPage implements OnInit {

  constructor(
    private popoverCtrl: PopoverController,
    private events: EventsService,
    private modalCtrl : ModalController
  ) {
   }

  ngOnInit() {
    
  }
  
  
}