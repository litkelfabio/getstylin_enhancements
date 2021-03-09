import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { CmsService } from 'src/app/services/cms/cms.service';

@Component({
  selector: 'app-terms-and-conditions',
  templateUrl: './terms-and-conditions.page.html',
  styleUrls: ['./terms-and-conditions.page.scss'],
})
export class TermsAndConditionsPage implements OnInit {

  isLoading: boolean = true;
  cmsContent: any;
  cmsPage = 'terms-and-conditions'
  constructor(
    private cmsProvider: CmsService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
  } 

  async ionViewDidEnter(){
    console.log("ionview")
    await this.cmsProvider.cms({page_code: this.cmsPage}).then(response => {
      console.log(response)
      if (response['error'] == 0) {
        console.log(response);
        this.cmsContent = response;
        this.isLoading = false;
      }
      else {
        console.log('Error getting CMS content1: ', response);
        // this.componentsProvider.showAlert('Privacy Policy', 'Cannot get Privacy Policy right now. Please try again later.');
      }
    }).catch(ex => {
      console.log('Error getting CMS content2: ', ex);
      // this.componentsProvider.showAlert('Privacy Policy', 'Cannot get Privacy Policy right now. Please try again later.');
    });
  }

  back(){
    this.navCtrl.back();
  }

}
