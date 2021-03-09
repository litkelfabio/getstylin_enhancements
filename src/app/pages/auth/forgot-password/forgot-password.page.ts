import { Component, ViewChild, OnInit } from '@angular/core';
import { NavController, LoadingController, Platform } from "@ionic/angular";
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ComponentsService } from 'src/app/services/components/components.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DatasourceService } from 'src/app/services/datasource/datasource.service';
import { IonRouterOutlet } from '@ionic/angular';
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  public forgotPasswordForm: FormGroup;
  userDoesntExist = false;
  constructor(
    private authProvider: AuthService,
    private navCtrl: NavController,
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private componentService: ComponentsService,
    private dataSource: DatasourceService,
    private routerOutlet: IonRouterOutlet) { 
      this.forgotPasswordForm = this.formBuilder.group({
        email: [
          '',
          Validators.compose([
            Validators.required,
            Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
          ])
        ],
      });
    }

  ngOnInit() {
    console.log('ionViewDidLoad ForgotPasswordPage');
    this.routerOutlet.swipeGesture = false;
    
  }
  async resetPassword() {
    if (this.forgotPasswordForm.valid) {
      const loader = await this.loadingCtrl.create({
        message: 'Sending...',
      });
      loader.present();
      let data = {
        'type': '1',
        'email': this.forgotPasswordForm.controls.email.value
      };
      let email = this.forgotPasswordForm.controls.email.value;
      this.authProvider.forgotPassword(data).then((res) => {
        loader.dismiss();
        if (res['error'] == 0) {
          this.userDoesntExist = false;
          this.dataSource.changeData({
            type: 'verification_code',
            verify_code: res,
            email: email
          });
          this.navCtrl.navigateRoot(['/verify-account']);
          
          /* let emailModal = this.modalCtrl.create(PromptModalPage,
            {
              modal_type: 'verification_code',
              verify_code: res,
              fp_data: data,
            }
          ); */
          /* emailModal.onDidDismiss((data) => {
            if(data){
              this.appCtrl.getRootNav().setRoot(
                ChangePasswordPage, {
                  type: '3',
                  token: res['token'],
                  email: this.forgotPasswordForm.controls.email.value,
                }
              );
            }
          });
          emailModal.present(); */
        } else {
          this.userDoesntExist = true;
          /* this.componentsProvider.showToast(res['message']); */
        }
      }).catch(ex => {
        console.log('Error forgot password: ', ex);
        this.componentService.showToast('Something went wrong. Please try again later.');
      });
    }
  }

}
