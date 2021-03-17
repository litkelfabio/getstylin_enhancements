import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, LoadingController, NavController, Platform, IonTabs, AlertController, ModalController } from '@ionic/angular';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ImagePicker, ImagePickerOptions } from '@ionic-native/image-picker/ngx';
import { NgxImageCompressService } from 'ngx-image-compress';
import { EnvService } from 'src/app/services/env/env.service';
import { DatasourceService } from 'src/app/services/datasource/datasource.service';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { File } from '@ionic-native/file/ngx';
import { ComponentsService } from 'src/app/services/components/components.service';
import { EventsService } from 'src/app/services/events.service';
import { Storage } from '@ionic/storage';
import { ChatService } from 'src/app/services/chat/chat.service';
import { NavigationExtras, RouterLinkActive } from '@angular/router';
import { UserService } from 'src/app/services/user/user.service';
import { ImageCropperPage } from './../../../components/modals/image-cropper/image-cropper.page';
import { PostPage } from '../../post/post.page';
import { PostPageModule } from '../../post/post.module';
import * as imageResizeCompress from 'image-resize-compress';
import { MediaCapture, MediaFile, CaptureError, CaptureImageOptions } from '@ionic-native/media-capture/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';


@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {

  @ViewChild('tabs', { static: false }) tabs: IonTabs;
  @ViewChild('imgupload', { static: false }) private imgupload: ElementRef;

  selectedTab: any;
  dashboardIcon
  myStylinIcon: any;
  uploadIcon: any;
  rewardsIcon: any;
  discoverIcon
  icon: any;
  tabsColor: any;
  items = [];
  isLoaded;
  imageResponse: any;
  options: any;
  selectedPhoto: any;
  pic_attachment: any
  myStylinColor: string;
  dashboardColor: string;
  rewardsColor: string;
  discoverColor: string;
  uploadColor: string;
  nonNormalizedUrl: any;
  photo: any;
  platformResumeSubscription: any;
  platformPausedSubscription: any;
  messageCount: any;
  messageTabIcon: string;
  sTab: number;
  hasRequests: any;
  requestCount: any;
  stylinTabIcon: any;
  withNotif: any;
  constructor(
    private env: EnvService,
    private actionSheetCtrl: ActionSheetController,
    private camera: Camera,
    private imagePicker: ImagePicker,
    private loadingCtrl: LoadingController,
    private _zone: NgZone,
    private imageCompress: NgxImageCompressService,
    private navCtrl: NavController,
    private dataSoource: DatasourceService,
    private webView: WebView,
    private platform: Platform,
    private filePath: FilePath,
    private file: File,
    private componentsProvider: ComponentsService,
    private events: EventsService,
    private storage: Storage,
    private chatService: ChatService,
    private userProvider: UserService,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private mediaCapture: MediaCapture,
    private androidPermissions: AndroidPermissions,
  ) {
    this.dashboardColor = "medium";
    this.myStylinColor = "medium";
    this.uploadColor = "medium";
    this.rewardsColor = "medium";
    this.discoverColor = "medium";
    this.dashboardIcon = 'assets/css/icon/dashboard.svg';
    this.myStylinIcon = "assets/css/icon/profile.svg";
    this.uploadIcon = "assets/css/icon/upload.svg";
    this.rewardsIcon = "assets/css/icon/rewards2.svg";
    this.discoverIcon = "assets/css/icon/discover.svg";

  }

  ngOnInit() {

    this.events.subscribe('refresh-tab', () => {
      console.log("refresh tab")
    });
    this.events.subscribe("init-socket", () => {
      this.storage.get('user').then(user => {
        this.chatService.initChatSocket(user.id);
      })
    });

    this.events.subscribe("disconnect-socket", () => {
      this.chatService.socket().disconnect();
    });


    this.events.subscribe("requests-found", count => {
      // this.stylinTabIcon = "custom-profile-inactive-with-notification";
      this.myStylinIcon = "assets/css/icon/profile-inactive-with-notif.svg";
      // this.withNotif = "mystylin";
    });

    this.events.subscribe("stylist-tab-opened", (data) => {
      this.myStylinIcon = "assets/css/icon/profile-inactive-with-notif.svg";
      this.withNotif = data;
    });

    this.events.subscribe("has-friend-requests", data => {
      console.log("Requests count (from Tabs): ", data);
      if (data > 0) {
        this.hasRequests = true;
        this.requestCount = data;
        this.withNotif = "mystylin";
      }
      else {
        this.hasRequests = false;
        this.requestCount = null;
        this.myStylinIcon = "assets/css/icon/profile-inactive-with-notif.svg";
        this.withNotif = null;
      }
    });

    this.events.subscribe("requests-updated", data => {
      console.log("Updated requests (from Tabs): ", data);
      if (data["requestCount"] <= 0) {
        this.hasRequests = false;
        this.requestCount = null;
      } else {
        this.requestCount = data["requestCount"];
      }
    });
    this.events.subscribe("message-tab-opened", () => {
      this.messageTabIcon = "custom-message";
      this.messageCount = null; // Clear the badge when the message tab is opened.
    });

    this.events.subscribe("update-stylist-status", (data?) => {
      console.log("Stylist application update: ", data);
      this.storage.get('user').then(data => {
        let userData = data;
        // Since 1 is the verified status, we should replace
        // this with any value in the user's stylist status for every instance
        // his or her status is approved/updated.
        if (userData['stylist'] != 1) {
          userData['stylist'] = 1;
        }

        // Then we update the currently stored user data.
        this.storage.set('user', userData).then(() => {
          console.log('Updated user data.');
          this.events.publish('changeTab', 1);  // Change tab to Profile if successfully updated.
        }).catch(ex => {
          console.log('Error setting new user data: ', ex);
        });
      }).catch(ex => {
        console.log('Error updating stylist status: ', ex);
      });
    });

    this.componentsProvider.changeStatusBarColor("#FFFFFF");
    this.getnotifnotifaction();
  }

  getnotifnotifaction() {
    this.userProvider.getNotificationSettings('getnotifsettings').then(response => {
      if (response['error'] == 0) {
        console.log('getnotifsettings ', response);
        if (response['postNotif'] == 1 || response['muteAll'] == 1 || response['styleColumnNotif'] == 1) {
          console.log('Show Alert')
          this.showNotifAlert();
        }
      } else {
        console.log('Error getting notification settings: ', response);
      }
    }).catch(ex => {
      console.log('Error getting notification settings: ', ex);
    })
  }

  setCurrentTab() {
    this.selectedTab = this.tabs.getSelected();
    // if(this.selectedTab == "dashboard"){
    //   this.dashboardColor = 'dark';
    //   // this.dashboardIcon = 'assets/css/icon/dashboard-active.svg'
    // }else if(this.selectedTab == "my-stylin"){
    //   this.myStylinColor = 'dark';
    //   this.myStylinIcon = 'assets/css/icon/profile-active.svg'
    // }else if(this.selectedTab == "upload"){

    // }else if (this.selectedTab == "rewards"){

    // }else if(this.selectedTab == "discover"){

    // }

  }

  ionViewWillEnter() {
    setTimeout(() => {
      // this.events.publish('init-socket');
    }, 1000);
  }



  async showNotifAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Warning',
      cssClass: 'muteAlertModal',
      mode: "md",
      message: 'We noticed that your notification is off. Would you like to turn it on ?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'LATER',
          role: 'cancel',
          handler: () => {
            console.log('Hello Later');
          }
        },
        {
          text: 'YES',
          handler: () => {
            this.updateNotif();
          }
        }
      ]
    });
    alert.present();
  }

  updateNotif() {
    let data = {
      postNotif: 0,
      muteAll: 0,
      styleColumnNotif: 0
    }

    this.userProvider.getNotificationSettings('getnotifsettings', data, true).then(response => {
      if (response['error'] == 0) {
        console.log('Updated: ', response);
      }
      else {
        console.log('Error getting response: ', response);
      }
    }).catch(ex => {
      console.log('Error updating notification settings: ', ex);
      this.componentsProvider.showToast('Cannot update notification settings at this time. Please try again later.');
    })
  }
  ionViewDidEnter() {
    /*
      Initialize the conversation list subscription at tabs level
      using an event publisher so that we could have the subscription for it available
      as an event for the Messages tab to also fire.
    */
    this.events.subscribe('socket-ready', () => {
      console.log('Socket ready; firing convo subscribe init.');
      this.events.publish("init-convo-subscribe");
    });

    // Get the length of the current unread conversations key store then assign it as the current message count.
    this.storage.get("unread_conversations").then(data => {
      if (data) {
        if (data.length > 0) {
          this.messageCount = data.length;
          this.messageTabIcon =
            this.sTab != 3 ? "custom-message-icon-gold" : "custom-message";
        }
      }
    });

    // Once this page is loaded, subscribe to platform.resume and platform.pause.
    this.platformResumeSubscription = this.platform.resume.subscribe(() => {
      console.log('Platform resumed.');
      this.events.publish('init-socket');
    });

    this.platformPausedSubscription = this.platform.pause.subscribe(() => {
      console.log('Platform paused.');
      this.events.publish('disconnect-socket');
    });

    // Override back button registrations
    if (this.platform.is('android')) {
      console.log('Platform is Android; registering back button.');
      // this.platform.registerBackButtonAction(() => {
      //   let currentNav = this.app.getActiveNavs()[0];
      //   let activeView = currentNav.getActive();
      //   console.log('Current nav: ', currentNav);
      //   console.log('Active view: ', activeView);

      //   if (
      //     activeView.id == 't0-0-0' ||
      //     activeView.id == 't0-1-0' ||
      //     activeView.id == 't0-3-0' ||
      //     activeView.id == 't0-4-0'
      //   ) {
      //     this.appMinimize.minimize();
      //   }
      //   else {
      //     if (activeView.isOverlay == true) {
      //       activeView.dismiss();
      //     }
      //     else {
      //       currentNav.pop();
      //     }
      //   }

      // if (this.nav.canGoBack()) {
      //   this.nav.pop();
      // }
      // else {
      //   this.appMinimize.minimize();
      // }
      // });
    }
  }

  async presentActionSheet() {
    const loader = await this.loadingCtrl.create({
      message: 'Almost there...'
    });
    loader.present();
    let actionSheet = await this.actionSheetCtrl.create({
      buttons: [
        {
          text: "Load from Library",

          handler: () => {
            this.openImagePicker();
            actionSheet.dismiss();
          }
        },
        {
          text: "Use Camera",
          handler: () => {
            this.takePicture();
            actionSheet.dismiss();
          }
        },
        {
          text: "Record Video",
          handler: () => {
            this.recordVideo();
            actionSheet.dismiss();
          }
        },
        {
          text: "Cancel",
          role: "cancel"
        }
      ]
    });
    actionSheet.present();
    loader.dismiss();
  }

  async openImagePicker() {
    this.imgupload.nativeElement.value = null;
    this.imgupload.nativeElement.click();
  }
  async imgChange(e: any) {
    let imgs: any = e.target.files;
    console.log(imgs)
    if (imgs[0].type == 'video/mp4') {
      let loader: any = await this.loadingCtrl.create({
      });
      loader.present();
      let alert = await this.alertCtrl.create({
        message: 'Videos are not supported',
        mode: 'md',
        cssClass: 'videoAlert',
        buttons: [
          {
            text: 'OK',
            role: 'cancel',
            handler: () => { }
          },
        ]
      });
      loader.dismiss();
      alert.present();
      // alert('Videos are not allowed in posting')
    } else {
      if (imgs.length == 1) {
        let loader: any = await this.loadingCtrl.create({
        });
        await loader.present();
        await Array.from(imgs).forEach((img: any) => {
          this._zone.run(() => {
            let reader = new FileReader();
            reader.onload = (e: any) => {
              let imageType = imgs[0].type;
              this.imageCompress.compressFile(e.target.result, 1, 100, 90).then(async (res: any) => {
                let imgblob: any = this.componentsProvider.b64toBlobNew(res.replace("data:" + imageType + ";base64,", ""), imageType, 512);
                loader.dismiss();
                console.log('before ', imgblob)
                if (imgblob['size'] > 1000) {
                  imageResizeCompress.fromBlob(imgblob, 100, 1080, 1350).then(async resize => {
                    imgblob = resize
                    this.dataSoource.changeData({
                      isEditPost: 1,
                      imgblob: imgblob,
                      imgbase64: res,
                      from: 'gallery',
                    });
                    let modal = await this.modalCtrl.create({
                      component: PostPage
                    });
                    modal.present();
                  })
                } else {
                  this.dataSoource.changeData({
                    isEditPost: 1,
                    imgblob: imgblob,
                    imgbase64: res,
                    from: 'gallery',
                  });
                  let modal = await this.modalCtrl.create({
                    component: PostPage
                  });
                  modal.present();
                }
              });
            }
            reader.readAsDataURL(img);
          });
        });
      } else if (imgs.length > 1) {
        let arrImgs = [];
        let arrBase64Imgs = [];
        let loader: any = await this.loadingCtrl.create({
        });
        await loader.present();
        await Array.from(imgs).forEach((img: any, index) => {
          this._zone.run(() => {
            let reader = new FileReader();
            reader.onload = (e: any) => {
              let imageType = imgs[index].type
              console.log(imageType)
              console.log(imageType)
              this.imageCompress.compressFile(e.target.result, 1, 100, 90).then(async (res: any) => {
                let imgblob: any = this.componentsProvider.b64toBlobNew(res.replace("data:" + imageType + ";base64,", ""), imageType, 512);
                arrImgs.push(imgblob)
                arrBase64Imgs.push({ 'img': res })
                // console.log(arrBase64Imgs.length)
                if (arrBase64Imgs.length == imgs.length) {
                  loader.dismiss();
                  this.dataSoource.changeData({
                    isEditPost: 1,
                    imgblob: arrImgs,
                    imgbase64: arrBase64Imgs,
                    from: 'gallery',
                    backUpBase64: arrBase64Imgs
                  });
                  let modal = await this.modalCtrl.create({
                    component: PostPage
                  });
                  modal.present();
                }
              });
            }
            reader.readAsDataURL(img);
          });
        });
      }
    }

  }

  // openImagePicker(){
  //   let options ={
  //     maximumImagesCount: 5,
  //     quality : 70,
  //     mode : 'ios'
  //   }
  //   let temp = [];
  //   let arrImg = [];
  //   let arrB64 =[];
  //   this.imagePicker.getPictures(options).then(async (results) => {
  //     if(results.length > 0){
  //       let msg = 'Preparing image...';
  //     if(results.length > 1){
  //       msg = 'Preparing images...'
  //     }
  //     let prepareLoading = await this.loadingCtrl.create({
  //       message: msg
  //     });
  //     prepareLoading.present();
  //     results.forEach(async element => {
  //       temp['path'] = element
  //       await this.componentsProvider.photoCompress(temp).then(image =>{
  //         let imageType = element.split(/[#?]/)[0].split('.').pop().trim();
  //         if(imageType == 'jpg'){
  //           imageType = 'jpeg';
  //         }
  //         console.log(imageType)
  //         if(image){
  //           if (image['error'] == 0) {
  //             this._zone.run(() => {
  //               this.imageCompress.compressFile(image['compressedImg'], 1, 100, 70).then( async compressedImg =>{
  //                 console.log(compressedImg)
  //                 let imgblob;
  //                 try {
  //                   imgblob = this.componentsProvider.b64toBlobNew(compressedImg.replace("data:image/"+imageType+";base64,", ""), 'image/'+imageType, 512)
  //                 } catch (error) {
  //                   console.log(error)
  //                 }
  //                 arrB64.push(compressedImg)
  //                 arrImg.push(imgblob);
  //                 if(arrImg.length == results.length){
  //                   this.dataSoource.changeData({
  //                     isEditPost: 1,
  //                     imgblob: arrImg,
  //                     imgbase64: arrB64,
  //                     from: 'gallery',
  //                     backUpBase64: arrB64
  //                   });
  //                   let modal = await this.modalCtrl.create({
  //                     component: PostPage
  //                   });
  //                   modal.present();
  //                   prepareLoading.dismiss();
  //                 }
  //               }).catch(e=>{
  //                 console.log(e)
  //               })
  //             });
  //           }
  //         }
  //       })
  //     });
  //     console.log(arrImg)
  //     }
  //   });
  // }

  async takePicture() {
    let options = {
      quality: 50,
      correctOrientation: true,
      targetWidth: 1500,
      targetHeight: 1000,
      encodingType: this.camera.EncodingType.JPEG
    };

    let prepareLoading = await this.loadingCtrl.create({
      message: 'Preparing image...'
    });

    this.camera.getPicture(options).then(
      results => {
        console.log("getPicture_result_camera", results);
        this.nonNormalizedUrl = results;
        if (results.length > 0 && results != "OK") {
          this.photo = new Array<string>();
          let pp_pieces = results.split("/");
          let new_pp = {
            name: pp_pieces[pp_pieces.length - 1],
            path: results
          };

          let t = results;
          t = t.replace("(", "%28");
          t = t.replace(")", "%29");
          if (this.platform.is("ios")) {
            t = t.replace("file://", "");
            new_pp["path"] = t;
          }
          this.photo.splice(0, 1);
          this.photo.push(new_pp);

          this.photo[0].path = this.photo[0].path.replace("(", "%28");
          this.photo[0].path = this.photo[0].path.replace(")", "%29");

          console.log("temp_upload_photo: ", this.photo[0]);
          prepareLoading.present().then(() => {
            this.componentsProvider.photoCompress({ path: this.nonNormalizedUrl }).then(async response => {
              if (response['error'] == 0) {
                this._zone.run(() => {
                  console.log("photo", this.photo[0]);
                  console.log("compressedImg", response['compressedImg']);
                  console.log("nonNormalizedUrl", this.nonNormalizedUrl);
                  let imgblob = this.componentsProvider.b64toBlobNew(response['compressedImg'].replace("data:image/jpeg;base64,", ""), 'image/jpeg', 512)
                  this.dataSoource.changeData({
                    isEditPost: 1,
                    imgblob: imgblob,
                    imgbase64: response['compressedImg'],
                    from: 'camera',
                  });
                });
                let modal = await this.modalCtrl.create({
                  component: PostPage
                });
                modal.present();
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
      },
      function (error) {
        console.log(error);
      }
    );
  }
  refreshDashboard() {
    this.events.publish('refresh-dashboard');
    console.log('clicked')
  }

  goToStylin() {
    this.navCtrl.navigateRoot('/tabs/tabs/my-stylin');
  }

  recordVideo() {
    this.androidPermissions.requestPermissions(
      [
        this.androidPermissions.PERMISSION.CAMERA,
        this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
        this.androidPermissions.PERMISSION.READ_MEDIA_VIDEO

      ]
    ).then(() => {
      this.mediaCapture.captureVideo()
        .then(
          async (data: MediaFile[]) => {
            let loader: any = await this.loadingCtrl.create({
            });
            this.convertVideoToBase64(data[0]['fullPath']).then( videoBase64 =>{
              this.componentsProvider.b64toBlob(videoBase64, 'video/mp4').then( async newBlob =>{
                // console.log(newBlob['generatedBlob'])
                this.dataSoource.changeData({
                      video: 'true',
                      file: data,
                      videoBlob: newBlob['generatedBlob']
                    });
                    await loader.present();
                    let modal = await this.modalCtrl.create({
                      component: PostPage
                    });
                    loader.dismiss();
                    modal.present();
              })
            })
          })
    })
  }
  async convertVideoToBase64(video) {
    return new Promise(async (resolve) => {
      let res:any = await this.file.resolveLocalFilesystemUrl(video);
      res.file((resFile) => {
        let reader = new FileReader();
        reader.readAsDataURL(resFile);
        reader.onloadend = async (evt: any) => {
          let encodingType = "data:video/mp4;base64,";
          /*
           * File reader provides us with an incorrectly encoded base64 string.
           * So we have to fix it, in order to upload it correctly.
           */
          let OriginalBase64 = evt.target.result.split(',')[1]; // Remove the "data:video..." string.
          let decodedBase64 = atob(OriginalBase64); // Decode the incorrectly encoded base64 string.
          let encodedBase64 = btoa(decodedBase64); // re-encode the base64 string (correctly).
          let newBase64 = encodingType + encodedBase64; // Add the encodingType to the string.
          resolve(newBase64);
        }
      });
    });
  }

}
