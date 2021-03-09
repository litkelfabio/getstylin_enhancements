import { Component, ViewChild, OnInit, NgZone } from '@angular/core';
import { NavController, LoadingController, Platform, AlertController } from "@ionic/angular";
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { ComponentsService } from 'src/app/services/components/components.service';
import {ModalController} from '@ionic/angular'
import {BirthdayModalComponent} from '../../../components/modals/birthday-modal/birthday-modal.component'
import {FavoriteBrandModalComponent} from '../../../components/modals/favorite-brand-modal/favorite-brand-modal.component'
import { BrandsService } from 'src/app/services/brands/brands.service';
import { UserService } from 'src/app/services/user/user.service';
import { IonicSelectableComponent } from 'ionic-selectable';
import { IonRouterOutlet } from '@ionic/angular';
declare var google: any;
@Component({
  selector: 'app-register3',
  templateUrl: './register3.page.html',
  styleUrls: ['./register3.page.scss'],
})
export class Register3Page implements OnInit {
  public registrationForm: FormGroup;
  brandIds = [];
  new_brands = [];
  brands = [];
  brand_label;
  brandOptions = [];
  @ViewChild("searchInput") searchInput: any;
  autocompleteItems = [];
  service = new google.maps.places.AutocompleteService();
  searchKey: string;
  page: number;
  totalPages: any;
  totalItems: any;
  currentDate = new Date().toISOString();

  constructor(
    
    private modalCtrl: ModalController,
		private formBuilder: FormBuilder,
		private loadingCtrl: LoadingController,
		private navCtrl: NavController,
		private storage: Storage,
    private platform : Platform,
    private componentService: ComponentsService,
    private zone: NgZone,
    private brandsService: BrandsService,
    private alertCtrl: AlertController,
    private userService: UserService,
    private routerOutlet: IonRouterOutlet

  ) { 
    this.registrationForm = this.formBuilder.group({
      birthdate: [""],
      about: [""],
      brands_form: [""],
      brands_label: [""],
      brandIds: [""],
      lon: [""],
      lat: [""],
      location: [""]
    });
  }

  ngOnInit() {
    this.routerOutlet.swipeGesture = false;
    console.log("ionViewDidLoad Register3Page");
    this.loadBrands();
  }
  loadUserInfo() {
    this.storage.get("user").then(data => {
      this.registrationForm.controls.birthdate.setValue(data.profile_birthdate);
      this.registrationForm.controls.about.setValue(data.profile_about);
      if (data.brands) {
        let brand_labels = [];
        data.brands.forEach(data => {
          brand_labels.push(data.brand_name);
          this.registrationForm.controls.brands_form.setValue(data.brands);
          this.registrationForm.controls.brands_label.setValue(
            brand_labels.join(", ")
          );
          this.brandIds.push(data.id);
        });
      }
      /* if (data.profile_gender) {
        this.registrationForm.controls.gender.setValue(data.profile_gender);
        let gender_label = this.componentsProvider.getGenderLabel(data.profile_gender);
        this.registrationForm.controls.gender_label.setValue(gender_label);
      } */
    });
  }
  async loadBrands() {
    const loader = await this.loadingCtrl.create({
      message: "Getting brands ready..."
    });
    
    loader.present();
    this.brandsService
    .getBrands()
    .then(data => {
      loader.dismiss();
      console.log('nagload si loadBrands', data)
        if (data["error"] == 0) {
          this.brands = data["data"];
          this.totalPages = data["total_page"];
          this.totalItems = data["total_count"];
          console.log('brands', this.brands);
          this.brands.forEach(data => {
            this.brandOptions.push({
              type: "checkbox",
              label: data.brand_name,
              value: data.id,
              handler: brand => {
                if (brand) {
                  /* this.brandIds = brand.value; */
                  if (this.brandIds.find(e => e === brand.value)) {
                    let index = this.brandIds.indexOf(brand.value);
                    this.brandIds.splice(index, 1);
                  } else {
                    this.brandIds.push(brand.value);
                  }
                  console.log("this.brandIds", this.brandIds);
                  let brand_labels = [];
                  this.brandIds.forEach(data => {
                    let brand = this.brandOptions.find(e => e.value === data);
                    brand_labels.push(brand.label);
                  });
                  this.registrationForm.controls.brands_label.setValue(
                    brand_labels.join(", ")
                  );
                } else {
                  this.brandIds = [];
                  this.registrationForm.controls.brands_label.setValue("");
                }
              }
            });
          });
        } else {
          this.componentService.showToast(data["message"]);
        }
      })
      .catch(e => {
        loader.dismiss();
        console.log("this.userProvider.register Error: ", e);
      });
    this.loadUserInfo();
  }
  chooseBrands() {
    if (this.brandIds) {
      this.brandOptions.forEach(data => {
        data["checked"] = false;
      });
      this.brandIds.forEach(data => {
        let brand = this.brandOptions.find(e => e.value === data);
        if (brand) {
          brand["checked"] = true;
        } else {
          brand["checked"] = false;
        }
      });
    }
      // let modal = this.modalCtrl.create(PagesBrandsModalPage,{
      //   inputs: this.brandOptions
      // });
      // modal.present();
     this.alertCtrl.create({
      cssClass: "custom-alert-option-list",
       inputs: this.brandOptions
      /* buttons: [
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
              this.registrationForm.controls.brands_label.setValue(brand_labels.join(', '));
            } else {
              this.brandIds = [];
              this.registrationForm.controls.brands_label.setValue('');
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
     this.alertCtrl.getTop();
  }
  async saveInfo() {
    const loader = await this.loadingCtrl.create({
      message: "Adding your details..."
    });
    loader.present();
    this.registrationForm.controls.brandIds.setValue(this.brandIds);
    this.userService
      .updateProfile(null, this.registrationForm.value)
      .then(data => {
        if (data["error"] == 0) {
          this.brandsService
            .saveFavoriteBrands(this.registrationForm.value)
            .then(data => {
              //this.registrationForm.controls.brandIds.setValue(this.brandIds);
              loader.dismiss();
              if (data["error"] == 0) {
                this.storage.set("user", data["data"]).then(() => {
                  /* this.navCtrl.setRoot(Register4Page); */
                  this.navCtrl.navigateRoot(['/register4']);
                });
              }
            });
        } else {
          loader.dismiss();
          this.componentService.showToast(data["message"]);
        }
      })
      .catch(e => {
        loader.dismiss();
        console.log("this.userProvider.register Error: ", e);
      });
  }
  
  async showDateInput() {
    const modal = await this.modalCtrl.create({
      cssClass: 'birthdayModal',
      mode:'ios',
      component: BirthdayModalComponent,
      backdropDismiss: true, 
      componentProps:{
      date: true,
      datevalue: this.registrationForm.value.birthdate
      }
    })
    modal.onDidDismiss().then((data)=>{
      console.log(data);
      if (data) {
            console.log(data["data"].birthday);
            if (this.platform.is('ios')) {
              this.registrationForm.controls.birthdate.setValue(data["data"].birthday);
            }
            else {
              this.registrationForm.controls.birthdate.setValue(data["data"].birthday);
            }
          }
    });
    return await modal.present();
    // await modal.dismiss((data) => {
    //   if (data) {
    //     console.log(data["birthday"]);
    //     if (this.platform.is('ios')) {
    //       this.registrationForm.controls.birthdate.setValue(data['birthday']);
    //     }
    //     else {
    //       this.registrationForm.controls.birthdate.setValue(data['birthday']);
    //     }
    //   }
    // });
    // 
    
  }

  getValue(ev: any) {
    if (ev == "") {
      this.autocompleteItems = [];
      return;
    }
    let me = this;
    this.service.getPlacePredictions(
      {
        input: ev
      },
      (predictions, status) => {
        me.autocompleteItems = [];
        me.zone.run(() => {
          if (predictions != null) {
            predictions.forEach(prediction => {
              me.autocompleteItems.push(prediction.description);
            });
            console.log("predictions", predictions);
          }
        });
      }
    );
  }
  clearFocus() {
    this.registrationForm.controls.location.setValue(null);
  }
  geoCode(address: String) {
    console.log(address);
    this.registrationForm.controls.location.setValue(address);
    this.autocompleteItems = [];

    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
      this.registrationForm.controls.lon.setValue(
        results[0].geometry.location.lng()
      );
      this.registrationForm.controls.lat.setValue(
        results[0].geometry.location.lat()
      );
    });
  }
  skipStep() {
    /* this.navCtrl.setRoot(Register4Page); */
    this.navCtrl.navigateRoot(['/register4']);
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
  searchBrands(e: {
    component: IonicSelectableComponent,
    text: string
  }) {
    e.component.startSearch();
    console.log(e.text);
    this.searchKey = e.text;
    console.log(e);
    this.page = 1;

    this.brandsService.getBrands(this.page, 15, this.searchKey).then(data => { 
      console.log(data);
      if(data) {
        this.zone.run(() => {
          this.totalPages = data["total_page"];
          this.totalItems = data["total_count"];
          this.brands = data["datas"];
          e.component.items = data['datas'];
          this.page = data['next_page'];
      });

        console.log('bradssdsds', this.brands);
        console.log('bardsdsds',  e.component.items);
        
      }
      e.component.endSearch();
    }).catch(e => {
      console.log(e);
      e.component.endSearch();
    });
  }

  onSaveBrands(e) {
    console.log(e);
  }

  getMoreBrands(event: {
    component: IonicSelectableComponent,
    text: string
  }) {

   // let text = (event.text || '').trim().toLowerCase();
    if(this.page > this.totalPages){
      event.component.disableInfiniteScroll();
    }
    this.brandsService.getBrands(this.page, 15, this.searchKey).then(data =>{
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

  brandChange(event: {
    component: IonicSelectableComponent,
    value: any
  }) {
    console.log('brands:', event.value);
    this.registrationForm.controls.brands_form.patchValue(event.value);

    let ids = [];
    event.value.forEach(data => {
      ids.push(data.id);
    });

    this.brandIds = ids;
  }
  async openBirthdayModal(){
    const modal = await this.modalCtrl.create({
      cssClass: 'birthdayModal',
      mode:'ios',
      component: BirthdayModalComponent,
      backdropDismiss: true,
    });
    await modal.present();
  }

  async openFavoriteBrandModal(){
    const modal = await this.modalCtrl.create({
      mode:'ios',
      component: FavoriteBrandModalComponent,
      backdropDismiss: true,
    });
    await modal.present();
  }

}
