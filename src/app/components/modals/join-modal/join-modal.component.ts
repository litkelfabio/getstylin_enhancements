import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DatasourceService } from 'src/app/services/datasource/datasource.service';

@Component({
  selector: 'app-join-modal',
  templateUrl: './join-modal.component.html',
  styleUrls: ['./join-modal.component.scss'],
})
export class JoinModalComponent implements OnInit {
  params: any;
  constructor(
    private modalCtrl: ModalController
  ) {

   }

  ngOnInit() {}

  dismissModal(){
    this.modalCtrl.dismiss();
  }
}
