import { Component, OnInit } from '@angular/core';
import {ModalController} from '@ionic/angular'
@Component({
  selector: 'app-favorite-brand-modal',
  templateUrl: './favorite-brand-modal.component.html',
  styleUrls: ['./favorite-brand-modal.component.scss'],
})
export class FavoriteBrandModalComponent implements OnInit {

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}


  dismissModal(){
    this.modalCtrl.dismiss();
  }
}
