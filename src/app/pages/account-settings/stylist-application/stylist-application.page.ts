import { Component, OnInit,NgZone  } from '@angular/core';
import { Platform, NavController,  LoadingController, AlertController, ModalController} from '@ionic/angular';

import {BirthdayModal2Component} from '../../../components/modals/birthday-modal2/birthday-modal2.component'
import {  Router,NavigationExtras,ActivatedRoute } from '@angular/router'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { ComponentsService } from 'src/app/services/components/components.service';
import { UserService } from 'src/app/services/user/user.service';
import { IonRouterOutlet } from '@ionic/angular';
import { BirthdayModalComponent } from 'src/app/components/modals/birthday-modal/birthday-modal.component';
declare var google: any;
@Component({
  selector: 'app-stylist-application',
  templateUrl: './stylist-application.page.html',
  styleUrls: ['./stylist-application.page.scss'],
})
export class StylistApplicationPage implements OnInit {

  emailExistence:any;
  public stylistApplicationFormStep1: FormGroup;
  autocompleteItems = [];
  // For form uses
  profileInfo: any;
  currentUserId: any;   // container for the current user's ID
  selectedGender: any;  // assign a gender when chosen
  service = new google.maps.places.AutocompleteService();
  constructor(
    private router: Router,
    public navCtrl: NavController,
    public componentsProvider: ComponentsService,
    public userProvider: UserService,
    private loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,
    public storage: Storage,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private zone: NgZone,
    private platform: Platform,
    private routerOutlet: IonRouterOutlet
  ) { 
    this.stylistApplicationFormStep1 = this.formBuilder.group({
      firstName: ['', Validators.compose([Validators.required,
        Validators.pattern('[a-zA-Z ]*'),
        Validators.maxLength(30) ])],
      lastName: ['', Validators.compose([Validators.required,  Validators.pattern('[a-zA-Z ]*'),
      Validators.maxLength(30)])],
      gender: ['', Validators.compose([Validators.required])],
      email: ['', Validators.compose([Validators.required,  Validators.pattern(/(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i),
      Validators.maxLength(60)])],
      long: [],
      lat: [],
      location: ['', Validators.compose([Validators.required])],
      phoneNumber: ['', Validators.compose([Validators.pattern('[\+]?[0-9]*')])],
      instagramUsername: ['', Validators.compose([Validators.pattern('(?:@)([A-Za-z0-9_](?:(?:[A-Za-z0-9_]|(?:\.(?!\.))){0,28}(?:[A-Za-z0-9_]))?)'), Validators.required, Validators.maxLength(30)])],
      birthday: ['', Validators.compose([Validators.required])],
    });
    this.storage.get('user').then(data => {
      this.profileInfo = data;
      this.prefillForm();
    });
  }

  ngOnInit() {
    this.routerOutlet.swipeGesture = false;
  }

  prefillForm() {
    let profileData = this.profileInfo;
    let formControl = this.stylistApplicationFormStep1.controls;
    formControl['firstName'].setValue(profileData['profile_first_name']);
    formControl['lastName'].setValue(profileData['profile_last_name']);
    formControl['email'].setValue(profileData['email']);

    if (profileData['profile_birthdate'] != '0000-00-00') {
      formControl['birthday'].setValue(profileData['profile_birthdate']);
    }

    if (profileData['profile_location'] && profileData['profile_location'] != 'null') {
      formControl['location'].setValue(profileData['profile_location']);
    }
  }

  async presentGenderPromptAlert(selected?) {
    if (selected) {
      console.log('Selected gender: ', selected);
    }
    const genderPrompt = await this.alertCtrl.create({
      cssClass: 'custom-alert-option-list',
      inputs: [
        {
          type: 'radio',
          label: 'Male',
          value: '1',
          checked: selected == 1 ? true : false,
          handler: gender => {
            if (gender) {
              console.log('This data: ', gender);
              this.selectedGender = gender.value;
              this.stylistApplicationFormStep1.controls.gender.setValue('Male');
            } else {
              this.selectedGender = null;
            }
            genderPrompt.dismiss();
          }
        },
        {
          type: 'radio',
          label: 'Female',
          value: '2',
          checked: selected == 2 ? true : false,
          handler: gender => {
            if (gender) {
              console.log('This data: ', gender);
              this.selectedGender = gender.value;
              this.stylistApplicationFormStep1.controls.gender.setValue('Female');
            } else {
              this.selectedGender = null;
            }
            genderPrompt.dismiss();
          }
        },
        {
          type: 'radio',
          label: 'Other',
          value: '3',
          checked: selected == 3 ? true : false,
          handler: gender => {
            if (gender) {
              console.log('This data: ', gender);
              this.selectedGender = gender.value;
              this.stylistApplicationFormStep1.controls.gender.setValue('Other');
            } else {
              this.selectedGender = null;
            }
            genderPrompt.dismiss();
          }
        }
      ]
    });
    genderPrompt.present();
  }


  goToStep2() {
    // Before handing over controls to the second page, validate the form group in
    // this page first. The other pages will also contain their own form groups.
    if (this.stylistApplicationFormStep1.valid) {
      console.log('Form is valid.');
      console.log(this.stylistApplicationFormStep1.value, this.selectedGender);

      // Pass the step 1 form data along with the current user's ID to the second form.
      let formData = this.stylistApplicationFormStep1.value;
      this.storage.get('user').then(data => {
        formData['userId'] = data.id;
      });
      let navigateExtras: NavigationExtras = {
        state:{step1Data: formData}
      }
      console.log("formData",formData);
      this.navCtrl.navigateForward(['/stylist-application-step2'],navigateExtras );
    }
    else {
      console.log('Form is invalid.');
      console.log(this.stylistApplicationFormStep1.value);
      this.componentsProvider.showToast('Please check your input for invalid values.');
    }
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
    this.stylistApplicationFormStep1.controls.location.setValue(null);
  }
  geoCode(address: String) {
    console.log(address);
    this.stylistApplicationFormStep1.controls.location.setValue(address);
    this.autocompleteItems = [];

    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
      this.stylistApplicationFormStep1.controls.long.setValue(
        results[0].geometry.location.lng()
      );
      this.stylistApplicationFormStep1.controls.lat.setValue(
        results[0].geometry.location.lat()
      );
    });
  }
  async openBirthdayModal(){
    const modal = await this.modalCtrl.create({
      cssClass: 'birthdayModal',
      mode:'ios',
      component: BirthdayModalComponent,
      backdropDismiss: true,
      componentProps: {date: true,
        datevalue: this.stylistApplicationFormStep1.value.birthdate}
    });
    
    await modal.present();
    await modal.onDidDismiss().then((data: any) => {
      console.log(data)
      if (data) {
        console.log(data["data"].birthday);
        if (this.platform.is('ios')) {
          // let momented = this.componentsProvider.getMomentFormat(data['birthday'], 'YYYY-MM-DD');
          this.stylistApplicationFormStep1.controls.birthday.setValue(data['data'].birthday);
        }
        else {
          this.stylistApplicationFormStep1.controls.birthday.setValue(data['data'].birthday);
          // this.stylistApplicationFormStep1.controls.birthday.setValue(this.componentsProvider.getMomentFormat(data["birthday"], 'MMMM DD, YYYY'));
        }
      }
    });
  }
  nextPage(){
    this.router.navigateByUrl('/stylist-application-step2')
  }

}
