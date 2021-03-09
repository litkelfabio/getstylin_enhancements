import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ComponentsService } from 'src/app/services/components/components.service';
import { UserService } from 'src/app/services/user/user.service';
import { Storage } from '@ionic/storage';
import { NgProgressComponent } from 'ngx-progressbar';

@Component({
  selector: 'app-account-settings-inside',
  templateUrl: './account-settings-inside.page.html',
  styleUrls: ['./account-settings-inside.page.scss'],
})
export class AccountSettingsInsidePage implements OnInit {
  @ViewChild(NgProgressComponent) ngProgress: NgProgressComponent;

  type: any;
  pageContext: any;
  pageTitle: any;
  profileInfo: any;
  prevUsername: any;

  public changeUsernameForm: FormGroup;
  public changePasswordForm: FormGroup;
  public changeEmailForm: FormGroup;
  hasSubmissionErrors: any;
  isSameAsPrevious: boolean;
  usernameExists: boolean;
  emailError: any;
  emailExistence: boolean;
  showMaxLength: boolean = true;
  submissionErrorMessage: string;
  isSending: boolean;

  passwordType = ["password", "password", "password"];
  passwordIcon = ["eye-off", "eye-off", "eye-off"];
 passwordStatus = ["hide", "hide", "hide"];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private authProvider: AuthService,
    private storage: Storage,
    private componentsProvider: ComponentsService,
    private userProvider: UserService,
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController
  ) {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.pageContext = this.router.getCurrentNavigation().extras.state.context;

        if (this.pageContext == "username") {
          this.pageTitle = "Username";
          this.changeUsernameForm = this.formBuilder.group({
            username: ['', Validators.compose([Validators.required,
              Validators.maxLength(30),
              Validators.pattern('^[a-zA-Z0-9.]+$')])]
          });
        }
        else if (this.pageContext == "emailaddress") {
          this.pageTitle = "E-mail";
    
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
        }
        else if (this.pageContext == "password") {
          this.pageTitle = "Password";
    
          this.changePasswordForm = this.formBuilder.group({
            current_password: ['', Validators.compose([Validators.required])],
            password: ['', Validators.compose([Validators.required, Validators.minLength(8)])],
            confirm_password: [
              '',
              Validators.compose([Validators.required, Validators.minLength(8)])
            ],
          }, {
            validator: [this.authProvider.MatchPassword]
          });
        }
      }
    });

    this.storage.get('user').then(data => {
      this.profileInfo = data;
      console.log("edit profile", this.profileInfo);
      if (this.profileInfo) {
        this.changeUsernameForm = this.formBuilder.group({
          username: [this.profileInfo.username, Validators.compose([Validators.required,
            Validators.maxLength(30),  Validators.pattern('^[a-zA-Z0-9.]+$')])]
        });
        this.prevUsername = this.profileInfo.username;

        if (this.pageContext == 'emailaddress') {
          this.changeEmailForm.controls['email'].setValue(this.profileInfo.email);
        }
      }
      console.log("profileInfo", this.profileInfo);
    });
   }
   
   validateInfo(username: String) {
    if (this.hasSubmissionErrors) {
      this.hasSubmissionErrors = !this.hasSubmissionErrors;
    }

    if (username != this.profileInfo.username) {
      this.isSameAsPrevious = false;
      this.authProvider.auth('validateusername', {username: username}, true).then(data => {
        console.log("validateusername", data);
        if (data['error'] == 0) {
          this.usernameExists = false;
        } else {
          this.usernameExists = true;
        }
      });
    }
    else {
      console.log('This nickname is the same as yours last time.');
      this.isSameAsPrevious = true;
    }
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

  fireAction(context) {
    console.log(context);
    switch (context) {
      case 'username':
        this.updateMyUsername();
        break;

      case 'emailaddress':
        this.updateEmail();
        break;

      case 'password':
        this.updatePassword();
        break;

      default:
        console.log('No context provided.');
    }
  }

  async updateMyUsername() {
    if (this.hasSubmissionErrors) {
      this.hasSubmissionErrors = !this.hasSubmissionErrors;
    }

    let form = this.changeUsernameForm;
    if (form.valid && form.controls['username'].value != this.prevUsername) {
      let data = form.value;

      this.isSending = true;
      this.ngProgress.start();
      await this.userProvider.updateUsername('updateprofile', data, true).then(response => {
        if (response['error'] == 0) {
          this.componentsProvider.showToast('Updated username.');
          this.storage.get('user').then(data => {
            let userData = data;
            userData.username = form.controls['username'].value;

            this.storage.set('user', userData);
          });
        }
        else {
          console.log(response);
          this.componentsProvider.showToast('Cannot update username at this time. Please try again later.');
        }
      }).catch(ex => {
        console.log('Error updating username: ', ex);
        this.componentsProvider.showToast('Cannot update username at this time. Please try again later.');
      }).then(() => {
        this.isSending = false;
        this.ngProgress.complete();
      });
    }
    else if (form.controls['username'].value == this.prevUsername) {
      // this.componentsProvider.showToast('Your new username must be different from your previous one.');
      this.hasSubmissionErrors = true;
      this.submissionErrorMessage = 'Your new username must be different from your previous one.';
    }
    else {
      // console.log('Username is blank or same with previous username.');
      // this.componentsProvider.showToast('Please check your form for invalid values.');
      this.hasSubmissionErrors = true;
      this.submissionErrorMessage = 'Please enter a valid username.';
    }
  }

  async updatePassword() {
    if (this.hasSubmissionErrors) {
      this.hasSubmissionErrors = !this.hasSubmissionErrors;
      this.submissionErrorMessage = '';
    }
    
    let form = this.changePasswordForm;
    if (form.valid) {
      console.log('Form is valid.');
      let data = form.value;
      let password = form.controls['password'].value;
      data.new_password = password;
      console.log(password);
/* Your old password was entered incorrectly. Please enter it again */
      this.isSending = true;
      this.ngProgress.start();
      let loader = await this.loadingCtrl.create({
        message: 'Updating password...'
      });
      loader.present();
      await this.userProvider.updatePassword(data, true).then(async response => {
        console.log(response);

        if (response['error']== 0){
          let changePass = await this.alertCtrl.create({
            message: "Your old password has been updated",
            mode: "md",
            cssClass: 'custom-alert-password',
            buttons:[{
                text: 'Dismiss',
                handler: () => {
                  this.navCtrl.back();
                  loader.dismiss();
                }
            }
          ]
          });
          changePass.present();
         /*  this.componentsProvider.showToast('Password has been updated.'); */
        }
      else{
        let changePass = await this.alertCtrl.create({
          message: "Your old password was entered incorrectly. Please enter it again",
          mode: "md",
          buttons:[{
            text: 'Dismiss',
            handler: () => {}
            
          }]
        })
        changePass.present();
        loader.dismiss();
       /*  this.componentsProvider.showToast('Your old password is incorrect.'); */
      }

      }).catch(ex => {
        console.log('Error updating password: ', ex);
        loader.dismiss();

      }).then(() => {
        this.isSending = false;
         this.ngProgress.complete();
         loader.dismiss();
      });
    }
    else {
      this.hasSubmissionErrors = true;
      this.submissionErrorMessage = 'Please check your form for invalid values.';
      // this.componentsProvider.showToast('Please check your form for invalid values.');
    }
  }

  async updateEmail(){
    let form = this.changeEmailForm;
    if (form.valid) {
      console.log('Form is valid.');
      let data = form.value;


      this.isSending = true;
      this.ngProgress.start();
      await this.userProvider.updateProfile(null, data).then(response => {
        /*  */
        if (response['error'] == 0) {
          console.log(response);
          this.componentsProvider.showToast('Updated email address.');
          this.storage.get('user').then(data => {
            let userData = data;
            userData.email = form.controls['email'].value;

            this.storage.set('user', userData);
          });
        }
        else {
          this.componentsProvider.showToast('Cannot update email at this time.');
        }
      }).catch(ex => {
        console.log('Error updating password: ', ex);
        this.componentsProvider.showToast('Cannot update email at this time.');
      }).then(() => {
        this.isSending = false;
        this.ngProgress.complete();
      });
    }
    else {
      this.componentsProvider.showToast('Please check if your form for invalid values.');
    }
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

  ngOnInit() {
  }
  back(){
    this.navCtrl.navigateBack('/inside-security');
  }

}
