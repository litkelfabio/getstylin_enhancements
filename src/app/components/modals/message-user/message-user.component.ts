import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { IonImg, LoadingController, ModalController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { ChatService } from 'src/app/services/chat/chat.service';
import { DiscoverService } from 'src/app/services/discover/discover.service';
import { FriendService } from 'src/app/services/friend/friend.service';
import { UserService } from 'src/app/services/user/user.service';
import { MessageModalComponent } from '../message-modal/message-modal.component';
import { EventsService } from 'src/app/services/events.service';

@Component({
  selector: 'app-message-user',
  templateUrl: './message-user.component.html',
  styleUrls: ['./message-user.component.scss'],
})
export class MessageUserComponent implements OnInit {
  @ViewChild("image", {static: false}) imageDash: IonImg;
  searchkey: any;
  isStylist: any;
  currentPage: number = 1;
  artists: any;
  totalItems: any;
  totalPage: any;
  infiniteScroll: any;
  maxListingPages: any;
  userListing: any;
  searching: boolean = false;
  disableInfinite: any;
  othercontext: any;
  findMeAUser: any;
  isLoadedProfile =false;

  constructor(
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private discoverService: DiscoverService,
    private friendsProvider: FriendService,
    private chatProvider: ChatService,
    private storage: Storage,
    private userProvider: UserService,
    private loadingCtrl: LoadingController,
    private events: EventsService,
  ) { }

  ngOnInit() {
    this.getArtists();
  }

  back() {
    this.modalCtrl.dismiss();
  }

  async goToMessageModal(user) {
    let loader = await this.loadingCtrl.create({
      message:'Almost there...',
      mode:'ios',
    });
    loader.present();
    this.chatProvider.getInbox(user.id).then(async res => {
      console.log(res);
      if (res["error"] == 0) {
        const modal = await this.modalCtrl.create({
          component: MessageModalComponent,
          componentProps: {
            otherUser: user,
            convo: res["data"],
            context: "userlist"
          }
        });
        modal.present();
        this.modalCtrl.dismiss();
        loader.dismiss();
        this.events.publish('refresh-message');
        this.events.publish('init-subscribers');
        this.events.publish('init-inbox');
      }
    });
  }


  async goToMyStylin(user) {
    let loader = await this.loadingCtrl.create({
      message:'Almost there...',
      mode: 'ios',
    })
    loader.present();
    this.userProvider.getProfileInfo(user.id).then(res =>{
      console.log("RES: ", res['userinfo']);
      let navigationExtras : NavigationExtras={
        state:{
          otherUser: res['userinfo'],
          status: res['userinfo']
        }
      }
      this.navCtrl.navigateForward(['/my-stylin'], navigationExtras)
      loader.dismiss();
      this.modalCtrl.dismiss();
    })
    // console.log("HEY: ", user)
    
  }

  getArtists(refresher?, infiniteScroll?) {

    if (refresher) {
      this.currentPage = 1;
      this.infiniteScroll.disable = false;
    }

    console.log("Message context: getting all users.");
    console.log("Current page: ", this.currentPage);
    console.log("Current max page: ", this.maxListingPages);

    this.friendsProvider.getFriendsForMessaging('listing', this.currentPage).then(response => {
      if (response['error'] == 0) {
        let connectionsData = response['datas'];
        if (infiniteScroll) {
          connectionsData.forEach(item => {
            this.userListing.push(item);
          });

          if (this.currentPage >= this.maxListingPages) {
            infiniteScroll.target.disable = true;
          }

          infiniteScroll.target.complete();
        }
        else {
          this.userListing = connectionsData;
          this.maxListingPages = response['total_page'];
          this.userListing.forEach((element : any) => {
            console.log(element)
            if(element.profile_profile_pic){
              
            }else{
              element.profile_profile_pic = "/assets/css/imgs/empty-states/no-user-photo.png";
            }
          });
          console.log(this.userListing);
        }

        if (refresher) {
          refresher.complete();
        }
      }
      else {
        console.log("Error getting user listings for messages: ", response);
        // this.userListing = [];
        if (refresher) {
          refresher.complete();
        }

        if (infiniteScroll) {
          if (this.currentPage >= this.maxListingPages) {
            infiniteScroll.target.disable = true;
          }

          infiniteScroll.target.complete();
        }
      }
    }).catch(ex => {
      console.log("Error getting user listings for messages: ", ex);
    }).then(() => {

    });
  }

  doInfinite(infiniteScroll: any) {
    this.currentPage++;
    this.infiniteScroll = infiniteScroll;

    if (this.searching === false) {
      this.getArtists(null, infiniteScroll);
    } else {
      if (this.currentPage >= this.maxListingPages) {
        infiniteScroll.target.disable = true;
      }
      else {
        this.finder(null, null, infiniteScroll);
      }
    }
  }

  async finder(event, isRefresh?, isInfinite?) {
    let data = {
      query: event.target.value
    };

    this.currentPage = 1;
    this.searching = true; // set this to true until set false otherwise.
    // Store previous results, page, and maxPage to Storage.
    // Do this only if the searching flag is false and context is messages.
    // previousResults: any;
    // previousMaxListingPages: any;
    // previousPage: any;
    this.storage.get("previousListingState").then(data => {
      console.log(data);
      if (!data) {
        let previousListingState = {
          previousResults: this.userListing,
          previousMaxListingPages: this.maxListingPages,
          previousPage: this.currentPage,
          previousTotal: this.totalItems
        };
        this.storage.set("previousListingState", previousListingState);
      }
    });

    console.log('OTHER CONTEXT ', this.othercontext);

    await this.userProvider
      .getUserListings("listing", data, this.currentPage, 20)
      .then(response => {
        if (response["error"] == 0) {
          console.log("Search for user to message: ", response);
          let prefilteredArtists = response['datas'];
          let filteredArtists = [];
          prefilteredArtists.forEach(artist => {
            if (artist['blockedBy'] === false && artist['isBlocked'] === false) {
              filteredArtists.push(artist);
            }
            else {
              console.log('Blocked user found: ', artist);
            }
          });

          if (isInfinite) {
            let newEntries = filteredArtists;
            newEntries.forEach(entry => {
              this.userListing.push(entry);
            });
          } else {
            this.userListing = filteredArtists;
          }
          this.maxListingPages = response['total_page'];
        } else {
          console.log("Error getting user listing: ", response);
          if (response["message"] == "No Friends Found" && !isInfinite) {
            this.userListing = [];
          } else if (
            response["message"] == "No Friends Found" &&
            isInfinite
          ) {
            console.log(
              "Are you infinite scrolling and no more results are found? Let's disable the infinite scroll."
            );
            isInfinite.enable(false);
          }
        }
      })
      .catch(ex => {
        console.log("Error getting user search in messages: ", ex);
      })
      .then(() => {
        if (isInfinite) {
          isInfinite.complete();
        }
      });
  }
  errorLoad(user){
    console.log("erorr")
    console.log(this.imageDash.src)
    user.errorImage = true;
    // this.imageDash.src = "/assets/css/imgs/empty-states/no-user-photo.png";
    user.isLoadedProfile = true;
  }

  isLoadedImg2(user){
    console.log("isLoaded image...");
    if(user){
      user.isLoadedProfile = true;
    } 
  }

}
