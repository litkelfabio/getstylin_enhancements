import { Component, ViewChild, OnInit } from '@angular/core';
import { NavController, LoadingController, Platform, AlertController } from "@ionic/angular";
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { Device } from '@ionic-native/device/ngx';
import { Facebook } from '@ionic-native/facebook/ngx';
import { IonRouterOutlet } from '@ionic/angular';
// import { GooglePlus } from '@ionic-native/google-plus';

// import { ActivatePage } from './../activate/activate';
// import { RegisterPage } from './../register/register';
// import { Register2Page } from './../register2/register2';
// import { ForgotPasswordPage } from './../forgot-password/forgot-password';

// import { TabsPage } from './../../components/tabs/tabs';

// import { SignInWithApple,AppleSignInResponse, AppleSignInErrorResponse, ASAuthorizationAppleIDRequest, SignInWithAppleOriginal } from '@ionic-native/sign-in-with-apple';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { ApiService } from 'src/app/services/api/api.service';
import { EventsService } from 'src/app/services/events.service';
import { ComponentsService } from 'src/app/services/components/components.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router, NavigationExtras} from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { DatasourceService } from 'src/app/services/datasource/datasource.service';


@Component({
  selector: 'app-register2',
  templateUrl: './register2.page.html',
  styleUrls: ['./register2.page.scss'],
})
export class Register2Page implements OnInit {
  getData : any ;
  getDataSocial: any;
  public registrationForm: FormGroup;
  public genderId = '';
  isSocial : any;
  usernameExists = false;
  userInfo = [];
  constructor(
    private routerOutlet: IonRouterOutlet,
    private apiService: ApiService,
    private eventService:EventsService,
    private facebook: Facebook,
		private formBuilder: FormBuilder,
    // private googlePlus: GooglePlus,
    private device: Device,
		private loadingCtrl: LoadingController,
		private navCtrl: NavController,
		private storage: Storage,
		private keyboard: Keyboard,
    private platform : Platform,
    private componentService: ComponentsService,
    private authService : AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private datasource : DatasourceService,
    private alertCtrl : AlertController,
  ) {
    this.datasource.serviceData.subscribe(data=>{
      console.log('dataaaa:', data);
      this.isSocial = data['isSocial'];
      if(this.isSocial == false){
        this.getData = data['registration'];
      }else if (this.isSocial == true){
        this.getDataSocial = data['social_details'] ;
      }
    });
    this.registrationForm = this.formBuilder.group({
			username: [
				'',
				Validators.compose([
          Validators.required,
          Validators.maxLength(30),
          Validators.pattern('^[a-zA-Z0-9.]+$')
				])
			], /*Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')*/
			first_name: [
				'',
				Validators.compose([
          Validators.required,
          Validators.pattern('[a-zA-Z ]*'),
          Validators.maxLength(30)
				])
      ],
      last_name: [
				'',
				Validators.compose([
          Validators.required,
          Validators.pattern('[a-zA-Z ]*'),
          Validators.maxLength(30)
				])
      ],
      gender_label: [
				'',
				Validators.compose([
					Validators.required
				])
      ],
      gender: [
				'',
				Validators.compose([
					Validators.required
				])
      ],
      email: [
        this.getData ? this.getData.email : null
      ],
      password: [
        this.getData ? this.getData.password : null
      ],
      confirm_password: [
        this.getData ? this.getData.confirm_password : null
      ],
      referral_code: [
        this.getData ? this.getData.referral_code : null
      ]
    });
   }

  ngOnInit() {
    this.routerOutlet.swipeGesture = false;
    console.log("Register 1 info: ",this.getData);
    console.log("Register 1 with social info: ", this.getDataSocial);
    console.log('ngOnInit Register2Page');
    this.loadUserInfo();
  }
  loadUserInfo() {
    this.storage.get('user').then(data => {
      if (data) {
        this.userInfo = data;
        this.registrationForm.controls.username.setValue(data.username);
        this.registrationForm.controls.first_name.setValue(data.profile_first_name);
        this.registrationForm.controls.last_name.setValue(data.profile_last_name);
        if (data.profile_gender) {
          this.registrationForm.controls.gender.setValue(data.profile_gender);
          let gender_label = this.componentService.getGenderLabel(data.profile_gender);
          this.registrationForm.controls.gender_label.setValue(gender_label);
        }
      }
    });
    if (this.getDataSocial) {
      this.registrationForm.controls.first_name.setValue(this.getDataSocial['first_name']);
      this.registrationForm.controls.last_name.setValue(this.getDataSocial['last_name']);
    }
  }
  validateInfo(username: String) {
    console.log(username);
    this.authService.auth('validateusername', {username: username}).then(data => {
      console.log("validateusername", data);
			if (data['error'] == 0) {
				this.usernameExists = false;
			} else {
				this.usernameExists = true;
			}
		});
  }
  async chooseGender(selected?) {
    console.log(selected);
    const alert = await this.alertCtrl.create({
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
              let gender_label = this.componentService.getGenderLabel(gender.value);
              this.registrationForm.controls.gender_label.setValue(gender_label);
              this.registrationForm.controls.gender.setValue(gender.value);
            } else {
              this.genderId = '';
              this.registrationForm.controls.gender_label.setValue('');
              this.registrationForm.controls.gender.setValue('');
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
              let gender_label = this.componentService.getGenderLabel(gender.value);
              this.registrationForm.controls.gender_label.setValue(gender_label);
              this.registrationForm.controls.gender.setValue(gender.value);
            } else {
              this.genderId = '';
              this.registrationForm.controls.gender_label.setValue('');
              this.registrationForm.controls.gender.setValue('');
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
              let gender_label = this.componentService.getGenderLabel(gender.value);
              this.registrationForm.controls.gender_label.setValue(gender_label);
              this.registrationForm.controls.gender.setValue(gender.value);
            } else {
              this.genderId = '';
              this.registrationForm.controls.gender_label.setValue('');
              this.registrationForm.controls.gender.setValue('');
            }
            alert.dismiss();
          }
        }
      ],
      /* buttons: [
        {
          text: 'Ok',
          handler: data => {
            if (data) {
              this.genderId = data;
              let gender_label = this.componentsProvider.getGenderLabel(data);
              this.registrationForm.controls.gender_label.setValue(gender_label);
              this.registrationForm.controls.gender.setValue(data);
            } else {
              this.genderId = '';
              this.registrationForm.controls.gender_label.setValue('');
              this.registrationForm.controls.gender.setValue('');
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
      ] */
    });
    alert.present();
  }

  pushToAgreementsPage() {
    // let navigationExtras: NavigationExtras = {
    //   state: {
    //     formData: this.registrationForm.value, 
    //     social: this.getDataSocial['social'] ? this.getDataSocial['social'] : false,
    //   }
    // };
    this.datasource.changeData({ formData: this.registrationForm.value, social: this.isSocial });
    this.navCtrl.navigateForward('/register-agreements');
  }


}
