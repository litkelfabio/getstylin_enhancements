import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, IonInfiniteScroll, IonText, LoadingController, ModalController, NavController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { ChatService } from 'src/app/services/chat/chat.service';
import { ComponentsService } from 'src/app/services/components/components.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { EventsService } from 'src/app/services/events.service';
import { Observable } from 'rxjs';
import { ConvoOptionModalComponent } from 'src/app/component/modals/convo-option-modal/convo-option-modal.component';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-message-modal',
  templateUrl: './message-modal.component.html',
  styleUrls: ['./message-modal.component.scss'],
})
export class MessageModalComponent implements OnInit {

  @ViewChild("chatInput") chatInput: ElementRef;
  @ViewChild("infiniteScroll") infiniteScroll: IonInfiniteScroll;
  @ViewChild("activeText", {read: ElementRef}) activeText: ElementRef;
  public win: any = window;
  message: any = '';
  fromConvo: any;
  nonNormalizedUrl: any;
  convo:any;
  messageAttachment:any;
  isFaulted: boolean = false;
  isInitial: boolean = true; // flag this as false if the user scrolls the page up on their own; prevents firing infiniteScroll event on first load
  isLoading: boolean = true; // flag this as false if the current thread has finished loading.
  isEmpty: boolean = false; // flag this as true if the current thread has no messages
  isSending: boolean = false;
  currentPage = 1; // Current page for message retrieval
  maxPages = 1; // Max pages for this conversation.
  messageToSend = ""; // Message to be sent.
  photo: any;         // Attachment to be sent along with the message.
  photoPath: any;     // Original path for the photo (non-normalized)
  attachment: any;
  messages: any = []; // Message thread list
  // infiniteScroll: any;
  yourId: any;
  loggedUser: any;
  user: any;
  temp_id: any = 1;
  showActive: number;
  context: any;
  otherUser: any;
  updatedState: any;
  ago: any;
  otherUserDate: any;
  isProcessing: boolean = false;
  completedInfinite = false;
  isLoadedAttachment= false;
  timezone = "America/New_York";
  constructor(
    private modalCtrl: ModalController,
    private chatProvider: ChatService,
    private componentsProvider: ComponentsService,
    private storage: Storage,
    private platform: Platform,
    private actionSheetCtrl: ActionSheetController,
    private camera: Camera,
    private filePath: FilePath,
    private events: EventsService,
    private loadingCtrl : LoadingController,
    private _zone : NgZone,
    private navCtrl: NavController
  ) {

    this.storage.get('user').then(data => {
      if (data) {
        // Checks both if the Show Active Status of both users are set to 1 (ON).
        // If both are turned on, they'll be able to see each other's Active statuses.
        // If one is turned OFF (0), this conversation's Active stamp will not be shown.
        this.showActive = data['activity_status'] == 1 && this.convo['activity_status'] == 1 ? 1 : 0;
      }
    });
    this.events.subscribe('refresh-message', ()=>{
      console.log('start refresh-message');
      this.getMessage().subscribe(message => {
        // console.error(this.activeText.nativeElement.innerText);
        // if(this.activeText.nativeElement.innerText == 'Active now ' ){
        //   this.ago= false;
        //   console.log("if",this.ago)
        // }else{
        //   this.ago = true
        //   console.log("else",this.ago)
        // }
        console.log('getMessageRes', message);
        /*
          We implemented a different check method when chatting from ionic serve and actual device.
          This is due to a different response structure between the two.
        */
       let hasSent = false;

       this.messages = this.messages.filter(mess => mess['created_at'] != "Sending");

         if(!hasSent) {
           if(!this.isProcessing) {
             this.isProcessing = true;
             this.messages.push(message["data"]);
             setTimeout(() => {
               this.isProcessing = false;
             },500);
           }
         }
   
         this.temp_id++;
       
        
        this.scrollToView();
      });
    })
    // this.getMessage().subscribe(message => {
    //   console.log('getMessageRes', message);
    //   /*
    //     We implemented a different check method when chatting from ionic serve and actual device.
    //     This is due to a different response structure between the two.
    //   */
    //   if (this.platform.is('pwa')) {
    //     /*
    //       Check if the emitted message is yours.
    //       If yours, simply update the message data with the emitted one.
    //       If not yours, push it to the message tree.
    //     */
    //     console.log("New message emitted (core/desktop/web): ", message);
    //     if (message["data"].user_id != this.convo["user2"]) {
    //       this.messages.map((mess, index) => {
    //         if (mess.temp_id == message["data"]["temp_id"]) {
    //           this.messages[index] = message["data"];
    //         }
    //       });

    //       this.temp_id++;
    //     } else {
    //       this.messages.push(message["data"]);
    //     }
    //   }
    //   else if (this.platform.is('android') || this.platform.is('ios')) {
    //     /*
    //       If the message has a temp_id (signifying that it is marked as Sending i.e. you sent it)
    //       then
    //     */
    //     console.log("New message emitted (mobile): ", message);
    //     if (message['data']['temp_id']) {
    //       this.messages.map((mess, index) => {
    //         if (mess.temp_id == message['data']['temp_id']) {
    //           this.messages[index] = message['data'];
    //         }
    //       });

    //       this.temp_id++;
    //     }
    //     else {
    //       this.messages.push(message['data']);
    //     }
    //     console.log('Current message tree: ', this.messages);
    //   }

    //   this.scrollToView();
    // });
  
   }

   getMessage() {
        
    let observable = new Observable(observer => {
      this.chatProvider.socket().on("chat message", data => {
        console.log('Observable ',data);
        observer.next(data);
      });
    });
    return observable;
  }

  ngOnInit() {
    this.events.publish('refresh-message');
    if(this.context == "userlist") {
      this.convo['other_first_name'] = this.otherUser.profile_first_name;
      this.convo['other_last_name'] = this.otherUser.profile_last_name;
   }
   console.log("This is MessageModalComponent", this.convo['other_first_name']);
  }

  async dismissModal(){
    // await this.modalCtrl.dismiss();
    // this.navCtrl.navigateBack('/tabs/tabs/dashboard/messages')
    // this.events.publish('init-inbox');
    await this.modalCtrl.dismiss();
  }

  ionViewWillLeave() {
    this.chatProvider.socketEmitChatting(0);
    this.events.destroy('refresh-message');
    this.events.publish("disconnect-socket");
    this.events.publish("init-socket");
    this.storage.set('unread_conversations', null)
    // Store the current message tree to cache.
    this.cacheConvoMessages(this.convo['id'], this.messages);
    console.log('Caching messages on view leave.');
  }

  ionViewDidEnter() {
    // console.log("HEHE ", this.activeText.nativeElement.innerText)
    // if(this.activeText.nativeElement.innerText === 'Active now' ){
    //   this.ago= false;
    // }else{
    //   this.ago = true
    // }
    console.log("This conversation data: ", this.convo);

    this.storage.get("user").then(data => {
      console.log('USER DAW',data);
      if (data) {
        this.user = data;
        this.yourId = data["id"];
        this.loggedUser = data;
        // this.events.subscribe('check-convo', ()=>{
        //   this.checkConvo();
        // })
        this.checkConvo();
      }
    });
  }

  checkConvo() {
    if (!this.convo) {
      this.chatProvider.getInbox(this.user.id).then(res => {
        this.convo = res["data"];
        console.log("CONVO ID", res["data"]);
        this.emitConvo();
      });
    } else {
      this.emitConvo();
    }
  }

  emitConvo() {
    this.getPagedMessages(this.convo['id']);
    this.chatProvider.socketEmitChatting(this.convo.id);
  }

    // Smoothly scrolls the current message thread into view.
  // We might also use this to scroll the thread down if user sends or receives a message.
  scrollToView() {
    setTimeout(() => {
      document
        .getElementById("thread")
        .scrollIntoView({ behavior: "smooth", block: "end" });
    }, 500);
  }

  formatTimestamp(stamp) {
    // stamp = moment(stamp).tz(this.timezone);
    stamp = moment(stamp).subtract(13, "hours");
    // alert(stamp);
     return this.componentsProvider.getMomentFormat(
      stamp,
      "MMM DD, YYYY hh:mm A",
      'message'
    );
  }

  sendMessage() {
    console.log("convo",this.convo);
    this.isSending = true;  


    if(!this.chatProvider.isConnected()) {
      this.events.publish("disconnect-socket");
      this.events.publish("init-socket");
      this.events.destroy('refresh-message');
      this.events.publish('refresh-message');
    }

    if (this.message != "" || this.attachment) {
      // If an attachment is present, upload it first before doing all of the following.
      if (this.attachment) {
        let message = {
          temp_id: this.temp_id,
          user_id: this.yourId,
          message: this.message,
          created_at: "Sending",
          attachments: [{link: this.platform.is('ios') ? this.componentsProvider.trustMe(this.attachment['path']) : this.attachment['path']}]
        }
        
        let params = {
          convoid: this.convo['id']
        }

        let attachment = this.attachment;
        if (this.platform.is('ios')) {
          attachment = {
            name: this.attachment['name'],
            path: this.photoPath
          }
        }

        this.chatProvider.uploadAttachment('upload', attachment, params).then(response => {
          if (response['error'] == 0) {
            console.log("CREATED AT",message.created_at)
            
            console.log('Upload OK: ', response);
            let ids = response['data']['ids'][0];
            let attachmentId = [ids];

            this.chatProvider.socketSendMessage(
              this.message,
              this.convo.other_user_id,
              this.convo.id,
              this.temp_id,
              attachmentId
            );
            
            this.chatProvider.socket().emit('emit otheruser convo', {
              user: this.loggedUser,
              userId : this.convo.other_user_id ? this.convo.other_user_id : this.user.id,
              convo: this.convo,
              message: this.message
            });
            
            this.message = null;
            this.removeAttachment();
            
          }
          else {
            console.log('Upload failed: ', response);
            this.componentsProvider.showAlert('Message Not Sent', 'An unexpected error has occurred while trying to send your message. Try again later.');
          }
        }).catch(ex => {
          console.log('Error on upload: ', ex);
          this.componentsProvider.showAlert('Message Not Sent', 'An unexpected error has occurred while trying to send your message. Try again later.');
        }).then(() => {
          this.isSending = false;
        });

        this.messages.push(message);

        // if (this.messages.length > 0) {
        //   this.scrollToView();
        // }
      }
      else if (!this.attachment) {
        this.chatProvider.socketSendMessage(
          this.message,
          this.convo.other_user_id,
          this.convo.id,
          this.temp_id
        );

        this.chatProvider.socket().emit('emit otheruser convo', {
          user: this.loggedUser,
          userId : this.convo.other_user_id ? this.convo.other_user_id : this.user.id,
          convo: this.convo,
          message: this.message
        });

        let message = {
          temp_id: this.temp_id,
          user_id: this.yourId,
          message: this.message,
          created_at: "Sending",
          attachments: []
        }

        this.messages.push(message);

        // if (this.messages.length > 0) {
        //   this.scrollToView();
        // }

        this.message = null;
        this.isSending = false;
      }
    }

    if (this.messages.length > 0) {
      this.scrollToView();
    }
    this.events.publish('refresh-message');
    // if(this.activeText.nativeElement.innerText === 'Active now' ){
    //   this.ago= false;
    // }else{
    //   this.ago = true
    // }
    console.log("Messages",this.messages)
    console.log('Just sent this message: ', this.messages);
    this.message = '';
    // this.chatInput.nativeElement.innerText = null;
  }

  // Gets the current thread's messages.
  async getPagedMessages(convoId, isRefresh?, isInfinite?) {
    if (isInfinite) {
      await this.chatProvider
        .getMesages(convoId, this.currentPage)
        .then(response => {
          if (response["error"] == 0) {
            console.log("Paged messages: ", response);
            let pagedMessages = response["data"]["datas"];
            this.maxPages = response['data']['total_page'];
            pagedMessages.forEach(message => {
              this.messages.unshift(message);
            });

            // this.cacheConvoMessages(this.convo['id'], this.messages, true);
          } else {
            console.log("Error getting paged messages: ", response);
          }
        })
        .catch(ex => {
          console.log("Error getting paged messages: ", ex);
          this.componentsProvider.showAlert('', 'An error has occurred while trying to get your messages. Please try again later.');
          isInfinite.target.complete();
        })
        .then(() => {
          isInfinite.target.complete();

          if (this.currentPage >= this.maxPages) {
            this.infiniteScroll.disabled = true;
          }
        });
    } else {
      // For initialize request
      await this.chatProvider
        .getMesages(convoId, this.currentPage)
        .then(res => {
          console.log(res);
          if (res && res["error"] == 0) { 
            console.log("Get messages (paged): ", res["data"]["datas"]);
            let messageTree = res["data"]["datas"];
            this.maxPages = res['data']['total_page'];
            let sampler = [];
            messageTree.forEach(item => {
              if (item.user_id == this.convo["user1"]) {
                item["ownership"] = "theirs";
              } else {
                item["ownership"] = "yours";
              }
              sampler.push(item);
            });
            this.messages = sampler.reverse();
            console.log("Updated message tree: ", sampler, this.messages);

            // Cache the conversation.
            // this.cacheConvoMessages(this.convo['id'], this.messages);

            this.isLoading = false;
            if (this.messages.length > 0) {
              this.scrollToView();
            }
          } else {
            console.log("getMessages error: ", res);
            this.isLoading = false;
            // this.isFaulted = true;

            // Load cached messages
            let convoCacheId = 'cnvMessages-' + this.convo['id'];
            this.storage.get(convoCacheId).then(data => {
              this.messages = data;
            });
          }
        })
        .catch(ex => {
          console.log("Cannot get messages: ", ex);
          this.isLoading = false;
          // this.isFaulted = true;

          // Load cached messages
          let convoCacheId = 'cnvMessages-' + this.convo['id'];
          this.storage.get(convoCacheId).then(data => {
            this.messages = data;
          });
        })
        .then(() => {
          // this.isLoading = false;
          this.isInitial = false;
        });
    }
  }

  async presentActionSheet() {
    let actionSheet = await this.actionSheetCtrl.create({
      buttons: [
        {
          text: "Load from Library",
          handler: () => {
            this.openImagePicker();
          }
        },
        {
          text: "Use Camera",
          handler: () => {
            this.takePicture();
          }
        },
        {
          text: "Cancel",
          role: "cancel"
        }
      ]
    });
    await actionSheet.present();
  }

  openImagePicker() {
    let options = {
      quality: 30,
      correctOrientation: true,
      destinationType: this.camera.DestinationType.FILE_URI,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      mediaType: this.camera.MediaType.PICTURE
    };

    this.camera
      .getPicture(options)
      .then(async result => {
        console.log("openImagePicker", result);
        this.photoPath = result;
        this.nonNormalizedUrl = result;
        if (result.length > 0 && result != "OK") {
          if (!this.photo) {
            this.photo = new Array<string>();
          }

          let photoResult = result;
          let pp_pieces;
          let new_pp;
          if (this.platform.is('android')) {
            let prepareLoading = await this.loadingCtrl.create({
              message: 'Preparing image...'
            });
            console.log('Android: resolving native path.');
            this.filePath.resolveNativePath(result).then(resolvedFilePath => {
              photoResult = resolvedFilePath;
              pp_pieces = resolvedFilePath.split('/');
              new_pp = {
                name: pp_pieces[pp_pieces.length - 1],
                path: photoResult
              }

              let t = photoResult;
              t = t.replace('(', '%28');
              t = t.replace(')', '%29');

              this.photo.splice(0, 1);
              this.photo.push(new_pp);

              this.photo[0].path = this.photo[0].path.replace('(', '%28');
              this.photo[0].path = this.photo[0].path.replace(')', '%29');

              this.attachment = this.photo[0];
              console.log('Android attachment: ', this.attachment);

              prepareLoading.present().then(() => {
                this.componentsProvider.photoCompress({ path: this.nonNormalizedUrl }).then(response => {
                  if (response['error'] == 0) {
                    this._zone.run(() => {
                      console.log("photo", this.photo[0]);
                      console.log("compressedImg", response['compressedImg']);
                      console.log("nonNormalizedUrl", this.nonNormalizedUrl);
                      // let imgblob = this.componentsProvider.b64toBlobNew(response['compressedImg'].replace("data:image/jpeg;base64,", ""), 'image/jpeg', 512)
                      this.messageAttachment = response['compressedImg'];
                      this.messageAttachment = this.win.Ionic.WebView.convertFileSrc(this.messageAttachment)
                    });
                    // this.navCtrl.navigateForward(['/post']);
                  }
                  else {
                    console.log('Error in compression response: ', response);
                    this.componentsProvider.showAlert('', 'We encountered an error while preparing your image. Please select a different photo or try again later.');
                  }
                }).catch(requestCompressError => {
                  console.log('Error requesting compression: ', requestCompressError);
                  this.componentsProvider.showAlert('', 'We encountered an error while preparing your image. Please select a different photo or try again later.');
                }).then(() => {
                  prepareLoading.dismiss();
                });
              });


            });
          }
          else if (this.platform.is('ios')) {
            let prepareLoading = await this.loadingCtrl.create({
              message: 'Preparing image...'
            });
            pp_pieces = photoResult.split('/');
            new_pp = {
              name: pp_pieces[pp_pieces.length - 1],
              path: photoResult
            }

            let t = photoResult;
            t = t.replace('(', '%28');
            t = t.replace(')', '%29');

            t = t.replace('file://', '');
            t = t;
            new_pp['path'] = t;

            this.photo.splice(0, 1);
            this.photo.push(new_pp);

            this.photo[0].path = this.photo[0].path.replace('(', '%28');
            this.photo[0].path = this.photo[0].path.replace(')', '%29');

            this.attachment = this.photo[0];
            console.log('iOS attachment: ', this.attachment);
            prepareLoading.present().then(() => {
              this.componentsProvider.photoCompress({ path: this.nonNormalizedUrl }).then(response => {
                if (response['error'] == 0) {
                  this._zone.run(() => {
                    console.log("photo", this.photo[0]);
                    console.log("compressedImg", response['compressedImg']);
                    console.log("nonNormalizedUrl", this.nonNormalizedUrl);
                    // let imgblob = this.componentsProvider.b64toBlobNew(response['compressedImg'].replace("data:image/jpeg;base64,", ""), 'image/jpeg', 512)
                    this.messageAttachment = response['compressedImg'];
                    this.messageAttachment = this.win.Ionic.WebView.convertFileSrc(this.messageAttachment)
                  });
                  // this.navCtrl.navigateForward(['/post']);
                }
                else {
                  console.log('Error in compression response: ', response);
                  this.componentsProvider.showAlert('', 'We encountered an error while preparing your image. Please select a different photo or try again later.');
                }
              }).catch(requestCompressError => {
                console.log('Error requesting compression: ', requestCompressError);
                this.componentsProvider.showAlert('', 'We encountered an error while preparing your image. Please select a different photo or try again later.');
              }).then(() => {
                prepareLoading.dismiss();
              });
            });

            
          }
        }
      })
      .catch(e => {
        console.log("openImagePicker e", e);
      });
  }

  takePicture() {
    let options = {
      quality: 30,
      correctOrientation: true,
      targetWidth: 1280,
      targetHeight: 720,
      encodingType: this.camera.EncodingType.JPEG
    };

    this.camera.getPicture(options).then(async results => {
      console.log('getPicture_camera results: ', results);
      this.photoPath = results;
      this.nonNormalizedUrl = results;
      let prepareLoading = await this.loadingCtrl.create({
        message: 'Preparing image...'
      }); 
      if (results.length > 0 && results != 'OK') {
        if (!this.photo) {
          this.photo = new Array<string>();
        }

        let pp_pieces = results.split('/');
        let new_pp = {
          name: pp_pieces[pp_pieces.length - 1],
          path: results
        }

        if (this.platform.is('ios')) {
          results = results.replace('file://', '');
          results = results;
          new_pp['path'] = results;
        }

        this.photo.splice(0,1);
        this.photo.push(new_pp);

        this.photo[0].path = this.photo[0].path.replace('(', '%28');
        this.photo[0].path = this.photo[0].path.replace(')', '%29');

        this.attachment = this.photo[0];
        prepareLoading.present().then(() => {
          this.componentsProvider.photoCompress({ path: this.nonNormalizedUrl }).then(response => {
            if (response['error'] == 0) {
              this._zone.run(() => {
                console.log("photo", this.photo[0]);
                console.log("compressedImg", response['compressedImg']);
                console.log("nonNormalizedUrl", this.nonNormalizedUrl);
                // let imgblob = this.componentsProvider.b64toBlobNew(response['compressedImg'].replace("data:image/jpeg;base64,", ""), 'image/jpeg', 512)
                this.messageAttachment = response['compressedImg'];
                this.messageAttachment = this.win.Ionic.WebView.convertFileSrc(this.messageAttachment)
              });
              // this.navCtrl.navigateForward(['/post']);
            }
            else {
              console.log('Error in compression response: ', response);
              this.componentsProvider.showAlert('', 'We encountered an error while preparing your image. Please select a different photo or try again later.');
            }
          }).catch(requestCompressError => {
            console.log('Error requesting compression: ', requestCompressError);
            this.componentsProvider.showAlert('', 'We encountered an error while preparing your image. Please select a different photo or try again later.');
          }).then(() => {
            prepareLoading.dismiss();
          });
        });
      }
    }).catch(ex => {
      console.log('Camera attach error: ', ex);
      this.componentsProvider.showAlert('Attachment Error', 'Failed to attach the chosen file.');
    });
  }

  removeAttachment() {
    this.photo = null;
    this.attachment = null;
  }

  cacheConvoMessages(convoId?, convoData?, isInfinite?) {
    // On after load, cache the loaded messages.
    let convoCacheId = 'cnvMessages-' + convoId;
    this.storage.get(convoCacheId).then(data => {
      if (data && !isInfinite) {
        // If there is data and the thread is newly opened.
        // This will update the cache with new messages once newly opened.
        this.storage.set(convoCacheId, convoData);
        console.log('Updated conversation cache on load.');
      }
      else if (data && isInfinite) {
        // If there is a cache entry and the thread is infinite scrolled.
        // This will update the cache with the infinitely scrolled messages.
        let currentCacheData = data;
        let newData = convoData;
        newData.forEach(message => {
          currentCacheData.unshift(message);
        });

        // Set the new cache data.
        this.storage.set(convoCacheId, currentCacheData);
        console.log('Updated conversation cache on iScroll.');
      }
      else {
        // Set a new cache entry if no convo cache yet.
        this.storage.set(convoCacheId, convoData);
        console.log('Created new cache for conversation.');
      }
    }).catch(ex => {
      console.log('Error accessing conversation cache: ', ex);
    });
  }

  viewPhoto(src) {
    this.componentsProvider.viewFullPhoto(src, '');
  }
  getMomentFormat(stamp) {
    // if (this.platform.is("ios")) {
      return this.componentsProvider.getTimestampFormat(stamp, "YYYY-MM-DD hh:mm:ss");
    // } else {
    //   // if(stamp)
    //   return stamp;
    // }
  }

  async goToModal(){
    const modal = await this.modalCtrl.create({
      componentProps: {
       convo: this.convo
      },
      cssClass: 'convoOptionModal',
      mode:'ios',
      component: ConvoOptionModalComponent,
      backdropDismiss: true,
    });
    await modal.present();
  }

  debounce(func, wait, immediate?) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

  doInfinite(event) {

    console.log(this.infiniteScroll)
    console.log("infiniteScroll event fired.");
    console.log('Current Page ', this.currentPage);
    console.log('Max Pages ', this.maxPages);

    if (this.currentPage >= this.maxPages) {
      console.log("Max page resocketEmitMessageached.");
      event.target.complete();
      event.disabled = true;
      this.completedInfinite = true
      // event.enable(false);
    } else {
      this.currentPage += 1;
      this.getPagedMessages(this.convo.id, null, event);
    }
  }

  isLoadedImg(message){
    message.isLoadedAttachment = true;
  }
}
