import { Component, ViewChild, OnInit, NgZone } from '@angular/core';
import { NavController, LoadingController, Platform, AlertController, ModalController } from "@ionic/angular";
import { FormGroup, Validators, FormBuilder,FormControl } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { ComponentsService } from 'src/app/services/components/components.service';
import { IonRouterOutlet } from '@ionic/angular';
import { ClothingService } from 'src/app/services/clothing/clothing.service';
import { SizesService } from 'src/app/services/sizes/sizes.service';
import { TutorialModalComponent } from 'src/app/components/modals/tutorial-modal/tutorial-modal.component';
import { NavigationExtras } from '@angular/router';
@Component({
  selector: 'app-register4',
  templateUrl: './register4.page.html',
  styleUrls: ['./register4.page.scss'],
})
export class Register4Page implements OnInit {
  public registrationForm: FormGroup;
  clothings = [];
  chosenClothingSize = [];
  constructor(
    private routerOutlet: IonRouterOutlet,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private componentService: ComponentsService,
    private storage: Storage,
    private formBuilder: FormBuilder,
    private alertCtrl: AlertController,
    private clothingService: ClothingService,
    private sizesService: SizesService,
    private modalCtrl: ModalController

  ) {  
    this.registrationForm = this.formBuilder.group({});
  }

  ngOnInit() {
    this.routerOutlet.swipeGesture = false;
    console.log('ionViewDidLoad Register4Page');
    this.storage.get('user').then(data => {
      console.log('user',data);
      this.loadClothing(data.profile_gender);
    });
  }
  goToDashboard(){
    this.navCtrl.navigateRoot('/tabs/tabs/dashboard')
  }
  loadUserInfo() {
    /* this.storage.get('user').then(data => {
      if (data.clothing) {
        data.clothing.forEach((clothingData, i) => {
          this.chosenClothingSize[i] = {
            clothingId: clothingData.id,
            sizeId: clothingData.size.id
          };
          this.registrationForm.controls['clothingField_' + i].setValue(clothingData.size.size);
        });
      }
    }); */
    this.storage.get('user').then(data => {
      if (data.clothing.length > 0) {
        this.clothings.forEach((clothingData, i) => {
          this.chosenClothingSize[i] = {
            clothingId: data.clothing[i] ? data.clothing[i].id : null,
            sizeId: data.clothing[i] ? data.clothing[i].size.id : null
          };
          this.registrationForm.controls['clothingField_' + i].setValue(data.clothing[i] ? data.clothing[i].size.size : null);
        });
        /* data.clothing.forEach((clothingData, i) => {
          this.chosenClothingSize[i] = {
            clothingId: clothingData.id,
            sizeId: clothingData.size.id
          };
          this.editProfileForm.controls['clothingField_' + i].setValue(clothingData.size.size);
        }); */
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
  async loadClothing(genderId) {
    const loader = await this.loadingCtrl.create({
			message: "Getting clothings ready..."
    });
    loader.present();
    this.clothingService.getClothing(genderId).then(result => {
      loader.dismiss();
      if (result['error'] == 0) {
        console.log('loadClothing', result['data']);
        result['data'].forEach((data, i) => {
          this.registrationForm.addControl('clothingField_' + i, new FormControl(''));
        });
        this.clothings = result['data'];
      } else {
        this.componentService.showToast(result['message']);
      }
      this.loadUserInfo();
    }).catch(e => {
      loader.dismiss();
			console.log("this.userProvider.register Error: ", e);
    });
  }
  async chooseSize(clothing, i) {
    let options = [];
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
            this.registrationForm.controls['clothingField_' + i].setValue(sizeLabel);
          } else {
            this.chosenClothingSize.splice(i);
            this.registrationForm.controls['clothingField_' + i].setValue('');
          }
          alert.dismiss();
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
              this.registrationForm.controls['clothingField_' + i].setValue(sizeLabel);
            } else {
              this.chosenClothingSize.splice(i);
              this.registrationForm.controls['clothingField_' + i].setValue('');
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
    console.log(clothing);
  }
  async saveInfo() {
    // let modal = await this.modalCtrl.create({
    //   cssClass:'tutorialModal',
    //   component: TutorialModalComponent
    // });
    // modal.present();
    const loader = await this.loadingCtrl.create({
			message: "Adding your details..."
		});
		loader.present();
    this.sizesService.saveUserSizes(this.chosenClothingSize).then(data => {
      if (data['error'] == 0) {
        loader.dismiss();
        this.storage.set('user', data['data']).then(() => {
          // this.navCtrl.setRoot(TabsPage, {
          //   fromRegister: true
          // }, {
          //   animate: true,
          //   animation: 'ios-transition',
          //   direction: 'forward'
          // });
          // modal.present();
          let navigationExtras: NavigationExtras ={
            state:{
              context:'from register',
              fromRegister:'true'
            }
          }
          this.navCtrl.navigateRoot(['/tabs/tabs/dashboard'], navigationExtras);
        });
      } else {
        loader.dismiss();
        this.componentService.showToast(data['message']);
      }
    }).catch(e => {
      loader.dismiss();
			console.log("this.userProvider.register Error: ", e);
		});
  }
  
  async skipStep() {
    // this.navCtrl.setRoot(TabsPage, {
    //   fromRegister: true
    // }, {
    //   animate: true,
    //   animation: 'ios-transition',
    //   direction: 'forward'
    // });
    let navigationExtras: NavigationExtras ={
      state:{
        context:'from register'
      }
    }
    this.navCtrl.navigateRoot(['/tabs/tabs/dashboard'], navigationExtras);
    
  }
}
