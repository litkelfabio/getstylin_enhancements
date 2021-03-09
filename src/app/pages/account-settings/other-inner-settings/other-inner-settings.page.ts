import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { CmsService } from 'src/app/services/cms/cms.service';
import { ComponentsService } from 'src/app/services/components/components.service';
import _ from 'lodash';

@Component({
  selector: 'app-other-inner-settings',
  templateUrl: './other-inner-settings.page.html',
  styleUrls: ['./other-inner-settings.page.scss'],
})
export class OtherInnerSettingsPage implements OnInit {
  context: any;

  pageContext: any;
  pageTitle: any;

  isEmpty: boolean = false;
  isSearching: boolean = false;
  searchQuery: any;
  histories: any;
  tempHistory: any;

  isLoading: boolean = true;
  cmsContent: any;

  isLoggedIn: boolean = true; 
  prev: string;

  constructor(
    private route : ActivatedRoute,
    private navCtrl: NavController,
    private router: Router,
    private storage: Storage,
    private componentsProvider: ComponentsService,
    private cmsProvider: CmsService
  ) {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.pageContext = this.router.getCurrentNavigation().extras.state.context;
        if (this.pageContext == "search") {
          this.pageTitle = "Search History";
          this.prev = "/inside-security";
        }
        else if (this.pageContext == "about") {
          this.pageTitle = "About";
          this.prev = "/account-settings";
        }
        else if (this.pageContext == "privacy") {
          this.pageTitle = "Privacy Policy";
          this.prev = "/other-inner-settings/about";
        }
        else if (this.pageContext == 'terms') {
          this.pageTitle = 'Terms and Conditions';
          this.prev = "/other-inner-settings/about";
        }

      }
    });
   }

   ionViewWillEnter() {
    if (this.pageContext == 'search') {
      this.getSearchHistory();
    }
  }

  ionViewDidEnter() {
    this.cmsContent = null;
    if (this.pageContext != 'about') {
      if (this.pageContext == 'privacy') {
        this.getCms('privacy-policy');
      }
      else if (this.pageContext == 'terms') {
        this.getCms('terms-and-conditions');
      }
    }
  }

  ngOnInit() {
    this.getCms();
  }

  async getCms(cmsPage?) {
    console.log(this.isLoggedIn);
    // Load the cached terms and conditions first before requesting for a copy.
    let cacheId = cmsPage == 'terms-and-conditions' ? this.componentsProvider.tosCacheId : this.componentsProvider.privCacheId;
    await this.storage.get(cacheId).then(data => {
      if (data) {
        this.cmsContent = data;
        console.log('Loading cached data for: ', cacheId);
      }
      else {
        if (this.isLoggedIn === true) { 
          this.cmsProvider.cms({page_code: cmsPage}, true).then(response => {
            if (response['error'] == 0) {
              console.log(response);
              this.cmsContent = response;

              this.cacheThisData(cacheId, response);
            }
            else {
              console.log('Error getting CMS content: ', response);
              // this.componentsProvider.showAlert('Privacy Policy', 'Cannot get Privacy Policy right now. Please try again later.');
            }
          }).catch(ex => {
            console.log('Error getting CMS content: ', ex);
            // this.componentsProvider.showAlert('Privacy Policy', 'Cannot get Privacy Policy right now. Please try again later.');
          });
        }
        else {
          this.cmsProvider.cms({page_code: cmsPage}).then(response => {
            if (response['error'] == 0) {
              console.log(response);
              this.cmsContent = response;

              this.cacheThisData(cacheId, response);
            }
            else {
              console.log('Error getting CMS content: ', response);
              // this.componentsProvider.showAlert('Privacy Policy', 'Cannot get Privacy Policy right now. Please try again later.');
            }
          }).catch(ex => {
            console.log('Error getting CMS content: ', ex);
            // this.componentsProvider.showAlert('Privacy Policy', 'Cannot get Privacy Policy right now. Please try again later.');
          });
        }
      }
    });
  }

  cacheThisData(cacheId, cmsData) {
    this.storage.get(cacheId).then(data => {
      if (data) {
        console.log('Updating cache for: ', cacheId);
        this.storage.set(cacheId, cmsData);
      }
      else {
        console.log('Setting new cache for: ', cacheId);
        this.storage.set(cacheId, cmsData);
      }
    });
  }

  getSearchHistory() {
    this.storage.get('search_history').then(data => {
      if (data) {
        console.log('Search history: ', data);
        this.histories = data.reverse();
      }
    }).catch(historyKeyStoreError => {
      console.log('Error getting search history: ', historyKeyStoreError);
      this.componentsProvider.showToast('Cannot get search history at this time.');
    });
  }

  clearSearchHistory() {
    this.storage.remove('search_history');
    this.histories = null;
  }

  searchTheHistory() {
    if (this.searchQuery != null || this.searchQuery != '') {
      if (this.histories) {
        this.isSearching = true;
        // this.ngProgress.start();

        setTimeout(() => {
          let matches = [];
          console.log('Searching: ', this.histories);

          for (var i = 0; i <= this.histories.length - 1; i ++) {
            if (this.histories[i] == this.searchQuery) {
              matches.push(this.histories[i]);
            }
          }

          if (matches.length > 0) {
            this.tempHistory = matches;

            if (this.isEmpty === true) {
              this.isEmpty = false;
            }
          }
          else {
            this.isEmpty = true;
          }

          // this.ngProgress.done();
        }, 700);
      }
      else {
        console.log('Nothing to search for.');
      }
    }
    else if (this.searchQuery == '') {
      this.clearSearch();
    }
  }

  removeItem(removeThis) {
    // this.convos = _.remove(this.convos, convo => {
    //  return convo.id != data['convo'].id;
    // }) ;
    let sampleRemove = _.remove(this.histories, item => {
      return item != removeThis;
    });

    this.histories = sampleRemove;
    this.storage.set('search_history', this.histories);
  }

  clearSearch() {
    this.searchQuery = '';
    this.tempHistory = [];
    this.isEmpty = false;
    this.isSearching = false;
  }

  goToPolicy(){
    let navigationExtras: NavigationExtras = {
      state: {
        context: "privacy"
      }
    };
    this.navCtrl.navigateForward(['/other-inner-settings/privacy'],navigationExtras);
    // this.navCtrl.push(OtherInnerSettingsPage, {context: "privacy"});
  }

  goToTermsAndConditions() {
    let navigationExtras: NavigationExtras = {
      state: {
        context: "terms"
      }
    };
    this.navCtrl.navigateForward(['/other-inner-settings/terms'],navigationExtras);
    // this.navCtrl.push(OtherInnerSettingsPage, {context: 'terms'});
  }
  back(){
    // this.navCtrl.back();
    console.log(this.pageContext)
    if(this.pageContext == 'search'){
      this.navCtrl.navigateBack('/inside-security');
    }else if(this.pageContext == 'terms' || this.pageContext == 'privacy' ){
      this.navCtrl.navigateBack('/other-inner-settings/about');
    }else if(this.pageContext == 'about'){
      this.navCtrl.navigateBack('/account-settings');
    }
  }


}
