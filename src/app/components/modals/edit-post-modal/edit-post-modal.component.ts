import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { AlertController, LoadingController, ModalController, NavController} from '@ionic/angular';
import { BlockedService } from 'src/app/services/blocked/blocked.service';
import { ComponentsService } from 'src/app/services/components/components.service';
import { DatasourceService } from 'src/app/services/datasource/datasource.service';
import { EventsService } from 'src/app/services/events.service';
import { MutedService } from 'src/app/services/muted/muted.service';
import { PostService } from 'src/app/services/post/post.service';
import {ShareService} from 'src/app/services/share/share.service';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { PostPage } from 'src/app/pages/post/post.page';
import { PostPageModule } from 'src/app/pages/post/post.module';

@Component({
  selector: 'app-edit-post-modal',
  templateUrl: './edit-post-modal.component.html',
  styleUrls: ['./edit-post-modal.component.scss'],
})
export class EditPostModalComponent implements OnInit {

  @ViewChild('thisImage') thisImage: ElementRef;
  @ViewChild("thisCanvas") private thisCanvas: ElementRef;
  isStacked: any;
  item : any;
  isMine: any;
  otherUser: any;
  target: any;
  params: any=[];
  post_privacy: any;
  tempPhoto: any;
  fromPost: any;
  constructor(
    private modalCtrl: ModalController,
    private postService: PostService,
    private componentsService: ComponentsService,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private events: EventsService,
    // private navParams: NavParams,
    private shareService: ShareService,
    private blockService: BlockedService,
    private alertCtrl: AlertController,
    private muteService: MutedService,
    private transfer: FileTransfer,
    private file: File,
    private dataSource: DatasourceService
  ) {
    // this.dataSource.serviceData.subscribe(data=>{
    //  this.isMine = data['isMine']? data['isMine'] : null;
    //  this.item = data['item']? data['item'] : null;
    //  this.otherUser = data['otherUser']? data['otherUser'] : null;
    //   this.isStacked = data['isStacked']? data['isStacked'] : null;
    // })
  
  //  console.log("this.isStacked",this.isStacked);

   }

   ngOnInit() {
    // if(this.item['isPrivate']){
      console.log("from posst number: ",this.fromPost);
      this.post_privacy = this.item['isPrivate'].toString();
    //  console.log("TTTTT: ", this.post_privacy)
    // }
    console.log("this.isMine",this.isMine);
    if(this.otherUser){
      console.log("this.otherUser: ", this.otherUser)
    }
    //else{
    //   this.otherUser = null;
    //   console.log("this.otherUser: ", this.otherUser)
    // }
    console.log("this.item",this.item);
    // console.log("POST PRIVACY: ", this.post_privacy)
    
   
    console.log("this.isStacked",this.isStacked);
  }


  async goToEdit() {
    let prepareLoading = await this.loadingCtrl.create({
      message:`Preparing image...`,
    });
    await prepareLoading.present();
    this.modalCtrl.dismiss().then(() => {
      const fileTransfer: FileTransferObject = this.transfer.create();
      let imgUrl = this.item.photo;
      fileTransfer
        .download(
          imgUrl,
          this.file.dataDirectory +
            this.item.photo_filename /*  + '-imguri.jpg' */
        )
        .then(photo => {
          /* this.item.id + '-imguri.jpg' */
          this.tempPhoto = new Array<string>();
          this.tempPhoto = {
            name: this.item.photo_filename,
            path: photo.nativeURL,
          };

          let editBase64;
          this.componentsService.encodeToBase64(photo.nativeURL).then(async response => {
            console.log("response", response);
            if (response['error'] == 0) {
              editBase64 = response['b64'];
              let imgblob: any = this.componentsService.b64toBlobNew(response['b64'].replace("data:image/jpeg;base64,", ""), 'image/jpeg', 512);
              if (this.isStacked) {
                // loader.dismiss();
                /* this.events.publish("gotoedit", this.item, this.tempPhoto, editBase64); */
                console.log("isStacked")
              }
              else {
                let navigationExtras : NavigationExtras = {
                  state:{
                    item: this.item,
                    /* photo */imgblob: /* this.tempPhoto */imgblob,
                    /* editBase64 */imgbase64: editBase64,
                    isEditPost: 2
                  }
                }
                this.dataSource.changeData({
                  item: this.item,
                  /* photo */imgblob: /* this.tempPhoto */imgblob,
                  /* editBase64 */imgbase64: editBase64,
                  isEditPost: 2
                });
                let modal = await this.modalCtrl.create({
                  component: PostPage,
                });
                modal.present();
                // this.navCtrl.navigateForward('/post', navigationExtras);
                /* this.navCtrl.navigateForward()
                this.navCtrl.push(PostPage, {
                  item: this.item,
                  photo: this.tempPhoto,
                  editBase64: editBase64
                }); */
              }
            }
            else {
              console.log('Error encoding to base64 from Edit: ', response);
            }
          }).catch(encodeError => {
            console.log('Encoding error from Edit: ', encodeError);
          }).then(() => {
            prepareLoading.dismiss();
          });
        }).catch(e => {
          prepareLoading.dismiss();
          console.log("Error proceeding to edit: ", e);
        });
    });
    /* this.router.navigateByUrl('/post')
    this.modalCtrl.dismiss(); */
  }
 async savePost(item) {
    // this.navCtrl.pop().then(async () => {
     const loader = await this.loadingCtrl.create({
        message: "Getting Ready..."
      });
      loader.present();
      this.postService.savePost({ postId: item.id }).then(res => {
        
        if (res["error"] == 0) {
          if (res["message"] == "Unsaved successfully!") {
            this.componentsService.showToast("You will no longer see this post in your Favorites.");
            this.events.publish('refresh-fav');
            loader.dismiss();
            this.modalCtrl.dismiss();
          } else {
            this.componentsService.showToast(res["message"]);
            this.events.publish('refresh-fav');
            loader.dismiss();
            this.modalCtrl.dismiss().then(()=>{
              
            });
          }

          // this.events.publish("refresh-post-details");

          if (this.isStacked) {
            console.log("refresher");
            this.events.publish("refresh-home-feed");
            this.events.publish("refresh-post-details");
            this.events.publish("refresh-main-profile-feed");
          } else {
            this.events.publish("refresh-home-feed");
            this.events.publish("refresh-post-details");
            this.events.publish("refresh-main-profile-feed");
          }
        } else {
          console.log(res["message"]);
        }
        // this.events.publish("refresh-home-feed");
      });
    // });
  }
  subscribeToShareEvent() {
    console.log("Subscribing to Share event.");
    // This event is published by the Share provider after a sharing event has occurred.
    // This is set to fire every time a share event is performed.
    // We made this a function call so we could manually subscribe and unsubscribe to this event
    // since each share function invokes this event.
    this.events.subscribe("shared-external", platform => {
      console.log('Shared to: ', platform);
      this.modalCtrl.dismiss(); // dismiss the modal, as per suggested.
    });
  }
  unsubscribeToShareEvent() {
    setTimeout(() => {
      this.events.destroy("shared-external");
      console.log("Unsubscribed to share event.");
    }, 500);
  }

  async prepImage(target) {
    let srcImage = this.thisImage.nativeElement;
    let destCanvas = this.thisCanvas.nativeElement;

    // Pass the original source image as well as the blank transfer canvas to the
    // image preparation function in the provider; chain the filter application here.
    let preparePhotoLoader = this.loadingCtrl.create({
      message: "Almost there..."
    });

    console.log(this.item);
    this.target = target;
    let cssFilterOptions = this.item["filter"];

    await (await preparePhotoLoader).present().then(() => {
      this.shareService.fairyDraw(cssFilterOptions, srcImage, null).then(async response => {
        if (response['error'] == 0) {
          console.log(response); 
          let imageData = response['canvas'];
          return (imageData);
        }
        else {
          console.log('Error in PixiJS: ', response);
          this.componentsService.showAlert('Sharing Failed', 'Something went wrong while preparing your photo. Please try again later.');
          (await preparePhotoLoader).dismiss();
        }
      }).catch(ex => {
        console.log('Error calling PixiJS: ', ex);
        this.componentsService.showAlert('Sharing Failed', 'Something went wrong while preparing your photo. Please try again later.');
      }).then(imageData => {
        this.shareService.addWatermark(imageData).then(async response => {
          if (!response['error']) {
            let watermarked = response;
            (await preparePhotoLoader).dismiss();

            this.forwardToSocial(watermarked, this.target);
          }
          else {
            console.log('Error watermarking image: ', response);
            this.componentsService.showAlert('Sharing Failed', 'Something went wrong while preparing your photo. Please try again later.');
          }
        }).catch(ex => {
          console.log('Error calling watermarker: ', ex);
          this.componentsService.showAlert('Sharing Failed', 'Something went wrong while preparing your photo. Please try again later.');
        });
      });
    });
  }

  // UPDATE: This social switcher has been updated to use the share sheet of
  // the Social Share plugin. The original sequence has been commented out
  // for legacy purposes, but do not remove in case we will revert to the original sequence.
  //
  // For forwarding the native URL of the file (the file is now the base64 data of the image)
  // to the respective social platform to share in.
  async forwardToSocial(file, target) {
    // console.log('File to share: ', file);
    console.log("Target platform: ", this.target);
    // console.log('File data to share: ', file);

    this.subscribeToShareEvent(); // call the subscribe function

    // Switch between platforms depending on which icon
    // was tapped that triggered the Share action.
    // TODO: ADD RETURN DATA PERTAINING TO THIS IMAGE'S nativeURL AND THE POST'S
    // CURRENT SHARE COUNT SO THAT SUCCESSIVE SHARES WON'T GENERATE NEW IMAGES;
    // IT WILL SIMPLY REUSE THE PREVIOUS ONE.
    // Add a new provider for monitoring or listing down all generated files by
    // the app in its own directory, if it exists. Should the directory be not found
    // or the directory is empty but the cached list is not, purge the list.

    switch (target) {
      case "facebook":
        // this.shareViaFacebookPlugin(file);
        await this.shareService
          .canShareViaFacebook(file)
          .then(response => {
            if (response == "OK") {
              console.log("Sharing to Facebook.");
              //this.addPoints(target);

              // Most Android apps return a return.completed = false response even if
              // the request and upload was completed. We therefore catch as well if the
              // plugin was able to forward the request to the target platform, since the
              // external platform will definitely have its own way of restarting or discarding
              // post uploads started by a user. This is out of the scope of the plugin.

              this.shareService
                .fbShareUsingSocialShare(file)
                .then(response => {
                  console.log(response);
                })
                .catch(ex => {
                  console.log("Error sharing on Facebook: ", ex);
                  this.componentsService.showToast(
                    "Cannot share to Facebook right now. Please try again later."
                  );

                  this.unsubscribeToShareEvent();
                })
                .then(() => {
                  // Unsubscribe to the event 500ms after this Promise is resolved.
                  this.unsubscribeToShareEvent();
                });
            } else {
              this.componentsService.showAlert(
                "Install Facebook app",
                "In order to share to Facebook, please install the Facebook app."
              );
              console.log("Cannot initiate share: ", response);
              this.unsubscribeToShareEvent();
            }
          })
          .catch(ex => {
            console.log("Error sharing: ", ex);
            this.componentsService.showToast(
              "Something went wrong while trying to share to Facebook. Please try again later."
            );
            this.unsubscribeToShareEvent();
          });
        break;

      case "instagram":
        // this.shareViaInstagramSocialSharing(file);
        await this.shareService
          .canShareViaInstagram(file)
          .then(response => {
            if (response == "OK") {
              console.log("Sharing to Instagram.");
              //this.addPoints(target);

              this.shareService
                .igShareUsingSocialShare(file)
                .then(response => {
                  console.log(response);
                })
                .catch(ex => {
                  console.log("Error sharing on Instagram: ", ex);
                  this.componentsService.showToast(
                    "Cannot share to Instagram right now. Please try again later."
                  );
                  this.unsubscribeToShareEvent();
                })
                .then(() => {
                  // Unsubscribe to the event 2 seconds after this Promise is resolved.
                  this.unsubscribeToShareEvent();
                });
            } else {
              this.componentsService.showAlert(
                "Install Instagram app",
                "In order to share to Instagram, please install the Instagram app."
              );
              console.log("Cannot initiate share: ", response);
              this.unsubscribeToShareEvent();
            }
          })
          .catch(ex => {
            console.log("Error sharing: ", ex);
            this.componentsService.showToast(
              "Something went wrong while trying to share to Instagram. Please try again later."
            );
            this.unsubscribeToShareEvent();
          });
        break;

      case "twitter":
        // this.shareViaTwitterSocialSharing(file);
        await this.shareService
          .canShareViaTwitter(file)
          .then(response => {
            if (response == "OK") {
              console.log("Sharing to Twitter.");
              //this.addPoints(target);

              this.shareService
                .twShareUsingSocialShare(file)
                .then(response => {
                  console.log(response);
                })
                .catch(ex => {
                  console.log("Error sharing on Twitter: ", ex);
                  this.componentsService.showToast(
                    "Cannot share to Twitter right now. Please try again later."
                  );
                  this.unsubscribeToShareEvent();
                })
                .then(() => {
                  // Unsubscribe to the event 2 seconds after this Promise is resolved.
                  this.unsubscribeToShareEvent();
                });
            } else {
              this.componentsService.showAlert(
                "Install Twitter app",
                "In order to share to Twitter, please install the Twitter app."
              );
              console.log("Cannot initiate share: ", response);
              this.unsubscribeToShareEvent();
            }
          })
          .catch(ex => {
            console.log("Error sharing: ", ex);
            this.componentsService.showToast(
              "Something went wrong while trying to share to Twitter. Please try again later."
            );
            this.unsubscribeToShareEvent();
          });
        break;

      case "email":
        // this.shareViaEmailSocialSharing(file);
        await this.shareService
          .canShareViaEmail()
          .then(response => {
            if (response["error"] == 0) {
              console.log("Sharing to email.");
              //this.addPoints(target);

              this.shareService
                .emailShareUsingSocialShare(file)
                .then(response => {
                  console.log(response);
                })
                .catch(ex => {
                  console.log("Error sharing using email: ", ex);
                  this.componentsService.showToast(
                    "Cannot share using mail right now. Please try again later."
                  );
                  this.unsubscribeToShareEvent();
                })
                .then(() => {
                  // Unsubscribe to the event 2 seconds after this Promise is resolved.
                  this.unsubscribeToShareEvent();
                });
            } else {
              this.componentsService.showAlert(
                "Install an email app",
                "In order to share using email, please install an email app."
              );
              console.log("Cannot initiate share: ", response);
              this.unsubscribeToShareEvent();
            }
          })
          .catch(ex => {
            console.log("Error sharing: ", ex);
            this.componentsService.showToast(
              "Something went wrong while trying to share using mail. Please try again later."
            );
            this.unsubscribeToShareEvent();
          });
        break;

      default:
        console.log("No target platform specified.");
    }
  }

  async blockUser(otherUser) {
    // this.navCtrl.pop().then(async () => {
    /*   let title = "Block User"; */
      let message = "Are you sure you want to block this account?";
      if (otherUser.isBlocked) {
      /*   title = "Unblock User"; */
        message = "Unblock this account?";
      }
      console.log("try lungz", otherUser);
      const alert = await this.alertCtrl
        .create({
         /*  title: title, */
          message: message,
          mode: "md",
          cssClass: 'blockAlert',
          buttons: [
            {
              text: "Cancel",
              role: "cancel"
            },
            {
              text: "Yes",
              handler: async () => {
                let loader = await this.loadingCtrl.create({
                  message: "Updating block status..."
                });
                alert.present();
                loader.present();
                this.blockService
                  .save({ friendId: otherUser.id })
                  .then(res => {
                    alert.dismiss();
                    this.modalCtrl.dismiss();
                    console.log("try 2.0", res);

                    if (res["error"] == 0) {
                      otherUser.isBlocked = !otherUser.isBlocked;
                      /*  this.navCtrl.pop().then(() => {
                      this.componentsProvider.showToast(res['message']);
                      this.events.publish('refresh-main-profile-feed');
                      this.events.publish('refresh-home-feed');
                    }); */
                      this.componentsService.showToast(res["message"]);
                      this.events.publish("refresh-main-profile-feed");
                      this.events.publish("refresh-home-feed");
                      loader.dismiss();
                    } else {
                      console.log(res["message"]);
                    }
                  });
              }
            },
          ]
        })
        alert.present();
    // });
  }

  async muteUser(otherUser) {
    // this.navCtrl.pop().then(async () => {
      let title = "Mute User";
      let message =
        "Are you sure you want to mute this user? You will not see posts and notifications related to this person but you will remain connected.";
      if (otherUser.isMuted) {
        title = "Unmute User";
        message = "Unmute this account?";
      }
      const alert = await this.alertCtrl
        .create({
          mode: "md",
          cssClass:'muteAlertModal',
        /*   title: title, */
          message: message,
          buttons: [
           
            {
              text: "Cancel",
              role: "cancel"
            },
            {

              text: "Yes",
              handler: async () => {
                let loader = await this.loadingCtrl.create({
                  message: "Updating mute status..."
                });
                alert.present();
                loader.present();
                this.muteService.save({ friendId: otherUser.id }).then(res => {
                  loader.dismiss();
                  console.log("try 2.0", res);

                  if (res["error"] == 0) {
                    otherUser.isMuted = !otherUser.isMuted;
                    /* this.navCtrl.pop().then(() => {
                    this.componentsProvider.showToast(res['message']);
                    this.events.publish('refresh-home-feed');
                    }); */
                    this.componentsService.showToast(res["message"]);
                    this.events.publish("refresh-home-feed");
                    this.modalCtrl.dismiss();
                  } else {
                    console.log(res["message"]);
                  }
                });
              }
            },
          ]
        })
        alert.present();
    // });
  }

  async reportPost(item) {
    const reportPrompt = await this.alertCtrl.create({
      mode: 'md',
      cssClass: 'reportAlert',
      header: 'Report Post as Inappropriate',
      message: 'This post will be reported as inappropriate, and if proven, this post will be removed and we will contact its author.',
      buttons: [
       
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Proceed',
          handler: () => {
            this.saveReportPost(item);
            this.modalCtrl.dismiss();
          }
        },
      ]
    });
    reportPrompt.present();
  }

  async saveReportPost(item) {
    console.log('Reporting this as inappropriate: ', item);
    const loadingPrompt = await this.loadingCtrl.create({
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
              handler: () => {}
            }
          ]
        });
        reportSuccess.present();
      }, 1000);
    });
  }

  async changePostPrivacy(item) {
    //let private_type = 0;
    console.log(this.post_privacy)
    // this.navCtrl.pop().then(async () => {
      let message;

      switch (this.post_privacy) {
        case "2":
          message = "Make this post to connection only?"
          break;
        case "1":
          message = "Make this post to only me?"
          break;
        default:
          message = "Make this post to public?";
          break;
      }

      const alert =await this.alertCtrl
        .create({
         /*  title: "Change Privacy", */
         mode: "md",
          message: message,
          buttons: [
            
            {
              text: "cancel",
              role: "cancel"
            },
            {

              text: "YES",
              handler: async () => {
                let loader = await this.loadingCtrl.create({
                  message: "Updating privacy..."
                });
                loader.present();
                this.postService
                  .changePrivacy({ postId: item.id, type: this.post_privacy })
                  .then(res => {
                    loader.dismiss();
                    alert.dismiss();
                    console.log(res);
                    if (res["error"] == 0) {
                      if(res['type']) {
                        if(res['type'] == 1 || res['type'] == 2) {
                          item.isPrivate = res['type'];
                          this.modalCtrl.dismiss();
                          this.events.publish("refresh-main-profile-feed");
                          this.events.publish("refresh-home-feed");
                        } else {
                          item.isPrivate = "0";
                          this.modalCtrl.dismiss();
                          this.events.publish("refresh-main-profile-feed");
                          this.events.publish("refresh-home-feed");
                        }
                      }
       
                    }
                    this.events.publish("refresh-home-feed");
                    this.componentsService.showToast(res["message"]);
                    /*     this.navCtrl.pop(); */
                  });
                console.log("Post Privacy is:  "+this.post_privacy + "Item Id: "+item.id)
              }
            },
          ]
        })
        alert.present();
    // });
  }

  async delete(item) {
    // this.navCtrl.pop().then(async () => {
     const alert = await this.alertCtrl
        .create({
          mode: "md",
          cssClass:'blockAlert',
         /*  title: "Delete Post", */
          message: "Are you sure you want to delete this post?",
          buttons: [
            {
              text: "Cancel",
              role: "cancel"
            },
            {
              text: "YES",
              handler: async () => {
                let loader = await this.loadingCtrl.create({
                  message: "Deleting post..."
                });
                loader.present();
                this.postService.delete({ postId: item.id }).then(res => {
                  loader.dismiss();
                  alert.dismiss();
                  if (res["error"] == 0) {
                    this.componentsService.showToast(res["message"]);
                    if (this.isStacked) {
                      this.events.publish("afterdelete");
                      this.events.publish("refresh-home-feed");
                      this.events.publish("refresh-main-profile-feed");
                      this.navCtrl.pop().then(() => {
                        this.events.publish('refresh-home-feed');
                        if(this.fromPost == 1){
                          this.modalCtrl.dismiss();
                          this.navCtrl.navigateRoot(['/tabs/tabs/dashboard']);
                        }else{
                          this.modalCtrl.dismiss();
                          this.navCtrl.navigateRoot(['/tabs/tabs/dashboard']);
                        }
                      }); 
                    } else {
                      /*  this.navCtrl.pop().then(() => {
                      this.events.publish('refresh-home-feed');
                      
                    }); */
                      this.events.publish("afterdelete");
                      this.events.publish("refresh-home-feed");
                      this.events.publish("refresh-main-profile-feed");
                      this.navCtrl.pop().then(() => {
                      this.events.publish('refresh-home-feed');
                      this.modalCtrl.dismiss();
                    }); 
                    this.navCtrl.navigateRoot(['/tabs/tabs/dashboard']);
                      this.events.publish("refresh-home-feed");
                    }
                  } else {
                    console.log(res["message"]);
                  }
                });
              }
            },
          ]
        })
        alert.present();
    // });
  }
}
