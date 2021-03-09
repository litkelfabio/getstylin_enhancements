import { Component, OnInit, ElementRef, ViewChild, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

import { Router, NavigationExtras } from '@angular/router';
import { AlertController, LoadingController, Platform, IonText, NavController, ModalController, IonSelectOption, IonSelect, IonSlides, IonRange } from '@ionic/angular';
import * as PIXI from 'pixi.js'
import { DatasourceService } from 'src/app/services/datasource/datasource.service';
import { PostService } from 'src/app/services/post/post.service';

import { ComponentsService } from 'src/app/services/components/components.service';
import { File, IWriteOptions } from '@ionic-native/file/ngx';

import { EventsService } from 'src/app/services/events.service';
import { Crop, CropOptions } from '@ionic-native/crop/ngx';
import { ImageCropperPage } from './../../components/modals/image-cropper/image-cropper.page';
import { TagInputComponent } from 'ngx-chips';
import { DiscoverService } from 'src/app/services/discover/discover.service';
import { NgxMasonryOptions } from 'ngx-masonry';
import { Storage } from '@ionic/storage';
import { WebView } from '@ionic-native/ionic-webview/ngx';

declare var google: any;


@Component({
  selector: 'app-post',
  templateUrl: './post.page.html',
  styleUrls: ['./post.page.scss'],
})
export class PostPage implements OnInit {
  @ViewChild('myvideo') myVideo: ElementRef;
  @ViewChild('duration') duration: IonRange;
  @ViewChild('test', { static: false }) test: ElementRef;
  @ViewChild("tagInput", { read: TagInputComponent }) private tagInput: TagInputComponent;
  @ViewChild("thisImage") private thisImage: ElementRef;
  @ViewChild('searchInput') searchInput: IonText;
  @ViewChild('selectPrivacy') selectPrivacy: IonSelect;
  @ViewChild('slides') slides: IonSlides
  /* @ViewChild(Content) content: Content; */
  public postForm: FormGroup;

  /* img: any = "https://getstylin.com/public/deploy1599536530/images/lns/sb/L2ltYWdlcy91cGxvYWRzL3Byb2ZpbGVwaWMvMTQ3/type/toheight/height/500/allow_enlarge/0/1582504925_yw456vuwtejxiqxwok56.jpg"; */
  pixiBrightness: number = 0;
  pixiContrast: number = 0;
  pixiSaturation: number = 0;
  stage;
  /* canvas; */
  selected = null;
  isEditPost: any;
  /* compressedImg: any; */
  tags: any = [[]];
  filename: any;
  path: any;
  formDisabled: any
  photo_for_upload: any;
  rotatePosition: number = 0;
  rotatedImage: any;
  base64StockImage: any;
  dataDir: string;
  onChange: any;
  /* temp_photo:any; */
  autocompleteItems: any = [];
  service = new google.maps.places.AutocompleteService();

  isFromEdit: boolean = false;
  item: any = [];
  cropSelected: number = 0;
  brightness: number;
  contrast: number;
  saturation: number;
  rotation: any;
  tag: any = [];
  temp_crop: any;
  /* temp_crop: any; */
  isAndroid: any;
  imgblob: any;
  imgblob_backup: any;
  imgbase64: any;
  imgbase64_backup: any;
  activeTags: any = false;
  activeModal = false;
  subscription: any;
  privacy = 0;
  suggestTags: any = [];
  slideOpts = {
    initialSlide: 0,
    speed: 400
  };
  playing = false;
  public masonryOptions: NgxMasonryOptions = {
    originLeft: true,
    gutter: 10,
    resize: true,
    initLayout: true,
    columnWidth: ".grid-sizer",
    itemSelector: ".grid-item",
    percentPosition: true
  };
  isMultiple = false;
  slidePage = 1;
  video = false;
  videoURL : any;
  videoFile;
  showButton = true;
  completeDuration;
  // slideOpts = {
  //   coverflowEffect: {
  //     rotate: 50,
  //     stretch: 0,
  //     depth: 100,
  //     modifier: 1,
  //     slideShadows: true,
  //   },
  //   on: {
  //     beforeInit() {
  //       const swiper = this;

  //       swiper.classNames.push(`${swiper.params.containerModifierClass}coverflow`);
  //       swiper.classNames.push(`${swiper.params.containerModifierClass}3d`);

  //       swiper.params.watchSlidesProgress = true;
  //       swiper.originalParams.watchSlidesProgress = true;
  //     },
  //     setTranslate() {
  //       const swiper = this;
  //       const {
  //         width: swiperWidth, height: swiperHeight, slides, $wrapperEl, slidesSizesGrid, $
  //       } = swiper;
  //       const params = swiper.params.coverflowEffect;
  //       const isHorizontal = swiper.isHorizontal();
  //       const transform$$1 = swiper.translate;
  //       const center = isHorizontal ? -transform$$1 + (swiperWidth / 2) : -transform$$1 + (swiperHeight / 2);
  //       const rotate = isHorizontal ? params.rotate : -params.rotate;
  //       const translate = params.depth;
  //       // Each slide offset from center
  //       for (let i = 0, length = slides.length; i < length; i += 1) {
  //         const $slideEl = slides.eq(i);
  //         const slideSize = slidesSizesGrid[i];
  //         const slideOffset = $slideEl[0].swiperSlideOffset;
  //         const offsetMultiplier = ((center - slideOffset - (slideSize / 2)) / slideSize) * params.modifier;

  //          let rotateY = isHorizontal ? rotate * offsetMultiplier : 0;
  //         let rotateX = isHorizontal ? 0 : rotate * offsetMultiplier;
  //         // var rotateZ = 0
  //         let translateZ = -translate * Math.abs(offsetMultiplier);

  //          let translateY = isHorizontal ? 0 : params.stretch * (offsetMultiplier);
  //         let translateX = isHorizontal ? params.stretch * (offsetMultiplier) : 0;

  //          // Fix for ultra small values
  //         if (Math.abs(translateX) < 0.001) translateX = 0;
  //         if (Math.abs(translateY) < 0.001) translateY = 0;
  //         if (Math.abs(translateZ) < 0.001) translateZ = 0;
  //         if (Math.abs(rotateY) < 0.001) rotateY = 0;
  //         if (Math.abs(rotateX) < 0.001) rotateX = 0;

  //          const slideTransform = `translate3d(${translateX}px,${translateY}px,${translateZ}px)  rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

  //          $slideEl.transform(slideTransform);
  //         $slideEl[0].style.zIndex = -Math.abs(Math.round(offsetMultiplier)) + 1;
  //         if (params.slideShadows) {
  //           // Set shadows
  //           let $shadowBeforeEl = isHorizontal ? $slideEl.find('.swiper-slide-shadow-left') : $slideEl.find('.swiper-slide-shadow-top');
  //           let $shadowAfterEl = isHorizontal ? $slideEl.find('.swiper-slide-shadow-right') : $slideEl.find('.swiper-slide-shadow-bottom');
  //           if ($shadowBeforeEl.length === 0) {
  //             $shadowBeforeEl = swiper.$(`<div class="swiper-slide-shadow-${isHorizontal ? 'left' : 'top'}"></div>`);
  //             $slideEl.append($shadowBeforeEl);
  //           }
  //           if ($shadowAfterEl.length === 0) {
  //             $shadowAfterEl = swiper.$(`<div class="swiper-slide-shadow-${isHorizontal ? 'right' : 'bottom'}"></div>`);
  //             $slideEl.append($shadowAfterEl);
  //           }
  //           if ($shadowBeforeEl.length) $shadowBeforeEl[0].style.opacity = offsetMultiplier > 0 ? offsetMultiplier : 0;
  //           if ($shadowAfterEl.length) $shadowAfterEl[0].style.opacity = (-offsetMultiplier) > 0 ? -offsetMultiplier : 0;
  //         }
  //       }

  //        // Set correct perspective for IE10
  //       if (swiper.support.pointerEvents || swiper.support.prefixedPointerEvents) {
  //         const ws = $wrapperEl[0].style;
  //         ws.perspectiveOrigin = `${center}px 50%`;
  //       }
  //     },
  //     setTransition(duration) {
  //       const swiper = this;
  //       swiper.slides
  //         .transition(duration)
  //         .find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left')
  //         .transition(duration);
  //     }
  //   }
  // }

  constructor(
    private alertCtrl: AlertController,
    private router: Router,
    private dataSouce: DatasourceService,
    private postService: PostService,
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private _zone: NgZone,
    private platform: Platform,
    private file: File,
    private navCtrl: NavController,
    private componentsProvider: ComponentsService,
    private events: EventsService,
    private cropper: Crop,
    private modalCtrl: ModalController,
    private discoverService: DiscoverService,
    private storage: Storage,
    private webview : WebView,
  ) {

    // Getting the params image
    this.isAndroid = this.platform.is('android');
    this.subscription = this.platform.backButton.subscribeWithPriority(9999,() => {
      console.log('dont dismiss')
      this.cancelEdit();
    });

    this.dataSouce.serviceData.subscribe(res => {
      console.log('serviceData', res);
      if (res) {
        try {
          this._zone.run(() => {
            console.log(res['photo']);
            /* this photo */
            this.imgblob = res['imgblob'];
            this.imgblob_backup = this.imgblob;
            this.imgbase64 = res['imgbase64'];
            if (Array.isArray(this.imgbase64)) {
              this.isMultiple = true;
            }
            this.video = res['video']
              let file = res['file']
              this.videoURL = this.webview.convertFileSrc(file[0]['fullPath'])
              
            this.imgbase64_backup = this.imgbase64;
            // this.multipleBase64_backUp = res['backUpBase64'];
            this.storage.set('back-up-base64', res['backUpBase64'])
            /* this photo */
            this.isEditPost = res['isEditPost'];
            /* this.img = res['photo'];
            this.temp_crop = res['photo']['path']
            this.temp_photo = res['photo']; */
            /* this.canvas = res['compressedImg'];
            this.compressedImg = res['compressedImg']; */
            this.item = res['item'] ? res['item'] : null;
            this.isFromEdit = this.item != null ? true : false;
            this.privacy = this.item['isPrivate'];
            console.log("isPrivate: ", this.privacy)
            /* if(res['editBase64']){
              this.canvas = res['editBase64'];
              this.compressedImg = res['editBase64'];
            } */
          });

        } catch (error) {

        }
      }
      /* if (this.compressedImg) {
        this._zone.run(() => {
          this.base64StockImage = this.compressedImg;
        });
      } */
    });
    this.buildForm();


  }

  ngOnInit() {
    if (this.item) {
      // Attach a postId form value in the formGroup.
      if (this.platform.is('ios')) {
        this.postForm.addControl('postId', new FormControl(''));
        this.postForm.controls['postId'].setValue(this.item['id']);
      }
      else {
        this.postForm.addControl('postId', new FormControl(this.item.id));
      }

      this.brightness = (Number(this.item.filter.brightness) - 1) * 100;
      this.contrast = (Number(this.item.filter.contrast) - 1) * 100;
      this.saturation = (Number(this.item.filter.saturation) - 1) * 100;
      this.rotation = this.item.filter.rotation;

      this.changeBrightness(this.brightness, true);
      this.changeContrast(this.contrast, true);
      this.changeSaturation(this.saturation, true);
      this.postForm.controls.description.setValue(this.item.description && this.item.description != 'null' ? this.item.description : null);
      this.postForm.controls.location.setValue(this.item.location && this.item.location != 'null' ? this.item.location : null);
      this.postForm.controls.longitude.setValue(this.item.longitude && this.item.longitude != 'null' ? this.item.longitude : null);
      this.postForm.controls.latitude.setValue(this.item.latitude && this.item.latitude != 'null' ? this.item.latitude : null);
      this.postForm.controls.isPrivate.setValue(this.item.isPrivate && this.item.isPrivate != 'null' ? this.item.isPrivate : 0);
      if (this.item['tags']) {
        if (this.item['tags'].length > 0) {
          let tags = [];
          this.item.tags.forEach(tagss => {
            console.log("Before: " + tagss.tags)
            var rep = tagss.tags.replace('#', '')
            console.log("After: " + rep)
            this.tag.push({ display: rep, value: rep });
          });
        }
        else {
          console.log('Not setting tags to form; tags length is 0.');
        }
      }
      else {
        console.log('No tags found.');
      }
    }
  }

  ionViewDidEnter() {
    this.getAppDirectory();
    if(this.videoURL){
      this.test.nativeElement.click();
    }

  }

  cancelEdit() {
    this.presentCancelAlert();
  }

  buildForm() {
    this.postForm = this.formBuilder.group({
      description: [
        '',
        Validators.compose([
          Validators.required
        ])
      ],
      location: [
        '',
      ],
      longitude: [
        '',
      ],
      latitude: [
        '',
      ],
      brightness: [
        1
      ],
      contrast: [
        1
      ],
      saturation: [
        1
      ],
      rotation: [
        'rotate(0deg)'
      ],
      tags: [Array()],
      isPrivate: [0]
    });
  }

  async presentCancelAlert() {
    const alert = await this.alertCtrl.create({
      mode: "md",
      header: 'Cancel Update',
      message: 'Are you sure do you want to discard changes?',
      cssClass: 'postAlertModal',
      buttons: [
        {
          text: 'CANCEL',
          role: 'cancel',
          handler: () => {
            console.log("Cancel")
          }
        },
        {
          text: 'YES',
          handler: () => {
            this.storage.remove('back-up-base64').then(()=>{
              this.modalCtrl.dismiss();
            })
            // this.router.navigateByUrl('/tabs/tabs/dashboard')
          },

        },
      ]
    });
    await alert.present();
  }

  activedTags(event) {
    if (event == 0) {
      this.activeTags = false;
    }
    if (event != 0) {
      this.activeTags = true;
    }
  }


  select(option) {
    if (this.selected == option) {
      this.selected = null
    } else {
      this.selected = option

    }
    console.log(this.selected)
  }


  async pushPost(isDirect?) {
    console.log("this is tags", this.tag);
    console.log('Uploading photo....');
    let prepareLoading = await this.loadingCtrl.create({
      message: `Uploading image...`,
    });
    await prepareLoading.present();
    let tags: any = [];
    if (this.postForm.value.tags.length > 0) {
      console.log(this.postForm.value.tags);
      if (this.platform.is('ios')) {
        console.log(this.postForm.value);
      } else {
        this.tag.forEach((data: any) => {
          console.log(data);
          tags.push("#" + data.value);
        });
      }

      this.postForm.controls.tags.setValue(JSON.stringify(tags));
    } else {
      console.log("hey there");
      this.tag.forEach((data: any) => {
        console.log(data);
        tags.push("#" + data.value);
      });
      this.postForm.controls.tags.setValue(JSON.stringify(tags));
    }

    let thisData = this.postForm.value;
    var formData = new FormData();
    if (this.isMultiple) {
      this.imgblob.forEach((element, index) => {
        formData.append(`photo[${index}]`, element);
      });
    } else {
      formData.append('photo', this.imgblob);
    }
    let keys = Object.keys(thisData);
    for (var i = keys.length - 1; i >= 0; i--) {
      let key = keys[i];
      let toAppend = thisData[key];
      formData.append(key, toAppend);
    }
    await this.postService.saveNew(formData).then((result: any) => {
      console.log(result);
      if (result.error === 0) {
        prepareLoading.dismiss();
        // this.events.publish('refresh-home-feed');
        // this.events.publish('refresh-main-profile-feed');
        let navigationExtras: NavigationExtras = {
          state: {
            item: result['data'],
            temp_photo: this.imgbase64/* this.rotatedImage != '' ? this.rotatedImage : this.temp_photo */,
            fromPost: this.isEditPost
          }
        }
        this.modalCtrl.dismiss();
        this.navCtrl.navigateForward(['/post-detail'], navigationExtras);
        this.events.publish('refresh-post-details');
        if (result.status === 0) {
          this.postService.postNotif({ postId: result.data.id }).then(res => {
            console.log(res);
          });
        }
      } else {
        prepareLoading.dismiss();
      }
    }).catch(e => {
      console.error(e);
      prepareLoading.dismiss();
    });
  }

  changeBrightness(e, isFromEdit = false) {
    console.log('changeBrightness', e);
    if (isFromEdit) {
      this._zone.run(() => {
        this.pixiBrightness = e;
      });
    } else {
      this._zone.run(() => {
        if (this.isMultiple) {
          this.pixiBrightness = e;
          let pixiBrightness = { 'pixiBrightness': this.pixiBrightness }
          this.imgbase64[this.slidePage - 1] = Object.assign(this.imgbase64[this.slidePage - 1], pixiBrightness)
        } else {
          this.pixiBrightness = e;
        }
      });
    }
    this.postForm.controls.brightness.setValue((this.pixiBrightness + 100) / 100);
    console.log(this.postForm)
  }
  changeContrast(e, isFromEdit = false) {
    console.log('changeContrast', e);
    if (isFromEdit) {
      this._zone.run(() => {
        this.pixiContrast = e;
      });
    } else {
      this._zone.run(() => {
        if (this.isMultiple) {
          this.pixiContrast = e;
          let pixiContrast = { 'pixiContrast': this.pixiContrast }
          this.imgbase64[this.slidePage - 1] = Object.assign(this.imgbase64[this.slidePage - 1], pixiContrast)
        } else {
          this.pixiContrast = e;
        }
      });
    }
    this.postForm.controls.contrast.setValue((this.pixiContrast + 100) / 100);
  }
  changeSaturation(e, isFromEdit = false) {
    console.log('changeSaturation', e);
    if (isFromEdit) {
      this._zone.run(() => {
        this.pixiSaturation = e;
      });
    } else {
      this._zone.run(() => {
        if (this.isMultiple) {
          this.pixiSaturation = e;
          let pixiSaturation = { 'pixiSaturation': this.pixiSaturation }
          this.imgbase64[this.slidePage - 1] = Object.assign(this.imgbase64[this.slidePage - 1], pixiSaturation)
        } else {
          this.pixiSaturation = e;
        }
      });
    }
    this.postForm.controls.saturation.setValue((this.pixiSaturation + 100) / 100);
  }
  renderImage() {
    let naturalImage = this.thisImage.nativeElement
    var renderer = PIXI.autoDetectRenderer({
      width: naturalImage.naturalWidth,
      height: naturalImage.naturalHeight,
      transparent: true
    });
    this.stage = new PIXI.Container();
    var tempCanvas = PIXI.Sprite.from(this.imgbase64);
    // center the sprite anchor point
    tempCanvas.anchor.x = 0;
    tempCanvas.anchor.y = 0;
    // move the sprite to the center of the canvas
    tempCanvas.position.x = 0;
    tempCanvas.position.y = 0;
    var colorMatrix = new PIXI.filters.ColorMatrixFilter();
    var colorMatrix2 = new PIXI.filters.ColorMatrixFilter();
    var colorMatrix3 = new PIXI.filters.ColorMatrixFilter();
    console.log(this.pixiBrightness, this.pixiContrast, this.pixiSaturation)
    tempCanvas.filters = [colorMatrix, colorMatrix2, colorMatrix3];
    colorMatrix.brightness((this.pixiBrightness + 100) / 100, false);
    colorMatrix2.contrast(this.pixiContrast, false);
    colorMatrix3.saturate(this.pixiSaturation, false);
    // console.log("B: "+this.pixiBrightness)
    this.stage.addChild(tempCanvas);
    console.log(this.stage)
    renderer.render(this.stage)
    var canvasData = renderer.view.toDataURL('image/png');
    //console.log(canvasData)
    if (canvasData != null) {
      this.imgbase64 = canvasData
    }
  }

  prepareBlob(base64Data) {
    console.log("base64Data", base64Data);
    return new Promise(resolve => {
      this.componentsProvider.b64toBlob(base64Data, 'image/png').then(response => {
        if (response['error'] == 0) {
          let fileBlob = response['generatedBlob'];

          // Create a temporary file with the provided base64 data.
          let options: IWriteOptions = { replace: true }
          console.log('Writing file.');
          this.file.writeFile(this.dataDir, 'photo_upload', fileBlob, options).then(response => {
            console.log(response);
            let srcUrl = response['nativeURL'];
            resolve({ error: 0, url: srcUrl });
          }).catch(fileWriteError => {
            resolve({ error: 1, trace: fileWriteError, request: 'prepareBlob - writeFile' });
          });
        }
      }).catch(prepareBlobError => {
        resolve({ error: 1, trace: prepareBlobError, request: 'prepareBlob - b64toBlob' });
      });
    });
  }

  getAppDirectory() {
    let dataDir = this.file.dataDirectory;
    console.log('DataDir: ', dataDir);
    this.dataDir = dataDir;
  }

  ionViewWillLeave() {
    this.subscription.unsubscribe();
  }
  ionViewDidLeave() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  rotateImage() {

  }
  submitTag(e) {
    e = e.replace('#', '')
    this.tagInput.inputForm.inputText = e;
    this.tagInput.onFormSubmit();
  }

  seperatorKeys(event) {
    if (event) {
      setTimeout(() => {
        this.discoverService.searchTags(event).then((tags: any) => {
          this.suggestTags = [];
          console.log(this.tag)
          this.suggestTags = tags['data']
          if (this.suggestTags && this.suggestTags.length > 0) {
            document.getElementById('autocompleteTags').scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        })
      }, 500);
    } else {
      this.suggestTags = [];
    }
    this.tagInput.onTextChangeDebounce = 0;
    var tags = event;

    console.log(event);
    var iChars = ", ";
    if (event == 0) {
      this.activeTags = false;
    }
    if (event != 0) {
      this.activeTags = true;
    }
    for (var i = 0; i < tags.length; i++) {
      if (iChars.indexOf(tags.charAt(i)) != -1) {
        this.validateTag(event);
        console.log(this.tagInput.inputForm.inputText)
        this.activeTags = false;
      }
    }
  }

  validateTag(e) {
    let newValue = e;
    console.log("new value: ", newValue);
    let regExp = new RegExp('^[A-Za-z0-9]+$');
    if (!regExp.test(this.tagInput.inputForm.inputText)) {
      console.log(this.tagInput.inputForm.inputText)
      this.tagInput.inputForm.inputText = this.tagInput.inputForm.inputText.replace(",", "");
      this.tagInput.inputForm.inputText = this.tagInput.inputForm.inputText.replace(" ", "");
      this.tagInput.onFormSubmit()
      // var tempTag = this.tag.includes(e)
      // console.log("meron?", tempTag)
      // if(tempTag == false){
      // 
      //   console.log('Pasok?')
      // }
    }
    console.log(this.tag)
    // this.tag.push({display:e,value:e});
    this.tagInput.inputForm.inputText = ""
  }

  getValue(ev: any) {
    console.log("ev", ev);
    if (ev == '') {
      this.autocompleteItems = [];
      return;
    }
    let me = this;
    this.service.getPlacePredictions({
      input: ev
    }, (predictions, status) => {
      me.autocompleteItems = [];
      me._zone.run(() => {
        if (status == 'OK') {
          if (predictions != null) {
            predictions.forEach((prediction) => {
              me.autocompleteItems.push(prediction.description);
              console.log(me.autocompleteItems.length)
            });
            if (this.autocompleteItems.length != 0) {
              try {
                setTimeout(() => {
                  this.scrollToView();
                }, 200);
              } catch (e) {
                console.log(e)
              }
            }
            /* this.content.scrollToBottom(0); */
          }
        }
      });
    });
  }
  geoCode(address: String) {
    this.postForm.controls.location.setValue(address);
    this.autocompleteItems = [];

    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': address }, (results, status) => {
      this.postForm.controls.longitude.setValue(results[0].geometry.location.lng());
      this.postForm.controls.latitude.setValue(results[0].geometry.location.lat());
    });
  }
  blurFunction(e) {
    // console.log(e);
    setTimeout(() => {
      this.autocompleteItems = [];
    }, 500)
  }
  clearFocus() {
    this.postForm.controls.location.setValue(null);
    this.postForm.controls.longitude.setValue(null);
    this.postForm.controls.latitude.setValue(null);
  }

  crop(e) {
    if (e == 0) {
      this._zone.run(() => {
        this.imgblob = this.isMultiple ? this.imgblob_backup[this.slidePage -1] : this.imgblob_backup;
        if(this.isMultiple){
          this.imgbase64[this.slidePage - 1]['cropSelected'] = 0;
          this.storage.get('back-up-base64').then( res =>{
            this.imgbase64[this.slidePage - 1]['img'] = res[this.slidePage - 1]['img']
          })
          console.log('2nd',this.imgbase64)
        }else{
          this.imgbase64 =  this.imgbase64_backup;
        }
        this.cropSelected = e;
      });
    } else if (e == 1) {
      this._zone.run(() => {
        this.imgblob = this.isMultiple ? this.imgblob_backup[this.slidePage -1] : this.imgblob_backup;
      });
      this.presentCropperModal(this.imgblob, 3, 2, e);
    } else {
      this._zone.run(() => {
        this.imgblob = this.isMultiple ? this.imgblob_backup[this.slidePage -1] : this.imgblob_backup;
      });
      this.presentCropperModal(this.imgblob, 1, 1, e);
    }
    /* console.log("EEEE: ", this.temp_crop)
    this.cropSelected = e;
    if(e == 0){
      let cropOptions: CropOptions = {
        quality: 100,
        targetHeight: this.thisImage.nativeElement.naturalHeight,
        targetWidth: this.thisImage.nativeElement.naturalWidth
      };
      this.cropper.crop(this.temp_crop, cropOptions).then((croppedImage: any) => {
        console.log("croppedImage", croppedImage);
      }).catch(e => {
        console.log("e", e);
      });
    }else if(e == 1){
      let cropOptions: CropOptions = {
        quality: 100,
        targetHeight: 600,
        targetWidth: 400
      };
      this.cropper.crop(this.temp_crop, cropOptions).then((croppeImage: any) => {
        console.log("croppeImage", croppeImage);
      }).catch(e => {
        console.log("e", e);
      });
    }else if(e == 2){
      let cropOptions: CropOptions = {
        quality: 100,
        targetHeight: 600,
        targetWidth: 600,
        
      };
      this.cropper.crop(this.temp_crop, cropOptions).then((croppeImage: any) => {
        console.log("croppeImage", croppeImage);
      }).catch(e => {
        console.log("e", e);
      });
    } */
    /* this.gotoImageCropper(); */
  }
  /* async gotoImageCropper(image) {
    this.imageCompress.compressFile(image, orientation, 100, 90).then(result => {
      this.presentCropperModal(this.componentsProvider.b64toBlobNew(result.replace("data:image/jpeg;base64,", ""), 'image/jpeg', 512));
    }).catch(e => {
      console.log("e", e);
    });
  } */

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
        if(this.isMultiple){
          this.imgbase64[this.slidePage - 1]['img'] = data.base64;
        }else{
          this.imgbase64 = data.base64;
        }
      });
      if (this.isMultiple) {
        this.cropSelected = cropSelected;
        let objectCropSelected = { 'cropSelected': this.cropSelected }
        this.imgbase64[this.slidePage - 1] = Object.assign(this.imgbase64[this.slidePage - 1], objectCropSelected)
      } 
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
  onBlur(e) {
    // let newValue = e;
    // console.log("new value: ", newValue);
    // let regExp = new RegExp('^[A-Za-z0-9]+$');
    // if (!regExp.test(newValue)) {
    //   e = newValue.slice(0, -1);
    // }
    // if (e != '') {
    //   this.tag.push({ display: e, value: e });
    //   this.tagInput.inputForm.inputText = ""
    //   this.activeTags = false;
    // }
    this.suggestTags = [];
  }

  scrollToView() {
    let autoPop = document.getElementById("locations-card");
    if (autoPop) {
      autoPop.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
  cropDetermine(cropSelected){
    this.cropSelected = cropSelected
  }

  viewPhoto(src) {
    this.componentsProvider.viewFullPhotoNew(src);
  }
  ionSlideDidChange(e) {
    this.slides.getActiveIndex().then(res => {
      this.slidePage = res + 1;
      this.changeBrightness(this.imgbase64[res]['pixiBrightness'] ? this.imgbase64[res]['pixiBrightness'] : 0, false);
      this.changeContrast(this.imgbase64[res]['pixiContrast'] ? this.imgbase64[res]['pixiContrast'] : 0, false);
      this.changeSaturation(this.imgbase64[res]['pixiSaturation'] ? this.imgbase64[res]['pixiSaturation'] : 0, false);
      this.cropDetermine(this.imgbase64[res]['cropSelected'] ? this.imgbase64[res]['cropSelected'] : 0)
    })
  }

  click(){
    this.videoFile = this.myVideo.nativeElement;
    this.videoFile.src = this.videoURL;
    this.videoFile.play();
    this.playing = true;
    if(this.videoFile.paused){
      console.log('pos')
    }else{
      setTimeout(() => {
        this.showButton = false
      }, 1000);
    }
    // this.videoFile.addEventListener('timeupdate', function(){
    //   if(this.videoFile.ended){
    //     this.playing = true;
    //   }
    // })
    // playButton.style.backgroundColor = "black";
    // video.controlsList = "nodownload" 
    // console.log(video)
    // console.log(video.controls)
  }

  playPause(){
    if(this.videoFile.paused){
      this.videoFile.play()
      this.playing = true;
      console.log('play')
      setTimeout(() => {
        this.showButton = false
      }, 2000);
    }else{
      console.log('paused')
      this.videoFile.pause();
      this.playing = false
      this.showButton = true
    }
  }

  showButtons(){
    this.showButton = true;
    if(this.videoFile.paused){
      console.log('pause')
    }else{
      console.log('hide')
      setTimeout(() => {
        this.showButton = false
      }, 2000);
    }
  }

  setCurrentTime(data) {
  var currentPlayingTime = data.target.currentTime / data.target.duration;
  this.completeDuration = data.target.duration
  // this.duration.nativeElement.style.width = currentPlayingTime * 100 + "%";
  this.duration.value = currentPlayingTime * 100 ;
   if(data.target.currentTime == data.target.duration){
    this.playing = false;
    this.showButton = true
   }
 }
 setCurrentTimeForce(time){
   console.log(time.target.value)
   console.log(this.videoFile.currentTime)
    console.log( this.videoFile.currentTime = (time.target.value / this.completeDuration) * 100);
 }
 seeking(seek){
  console.log(seek)
  console.log(seek.target.value)
 }
}


// http://localhost/_app_file_/storage/emulated/0/DCIM/Camera/VID20210308135216.mp4
// outerHTML: "<iframe _ngcontent-qcd-c5="" allowfullscreen="" autoplay="" controls="" id="test2" src="http://localhost/_app_file_/storage/emulated/0/DCIM/Camera/VID20210308135705.mp4"></iframe>"
