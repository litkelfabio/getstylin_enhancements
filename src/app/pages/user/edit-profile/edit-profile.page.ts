import { Component, OnInit, NgZone, ViewChild, ElementRef } from '@angular/core';
import { ModalController, NavController, ActionSheetController, AlertController, LoadingController, Platform, IonText, IonImg, IonInput } from '@ionic/angular';
import { BirthdayModalComponent } from 'src/app/components/modals/birthday-modal/birthday-modal.component';
import { BrandsService } from 'src/app/services/brands/brands.service';
import { ClothingService } from 'src/app/services/clothing/clothing.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ComponentsService } from 'src/app/services/components/components.service';
import { EventsService } from 'src/app/services/events.service';
import { FilePath } from '@ionic-native/file-path/ngx';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SizesService } from 'src/app/services/sizes/sizes.service';
import { Storage } from '@ionic/storage';
import { IonicSelectableComponent } from 'ionic-selectable';
import { UserService } from 'src/app/services/user/user.service';
import { EmailValidator } from '../../../../validators/email';
import { FavoriteBrandModalComponent } from 'src/app/components/modals/favorite-brand-modal/favorite-brand-modal.component';
import { ImageCropperPage } from './../../../components/modals/image-cropper/image-cropper.page';
import { NgxImageCompressService } from 'ngx-image-compress';
import { Subscription } from 'rxjs';

declare var google: any;
@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})

export class EditProfilePage implements OnInit {
  // brands:any;
  // onSaveBrands:any;
  // searchBrands:any;
  // getMoreBrands:any;
  // brandChange:any;
  @ViewChild('input') private input: ElementRef;
  @ViewChild('imgupload', { static: false }) private imgupload: ElementRef;
  errorImage = false;
  public editProfileForm: FormGroup;
  profileInfo : any;
  isPresent = false;
  aboutLength: any;
  verifyDisabled: boolean = true;
  is_submit: boolean = false;
  emailExistence: boolean = false;
  usernameExistence: boolean = false;
  isDisabled = false;
  socialMedia: any;
  facebook_user: any;
	temp_profile_photo: any;
  new_profile_photo: any;
  submit_profile_photo: any;
  isLoadedImage = false;
  profile_image_url: any;
  nonNormalizedUrl: any;
  is_uploading: boolean = false;
  pic_path: any;
  brand: any;
  /* BRANDS */
  brandIds = [];
  brands = [];
  brand_label;
  brandOptions = [];
 // new_brands = [];
  new_brands = [];
  /* CLOTHING */
  clothings = [];
  chosenClothingSize = [];

  /* FOR ION SELECT BRANDS */
  page: number = 2;
  totalPages: number = 0;
  totalItems: number = 0;
  searchKey: string;
  loadedProfile = false;
  portsSubscription: Subscription;
  /* GENDER */
  public genderId = '';
  subscription: any;
  /* LOCATION */
  @ViewChild('searchInput') searchInput: IonText;
  @ViewChild("image", {static: false}) imageDash: IonImg;
  autocompleteItems = [];
  service = new google.maps.places.AutocompleteService();

  currentDate = new Date().toISOString();
  constructor(
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private brandsProvider: BrandsService,
    private clothingProvider: ClothingService,
    private camera: Camera,
    private componentsProvider: ComponentsService,
    private events: EventsService,
    private filePath: FilePath,
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private platform: Platform,
    private sizesProvider: SizesService,
    private storage: Storage,
    private userProvider: UserService,
    private _zone: NgZone,
    private modalCtrl: ModalController,
    public imageCompress: NgxImageCompressService,
  ) {
    this.subscription =  this.platform.backButton.subscribeWithPriority(10, () => {
      console.log('Back button clicked!');
      this.back();
    });
    
    console.log(this.currentDate);
    this.storage.get('user').then(data => {
      this.profileInfo = data;

      console.log("edit profile", this.profileInfo);
      if (this.profileInfo) {
        if (this.profileInfo.profile_profile_pic) {
          this.profileInfo.profile_image_url = this.profileInfo.profile_profile_pic;
        }
        this.editProfileForm = this.formBuilder.group({
          /* user_name: [this.profileInfo.username], */
          first_name: [
            this.profileInfo.profile_first_name,
            Validators.compose([
              Validators.required,
              Validators.pattern('[a-zA-Z ]*'),
              Validators.maxLength(30)
            ])
          ],
          last_name: [
            this.profileInfo.profile_last_name,
            Validators.compose([
              Validators.required,
              Validators.pattern('[a-zA-Z ]*'),
              Validators.maxLength(30)
            ])
          ],
          birthdate: [
            this.profileInfo.profile_birthdate && (this.profileInfo.profile_birthdate != 'null' && this.profileInfo.profile_birthdate != '0000-00-00') ?
              data.profile_birthdate : null
          ],
          gender_label: [
            this.componentsProvider.getGenderLabel(this.profileInfo.profile_gender),
            Validators.compose([
              Validators.required,
            ])
          ],
          gender: [
            this.profileInfo.profile_gender,
            Validators.compose([
              Validators.required,
            ])
          ],
          about: [
            this.profileInfo.profile_about && this.profileInfo.profile_about != 'null' ? this.profileInfo.profile_about : null
          ],
          brands_form: [

          ],
          brands_label: [
            ''
          ],
          brandIds: [
            ''
          ],
          email: [this.profileInfo.email, Validators.compose([Validators.required, EmailValidator.emailValidator])],
          number: [this.profileInfo.contact_number ? this.profileInfo.contact_number : null],
          lon: [
            this.profileInfo.profile_lon && this.profileInfo.profile_lon != 'null' ? this.profileInfo.profile_lon : null
          ],
          lat: [
            this.profileInfo.profile_lat && this.profileInfo.profile_lat != 'null' ? this.profileInfo.profile_lat : null
          ],
          location: [
            this.profileInfo.profile_location && this.profileInfo.profile_location != 'null' ? this.profileInfo.profile_location : null
          ]
        });
        if (data.brands) {
          let brand_labels = [];
          this.editProfileForm.controls.brands_form.setValue(data.brands);

          console.log('Brandsss', this.brands);

          data.brands.forEach(data => {
            brand_labels.push(data.brand_name);
            this.editProfileForm.controls.brands_label.setValue(brand_labels.join(', '));
            this.brandIds.push(data.id);
             
            console.log(this.editProfileForm.value.brands_label);
            console.log("brands", this.brandIds);
          });
        }
        if (data.profile_gender) {
          this.loadClothing(data.profile_gender);
          this.genderId = data.profile_gender;
        }

        if (data['profile_about'] && data['profile_about'].length > 0) {
          console.log(data['profile_about'].length);
          this.aboutLength = data['profile_about'].length;
        }
        else {
          console.log('No About Me set.');
        }
      }
      console.log("profileInfo", this.profileInfo);
    });
   }

  ngOnInit() {
  }
  ionViewDidEnter()
  {
    console.log('ionViewDidLoad EditProfilePage');
    this.loadBrands();
    this.getStorage();
  }  
  ionViewWillLeave(){
    this.subscription.unsubscribe();
  }
  async loadClothing(genderId) {
    const loader = await this.loadingCtrl.create({
      message: "Updating your profile..."
    });
    loader.present();
    this.clothingProvider.getClothing(genderId).then(result => {
      loader.dismiss();
      if (result['error'] == 0) {
        result['data'].forEach((data, i) => {
          this.editProfileForm.addControl('clothingField_' + i, new FormControl(''));
         this.editProfileForm.get('clothingField_'+i).setValue(data['clothing_type']);
         console.log("TYPE: ", 'clothingField_'+i)
        });
        this.clothings = result['data'];
        console.log("RES: ", this.clothings)
      } else {
        this.componentsProvider.showToast(result['message']);
      }
      this.loadUserInfo();
    }).catch(e => {
      loader.dismiss();
      this.loadClothing(genderId);
			console.log("this.userProvider.register Error: ", e);
    });
  }

  loadUserInfo() {
    this.storage.get('user').then(data => {
      if (data.clothing.length > 0) {
        this.clothings.forEach((clothingData, i) => {
          this.chosenClothingSize[i] = {
            clothingId: data.clothing[i] ? data.clothing[i].id : null,
            sizeId: data.clothing[i] ? data.clothing[i].size.id : null
          };
          this.editProfileForm.controls['clothingField_' + i].setValue(data.clothing[i] ? data.clothing[i].size.size : null);
        });
      } else {
        this.clothings.forEach(() => {
          this.chosenClothingSize.push({
            clothingId: null,
            sizeId: null
          })
        });
      }
    });
  }

 async chooseSize(clothing, i, show?) {
   
    let options = [];
    console.log('Clothing option: ', clothing);
    clothing.sizes.forEach(data => {
      let bool = this.chosenClothingSize.find(e => e.clothingId == clothing.id && e.sizeId == data.id) ? true : false;
      options.push({
        type: 'radio',
        label: clothing.clothing_type == 'Shoes' ? 'US ' + data.size : data.size,
        value: data.id,
        checked: bool,
        handler: op => {
          if (op) {
            this.chosenClothingSize[i] = {
              clothingId: clothing.id,
              sizeId: op.value
            };
            let sizeLabel = options.find(e => e.value === op.value)['label'];
            this.editProfileForm.controls['clothingField_' + i].setValue(sizeLabel);
          } else {
            this.chosenClothingSize.splice(i);
            this.editProfileForm.controls['clothingField_' + i].setValue('');
          }
          alert.dismiss()
          // this.isPresent = false
        }
      });
    });

    const alert = await this.alertCtrl.create({
      cssClass: "custom-alert-option-list",
      inputs: options,
      /*buttons: [
        {
          text: 'Ok',
          handler: data => {
            if (data) {
              this.chosenClothingSize[i] = {
                clothingId: clothing.id,
                sizeId: data
              };
              console.log(options.find(e => e.value === data)['label']);
              let sizeLabel = options.find(e => e.value === data)['label'];
              this.editProfileForm.controls['clothingField_' + i].setValue(sizeLabel);
            } else {
              this.chosenClothingSize.splice(i);
              this.editProfileForm.controls['clothingField_' + i].setValue('');
            }
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
      ]*/
    }); 
      alert.present()
  }

  async loadBrands() {
    const loader = await this.loadingCtrl.create({
      message: "Updating your profile..."
    });
    loader.present();
    this.brandsProvider.getBrands().then(data => {
      loader.dismiss();
      if (data['error'] == 0) {
        this.brands = data['data'];
        this.totalPages = data["total_page"];
        this.totalItems = data["total_count"];
        console.log('MASDASDA BRANDS', this.brands);
        this.brands.forEach(data => {
          this.brandOptions.push({
            type: 'checkbox',
            label: data.brand_name,
            value: data.id,
            handler: brand => {
              console.log(this.brandIds);
              if (brand) {
                /* this.brandIds = brand.value; */
                if (this.brandIds.find(e => e === brand.value)) {
                  let index = this.brandIds.indexOf(brand.value);
                  this.brandIds.splice(index, 1);
                } else {
                  this.brandIds.push(brand.value);
                }
                let brand_labels = [];
                this.brandIds.forEach(data => {
                  let brand = this.brandOptions.find(e => e.value === data);
                  brand_labels.push(brand.label);
                });
                this.editProfileForm.controls.brands_label.setValue(brand_labels.join(', '));
              } else {
                this.brandIds = [];
                this.editProfileForm.controls.brands_label.setValue('');
              }
            }
          });
        });
      } else {
        this.componentsProvider.showToast(data['message']);
      }
    }).catch(e => {
      loader.dismiss();
      this.loadBrands();
      console.log("this.userProvider.register Error: ", e);
    });
  }

  async chooseBrands() {
    if (this.brandIds) {
      this.brandOptions.forEach(data => {
        data['checked'] = false;
      });
      this.brandIds.forEach(data => {
        let brand = this.brandOptions.find(e => e.value === data );
        if (brand) {
          brand['checked'] = true;
        } else {
          brand['checked'] = false;
        }
      });
    }
    const alert = await this.alertCtrl.create({
      cssClass: "custom-alert-option-list",
      inputs: this.brandOptions,
    /*  buttons: [
        {
          text: 'Ok',
          handler: data => {
            if (data) {
              console.log('lookthis', data);
              this.brandIds = data;
              let brand_labels = [];
              this.brandIds.forEach(data => {
                let brand = this.brandOptions.find(e => e.value === data);
                brand_labels.push(brand.label);
              });
              this.editProfileForm.controls.brands_label.setValue(brand_labels.join(', '));
            } else {
              this.brandIds = [];
              this.editProfileForm.controls.brands_label.setValue('');
            }
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
      ]*/
    });
    alert.present();
  }

  async chooseGender(selected?) {
    console.log(selected);
    const alert =await this.alertCtrl.create({
      cssClass: "custom-alert-option-list",
      inputs: [
        {
          type: 'radio',
          label: 'Male',
          value: '1',
          checked: selected == 1 ? true : false,
          handler: gender => {
            console.log(gender);
            if (gender) {
              this.genderId = gender.value;
              let gender_label = this.componentsProvider.getGenderLabel(gender.value);
              this.editProfileForm.controls.gender_label.setValue(gender_label);
              this.editProfileForm.controls.gender.setValue(gender.value);
              this.loadClothing(gender.value);
            } else {
              this.genderId = '';
              this.editProfileForm.controls.gender_label.setValue('');
              this.editProfileForm.controls.gender.setValue('');
            }
            alert.dismiss();
          }
        },
        {
          type: 'radio',
          label: 'Female',
          value: '2',
          checked: selected == 2 ? true : false,
          handler: gender => {
            console.log(gender);
            if (gender) {
              this.genderId = gender.value;
              let gender_label = this.componentsProvider.getGenderLabel(gender.value);
              this.editProfileForm.controls.gender_label.setValue(gender_label);
              this.editProfileForm.controls.gender.setValue(gender.value);
              this.loadClothing(gender.value);
            } else {
              this.genderId = '';
              this.editProfileForm.controls.gender_label.setValue('');
              this.editProfileForm.controls.gender.setValue('');
            }
            alert.dismiss();
          }
        },
        {
          type: 'radio',
          label: 'Other',
          value: '3',
          checked: selected == 3 ? true : false,
          handler: gender => {
            console.log(gender);
            if (gender) {
              this.genderId = gender.value;
              let gender_label = this.componentsProvider.getGenderLabel(gender.value);
              this.editProfileForm.controls.gender_label.setValue(gender_label);
              this.editProfileForm.controls.gender.setValue(gender.value);
            } else {
              this.genderId = '';
              this.editProfileForm.controls.gender_label.setValue('');
              this.editProfileForm.controls.gender.setValue('');
            }
            alert.dismiss();
          }
        }
      ],
    });
    alert.present();
  }
  async saveUserInfo() {
    console.log("this.editProfileForm.value", this.editProfileForm.value);
    if (this.editProfileForm.valid) {
      const loader = await this.loadingCtrl.create({
        message: "Updating your profile..."
      });
      loader.present();
      console.log("this.chosenClothingSize", this.chosenClothingSize);
      console.log("this.brandIds", this.brandIds);
      this.sizesProvider.saveUserSizes(this.chosenClothingSize).then(() => {
        this.editProfileForm.controls.brandIds.setValue(this.brandIds);
        console.log("brandsid", this.brandIds);
        this.brandsProvider.saveFavoriteBrands(this.editProfileForm.value).then(() => {
          loader.dismiss();
          if (this.editProfileForm.valid) {
            /* this.saveProfile(); */
            this.saveProfileNew();
          }
          else {
            this.componentsProvider.showToast("Please check all fields for invalid input.");
          }

          // If the ProgressCheck modal is presented,
          // it will react to this event.
          this.events.publish('profile-updated');
        });
      });
    }
    else {
      this.componentsProvider.showToast("Please check all fields for invalid input.");
    }
  }
  /* openImagePicker() {
    let options = {
      quality: 30,
      correctOrientation: true,
      destinationType: this.camera.DestinationType.FILE_URI,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      mediaType: this.camera.MediaType.PICTURE,
    }
    this.camera.getPicture(options).then((result) => {
      console.log("openImagePicker", result);
      if (result.length > 0 && result != 'OK') {
        if (result.startsWith("content://")) {
          this.filePath
            .resolveNativePath(result)
            .then(filePath => {
              this.is_uploading = true;
              if (!this.temp_profile_photo) {
                this.temp_profile_photo = new Array<string>();
              }
              let pp_pieces = filePath.split("/");
              let new_pp = {
                name: pp_pieces[pp_pieces.length - 1],
                path: filePath
              };
              if (this.platform.is("ios")) {
                new_pp["path"] = filePath;
                filePath = filePath.replace("file://", "");
                this.profileInfo["userImage"] = filePath;
              } else {
                this.profileInfo["userImage"] = filePath;
              }
              this.temp_profile_photo.splice(0, 1);
              this.temp_profile_photo.push(new_pp);

              console.log("temp_profile_photo: ", this.temp_profile_photo);
              // this.cropPicture(this.temp_profile_photo, 'jpg');
              this.is_uploading = false;
            })
            .catch(err => {
              console.log(err);
            });
        } else if (result.startsWith("file://")) {
          let photo = result.split("?");
          // this.cropPicture(photo, 'png');
          this.is_uploading = false;
        }
      }
    }).catch(e => {
      console.log("openImagePicker e", e);
    });
  } */
  async takePicture(){
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true
    }
    
    let loader = await this.loadingCtrl.create({
    });
    await loader.present();

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      console.log(imageData);
      let imageBase64;
      if (imageData.length > 0) {
        this._zone.run(() => {
          imageBase64 = 'data:image/jpeg;base64,' + imageData;
        });
        this.gotoImageCropper(imageBase64);
        loader.dismiss();
      }
    }, (err) => {
      // Handle error
      console.log(err);
      loader.dismiss();
    });
  }
  async gotoImageCropper(image) {
    console.log("gotoImageCropper", image);
    this.imageCompress.compressFile(image, orientation, 100, 90).then(result => {
      this.presentCropperModal(this.componentsProvider.b64toBlobNew(result.replace("data:image/jpeg;base64,", ""), 'image/jpeg', 512),1,1);
    }).catch(e => {
      console.log("e", e);
    });
  }
  /* takePicture() {
    let options = {
      quality: 40,
      correctOrientation: true,
      targetWidth: 1500,
      targetHeight: 1000,
      encodingType: this.camera.EncodingType.JPEG,
    };
    this.camera.getPicture(options).then((results) => {
      console.log('getPicture_result_camera', results);
      this.pic_path = results;
      if(results.length > 0 && results != 'OK'){
        this.is_uploading = true;
        if(!this.temp_profile_photo) {
          this.temp_profile_photo = new Array<string>();
        }
        let pp_pieces = results.split("/");
        let new_pp = {
          "name": pp_pieces[pp_pieces.length - 1],
          "path": results
        };
        if (this.platform.is('ios')) {
          new_pp["path"] = results;
          results = results.replace("file://", "");
          this.profileInfo['userImage'] = results;
        }
        else {
          this.profileInfo['userImage'] = results;
        }
        this.temp_profile_photo.splice(0, 1);
        this.temp_profile_photo.push(new_pp);

        console.log("temp_profile_photo: ", this.temp_profile_photo);
        // this.cropPicture(this.temp_profile_photo, 'jpg');
        this.is_uploading = false;
    }
    }, function(error) {
      console.log(error);
    });
  } */
  // cropPicture(picture, type?) {
  //   let picture_url = null;
  //   if (type == 'jpg') {
  //     picture_url = picture[0].path;
  //   }

  //   if (type == 'png') {
  //     picture_url = picture[0];
  //   }
  //   console.log('Data from source: ', picture, 'Data assigned: ', picture_url);

  //   let cropOptions: RatioCropOptions = {
  //     quality: 50,
  //     targetHeight: 450,
  //     targetWidth: 300,
  //     heightRatio: 3,
  //     widthRatio: 2
  //   }
  //   this.ratioCrop.ratioCrop(picture_url, cropOptions).then(newImageUrl => {
  //     if (this.platform.is('ios')) {
  //       this.profile_image_url = newImageUrl;
  //     }
  //     else {
  //       this.profile_image_url = newImageUrl;
  //     }
  //     this.submit_profile_photo = new Array<string>();
  //     let pp_pieces = newImageUrl.split("/");
  //     let new_pp = {
  //       "name": pp_pieces[pp_pieces.length - 1].split("?")[0],
  //       "path": newImageUrl
  //     };

  //     let t = newImageUrl;
  //     t = t.replace('(', '%28');
  //     t = t.replace(')', '%29');
  //     if (this.platform.is('ios')) {
  //       t = t.replace("file://", "");
  //       this.profileInfo['userImage'] = t;
  //       new_pp["path"] = newImageUrl;
  //     }
  //     else {
  //       this.profileInfo['userImage'] = t;
        
  //     }
  //     console.log("profile image this: "+this.profileInfo['userImage']);
  //     this.submit_profile_photo.push(new_pp);

  //     this.submit_profile_photo[0].path = this.submit_profile_photo[0].path.replace("(","%28");
  //     this.submit_profile_photo[0].path = this.submit_profile_photo[0].path.replace(")","%29");
  //     this.submit_profile_photo[0].path = this.submit_profile_photo[0].path.split("?")[0];

  //     console.log("profile_image_url: ", this.profile_image_url);
  //     console.log("submit_profile_photo: ", this.submit_profile_photo);
  //   }, err => {
  //     console.log("Error cropping photo: ", err);
  //   });
  // }
  async saveProfileNew() {
    let thisData = this.editProfileForm.value;
    var formData = new FormData();
    if (this.submit_profile_photo) {
      formData.append('attachment', this.submit_profile_photo);
    }
    let keys = Object.keys(thisData);
    for (var i = keys.length - 1; i >= 0; i--) {
      let key = keys[i];
      let toAppend = thisData[key];
      formData.append(key, toAppend);
    }
    const loader = await this.loadingCtrl.create({
    });
    await loader.present();
    this.userProvider.updateProfileNew(formData).then((res: any) => {
      loader.dismiss();
      console.log("res", res);
      if (res.error == 0) {
        this.storage.set('user', res.data).then(() => {
          this.events.publish('refresh-main-profile-feed');
          this.navCtrl.navigateBack('/tabs/tabs/my-stylin');
        });
      }
    }).catch(e => {
      console.log("e", e);
      loader.dismiss();
    });
  }
  async saveProfile() {
    console.log(this.editProfileForm.value);
    console.log(this.emailExistence+", "+this.usernameExistence);
    this.is_submit = true;

    if(!this.editProfileForm.valid || (this.emailExistence == true /* || this.usernameExistence == true */)){
      /* this.siteProvider.showToast("Please check all input fields"); */

    } else {
      const loader = await this.loadingCtrl.create({
        message: "Updating your profile..."
      });
      loader.present();

      // if (this.platform.is('ios') || this.platform.is('android')) {
      //   console.log('Reformatting birthdate.');
      //   let birthdateValue = this.editProfileForm.controls['birthdate'].value;
      //   let newBirthdateValue = this.componentsProvider.getMomentFormat(birthdateValue, 'YYYY-MM-DD');
      //   this.editProfileForm.controls['birthdate'].setValue(newBirthdateValue);
      // }

      let formData = {
        'first_name': this.editProfileForm.controls.first_name.value,
        'last_name': this.editProfileForm.controls.last_name.value,
        /* 'email': this.editProfileForm.controls.email.value, */
        /* 'number': this.editProfileForm.controls.number.value, */
        'gender': this.editProfileForm.controls.gender.value,
        'about': this.editProfileForm.controls.about.value,
        'birthdate': this.editProfileForm.controls.birthdate.value,
        'lon': this.editProfileForm.controls.lon.value,
        'lat': this.editProfileForm.controls.lat.value,
        'location': this.editProfileForm.controls.location.value
      };
      console.log('formData', formData);
      this.userProvider.updateProfile(this.submit_profile_photo, formData).then(data => {
        console.log('editProfile',data);
        loader.dismiss();

        if(data['error'] === 0){
          this.storage.set('user', data['data']).then(() => {
            this.navCtrl.back();
            this.events.publish('refresh-main-profile-feed');
          });
        } else {
          this.componentsProvider.showToast(data['message']);
        }
      }, err => {
        loader.dismiss();
        this.componentsProvider.showToast(err);
      });
    }
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
        if (predictions != null) {
          predictions.forEach((prediction) => {
            console.log("prediction", prediction);
            me.autocompleteItems.push(prediction.description);
          });
        }
      });
    });
  }
  clearFocus() {
    this.editProfileForm.controls.location.setValue(null);
  }
  geoCode(address:String) {
    this.editProfileForm.controls.location.setValue(address);
    this.autocompleteItems = [];

    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: 'address' }, (results, status) => {
      this.editProfileForm.controls.lon.setValue(results[0].geometry.location.lng());
      this.editProfileForm.controls.lat.setValue(results[0].geometry.location.lat());
    });
  }
  // For checking character length
  characterCount(e){
    let characterLength = this.editProfileForm.controls.about.value.length;
    if(characterLength <= 150){
      console.log("count",characterLength);
      this.aboutLength = characterLength;
    }else{
      return false;
    }
  }

  async showDateInput() {
    const modal = await this.modalCtrl.create({
      component: BirthdayModalComponent,
      cssClass: 'birthdayModal',
      mode: 'ios',
      backdropDismiss: true,
      componentProps:{
        date: true,
        birthday: this.editProfileForm.value.birthdate
      }
    });
    modal.onDidDismiss().then(data =>{
      if (data) {
        console.log('Chosen birthdate: ', data["data"].birthday);
        let momentedBirthday;
        if (this.platform.is('ios')) {
          momentedBirthday =  data["data"].birthday;
        }
        else {
          momentedBirthday =  data["data"].birthday;
          // momentedBirthday = this.componentsProvider.getBirthdateMoment(data['birthday'], 'MM-DD-YYYY');
        }
       // this.editProfileForm.controls.brandIds.setValue(this.brandIds);
       
        this.editProfileForm.controls.birthdate.setValue(momentedBirthday);
      }
    });
    modal.present();
  }
  back(){
    this.events.publish('reload-masonry')
    this.navCtrl.navigateBack('/tabs/tabs/my-stylin');
  }
  getStorage(){
    this.storage.get('user').then(data =>{
      console.log("laman ng data", data);
      console.log("laman ng new brands", this.new_brands)
    }) 
  }
  async presentModal() {
    const userList = await this.modalCtrl.create({
      backdropDismiss: true,
      mode:'ios',
      component:FavoriteBrandModalComponent
    });
    await userList.onDidDismiss().then((data) => {
      console.log(data);
      let samplelabel = [];
      // this.new_brands = data;
      // console.log("data", data);
      // console.log("new brands", this.new_brands);
      this.new_brands = data['data'][0];
      console.log("data", data);

      if (data) {
      // this.brandIds = [];
        this.new_brands.forEach(item => {
          this.brandIds.push(item['id']);
        // samplelabel.push(item.brand_name);
        });
      }
      console.log("brandIds", this.brandIds);
      this.storage.get('user').then(userdata => { 
        let currentData = userdata;
        currentData['brands'] = this.new_brands;

        this.storage.set('user', currentData); 
        console.log("laman nito", currentData);
        });
          
      
        console.log("new brands", this.new_brands);
     
      console.log("Brands dismissed.");
    });
   
     userList.present();
  }
  brandChange(event: {
    component: IonicSelectableComponent,
    value: any
  }) {
    console.log('brands:', event.value.length);
    if(event.value.length !=0){
    this.editProfileForm.controls.brands_form.patchValue(event.value);

    let ids = [];
    event.value.forEach(data => {
      ids.push(data.id);
    });

    this.brandIds = ids;
    }
  }
  getMoreBrands(event: {
    component: IonicSelectableComponent,
    text: string
  }) {

   // let text = (event.text || '').trim().toLowerCase();
    if(this.page > this.totalPages){
      event.component.disableInfiniteScroll();
    }
    this.brandsProvider.getBrands(this.page, 15, this.searchKey).then(data =>{
      console.log("may laman kaba", data);
      // this.brandss = event.component.items.concat(data);
      // event.component.items = this.brandss;
    //  this.brandss = this.brandss.concat(data['datas']);
    //   this.brands = this.brandss;
    data["datas"].forEach(data => {
      this.brands.push(data);
   
     });
   
      event.component.endInfiniteScroll();
      this.page = this.page + 1;
    });
  }
  onSaveBrands(e) {
    console.log(e);
  }
 
  searchBrands(e: {
    component: IonicSelectableComponent,
    text: string
  }) {
    e.component.startSearch();
    console.log(e.text);
    this.searchKey = e.text;
    console.log(e);
    this.page = 1;

    this.brandsProvider.getBrands(this.page, 15, this.searchKey).then(data => { 
      console.log(data['data'].length);
      if(data['data'].length != 0) {
        this._zone.run(() => {
          this.totalPages = data["total_page"];
          this.totalItems = data["total_count"];
          this.brands = data["datas"];
          e.component.items = data['datas'];
          this.page = data['next_page'];
      });
      e.component.isConfirmButtonEnabled = true;
        console.log('bradssdsds', this.brands.length);
        console.log('bardsdsds',  e.component);
        // if(this.brands.length < 1){
        //   e.component.isConfirmButtonEnabled = false;
        // }
        e.component.endSearch();
      }else{
        e.component.items = []
        e.component.isConfirmButtonEnabled = false;
        e.component.endSearch();
      }
      
    }).catch(e => {
      console.log(e);
      e.component.endSearch();
    });
  }
 async openBdayModal(){
   const modal = await this.modalCtrl.create({
      component: BirthdayModalComponent,
      cssClass: 'birthdayModal',
      mode: 'ios',
      backdropDismiss: true
    });
    modal.present();
  }
  async editPhoto() {
    const actionSheet = await this.actionSheetCtrl.create({
        header: "Select Image source",
        buttons: [{
                text: 'Load from Library',
                handler: () => {
                  this.openImagePicker();
                }
            },
            {
                text: 'Use Camera',
                handler: () => {
                  this.takePicture();
                }
            },
            {
                text: 'Cancel',
                role: 'cancel'
            }
        ]
    });
    actionSheet.present();
  }
  async presentActionSheet() {
    const loader = await this.loadingCtrl.create({
      message: 'Almost there...'
    });
    loader.present();
    const actionSheet = await this.actionSheetCtrl.create({
        /*title: 'Select Image Source',*/
        buttons: [{
            text: 'Load from Library',
            handler: () => { this.openImagePicker(); }
        },
        {
            text: 'Use Camera',
            handler: () => { this.takePicture(); }
        },
        {
            text: 'Cancel',
            role: 'cancel'
        }]
    });
    actionSheet.present();
    loader.dismiss();
  }
  async openImagePicker(){
    this.imgupload.nativeElement.value = null;
    this.imgupload.nativeElement.click();
  }
  async imgChange(e: any) {
    let imgs: any = e.target.files;
    console.log(imgs)
    if (imgs.length > 0) {
      let loader: any = await this.loadingCtrl.create({
      });
      await loader.present();
      await Array.from(imgs).forEach((img: any) => {
        this._zone.run(() => {
          let reader = new FileReader();
          reader.onload = async (e: any) => {
            await this.imageCompress.compressFile(e.target.result, 1, 100, 90).then((res: any) => {
              console.log("imgChange", res);
              loader.dismiss();
              try {
                if (res.includes("data:image/jpeg;base64,")) {
                  this.presentCropperModal(this.componentsProvider.b64toBlobNew(res.replace("data:image/jpeg;base64,", ""), 'image/jpeg', 512),1,1);
                }
                if (res.includes("data:image/png;base64,")) {
                  this.presentCropperModal(this.componentsProvider.b64toBlobNew(res.replace("data:image/png;base64,", ""), 'image/jpeg', 512),1,1);
                }              
              } catch (error) {
                console.log(this.profileInfo.profile_image_url)  
              }
              //   if (res.includes("data:image/jpeg;base64,")) {
                  // this.presentCropperModal(this.componentsProvider.b64toBlobNew(res.replace("data:image/jpeg;base64,", ""), 'image/jpeg', 512),1,1);
                // }
                // if (res.includes("data:image/png;base64,")) {
                  // this.presentCropperModal(this.componentsProvider.b64toBlobNew(res.replace("data:image/png;base64,", ""), 'image/jpeg', 512),1,1);
                // }
              // }else{
            }).catch(e => { 
              loader.dismiss();
              console.error("e", e);
            });
          };
          reader.readAsDataURL(img);
        });
      });
    }
  }
  async presentCropperModal(imagePath, aspect_height?: number, aspect_width?: number) {
    console.log("presentCropperModal", imagePath);
    const modal = await this.modalCtrl.create({
      component: ImageCropperPage,
      cssClass: 'my-custom-modal-css',
      componentProps: {
        'imageBase64': imagePath,
        'type': 'avatar1',
        'aspect_height': aspect_height,
        'aspect_width': aspect_width,
      }
    });

    modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      console.log(data)
      //this.delegate.profile_photo = 'profile_photo';
      this._zone.run(() => {
        this.profileInfo.errorImage = false;
        this.profileInfo.profile_profile_pic = data.base64;
        this.profileInfo.profile_image_url = data.base64;
        this.submit_profile_photo = null;
      });
      this.save(data.fileBlob);
    }else{
      console.log("ETO ATA")
    }
  }
  save(attachment) {
    /* this.profile_image_url = null; */
    console.log("attachment", attachment);
    this._zone.run(() => {
      this.submit_profile_photo = attachment;
      /* this.profile_image_url = attachment; */
    });
  }
  errorLoad(profileInfo){
    console.log("error")
    console.log(this.imageDash.src)
    profileInfo.errorImage = true;
    this.imageDash.src = "/assets/css/imgs/empty-states/no-user-photo.png";
    profileInfo.loadedProfile = true;
  } 
  focus(){
    console.log("HI")
    // this.isPresent = false
  }

  profileLoaded(profileInfo){
    profileInfo.loadedProfile = true;
  }
  imgLoaded(profileInfo){
    profileInfo.isLoadedImage = true;
    console.error(profileInfo)
  }
}
