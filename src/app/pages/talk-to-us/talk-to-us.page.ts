import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AlertController, LoadingController, ModalController, NavController } from '@ionic/angular';
import { JoinModalComponent } from 'src/app/components/modals/join-modal/join-modal.component';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { TalkToUsService } from 'src/app/services/talk-to-us/talk-to-us.service';
import { Keyboard } from '@ionic-native/keyboard/ngx';
@Component({
  selector: 'app-talk-to-us',
  templateUrl: './talk-to-us.page.html',
  styleUrls: ['./talk-to-us.page.scss'],
})
export class TalkToUsPage implements OnInit {
  talkForm: FormGroup;
  translator: any;
  constructor(
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private talkService: TalkToUsService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private keyboard: Keyboard
  ) {

    this.talkForm = this.formBuilder.group({
      contact_name: [
        '',
        Validators.compose([
          Validators.required,
        ])
      ],
      contact_email: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern(/(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i),
          Validators.maxLength(60)
        ])
      ],
      contact_message: [
        '',
        Validators.compose([
          Validators.required,
        ])
      ],
    })
  }

  ngOnInit() {
    // this.translator = document.getElementById('send').style.transform = "translateY(475%)"
  }

  ionViewDidEnter() {

  }

  back() {
    this.navCtrl.navigateBack('/tabs/tabs/my-stylin');
  }

  async sendMessage() {
    let loading = await this.loadingCtrl.create({
      message: 'Sending...'
    });
    loading.present();
    let thisData = this.talkForm.value;
    var formData = new FormData();
    let temp = {};
    temp = {
      'contact_name': thisData.contact_name,
      'contact_email': thisData.contact_email,
      'contact_message': thisData.contact_message,
    }
    await this.talkService.saveContact(temp).then(async (result: any) => {
      if (result.error == 0) {
        let params = {
          purpose: 'join-challenge',
          title: 'Message Sent!',
          sub_text: "We'll get back to you as soon as we can."
        }
        let modal = await this.modalCtrl.create({
          cssClass: 'joinModal',
          component: JoinModalComponent,
          componentProps: {
            params
          }
        });
        loading.dismiss();
        this.talkForm.reset();
        modal.present();
        // this.navCtrl.navigateBack('/tabs/tabs/my-stylin');
      } else {
        let alert = await this.alertCtrl.create({
          message: 'Unexpected error occured.',
          cssClass:'welcomealert',
          buttons: [
            {
              text: 'OK',
              role: 'Cancel'
            }
          ]
        });
        loading.dismiss();
        alert.present();
      }
    })
  }

  autoGrow(e) {
    e.target.style.height = "0px";
    e.target.style.height = (e.target.scrollHeight + 20) + "px";
    let tempScroll = e.target.scrollHeight + 1;
  }
  scrollToView() {
    document.getElementById("text-area").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  responsiveButton() {
    let replacer = this.translator.replace('translateY(', '');
    replacer = replacer.replace(')', '')
    replacer = replacer.replace('%', '')
    console.log(parseInt(replacer))
    replacer = parseInt(replacer) - 4
    this.translator = 'translateY(' + replacer + '%)'
    document.getElementById('send').style.transform = this.translator.toString()
    console.log(this.translator)
  }
}
