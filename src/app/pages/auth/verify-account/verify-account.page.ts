import { Component, ViewChild, OnInit } from '@angular/core';
import { NavController, LoadingController, Platform } from "@ionic/angular";
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ComponentsService } from 'src/app/services/components/components.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DatasourceService } from 'src/app/services/datasource/datasource.service';
import { NgProgress,NgProgressComponent } from 'ngx-progressbar';
import { Storage } from '@ionic/storage';
import { IonRouterOutlet } from '@ionic/angular';
@Component({
  selector: 'app-verify-account',
  templateUrl: './verify-account.page.html',
  styleUrls: ['./verify-account.page.scss'],
})

export class VerifyAccountPage implements OnInit {
  @ViewChild(NgProgressComponent) progressBar: NgProgressComponent;
  public activateForm: FormGroup;
  email: any;
  type: any;
  verify_code: any;
  isLoaded = true;
  invalidCode: boolean = false;
  constructor(private dataSource: DatasourceService,
    private authService: AuthService,
    private navCtrl: NavController,
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private componentService: ComponentsService,
    private storage: Storage,
    private ngProgress: NgProgress,
    private routerOutlet: IonRouterOutlet) { 
      this.dataSource.serviceData.subscribe(data=>{
        this.type=data['type'];
        this.verify_code = data['verify_code'];
        this.email = data['email'];
        console.log(data);
      })
    this.activateForm = this.formBuilder.group({
      email: [
				this.email,
				Validators.compose([
					Validators.required,
					Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
				])
      ],
      activation_code: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(6),
        ])
      ],
      action: [
        ''
      ]
    });
  }

  ngOnInit() {
    this.routerOutlet.swipeGesture = false;
  }
  timer = 60
  enableResend = true;
  activateTimer() {
    this.timer = 60;
    console.log('Time: ', this.timer);
    let startTimer = setInterval(() => {
      this.timer--;
      this.enableResend = false;

      if (this.timer < 0) {
        this.enableResend = true;
        clearInterval(startTimer);
        this.timer = 0;
      }
    }, 1000)
  }
  async activate(action) {
    this.activateForm.controls.action.setValue(action);
    let content = "Activating...";
    if (action == 'resend') {
      content = "Resending...";
      this.isLoaded = false;
    }
    const loader = await this.loadingCtrl.create({
      message: content
    });
    loader.present();
    this.authService.auth('activation', this.activateForm.value).then(result => {
      loader.dismiss();
      console.log(result);
      if (result['error'] == 0 && action == 'activate') {
        this.storage.set("user", result['user']).then(data => {
          console.log('user', data);
          this.storage.remove("guest_token");
          this.storage.set("user_token", result['token']).then(() => {
            /* loader.dismiss(); */
            if (!data.profile_first_name || !data.profile_last_name || !data.profile_gender) {
              // this.navCtrl.setRoot(Register2Page, {}, {
              //   animate: true,
              //   animation: 'ios-transition',
              //   direction: 'forward'
              // });
               this.navCtrl.navigateRoot(['/register2']);
            } else {
              // this.navCtrl.setRoot(TabsPage, {}, {
              //   animate: true,
              //   animation: 'ios-transition',
              //   direction: 'forward'
              // });
              this.navCtrl.navigateRoot(['/tabs/tabs/dashboard']);
            }
          }).catch(e => {
            console.log('error', e);
            loader.dismiss();
            this.componentService.showToast(result['message']);
          });
        }).catch(e => {
          console.log('error', e);
          loader.dismiss();
          this.componentService.showToast(result['message']);
        });
      } else if (result['error'] == 2){
        this.invalidCode = true;
      } else {
				this.componentService.showToast(result['message']);
      }
      setTimeout(() => {
        this.isLoaded = true;
      }, 60000);
      /* if (result['error'] == 0) {
        alert.addButton({
          text: "Okay",
          handler: () => {
            if (action == 'activate') {
              this.navCtrl.popTo(LoginPage);
            }
          }
        });
        alert.present();
      } else if (result['error'] == 2) {
        alert.addButton({
          text: "Cancel",
          handler: () => {
            this.navCtrl.popTo(LoginPage);
          }
        });
        alert.addButton({
          text: "Try Again",
          handler: () => {
            this.activateForm.controls.activation_code.reset();
          }
        });
        alert.present();
      } else {
				this.componentsProvider.showToast(result['message']);
      } */
    });
  }

  async sendCode() {
    const loader = await this.loadingCtrl.create({
      message: 'Verifying Code...',
    });
    loader.present();
    let formData = {
       'type': '2',
       'code': this.activateForm.value.activation_code,
       'email': this.activateForm.value.email
     };
     this.authService.forgotPassword(formData, this.verify_code['token']).then((res) => {
      console.log(res);
      if(res['error'] === 0) {
        loader.dismiss();
        this.dataSource.changeData({
          userId: res['userId']
        });
        this.navCtrl.navigateRoot(['/forgot-change-password']);
      } else {
        this.componentService.showToast("Sorry, code doesn't match!");
        loader.dismiss();
      }
    });
}
resend(){
  this.isLoaded = false;
  this.progressBar.start();
  /* let loader = this.loadingCtrl.create({
    content: "Resending..."
  });
  loader.present(); */
  let data = {
    'type': '1',
    'email': this.email
  };
  
  this.authService.forgotPassword(data).then((res) => {
    console.log(res);
    if(res['error'] === 0) {
      /* loader.dismiss(); */
      this.componentService.showToast(res['message']);
      this.activateTimer();
      setTimeout(() => {
        this.verify_code = res['code'];
        /* this.componentsProvider.showToast(res['message']); */
        this.isLoaded = true;
        this.progressBar.complete();
      }, 60000);

    } else {
      /* loader.dismiss(); */
      this.componentService.showToast(res['message']);
      this.isLoaded = true;
      this.progressBar.complete();
    }
  });
}
  resendCode(){
    console.log("resend Code")
  }
  

}
