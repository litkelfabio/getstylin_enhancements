import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ComponentsService } from 'src/app/services/components/components.service';
import { UserService } from 'src/app/services/user/user.service';
import { Storage } from '@ionic/storage';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LoadingController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-username',
  templateUrl: './username.page.html',
  styleUrls: ['./username.page.scss'],
})
export class UsernamePage implements OnInit {
  save: any;
  public changeUsernameForm: FormGroup;
  profileInfo: any;
  prevUsername: any;
  isSending: boolean;
  hasSubmissionErrors: boolean;
  submissionErrorMessage: string;
  isSameAsPrevious: boolean;
  usernameExists: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private storage: Storage,
    private userProvider: UserService,
    private componentsProvider: ComponentsService,
    private authProvider: AuthService,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController
  ) {
    this.changeUsernameForm = this.formBuilder.group({
      username: ['', Validators.compose([Validators.required,
        Validators.maxLength(30),
        Validators.pattern('^[a-zA-Z0-9.]+$')])]
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
      }
      console.log("profileInfo", this.profileInfo);
    });
   }

   async updateMyUsername() {
    if (this.hasSubmissionErrors) {
      this.hasSubmissionErrors = !this.hasSubmissionErrors;
    }

    let form = this.changeUsernameForm;
    if (form.valid && form.controls['username'].value != this.prevUsername) {
      let data = form.value;

      this.isSending = true;
      // this.ngProgress.start();
      let loader = await this.loadingCtrl.create({
        message: 'Updating username...'
      });
      loader.present();
      await this.userProvider.updateUsername('updateprofile', data, true).then(response => {
        if (response['error'] == 0) {
          this.componentsProvider.showToast('Updated username.');
          this.storage.get('user').then(data => {
            let userData = data;
            userData.username = form.controls['username'].value;
            this.storage.set('user', userData);
            this.navCtrl.back();
            loader.dismiss();
          });
        }
        else {
          console.log(response);
          this.componentsProvider.showToast('Cannot update username at this time. Please try again later.');
          loader.dismiss();
        }
      }).catch(ex => {
        console.log('Error updating username: ', ex);
        this.componentsProvider.showToast('Cannot update username at this time. Please try again later.');
        loader.dismiss();
      }).then(() => {
        this.isSending = false;
        loader.dismiss();
        // this.ngProgress.done();
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

  ngOnInit() {
    // this.routerOutlet.swipeGesture = false;
  }
  back(){
    this.navCtrl.back();
  }

}
