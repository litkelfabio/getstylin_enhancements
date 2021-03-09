import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { ComponentsService } from 'src/app/services/components/components.service';

@Component({
  selector: 'app-birthday-modal',
  templateUrl: './birthday-modal.component.html',
  styleUrls: ['./birthday-modal.component.scss'],
})
export class BirthdayModalComponent implements OnInit {
  today:any;
  date = this.navParams.get("date") ? this.navParams.get("date") : false;
  birthday = this.navParams.get("datevalue")
    ? this.navParams.get("datevalue")
    : null;
    // date:any ;
    // birthday:any ;
  dateValue:any;
  constructor(private modalCtrl:ModalController,private navParams: NavParams,private componentService:ComponentsService) { }

  ngOnInit() {}
  
  submitBirthday() {
    this.modalCtrl.dismiss({
      birthday: this.componentService.getMomentFormat(this.birthday, 'YYYY-MM-DD')
    });
  }
}
