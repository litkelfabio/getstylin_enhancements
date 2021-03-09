import { Component, OnInit,ViewChild } from '@angular/core';
import { NavController, AlertController, LoadingController } from "@ionic/angular";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { NgProgress, NgProgressComponent } from 'ngx-progressbar';
import { Router, ActivatedRoute } from '@angular/router';
import { ChatService } from 'src/app/services/chat/chat.service';
import { ComponentsService } from 'src/app/services/components/components.service';
import { UserService } from 'src/app/services/user/user.service';
import { IonRouterOutlet } from '@ionic/angular';
@Component({
  selector: 'app-stylist-application-step3',
  templateUrl: './stylist-application-step3.page.html',
  styleUrls: ['./stylist-application-step3.page.scss'],
})
export class StylistApplicationStep3Page implements OnInit {
  @ViewChild(NgProgressComponent) progressBar: NgProgressComponent;
  public stylistApplicationFormStep3: FormGroup;
  prefilledGroups: any;
  isSubmitting: boolean = false;
  data:any;
  expValue: any;
  constructor(
    private routerOutlet: IonRouterOutlet,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    public storage: Storage,
    public chatProvider: ChatService,
    public componentsProvider: ComponentsService,
    public userProvider: UserService,
    private loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,
    private ngProgress: NgProgress,
    private router :Router,
    private route: ActivatedRoute
  ) { 
    if(this.router.getCurrentNavigation().extras.state){
      this.data = this.router.getCurrentNavigation().extras.state.step2Data;
      if(this.data){
        console.log(this.data);
        this.prefilledGroups = this.data;
      }
      this.stylistApplicationFormStep3 = this.formBuilder.group({
        first_name: ['', Validators.compose([Validators.required])],
        last_name: ['', Validators.compose([Validators.required])],
        gender: ['', Validators.compose([Validators.required])],
        email: ['', Validators.compose([Validators.required])],
        address: ['', Validators.compose([Validators.required])],
        phone_number: [null],
        ig: ['', Validators.compose([Validators.required])],
        birthdate: ['', Validators.compose([Validators.required])],
        mFashion: ['', Validators.compose([Validators.required])],
        fFashion: ['', Validators.compose([Validators.required])],
        personal_style: ['', Validators.compose([Validators.required])],
        reason_to_apply: ['', Validators.compose([Validators.required])],
        experienced: ['', Validators.compose([Validators.required])],
        describe_exp: ['']
      });
  
      // Prefill the group.
      this.preFillFormGroup();
    }
  }

  ngOnInit() {
    this.routerOutlet.swipeGesture = false;
  }
  preFillFormGroup() {
    let form = this.stylistApplicationFormStep3.controls;
    let step1 = this.prefilledGroups['step1'];
    let step2 = this.prefilledGroups['step2'];

    // Assign step 1 values
    // form.userId.setValue(step1['userId']);
    form.first_name.setValue(step1['firstName']);
    form.last_name.setValue(step1['lastName']);
    form.gender.setValue(step1['gender']);
    form.email.setValue(step1['email']);
    form.address.setValue(step1['location']);
    if (step1['phoneNumber'] != '') {
      form.phone_number.setValue(step1['phoneNumber']);
    }
    form.ig.setValue(step1['instagramUsername']);
    form.birthdate.setValue(step1['birthday']);

    // Assign step 2 values
    form.mFashion.setValue(step2['mFashion']);
    form.fFashion.setValue(step2['fFashion']);
    form.personal_style.setValue(step2['styleDescription']);
    form.reason_to_apply.setValue(step2['stylistRationale']);
  }

  setExperienceValue(value) {
    this.stylistApplicationFormStep3.controls.experienced.setValue(value);
    this.expValue = value;
  }
  async submitApplication() {
    // console.log(this.stylistApplicationFormStep3.value);
    // The form group data being checked here will be the whole form.
    // We should place the form data from steps 1 and 2 before this step.
    if (this.stylistApplicationFormStep3.valid) {
      console.log(this.stylistApplicationFormStep3.value);
      // let bd = this.stylistApplicationFormStep3.controls['birthdate'].value;
      // let newBd = this.componentsProvider.getBirthdateMoment(bd);
      // this.stylistApplicationFormStep3.controls['birthdate'].setValue(newBd);

      let formData = this.stylistApplicationFormStep3.value;
      const loadingAlert = await this.loadingCtrl.create({
        message: 'Submitting your application...'
      });
      loadingAlert.present();

      // Submit the application form.
      this.progressBar.start();
      this.isSubmitting = true;
      await this.userProvider.applyAsStylist('applystylist', formData).then(async response => {
        console.log(response);

        if (response['error'] == 0) {
          this.progressBar.complete();
          this.chatProvider.socket().emit('receive notification', response['data']);

          const successAlert = await this.alertCtrl.create({
            header: 'Stylist Application Submitted',
            cssClass: 'muteAlertModal',
            mode: "md",
            message: 'Your stylist application will now be reviewed by the GetStylin\' team.',
            buttons: [
              {
                text: 'Okay',
                handler: () => {}
              }
            ]
          });
          successAlert.present();
          
          // Change the stored user profile data to 2 to signify it's pending status.
          // This will be used to determine whether the Apply to be Stylist button is enabled or not.
          this.storage.get('user').then(data => {
            let profile = data;
            profile['stylist'] = '2';

            this.storage.set('user', profile);
          });
        }
        else {
          if (response['message'] = "You're already sent an application. Please wait for admins approval!") {
            this.progressBar.complete();
            this.componentsProvider.showAlert('Pending Application', 'You\'ve already sent an application. Please wait for admin\'s approval.');

            // We add this part here in the event that a TimeoutError occurs on the first attempt
            // and the user tries to submit an application again.
            this.storage.get('user').then(data => {
              let profile = data;
              profile['stylist'] = '2';

              this.storage.set('user', profile);
            });
            
          }
          else {
            this.componentsProvider.showAlert('Form Submit Error', 'Something went wrong while submitting your application. Please try again later.');
          }
          // this.componentsProvider.showToast('Cannot submit application right now. Please try again later.');
        }
      }).catch(ex => {
        console.log('Error submitting application form: ', ex);
        // this.componentsProvider.showToast('Cannot submit application right now. Please try again later.');
        this.componentsProvider.showAlert('Cannot submit application right now.', 'Please try again later.');
        this.progressBar.complete();
      }).then(() => {
        this.progressBar.complete();
        loadingAlert.dismiss();
        this.isSubmitting = false;
        this.navCtrl.navigateRoot(['/tabs/tabs/dashboard']);
      });
    }
    else {
      console.log('Form is invalid.');
      this.componentsProvider.showToast('Please check your input for invalid values.');
    }
  }

  submit(){
    this.navCtrl.navigateForward('/tabs/tabs/my-stylin')
    this.presentStylistSubmitted();
  }
  presentStylistSubmitted() {
    this.alertCtrl.create({
    header: 'Stylist Application Submitted',
    mode: 'ios',
    message: 'Your stylist application will be now reviewed by the GetStylin\' team.',
      buttons: [
        {
          text: 'OKAY',
          handler: ()=>{
          }
        }
      ]
    }).then(alert => alert.present());
  }

}
