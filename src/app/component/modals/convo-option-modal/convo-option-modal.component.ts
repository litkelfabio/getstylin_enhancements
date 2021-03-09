import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, ModalController, NavController } from '@ionic/angular';
import { BlockedService } from 'src/app/services/blocked/blocked.service';
import { ChatService } from 'src/app/services/chat/chat.service';
import { EventsService } from 'src/app/services/events.service';

@Component({
  selector: 'app-convo-option-modal',
  templateUrl: './convo-option-modal.component.html',
  styleUrls: ['./convo-option-modal.component.scss'],
})
export class ConvoOptionModalComponent implements OnInit {

  convo: any;
  conversationData: any;
  constructor(
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private chatService: ChatService,
    private blockService: BlockedService,
    private modalCtrl: ModalController,
    private events: EventsService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.conversationData = this.convo;
    console.log(this.convo);
  }

  async blockUserPrompt() {
    let alertMsg;

    if (this.conversationData['isBlocked'] === true || this.conversationData['blockedBy'] === true) {
      alertMsg = 'Unblock this user?';
    }
    else {
      alertMsg = 'Are you sure you want to block this user?'
    }

    const confirm = await this.alertCtrl.create({
      message: alertMsg,
      mode : "md",
      cssClass: 'muteAlertModal',
      buttons: [
        
        {
          /* text: 'Yes',
          handler: () => {
            console.log('Blocking.');
            this.block();
          } */
          text: 'Cancel',
          role: 'cancel',
          handler: () => {}
        },
        {

          /*  text: 'No',
           role: 'cancel',
           handler: () => {} */
           text: 'Yes',
           handler: () => {
             console.log('Blocking.');
             this.block();
             this.modalCtrl.dismiss();
           }
           
         },
      ]
    });
    confirm.present();
  }

  async block() {
    let alertContent;
    if (this.conversationData['isBlocked'] === true || this.conversationData['blockedBy'] === true) {
      alertContent = 'Unblocking user...';
      const blockingAlert = await this.loadingCtrl.create({
        message: alertContent
      });
      blockingAlert.present();

      let data = {friendId: this.conversationData['other_user_id']};
      await this.blockService.save(data).then(response => {
        console.log(response);
        // this.dismiss(response);
        // this.dismiss('blocked');
        this.events.publish('refresh-message');
          this.events.publish('init-subscribers');
          this.events.publish('init-inbox');
          blockingAlert.dismiss();
          this.modalCtrl.dismiss();
      }).catch(ex => {
        console.log('Error blocking this user: ', ex);
      }).then(() => {
        blockingAlert.dismiss();
      });
    }
    else {
      alertContent = 'Blocking user...';
      const blockingAlert = await this.loadingCtrl.create({
        message: alertContent
      });
      blockingAlert.present();

      let data = {friendId: this.conversationData['other_user_id']};
      await this.blockService.save(data).then(response => {
        console.log(response);
        // this.dismiss(response);
        this.events.publish('refresh-message');
          this.events.publish('init-subscribers');
          this.events.publish('init-inbox');
          blockingAlert.dismiss();
          this.modalCtrl.dismiss();
      }).catch(ex => {
        console.log('Error blocking this user: ', ex);
      }).then(() => {
        blockingAlert.dismiss();
      });
    }
  }

  async deleteMessagePrompt() {
    this.modalCtrl.dismiss();
    const confirm = await this.alertCtrl.create({
      mode: "md",
      cssClass:'blockAlert',
      message: "Are you sure you want to delete this conversation?",
      buttons: [
        {
          text: "Cancel",
          role: 'cancel',
          handler: () => {
            console.log("Disagree clicked");
          }
        },
        {
          text: "Yes",
          handler: async () => {
            let deleteLoader = await this.loadingCtrl.create({
              message: 'Deleting conversation...'
            });
            deleteLoader.present();
        
            console.log("Agree clicked");
            this.deleteThisConvo();
            this.events.publish('refresh-message');
            this.events.publish('init-subscribers');
            this.events.publish('init-inbox');
            deleteLoader.dismiss();
            confirm.dismiss();
           
            
            // this.navCtrl.back();
            // this.modalCtrl.dismiss('close messageModal').then( ()=>{
            //   deleteLoader.dismiss();
            //   this.modalCtrl.dismiss();
            // })
          }
        },
      ]
    });
    confirm.present();
  }


  async deleteThisConvo() {
    console.log('Deleting this conversation.');
    
    let convoId = this.conversationData['id'];
    this.chatService.socketEmitDeleteConvo(convoId);
    this.modalCtrl.dismiss();
    // this.dismiss('deleted');
      
      
      this.modalCtrl.dismiss()
  }

  async reportConversation() {
    const reportConvoPrompt = await this.alertCtrl.create({
      mode: 'md',
      cssClass:'reportAlert',
      header: 'Report Conversation as Inappropriate',
      message: 'This conversation will be reported as inappropriate, and if proven, this conversation will be removed and we will contact the other user.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Proceed',
          handler: () => {
            this.saveReportConvo(this.conversationData['id']);
            this.modalCtrl.dismiss();
          }
        },
      ]
    });
    reportConvoPrompt.present();
  }

  async saveReportConvo(convo) {
    console.log('Reporting this conversation as inappropriate: ', convo);
    const loadingPrompt = await  this.loadingCtrl.create({
      message: 'Please wait...'
    });

    loadingPrompt.present().then(() => {
      setTimeout(async () => {
        loadingPrompt.dismiss();

        const reportSuccess = await this.alertCtrl.create({
          mode: 'md',
          message: 'Your report has been submitted and will be subjected for review.',
          buttons: [
            {
              text: 'Okay',
              handler: () => {
                this.events.publish('refresh-message');
                this.events.publish('init-subscribers');
                this.events.publish('init-inbox');
                this.modalCtrl.dismiss();
              }
            }
          ]
        });
        reportSuccess.present();
      }, 1000);
    });
  }

}
