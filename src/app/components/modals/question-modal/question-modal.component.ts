import { Component, OnInit,NgZone ,ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Camera,CameraOptions } from '@ionic-native/camera/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { ActionSheetController, LoadingController, ModalController, NavController, Platform } from '@ionic/angular';
import { ComponentsService } from 'src/app/services/components/components.service';
import { QuestionService } from 'src/app/services/question/question.service';
import { ImageCropperPage } from '../image-cropper/image-cropper.page';
import { NgxImageCompressService } from 'ngx-image-compress';
import { TagInputComponent } from 'ngx-chips';
@Component({
  selector: 'app-question-modal',
  templateUrl: './question-modal.component.html',
  styleUrls: ['./question-modal.component.scss'],
})
export class QuestionModalComponent implements OnInit {
  @ViewChild('imgupload', { static: false }) private imgupload: ElementRef;
  @ViewChild('tagbox') tagbox: ElementRef;
  @ViewChild("tagInput", {read:TagInputComponent}) private tagInput:TagInputComponent;
  activeTags: any;
  public postForm: FormGroup;
  nonNormalizedUrl: any;
  tags:any = [];
  tempTag: any;
  photo: any;
  questionAttachment: any;
  photoPath: any;
  imgbase64: any;
  cropSelected: any;
  imgblob: any;
  isAndroid:any;

  constructor(
    private camera: Camera,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private actionSheetCtrl: ActionSheetController,
    private filePath: FilePath,
    public formBuilder: FormBuilder,
    private questionService: QuestionService,
    private coomponentService: ComponentsService,
    private platform: Platform,
    private modalCtrl: ModalController,
    private _zone: NgZone,
    private componentsProvider: ComponentsService,
    public imageCompress: NgxImageCompressService,
    
  ) {
    this.isAndroid = this.platform.is('android');
    this.postForm = this.formBuilder.group({
      question: ["", Validators.compose([Validators.required])],
      tags: [[]]
    });
   }

  ngOnInit() {}

  closeModal() {
    this.navCtrl.pop();
  }

  dismiss() {
    this.navCtrl.pop();
  }

  stopPropagation(e) {
    console.log('StopPropagation');
    this.tempTag = null;
    e.stopPropagation();
  }

  onChange(val: string) {
    console.log(val);
  }

  onFocus() {
    console.log("Focus");
  }

  // onBlur() {
  //   console.log("Blur");
  // }

  // addTag(e) {
  //   if (this.tempTag) {
  //     this.tempTag = "#" + this.tempTag;
  //     if (!e.some(e => e === this.tempTag)) {
  //       e.push(this.tempTag);
  //       this.postForm.controls.tags.setValue(e);
  //     }
  //   }
  //   this.tempTag = "";

  //   // Clears the tag box when exiting
  //   if (this.tagbox) {
  //     if (this.tagbox['_editTag']) {
  //       this.tagbox['_editTag'] = null;
  //     }
  //   }
  // }

  // validateTag(e) {
  //   // console.log('Event fired: ', e);
  //   // console.log('Current tag box state: ', this.tagbox);
  //   if (e.data == ' ') {
  //     return;
  //   }
  //   else {
  //     let newValue = e.target.value;
  //     let regExp = new RegExp("^[A-Za-z0-9]+$");
  //     if (!regExp.test(newValue)) {
  //       e.target.value = newValue.slice(0, -1);
  //     }
  //     this.tempTag = e.target.value;
  //   }
  // }
  validateTag(e) {
    let newValue = e;
    console.log("new value: ", newValue);
    let regExp = new RegExp('^[A-Za-z0-9]+$');
    if (!regExp.test(newValue)) {
      e = newValue.slice(0, -1);
    }
    this.tags.push({display:e,value:e});
    this.tagInput.inputForm.inputText = "";
  }
  seperatorKeysIos(event){
    console.log(event);
    if(event == 0){
      this.activeTags =false;
    }
    if(event != 0){
      this.activeTags =true;
    }
  }

  seperatorKeys(event){
    var tags = event;
    console.log(event);
    if(event == 0){
      this.activeTags =false;
    }
    if(event != 0){
      this.activeTags =true;
    }
    var iChars = ", ";
    for(var i =0; i< tags.length; i++){
        if(iChars.indexOf(tags.charAt(i)) !=-1){
          this.validateTag(event);
          console.log(this.tagInput.inputForm.inputText)
          // this.tagInput.onTextChangeDebounce = 0;
        }
    }
  }

  async presentActionSheet() {
    let uploadSrcActionSheet = await this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Load from Library',
          handler: () => {
            console.log('Loading from library.');
            this.openImagePicker();
          }
        },
        {
          text: 'Use Camera',
          handler: () => {
            console.log('Opening camera.');
            this.takePicture();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Canceled.');
          }
        }
      ]
    });

    await uploadSrcActionSheet.present();
  }

  // OPEN IMAGE PICKER
  // Load and attach an image for attachment to the question.

  async imgChange(e: any) {
    let imgs: any = e.target.files;
    if (imgs.length > 0) {
      let loader: any = await this.loadingCtrl.create({
      });
      await loader.present();
      await Array.from(imgs).forEach((img: any) => {
        this._zone.run(() => {
          let reader = new FileReader();
          reader.onload = (e: any) => {
            this.imageCompress.compressFile(e.target.result, 1, 100, 90).then((res: any) => {
              console.log("imgChange", res);
              loader.dismiss();
              if (res.includes("data:image/jpeg;base64,")) {
                this.presentCropperModal(this.componentsProvider.b64toBlobNew(res.replace("data:image/jpeg;base64,", ""), 'image/jpeg', 512),4,4);
              }
              if (res.includes("data:image/png;base64,")) {
                this.presentCropperModal(this.componentsProvider.b64toBlobNew(res.replace("data:image/png;base64,", ""), 'image/jpeg', 512),4,4);
              }
            }).catch(e => {
              loader.dismiss();
              console.log("e", e);
            });
          };
          reader.readAsDataURL(img);
        });
      });
    }
  }
  async openImagePicker() {
    this.imgupload.nativeElement.value = null;
    this.imgupload.nativeElement.click();
  }

  // OPEN CAMERA TO TAKE PICTURE
  // Opens the camera to take a picture, then attach it to the post.

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
            // t = t.replace("file://", "/_file_");
            new_pp["path"] = t;
          }
          this.photo.splice(0, 1);
          this.photo.push(new_pp);

          this.photo[0].path = this.photo[0].path.replace("(", "%28");
          this.photo[0].path = this.photo[0].path.replace(")", "%29");

          console.log("temp_upload_photo: ", this.photo[0]);
          prepareLoading.present().then(() => {
            this.componentsProvider.photoCompress({ path: this.nonNormalizedUrl }).then(response => {
              if (response['error'] == 0) {
                this._zone.run(() => {
                  console.log("photo", this.photo[0]);
                  console.log("compressedImg", response['compressedImg']);
                  console.log("nonNormalizedUrl", this.nonNormalizedUrl);
                  let imgblob = this.componentsProvider.b64toBlobNew(response['compressedImg'].replace("data:image/jpeg;base64,", ""), 'image/jpeg', 512)
                  this.questionAttachment = response['compressedImg'];
                  this.imgblob = imgblob
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

            // this.compressPhoto({path: this.nonNormalizedUrl}).then(response => {
            //   if (response['error'] == 0) {
            //     console.log(response);
            //     this.navCtrl.push(PostPage, {
            //       photo: this.photo[0],
            //       isNewPost: true,
            //       from: "gallery",
            //       nonNormalizedUrl: this.nonNormalizedUrl,
            //       compressedImg: response['compressedImg']
            //     });
            //   }
            //   else {
            //     console.log('Error in compression response: ', response);
            //   }
            // }).catch(requestCompressError => {
            //   console.log('Error requesting compression: ', requestCompressError);
            // }).then(() => {
            //   prepareLoading.dismiss();
            // });
          });
          // this.navCtrl.push(PostPage, {
          //   photo: this.photo[0],
          //   isNewPost: true,
          //   from: "camera",
          //   nonNormalizedUrl: this.nonNormalizedUrl
          // });
        }
      },
      function (error) {
        console.log(error);
      }
    );
  }
  // async takePicture(){
  //   const options: CameraOptions = {
  //     quality: 100,
  //     destinationType: this.camera.DestinationType.DATA_URL,
  //     encodingType: this.camera.EncodingType.JPEG,
  //     mediaType: this.camera.MediaType.PICTURE,
  //     correctOrientation: true
  //   }
    
  //   let loader = await this.loadingCtrl.create({
  //   });
  //   await loader.present();

  //   this.camera.getPicture(options).then((imageData) => {
  //     // imageData is either a base64 encoded string or a file URI
  //     // If it's base64 (DATA_URL):
  //     console.log(imageData);
  //     let imageBase64;
  //     if (imageData.length > 0) {
  //       this._zone.run(() => {
  //         imageBase64 = 'data:image/jpeg;base64,' + imageData;
  //       });
  //       // this.gotoImageCropper(imageBase64);
  //       // this.questionAttachment = imageBase64;
        
  //       // this.questionAttachment = this.componentsProvider.b64toBlobNew(result.replace("data:image/jpeg;base64,", ""), 'image/jpeg', 512)
  //       loader.dismiss();
  //     }
  //   }, (err) => {
  //     // Handle error
  //     console.log(err);
  //     loader.dismiss();
  //   });
  //   // let options = {
  //   //   quality: 30,
  //   //   correctOrientation: true,
  //   //   targetWidth: 1280,
  //   //   targetHeight: 720,
  //   //   encodingType: this.camera.EncodingType.JPEG,
  //   // };

  //   // this.camera.getPicture(options).then((results) => {
  //   //   console.log('getPicture_result_camera', results);
  //   //   this.photoPath = results;

  //   //   if (results.length > 0 && results != 'OK') {
  //   //     if (!this.photo) {
  //   //       this.photo = new Array<string>();
  //   //     }

  //   //     let pp_pieces = results.split('/');
  //   //     let new_pp = {
  //   //       name: pp_pieces[pp_pieces.length - 1],
  //   //       path: results
  //   //     }

  //   //     console.log('Normalized URL: ', results);

  //   //     if (this.platform.is('ios')) {
  //   //       console.log('iOS: changing file path.');
  //   //       // _app_file_
  //   //       results = results.replace('file://', '');
  //   //       results = results;
  //   //       new_pp['path'] = results;

  //   //       console.log('results variable after replacement: ', results);
  //   //       console.log('new_pp: ', new_pp);
  //   //     }
  //   //     else {
  //   //       console.log('Platform is not iOS; not doing supplementary work.');
  //   //     }
  //   //     this.photo.splice(0, 1);
  //   //     this.photo.push(new_pp);

  //   //     this.photo[0].path = this.photo[0].path.replace('(', '%28');
  //   //     this.photo[0].path = this.photo[0].path.replace(')', '%29');

  //   //     console.log('Temporary photo from camera: ', this.photo);
  //   //     this.questionAttachment = this.photo[0];
  //   //   }
  //   // }, function(error) {
  //   //   console.log(error);
  //   // });
  // }

  async presentCropperModal(imagePath, aspect_height?: number, aspect_width?: number, cropSelected?: number) {
    console.log("presentCropperModal", imagePath);
    const modal = await this.modalCtrl.create({
      component: ImageCropperPage,
      cssClass: 'my-custom-modal-css',
      componentProps: {
        'imageBase64': imagePath,
        'type': 'post',
        'aspect_height': aspect_height,
        'aspect_width': aspect_width,
        'cropSelected': cropSelected
      }
    });

    modal.present();

    const { data } = await modal.onWillDismiss();
    console.log("data", data);
    if (data) {
      
      //this.delegate.profile_photo = 'profile_photo';
      this._zone.run(() => {
        this.cropSelected = data.cropSelected;
        this.questionAttachment = data.base64;
      });
      this.save(data.fileBlob);
    }
  }
  save(attachment) {
    /* this.profile_image_url = null; */
    console.log("attachment", attachment);
    this._zone.run(() => {
      this.imgblob = attachment;
    });
  }

  // For posting a new question
  questionBody: any;
  questionTags = this.tags;
  hasAttachment: boolean = false;
  // async postStyleQuestion() {
  //   if (this.postForm.valid && this.questionAttachment) {
  //     let loader = await this.loadingCtrl.create({
  //       message: 'Sending an SOS to the world...'
  //     });
  //     loader.present();

  //     let fileSrc;
  //     if (this.platform.is('ios')) {
  //       fileSrc = {
  //         name: this.questionAttachment['name'],
  //         path: this.photoPath
  //       }

  //       console.log('Attachment to be sent (iOS): ', this.photoPath);
  //     }
  //     else {
  //       fileSrc = this.questionAttachment;
  //       console.log('Attachment to be sent (Android): ', this.questionAttachment);
  //     }
  //     console.log("questionAttachment: ",this.questionAttachment);
  //     console.log("photopath: ",this.photoPath);
  //     await this.questionService.postQuestion('save', fileSrc, this.postForm.value).then(response => {
  //       console.log(response);
  //       if (response['error'] == 0) {
  //         this.modalCtrl.dismiss({posting: 'success'});
  //       }
  //       else {
  //         this.coomponentService.showToast(
  //           "Cannot post your question at this time. Please try again later."
  //         );
  //         this.modalCtrl.dismiss();
  //       }
  //     }).catch(postQuestionError => {
  //       console.log(postQuestionError);
  //       this.coomponentService.showToast('Cannot post your question at this time. Please try again later.');
  //     }).then(() => {
  //       loader.dismiss();
  //     });
  //   }
  //   else {
  //     console.log('Form is not valid.');
  //   }
  // }

  async postStyleQuestionNew() {
    if (this.postForm.valid && this.questionAttachment) {
      let loader = await this.loadingCtrl.create({
        message: 'Sending an SOS to the world...'
      });
      loader.present();
    let tags: any = [];
    if (this.postForm.value.tags.length > 0) {
      console.log(this.postForm.value.tags);
      if(this.platform.is('ios')) {
        console.log(this.postForm.value);
      } else {
        this.tags.forEach((data: any) => {
          console.log(data);
          tags.push("#"+data.value);
        });
      }

      this.postForm.controls.tags.setValue(JSON.stringify(tags));
    }else{
      console.log("hey there");
      this.tags.forEach((data: any) => {
        console.log(data);
        tags.push("#"+data.value);
      });
      this.postForm.controls.tags.setValue(JSON.stringify(tags));
    }
    let thisData = this.postForm.value;
    var formData = new FormData();
    formData.append('photo', this.imgblob);
    let keys = Object.keys(thisData);
    for (var i = keys.length - 1; i >= 0; i--) {
      let key = keys[i];
      let toAppend = thisData[key];
      formData.append(key, toAppend);
    }
      await this.questionService.postQuestionNew('savenew', formData).then(response => {
        console.log(response);
        if (response['error'] == 0) {
          this.coomponentService.showToast(
            response['message']
          );
          this.modalCtrl.dismiss({posting: 'success'});
        }
        else {
          this.coomponentService.showToast(
            "Cannot post your question at this time. Please try again later."
          );
          this.modalCtrl.dismiss();
        }
      }).catch(postQuestionError => {
        console.log(postQuestionError);
        this.coomponentService.showToast('Cannot post your question at this time. Please try again later.');
      }).then(() => {
        loader.dismiss();
      });
    }
    else {
      console.log('Form is not valid.');
    }
  }

  removeAttachment() {
    this.questionAttachment = null;
  }
  onBlur(e){
    let newValue = e;
    console.log("new value: ", newValue);
    let regExp = new RegExp('^[A-Za-z0-9]+$');
    if (!regExp.test(newValue)) {
      e = newValue.slice(0, -1);
    }
    if(e != ''){
      this.tags.push({display:e,value:e});
      this.tagInput.inputForm.inputText = ""
      this.activeTags =false;
    }
  }
}
