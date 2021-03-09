import { Component, OnInit,NgZone  } from '@angular/core';
import { Platform, NavController,  LoadingController, AlertController, ModalController} from '@ionic/angular';
import { IonRouterOutlet } from '@ionic/angular';
import {BirthdayModal2Component} from '../../../components/modals/birthday-modal2/birthday-modal2.component'
import {  Router,NavigationExtras,ActivatedRoute } from '@angular/router'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { ComponentsService } from 'src/app/services/components/components.service';
import { UserService } from 'src/app/services/user/user.service';
@Component({
  selector: 'app-stylist-application-step2',
  templateUrl: './stylist-application-step2.page.html',
  styleUrls: ['./stylist-application-step2.page.scss'],
})
export class StylistApplicationStep2Page implements OnInit {
  public stylistApplicationFormStep2: FormGroup;

  stylistApplicationFormStep1: any; 
  step1:any;
  constructor(
    private routerOutlet: IonRouterOutlet,
    private router:Router,
    private route :ActivatedRoute,
    public navCtrl: NavController,
    public componentsProvider: ComponentsService,
    public userProvider: UserService,
    private loadingCtrl: LoadingController,
    private formBuilder: FormBuilder
  ) {
    this.route.queryParams.subscribe(params=>{
      if(this.router.getCurrentNavigation().extras.state){
        this.stylistApplicationFormStep1 = this.router.getCurrentNavigation().extras.state.step1Data;
       
      }else{
        this.navCtrl.back();
      }

      this.stylistApplicationFormStep2 = this.formBuilder.group({
        mFashion: [0],
        fFashion: [0],
        styleDescription: ['', Validators.compose([Validators.required])],
        stylistRationale: ['', Validators.compose([Validators.required])]
      });
    });
   }
   updatePreferences(pref) {
    if (pref == 'm') {
      if (this.stylistApplicationFormStep2.controls.mFashion.value == 0) {
        this.stylistApplicationFormStep2.controls.mFashion.setValue(1);
      }
      else {
        this.stylistApplicationFormStep2.controls.mFashion.setValue(0);
      }
    }
    else {
      if (this.stylistApplicationFormStep2.controls.fFashion.value == 0) {
        this.stylistApplicationFormStep2.controls.fFashion.setValue(1);
      }
      else {
        this.stylistApplicationFormStep2.controls.fFashion.setValue(0);
      }
    }
  }
  goToStep3() {
    console.log(this.stylistApplicationFormStep2.value);
    if (this.stylistApplicationFormStep2.valid) {
      let data = {
        step1: this.stylistApplicationFormStep1,
        step2: this.stylistApplicationFormStep2.value
      }
      console.log("style2: ",data);
      let navigateExtras:NavigationExtras ={
        state:{step2Data: data}
      }
      this.navCtrl.navigateForward(['/stylist-application-step3'],navigateExtras );
    }
    else {
      console.log('Form is invalid.');
      this.componentsProvider.showToast('Please check your input for invalid values.');
    }
  }

  ngOnInit() {
    this.routerOutlet.swipeGesture = false
  }
  nextPage(){
    this.router.navigateByUrl('/stylist-application-step3')
  }

}
