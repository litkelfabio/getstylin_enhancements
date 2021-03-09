import { Component, ViewChild, OnInit } from '@angular/core';
import { NavController, LoadingController, Platform } from "@ionic/angular";
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ComponentsService } from 'src/app/services/components/components.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DatasourceService } from 'src/app/services/datasource/datasource.service';
import { NgProgress,NgProgressComponent } from 'ngx-progressbar';
import { Storage } from '@ionic/storage';
import { UserService } from 'src/app/services/user/user.service';
import { IonRouterOutlet } from '@ionic/angular';
@Component({
  selector: 'app-forgot-change-password',
  templateUrl: './forgot-change-password.page.html',
  styleUrls: ['./forgot-change-password.page.scss'],
})
export class ForgotChangePasswordPage implements OnInit {
  userId;

  public registrationForm: FormGroup;
 	passwordType = ["password", "password"];
 	passwordIcon = ["eye-off", "eye-off"];
  passwordStatus = ["hide", "hide"];
  constructor(
    private routerOutlet: IonRouterOutlet,
    private authService: AuthService,
    private componentService: ComponentsService,
		private formBuilder: FormBuilder,
		private loadingCtrl:LoadingController,
    private navCtrl: NavController,
    private userService:UserService,
    private dataSource: DatasourceService) {
      this.dataSource.serviceData.subscribe(data=>{
        this.userId =data['userId'];
        console.log('user id: ',this.userId);
      });
      this.registrationForm = this.formBuilder.group({
        userId: [
          this.userId
        ],
        password: [
          '',
          Validators.compose([
            Validators.minLength(8),
            Validators.required
          ])
        ],
        confirm_password: [
          ''
        ],
      }, {
        validator: [this.authService.MatchPassword]
      });
     }

  ngOnInit() {
    console.log('ionViewDidLoad ForgotChangePasswordPage');
    this.routerOutlet.swipeGesture = false;
  }
  togglePassword(num: any) {
    if (this.passwordStatus[num] == "hide") {
      this.passwordStatus[num] = "show";
      this.passwordType[num] = "text";
      this.passwordIcon[num] = "eye";
    } else {
      this.passwordStatus[num] = "hide";
      this.passwordType[num] = "password";
      this.passwordIcon[num] = "eye-off";
    }
  }
  async saveInfo() {
    const loader = await this.loadingCtrl.create({
			message: "Updating password..."
		});
		loader.present();
    this.userService.updatePassword(this.registrationForm.value).then(result => {
      loader.dismiss();
      if (result['error'] == 0) {
        this.componentService.showToast(result['message']);
        // this.navCtrl.setRoot(LoginPage, {}, {
        //   animate: true,
        //   animation: 'ios-transition',
        //   direction: 'forward'
        // });
        this.navCtrl.navigateRoot(['/login']);
      } else {
        this.componentService.showToast('Passwords do not match.');
      }
    });
  }
  

}
