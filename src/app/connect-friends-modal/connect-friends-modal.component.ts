import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { ComponentsService } from '../services/components/components.service';
import { UserService } from '../services/user/user.service';
import { Clipboard } from '@ionic-native/clipboard/ngx';

@Component({
  selector: 'app-connect-friends-modal',
  templateUrl: './connect-friends-modal.component.html',
  styleUrls: ['./connect-friends-modal.component.scss'],
})
export class ConnectFriendsModalComponent implements OnInit {

  isSending: boolean = false;
  emailAddress: any;
  error: any;
  link: any;

  constructor(
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private userService: UserService,
    private componentsService: ComponentsService,
    private clipboard: Clipboard
  ) {
    this.userService.getEmailLink('invitefriend').then(res => {
      if(res) {
        if(res['error'] == 0) {
          this.link = res['url'];
        }
      }
    });
   }

  ngOnInit() {}

  regexMe(email) {
    let regex = new RegExp(/(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i);
    let check = regex.test(email);
    return check;
  }

  async sendInvite() {
    console.log("CLICK")
    this.isSending = true;

    let validation = this.regexMe(this.emailAddress);
    if (validation === false) {
      this.error = 'Please enter a valid email address.';
      this.isSending = false;
    }
    else {
      console.log('Email address is valid.');
      this.error = null;

      let data = { email: this.emailAddress }

      await this.userService.sendEmailInvite('invitefriend', data).then(response => {
        if (response['error'] == 0) {
          console.log(response);
          this.componentsService.showToast('Invite sent.');
          // this.viewCtrl.dismiss();
        }
        else {
          console.log('Error sending email invite: ', response);
          if (response['message'] == 'email already registered') {
            this.error = 'Email address is already registered.';
          }
          else if (response['message'] == 'you can\'t invite your own email') {
            this.error = 'You can\'t invite your own email address.';
          }
          else if (response['message'] == 'Email already registered') {
            this.error = 'Email address is already registered.';
          }
          else if (response['message'] == 'You\'ve already invited this account') {
            this.error = 'You\'ve already invited this account.';
          }
          else {
            this.error = 'Cannot send email invite at this time. Please try again later.';
          }
        }
      }).catch(ex => {
        console.log('Error sending email invite: ', ex);
        this.error = 'Cannot send email invite at this time. Please try again later.';
      }).then(() => {
        this.isSending = false;
        this.emailAddress = null;
      });
    }
  }

  activeField: any;
  toggleActiveField(field?) {
    if (field) {
      this.activeField = field;
    }
    else {
      this.activeField = null;
    }
  }

  stopPropagation(e) {
    e.stopPropagation();
  }


  addToClipboard() {

    if(this.link) {
       this.clipboard.copy(this.link);
       this.componentsService.showToast('Link was copied to clipboard!');
    }
  }

}
