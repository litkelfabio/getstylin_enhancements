import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, ModalController, Platform, IonRefresher, NavController, IonImg, IonSearchbar } from '@ionic/angular';
import { MessageModalComponent } from 'src/app/components/modals/message-modal/message-modal.component';
import { ChatService } from 'src/app/services/chat/chat.service';
import { Storage } from '@ionic/storage';
import { EventsService } from 'src/app/services/events.service';
import { Observable, Subscription } from 'rxjs';
import _ from 'lodash';
import { ComponentsService } from 'src/app/services/components/components.service';
import { MessageUserComponent } from 'src/app/components/modals/message-user/message-user.component';
import { NgProgressComponent } from 'ngx-progressbar';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
})
export class MessagesPage implements OnInit {
  @ViewChild('refresherRef') refresherRef: IonRefresher;
  @ViewChild(NgProgressComponent) ngProgress: NgProgressComponent;
  @ViewChild("image", {static: false}) imageDash: IonImg;
  @ViewChild('searchBar') searchBar : IonSearchbar
  isFaulted: boolean = false;
  isSearching: boolean = false;
  pageIsLoading: boolean = true;
  showActive = 0;   // flip this to 1 depending on stored values
  lastOpenedThread: any;  // assign the convo ID of the last opened thread here.
  currentPage: number = 1;
  maxPages: any;
  messages: any = [];
  convos: any;
  isAndroid:any ;
  data:any = [];  
  infiniteScroll: any;
  isInit: boolean;
  isLoadedProfile = false;
  isLoadedMessage = false;
  tempTotal: any;
  tempLength = 0;
  isNotified: any;
  showSpinner = false;
  constructor(
    private modalCtrl:ModalController,
    private chatProvider: ChatService,
    private storage: Storage,
    private events: EventsService,
    private componentsProvider: ComponentsService,
    private alertCtrl: AlertController,
    private platform: Platform,
    private router: Router,
    private route: ActivatedRoute,
    private navCtrl: NavController,
  ) { 
    this.route.queryParams.subscribe(params => {
      try{
        this.isNotified = this.router.getCurrentNavigation().extras.state.isNotified;
      }catch(e){
        this.isNotified = false;
      }
      if (params && params.special) {
        this.data = JSON.parse(params.state);
        console.log("receive data from notification: ",this.data);
      }else{
        this.storage.get('unread_conversations').then(data => {
          if (data) {
            console.log("DATA ", data['0']['message'])
            this.myUnreads = data;
          }
        });
      }
    });
    this.isAndroid = this.platform.is('android');
    this.events.subscribe("init-subscribers", () => {
      this.subscribers();
    });

    this.events.subscribe('init-inbox', () => {
      if(this.searchBar.value.length !=0){
        this.searchBar.value = "";
        this.getInbox();
      }else{
        this.getInbox();
      }
    });

    // this.events.publish('has-message');
    this.events.subscribe('new-message', () =>{
      // this.subscribeToMessages().subscribe( result =>{
        this.getInboxAutoReload();
        console.log("NEW MESSAGE")
      // })
    })

  }
  

  ngOnInit() {
    this.subscribers();
  }
  ionViewWillLeave(){
    this.ngProgress.complete();
  }

  async presentUserListModal() {
    //     const modal = await this.modalCtrl.create({
    // //   mode:'ios',
    // //   component: MessageModalComponent,
    // //   backdropDismiss: true,
    // //   componentProps: {
    // //     convo,
    // //   }
    // // });
    
    // await modal.present();

    // let userList = await this.modalCtrl.create(DiscoverInnerPage, {
    //   context: "messages"
    // });
    // userList.onDidDismiss(() => {
    //   console.log("User list dismissed.");
    // });
    // await userList.present();
  } 


  subscribeToMessages() {
    let observable = new Observable(observer => {
      this.chatProvider.socket().on("emit otheruser convo", data => {
        observer.next(data);
      });
    });
    return observable;
  }

  ionViewDidEnter() {
    // this.events.publish("disconnect-socket");
    this.events.publish("init-socket");
      
    console.log('isInit ', this.isInit);
    if (!this.isInit) {
      setTimeout(() => {
        this.subscribers();
        this.isInit = true;
      }, 200);

      this.getInbox();
    }
  }

  ionViewWillEnter(){
    // this.getInbox();
  }
  
  async openMessageModal(convo, i){
    const modal = await this.modalCtrl.create({
      mode:'ios',
      component: MessageModalComponent,
      backdropDismiss: true,
      componentProps: {
        convo,
      }
    });
    this.storage.set('convo-lists', this.convos.length + this.tempLength)
    await modal.present();
    modal.onWillDismiss().then(async res =>{
      if(this.searchBar.value.length ==0){
        await this.storage.get('convo-lists').then( res =>{
          console.log("CONVO TEMP NUMBER: ",res);
          this.tempTotal = res
          this.currentPage =  1;
          if(this.tempTotal < 12){
            this.tempTotal = 12;
          }
          this.getInbox(null, null, this.tempTotal);
        this.storage.set('unread_conversations', null)
        this.events.publish('has-messages');
        })
        this.storage.remove('convo-lists');
      }
    });
    // this.events.destroy('has-messages');
  }
  ionViewDidLeave(){
    this.isInit =false;
    this.events.destroy('has-messages');
    this.storage.remove('unread_conversations');
  }

  total_count: any;
  myUnreads: any;
  getInbox(infiniteScroll?, isRefresh?, total?) {
    console.log("TOTAL: ",total);
    this.ngProgress.start();
    this.chatProvider
      .getInbox(null, this.currentPage, total ? total : 12)
      .then((res:any)=> {
        this.ngProgress.complete();
        if (res) {
      
          this.total_count = res["total_count"];
          if (!infiniteScroll) {
            console.log('Convo listing: ', res['datas']);
            let unfilteredConvos = res['datas'];
            let filteredConvos = [];
            unfilteredConvos.map(cnv => {
              if (cnv['blockedBy'] === false && cnv['isBlocked'] === false) {
                if (this.lastOpenedThread && cnv['id'] == this.lastOpenedThread) {
                  cnv['read_at'] = new Date();
                }
                filteredConvos.push(cnv);
              }
              else {
                console.log('Blocked conversation found: ', cnv);
                this.tempLength +=1;
                console.log(this.tempLength)
                // this.storage.set('convo-lists', this.convos.length + cnv.length)
                // unfilteredConvos.splice(cnv)
              }
            });

            // this.convos = res['datas'];
            this.convos = filteredConvos;
            console.log("convos length: ", this.convos)
            if (isRefresh) {
              this.cacheConversationList(res["datas"], true);
            }
            else {
              this.cacheConversationList(res["datas"]);
            }

            // Negate the isFaulted state if the page is refreshed.
            this.isFaulted = false;

            // console.log('Updated convo list: ', rawConvoData);
            // this.convos = rawConvoData;
            
          }
          else {
            this.convos.concat(res['datas']);
         
            res['datas'].map(convo => {
              this.convos.push(convo);
            })

            console.log('PUMASOK', res['datas']);
            this.cacheConversationList(this.convos, true);
            this.ngProgress.complete();
          }
        } else {
         
          console.log("Error getting conversations: ", res);
          this.isFaulted = true;
          this.ngProgress.complete();
        }
        this.pageIsLoading = false;

        // if (isRefresh) {
        //   isRefresh.complete();
        // }

        if (infiniteScroll) {
          infiniteScroll.target.complete();
        }
        console.log("Is the load request faulted? ", this.isFaulted);

      })
      .catch(ex => {
        console.log("Error getting conversations: ", ex);
        this.ngProgress.complete();
        this.isFaulted = true;
      })
  }

  getInboxAutoReload(infiniteScroll?, isRefresh?, total?) {
    console.log("TOTAL: ",total);
    // this.ngProgress.start();
    this.showSpinner = true
    this.chatProvider
      .getInbox(null, this.currentPage, total ? total : 12)
      .then((res:any)=> {
        this.showSpinner = false
        // this.ngProgress.complete();
        if (res) {
          this.total_count = res["total_count"];
          if (!infiniteScroll) {
            console.log('Convo listing: ', res['datas']);
            let unfilteredConvos = res['datas'];
            let filteredConvos = [];
            unfilteredConvos.map(cnv => {
              if (cnv['blockedBy'] === false && cnv['isBlocked'] === false) {
                if (this.lastOpenedThread && cnv['id'] == this.lastOpenedThread) {
                  cnv['read_at'] = new Date();
                }
                filteredConvos.push(cnv);
              }
              else {
                console.log('Blocked conversation found: ', cnv);
                this.tempLength +=1;
                console.log(this.tempLength)
                // this.storage.set('convo-lists', this.convos.length + cnv.length)
                // unfilteredConvos.splice(cnv)
              }
            });

            // this.convos = res['datas'];
            this.convos = filteredConvos;
            console.log("convos length: ", this.convos)
            if (isRefresh) {
              this.cacheConversationList(res["datas"], true);
            }
            else {
              this.cacheConversationList(res["datas"]);
            }

            // Negate the isFaulted state if the page is refreshed.
            this.isFaulted = false;

            // console.log('Updated convo list: ', rawConvoData);
            // this.convos = rawConvoData;
            
          }
          else {
            this.convos.concat(res['datas']);
         
            res['datas'].map(convo => {
              this.convos.push(convo);
            })

            console.log('PUMASOK', res['datas']);
            this.cacheConversationList(this.convos, true);
            this.ngProgress.complete();
          }
        } else {
         
          console.log("Error getting conversations: ", res);
          this.isFaulted = true;
          this.ngProgress.complete();
        }
        this.pageIsLoading = false;

        // if (isRefresh) {
        //   isRefresh.complete();
        // }

        if (infiniteScroll) {
          infiniteScroll.target.complete();
        }
        console.log("Is the load request faulted? ", this.isFaulted);

      })
      .catch(ex => {
        console.log("Error getting conversations: ", ex);
        this.ngProgress.complete();
        this.isFaulted = true;
      })
  }

  // Cache the first 20 conversations to be successfully loaded.
  // This constitutes to about 2 pages worth of conversations, but just the list.
  // The inner messages' caching will be handled by the Message Thread view.
  async cacheConversationList(listData, isRefresh?) {
    console.log('Caching conversations.');
    this.storage
      .get("conversations")
      .then(data => {
        if (isRefresh) {
          console.log("Page refreshed; replacing/updating cached data.");
          this.storage.set("conversations", listData);
        } else if (data) {
          console.log("Conversation cache present; trying to append.");
          if (data.length < 20) {
            // Append new data here if cache length is less than 20.
            this.storage.set("conversations", listData);
          } else {
            // Reject this cache request.
          }
        }
        else {
          console.log('No convo cache data found.');
          this.storage.set('conversations', listData);
        }
      })
      .catch(ex => {
        console.log("Cannot access Storage; not creating/accessing cache.");
      });
  }

  doInfinite(event) {
    this.infiniteScroll = event;
    if (this.convos.length < (this.total_count - this.tempLength)) {
      this.currentPage++;
      this.getInbox(this.infiniteScroll);
    } else {
      console.log("Max page resocketEmitMessageached.");
      // this.infiniteScroll = true;
      this.infiniteScroll.disabled = true;
      this.isLoadedMessage = true;
      this.infiniteScroll.target.complete();
    }
    console.log('CURRENT PAGE', this.currentPage);
    console.log('Convo COUNT', this.convos.length);
    console.log('Total COUNT', this.total_count - this.tempLength);
  }

  doRefresh(event) {
    this.currentPage = 1;
    this.pageIsLoading = true;
    console.log(this.infiniteScroll)
    if(this.searchBar.value.length != 0){
      console.log(this.searchBar.value)
      this.searchRefreshConvo(this.searchBar.value)
    }else{
      if (event == 'reload') {
        this.getInbox(null, null);
        
      } else {
        this.getInbox(null, event);
        event.target.complete();
      }
  
    }
    
    this.refresherRef.disabled = false; 
  }

  async goToMessageUserModal(){
    this.searchBar.value = '';
    const modal = await this.modalCtrl.create({
      component: MessageUserComponent,
      componentProps: {
      }
    });
    this.storage.set('convo-lists', this.convos.length + this.tempLength)
    modal.present();
    modal.onWillDismiss().then(async res =>{
      // this.getInbox();
      // this.storage.set('unread_conversations', null)
      // this.events.publish('has-messages')
      await this.storage.get('convo-lists').then( res =>{
        console.log("CONVO TEMP NUMBER: ",res);
        this.tempTotal = res
        this.currentPage =  1;
        if(this.tempTotal < 12){
          this.tempTotal = 12;
        }
        this.getInbox(null, null, this.tempTotal);
      this.storage.set('unread_conversations', null)
      this.events.publish('has-messages');
      })
      this.storage.remove('convo-lists');
    })
  }

  subscribers() {
    /*
      This event is fired by the Tabs controller holding the first emitConvo
      subscriber. Instead of reinstantiating another subscriber in this page,
      we simply subscribe to the event fired by that subscriber in order to update
      the conversation list shown.
    */
    console.log('Subscribing to has-messages event.');
    this.events.subscribe('has-messages', data => {
      console.log('Other user emitted convo: ', data);

      let tempConvo;
      this.convos.map(convo => {
        if (convo.id == data['convo'].id) {
          tempConvo = convo;
          this.convos = _.remove(this.convos, convo => {
            return convo.id != data['convo'].id;
          });
        }
        else {
          console.log('Other User: ', data['user'], ' Convo: ', data['convo']);

          tempConvo = data['convo'];
          tempConvo.other_img_url = data['user'].profile_profile_pic;
          tempConvo.other_first_name = data['user'].profile_first_name;
          tempConvo.other_last_name = data['user'].profile_last_name;
          tempConvo.other_user_id = data['user'].id;
        }
      });

      tempConvo.last_message = data['message'] != '' ? data['message'] : 'Sent an attachment.';
      tempConvo.update_at = new Date();
      tempConvo.read_at = '';
      this.convos.unshift(tempConvo);
    });

    // This subscriber block is for convoDelete. This fires every time a conversation is deleted.
    let convoDelObsv = this.deletedConvo();
    let convoDelObsvSubscriber: Subscription = convoDelObsv.subscribe(data => {
      if (data['error'] == 0) {
        this.componentsProvider.showToast(data['message']);
      }
    }, convoDeleteObserverError => {
      console.log('convoDeleteObserverError: ', convoDeleteObserverError);
    });
  }

  deletedConvo() {
    return new Observable(observer => {
      this.chatProvider.socket().on('delete convo', data => {
        observer.next(data);
        console.log('Observer next data (delete): ', data);
        this.modalCtrl.dismiss();
      });
    });
  }

  async searchConvo(event) {
    console.log(event.target.value);
    if (event.target.value) {
      this.isSearching = true;

      this.ngProgress.start();
      await this.chatProvider
        .searchConversation("getconvo", event.target.value)
        .then(response => {
          console.log(response);
          if (response && response["message"] == "Success!") {
    
            let conversations = response["datas"];
            if (conversations.length > 0) {
              this.convos = response["datas"];
            } else {
              this.ngProgress.complete();
              this.convos = [];
              this.isLoadedMessage = false;
              console.log("No conversation found.");
            }
          } else {
            this.ngProgress.complete();
            console.log("Error getting conversation: ", response);
            this.componentsProvider.showToast(
              "Cannot find the conversation right now. Try again later."
            );
          }
        })
        .catch(ex => {
          this.ngProgress.complete();
          console.log("Error getting conversation: ", ex);
          this.componentsProvider.showToast(
            "Cannot find the conversation right now. Try again later."
          );
        })
        .then(() => {
          this.ngProgress.complete();
        });
    } else {
      this.restoreCachedMessages();
    }
  }

  async searchRefreshConvo(value) {
    console.log(value);
    if (value) {
      this.isSearching = true;

      this.ngProgress.start();
      await this.chatProvider
        .searchConversation("getconvo", value)
        .then(response => {
          console.log(response);
          if (response && response["message"] == "Success!") {

            let conversations = response["datas"];
            if (conversations.length > 0) {
              this.convos = response["datas"];
              this.refresherRef.complete();
            } else {
              this.ngProgress.complete();
              this.convos = [];
              console.log("No conversation found.");
              this.refresherRef.complete();
            }
          } else {
            this.ngProgress.complete();
            this.refresherRef.complete();
            console.log("Error getting conversation: ", response);
            this.componentsProvider.showToast(
              "Cannot find the conversation right now. Try again later."
            );
          }
        })
        .catch(ex => {
          this.ngProgress.complete();
          this.refresherRef.complete();
          console.log("Error getting conversation: ", ex);
          this.componentsProvider.showToast(
            "Cannot find the conversation right now. Try again later."
          );
        })
        .then(() => {
          this.pageIsLoading = false;
          this.ngProgress.complete();
          this.refresherRef.complete();
        });
    } else {
      this.restoreCachedMessages();
      this.refresherRef.complete();
    }
  }

  restoreCachedMessages() {
    this.isSearching = false;

    this.storage
      .get("conversations")
      .then(data => {
        this.convos = data;
      })
      .then(() => {
        this.getInbox();
      });
  }

  async promptDeleteConvo(convo) {
    const confirm = await this.alertCtrl.create({
      mode: "md",
      message: "Are you sure you want to delete this conversation?",
      buttons: [
        {
          text: "cancel",
          role: 'cancel', 
          // handler: () => {
          //   console.log("Disagree clicked");
          // }
        },
        {
          text: "Yes",
          handler: () => {
            this.deleteConvo(convo);
          }
        },
      ]
    });
    confirm.present();
  }

  deleteConvo(convo) {
    console.log("!: ", convo);
    console.log("!: ",convo.id);
    console.log("Deleting this stuff.");
    this.convos = _.remove(this.convos, item => {
      return item != convo;
    });

    this.chatProvider.socketEmitDeleteConvo(convo.id);
  }

  getMomentFormat(stamp) {
      return this.componentsProvider.getTimestampFormat(stamp, "YYYY-MM-DD hh:mm:ss");
  }
  back(){
    if(this.isNotified){
      // this.events.publish('no-show-progress');
      let navigationExtras: NavigationExtras={
        state:{
          dontShow: true
        }
      }
      this.navCtrl.navigateBack('/tabs/tabs/dashboard', navigationExtras);
    }else{
      this.navCtrl.navigateBack('/tabs/tabs/dashboard');
    }
   
  }
  errorLoad(convo){
    console.log("erorr")
    console.log(this.imageDash.src)
    convo.errorImage = true;
    console.log(convo.errorImage) 
    convo.isLoadedProfile = true;
    // this.imageDash.src = "/assets/css/imgs/empty-states/no-user-photo.png";
  }
  isLoadedImg2(convo){
    console.log("isLoaded image...");
    if(convo){
      convo.isLoadedProfile = true;
    } 
  }

  isLoadedImg3(convo){
    console.log("isLoaded image...");
    if(convo){
      convo.isLoadedProfile = true;
    } 
  }
}
