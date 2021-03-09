import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ModalController, AlertController, LoadingController, Platform } from "@ionic/angular";
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
import { Router,NavigationExtras } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { DatasourceService } from 'src/app/services/datasource/datasource.service';
import { UserService } from 'src/app/services/user/user.service';
import { TutorialModalComponent } from 'src/app/components/modals/tutorial-modal/tutorial-modal.component';


@Component({
  selector: 'app-register-agreements',
  templateUrl: './register-agreements.page.html',
  styleUrls: ['./register-agreements.page.scss'],
})
export class RegisterAgreementsPage implements OnInit {
  formData: any;
  social:any;
  declineAlertOptions = {
    title: 'Decline Agreements',
    mode: 'md',
    message: 'Declining GET STYLIN\'s terms and policies will discard your registration.',
    buttons: [
      {
        text: 'No',
        role: 'cancel',
        handler: () => {}
      },
      {
        text: 'Yes',
        handler: () => {
          this.navCtrl.navigateBack('/register2')
        }
      }
    ]
  }

  constructor(private navCtrl: NavController,
    private alertCtrl: AlertController,
    private apiService: ApiService,
    private eventService:EventsService,
    private facebook: Facebook,
    private formBuilder: FormBuilder,
    private routerOutlet: IonRouterOutlet,
    // private googlePlus: GooglePlus,
    private device: Device,
		private loadingCtrl: LoadingController,
		private storage: Storage,
		private keyboard: Keyboard,
    private platform : Platform,
    private componentService: ComponentsService,
    private authService : AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private datasource: DatasourceService,
    private modalCtrl: ModalController
    ) { 
      this.route.queryParams.subscribe(params => {
          console.log("Query Params: ",params);
          if (this.router.getCurrentNavigation().extras.state) {
            this.formData = this.router.getCurrentNavigation().extras.state.formData;
            this.social = this.router.getCurrentNavigation().extras.state.social;
          }
      });
    }

  ngOnInit() {  
    this.routerOutlet.swipeGesture = false;
    this.datasource.serviceData.subscribe(data=>{
      console.log('data: ',data);
      this.formData = data['formData'];
      this.social = data['social'];
    });
    console.log("formData: ",this.formData);
      console.log("social: ",this.social);
    console.log('ionViewDidLoad RegisterAgreementsPage');
  }

  presentDecline() {
    this.alertCtrl.create({
    header: 'Decline Agreements',
    mode: 'md',
    cssClass: 'declineAgreements',
    message: 'Declining GET STYLIN\'s terms and policies will discard your registration.',
      buttons: [
        {
          text:'cancel',
          role: 'cancel',
          handler: ()=>{}
        },
        {
          text: 'Yes',
          handler: ()=>{
            this.navCtrl.navigateBack('/login')
          }
        }
      ]
    }).then(alert => alert.present());
  }
  presentAccept() {
    this.alertCtrl.create({
      header: 'Accept Agreements',
      mode: 'md',
      cssClass: 'acceptAgreements',
      message: 'By proceeding, you ensure that you have read and understood our Terms and Conditions and Privacy Policy.',
      buttons: [
        {
          text:'Not yet',
          role: 'cancel',
          handler: ()=>{}
        },
        {
          text: 'Yes',
          handler: ()=>{
            this.register();
          }
        }
      ]
    }).then(alert => alert.present());
  }
  presentWelcome() {
    this.alertCtrl.create({
      header: 'Welcome',
      mode: "md",
      cssClass: "welcomealert",
      message: 'Do you wish to continue filling up your personal information like favorite brands, clothing sizes, etc? You can always do this later.',
      backdropDismiss:false,
      buttons: [
        {
          text:'Later',
          role: 'cancel',
          handler: ()=>{
            let navigationExtras: NavigationExtras ={
              state:{
                context:'from register',
                fromRegister:'true'
              }
            }
            this.navCtrl.navigateRoot(['/tabs/tabs/dashboard'], navigationExtras);
          }
        },
        {
          text: 'Yes',
          handler: ()=>{
            this.navCtrl.navigateRoot('/register3')
          }
        }
      ]
    }).then(alert => alert.present());
  }
  
  decline(){
    this.presentDecline();
  }
  accept(){
    this.presentAccept();
  }

  async register() {
    
    const loader = await this.loadingCtrl.create({
      message: "Creating your profile..."
    });
    loader.present();
    if (this.social) {
      this.userService.updateProfile(null, this.formData).then(result => {
        if (result['error'] == 0) {
          loader.dismiss();
          this.storage.set("user", result['data']).then(() => {
            this.storage.remove("guest_token");
            /* this.navCtrl.setRoot(Register3Page); */
            /* this.navCtrl.push(Register3Page); */
            this.alertCtrl.create({
              header: result['message'],
              mode: "md",
              message: 'Do you wish to continue filling up your personal information like favorite brands, clothing sizes, etc? You can always do this later.',
              backdropDismiss: false,
              buttons: [
                {
                  text: 'LATER',
                  role: 'cancel',
                  handler: () => {
                    // this.navCtrl.navigateRoot(['/tabs/tabs/dashboard'], {
                    //   fromRegister: true
                    // }, {
                    //   animate: true,
                    //   animation: 'ios-transition',
                    //   direction: 'forward'
                    // });
                    let navigationExtras: NavigationExtras ={
                      state:{
                        context:'from register',
                        fromRegister:'true'
                      }
                    }
                    this.navCtrl.navigateRoot(['/tabs/tabs/dashboard'], navigationExtras);
                  }
                },
                {
                  text: 'YES',
                  handler: () => {
                    // this.navCtrl.setRoot(Register3Page, {}, {
                    //   animate: true,
                    //   animation: 'ios-transition',
                    //   direction: 'forward'
                    // });
                    this.navCtrl.navigateRoot(['/register3']);
                  }
                }
              ]
            }).then(alert=>{alert.present();});
            
          });
        } else {
          loader.dismiss();
          this.componentService.showToast(result['message']);
        }
      });
    }
    else {
      this.authService.auth('register', this.formData).then(res => {
        console.log("authProvider", res);
        if (res['error'] == 0) {
          loader.dismiss();
          this.storage.set("user", res['user']).then(data => {
            this.storage.remove("guest_token");
            this.storage.set("user_token", res['token']).then(() => {
              this.alertCtrl.create({
                header: 'Welcome!',
                cssClass: 'welcomealert',
                mode: "md",
                message: 'We\'re excited to have you at Get Stylin\'! Do you want to complete your profile now, or go straight to the style?',
                backdropDismiss: false,
                buttons: [
                  {
                    text: 'LATER',
                    role: 'cancel',
                    handler: () => {
                      // this.navCtrl.setRoot(TabsPage, {
                      //   fromRegister: true
                      // }, {
                      //   animate: true,
                      //   animation: 'ios-transition',
                      //   direction: 'forward'
                      // });
                      
                      let navigationExtras : NavigationExtras={
                        state:{
                          context: 'from register'
                        }
                      }
                      this.navCtrl.navigateRoot(['/tabs/tabs/dashboard'], navigationExtras);
                    }
                  },
                  {
                    text: 'YES',
                    handler: () => {
                      // this.navCtrl.setRoot(Register3Page, {}, {
                      //   animate: true,
                      //   animation: 'ios-transition',
                      //   direction: 'forward'
                      // });
                      this.navCtrl.navigateRoot(['/register3']);
                    }
                  }
                ]
              }).then(alert=>{
                alert.present();
              });
            });
          });
        } else {
          loader.dismiss();
          this.componentService.showToast(res['message']);
        }
      }).catch(e => {
        loader.dismiss();
        console.log("Error: ", e);
      });
    }
  }
  presentAcceptWelcome(){
    this.alertCtrl.create({
      header: 'Welcome!',
      mode: "md",
      message: 'We\'re excited to have you at Get Stylin\'! Do you want to complete your profile now, or go straight to the style?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'LATER',
          role: 'cancel',
          handler: () => {
            // this.navCtrl.setRoot(TabsPage, {
            //   fromRegister: true
            // }, {
            //   animate: true,
            //   animation: 'ios-transition',
            //   direction: 'forward'
            // });
            let navigationExtras: NavigationExtras ={
              state:{
                context:'from register',
                fromRegister:'true'
              }
            }
            this.navCtrl.navigateRoot(['/tabs/tabs/dashboard'], navigationExtras);
          }
        },
        {
          text: 'YES',
          handler: () => {
            // this.navCtrl.setRoot(Register3Page, {}, {
            //   animate: true,
            //   animation: 'ios-transition',
            //   direction: 'forward'
            // });
            this.navCtrl.navigateRoot(['/register3']);
          }
        }
      ]
    }).then(alert=>{
      alert.present()
    });
    // this.alertCtrl.getTop();
  }
  pushTermsModal(){
    this.navCtrl.navigateForward('/terms-and-conditions');
    // let navigationExtras: NavigationExtras = {
    //   state: {
    //     context: "terms"
    //   }
    // };
    // this.navCtrl.navigateForward(['/other-inner-settings/terms'],navigationExtras);
  }
  pushPrivacyModal(){
    this.navCtrl.navigateForward('/privacy-policy');
    // let navigationExtras: NavigationExtras = {
    //   state: {
    //     context: "privacy"
    //   }
    // };
    // this.navCtrl.navigateForward(['/other-inner-settings/privacy'],navigationExtras);
  }
  back(){
    this.navCtrl.back();
  }
}
