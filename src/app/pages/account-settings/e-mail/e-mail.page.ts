import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ComponentsService } from 'src/app/services/components/components.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-e-mail',
  templateUrl: './e-mail.page.html',
  styleUrls: ['./e-mail.page.scss'],
})
export class EMailPage implements OnInit {
  save: any;
  public changeEmailForm: FormGroup;
  profileInfo: any;
  emailError: any;
  emailExistence: boolean;
  isSending: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private storage: Storage,
    private authProvider: AuthService,
    private userProvider: UserService,
    private componentsProvider: ComponentsService,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController
  ) { 
    this.changeEmailForm = this.formBuilder.group({
      email: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern(/(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i),
          Validators.maxLength(60)
        ])
      ]
    });

    this.storage.get('user').then(data => {
      this.profileInfo = data;
      console.log("edit profile", this.profileInfo);
      if (this.profileInfo) {
        this.changeEmailForm.controls['email'].setValue(this.profileInfo.email);
      }
      console.log("profileInfo", this.profileInfo);
    });
  }

  
  validateInfos(email: String) {
    console.log('Is email valid? ', this.changeEmailForm.valid);

    setTimeout(() => {
      if (this.changeEmailForm.controls['email'].valid) {
        this.emailError = null; // Nullify any set error messages in email status.
  			this.authProvider.auth("validateemail", { email: email }, true).then(data => {
  				console.log(data);
  				if (data["error"] == 0) {
  					this.emailExistence = false;
  				} else {
  					this.emailExistence = true;
  				}
  			});
  		}
      else {
        if (this.changeEmailForm.controls['email'].hasError('required')) {
          this.emailError = 'An email address is required.';
        }
        else if (this.changeEmailForm.controls['email'].hasError('pattern')) {
          this.emailError = 'Enter a valid email address.';
        }
        else if (this.changeEmailForm.controls['email'].hasError('maxlength')) {
          this.emailError = 'Max 60 characters for email address.'
        }
      }
    }, 100);
  }

  async updateEmail(){
    let form = this.changeEmailForm;
    if (form.valid) {
      console.log('Form is valid.');
      let data = form.value;


      this.isSending = true;
      // this.ngProgress.start();
      let loader = await this.loadingCtrl.create({
        message: 'Updating email...'
      });
      loader.present();
      await this.userProvider.updateProfile(null, data).then(response => {
        /*  */
        if (response['error'] == 0) {
          console.log(response);
          this.componentsProvider.showToast('Updated email address.');
          this.storage.get('user').then(data => {
            let userData = data;
            userData.email = form.controls['email'].value;
            this.navCtrl.back();
            this.storage.set('user', userData);
            loader.dismiss();
          });
        }
        else {
          this.componentsProvider.showToast('Cannot update email at this time.');
          loader.dismiss();
        }
      }).catch(ex => {
        console.log('Error updating password: ', ex);
        this.componentsProvider.showToast('Cannot update email at this time.');
      }).then(() => {
        this.isSending = false;
        // this.ngProgress.done();
      });
    }
    else {
      this.componentsProvider.showToast('Please check if your form for invalid values.');
    }
  }


  ngOnInit() {
    // this.routerOutlet.swipeGesture = false;
  }
  back(){
    this.navCtrl.back();
  }

}
