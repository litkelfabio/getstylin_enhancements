import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ModalController, AlertController, NavController, Platform, IonRefresher, IonImg, LoadingController } from '@ionic/angular'
import { EditPostModalComponent } from '../../../components/modals/edit-post-modal/edit-post-modal.component'
import { DatasourceService } from 'src/app/services/datasource/datasource.service';
import { EventsService } from 'src/app/services/events.service';
import { ComponentsService } from 'src/app/services/components/components.service';
import { PostService } from 'src/app/services/post/post.service';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { DiscoverService } from 'src/app/services/discover/discover.service';
import { Storage } from '@ionic/storage';
import { NgProgress, NgProgressComponent, } from 'ngx-progressbar';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { LikesDislikesComponent } from 'src/app/components/modals/likes-dislikes/likes-dislikes.component';
import { CommentTreePage } from '../../comment-tree/comment-tree/comment-tree.page';
import { InAppBrowserOptions, InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { AnimationOptions } from '@ionic/angular/providers/nav-controller';
import { UserService } from 'src/app/services/user/user.service';
@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.page.html',
  styleUrls: ['./post-detail.page.scss'],
})
export class PostDetailPage implements OnInit, AfterViewInit {
  @ViewChild("refresherRef") refresherRef: IonRefresher;
  @ViewChild('imageContainer') imageContainer: ElementRef;
  @ViewChild('imahe') imahe: ElementRef;
  @ViewChild(NgProgressComponent) progressBar: NgProgressComponent;
  @ViewChild("image", { static: false }) imageDash: IonImg;
  // Textarea resize
  @ViewChild("commentField") commentField: ElementRef;
  options: InAppBrowserOptions = {
    location: 'yes',//Or 'no' 
    hidden: 'no', //Or  'yes'
    clearcache: 'yes',
    clearsessioncache: 'yes',
    zoom: 'yes',//Android only ,shows browser zoom controls 
    hardwareback: 'yes',
    mediaPlaybackRequiresUserAction: 'no',
    shouldPauseOnSuspend: 'no', //Android only 
    closebuttoncaption: 'Close', //iOS only
    disallowoverscroll: 'no', //iOS only 
    toolbar: 'yes', //iOS only 
    enableViewportScale: 'no', //iOS only 
    allowInlineMediaPlayback: 'no',//iOS only 
    presentationstyle: 'pagesheet',//iOS only 
    fullscreen: 'yes',//Windows only    
  };
  isReactingTo = false;
  isReacting: any
  item: any = [];
  otherUser: any;
  fromPost: any;
  temp_photo: any;
  error: any;
  profileInfo = [];
  isAndroid: any;
  completeInfinite: any;
  isStacked = true;
  isPushedWithContext: boolean = false; // by default, set this to false.
  isPushedFromNotification: boolean = false; // flag this if and only if the page is navigated to from a notification.
  context: any;
  counting: boolean = false;
  isEvent = false;
  pageIsLoading: boolean = true;  // flag this as true when entering from a notification
  isRotating: boolean = true;    // flag this as false once the image is rotated
  isNotified: boolean = false;
  isLoadedComment: boolean = true;
  // Used for Event Details context
  pageTitle: any;
  postId: any;
  eventData = [];
  errorComment = false;
  img = "https://getstylin.com/public/deploy1599536530/images/lns/sb/L2ltYWdlcy91cGxvYWRzL3Byb2ZpbGVwaWMvMTQ3/type/toheight/height/500/allow_enlarge/0/1582504925_yw456vuwtejxiqxwok56.jpg";
  data: any;
  isLoadedImgComment = false;
  subscription: any;
  constructor(
    private modalCtrl: ModalController,
    private dataSource: DatasourceService,
    private alertCtrl: AlertController,
    private events: EventsService,
    private navCtrl: NavController,
    private ngProgress: NgProgress,
    private storage: Storage,
    private componentsProvider: ComponentsService,
    private postsProvider: PostService,
    private keyboard: Keyboard,
    private discoverProvider: DiscoverService,
    private platform: Platform,
    private route: ActivatedRoute,
    private router: Router,
    private theInAppBrowser: InAppBrowser,
    private loadingCtrl : LoadingController,
    private userProvider : UserService
  ) {
    this.pageIsLoading = true;
    this.isAndroid = this.platform.is('android');
    this.subscription = this.platform.backButton.subscribeWithPriority(10, () => {
      console.log('Back button clicked!');
      this.navCtrl.back();
    });

    this.route.queryParams.subscribe((params: any) => {

      if (params && params.state) {
        let param = JSON.parse(params.state);
        console.log("outside: ", param)
        if (param) {
          this.postId = param.postId;
          this.isNotified = param.isNotified;
          this.fromPost = 3;

          console.log("inside: ", param);
        }
        // if (this.postId) {
        //   // We don't need to trigger this as a contexted view since this is a
        //   // Post Details view but from a notification.
        //   console.log("Post ID: ", this.postId);
        //   let postId = this.postId;
        //   this.getSinglePostDetails(postId);
        //   this.pageIsLoading = true; // flag the page as loading in order to show the skeleton loaders
        //   this.isPushedFromNotification = true;
        // }
      }
      if (this.router.getCurrentNavigation().extras.state) {
        console.log("post details: ", this.router.getCurrentNavigation().extras.state)
        this.otherUser = this.router.getCurrentNavigation().extras.state.otherUser;
        this.item = this.router.getCurrentNavigation().extras.state.item ? this.router.getCurrentNavigation().extras.state.item : [];
        this.context = this.router.getCurrentNavigation().extras.state.context;
        this.fromPost = this.router.getCurrentNavigation().extras.state.fromPost ? this.router.getCurrentNavigation().extras.state.fromPost : 3;
        this.isNotified = this.router.getCurrentNavigation().extras.state.isNotified;
        this.temp_photo = this.router.getCurrentNavigation().extras.state.temp_photo;
        this.data = this.router.getCurrentNavigation().extras.state.data;
        this.postId = this.router.getCurrentNavigation().extras.state.postId;
        this.error = this.router.getCurrentNavigation().extras.state.error;
        console.log('Is from edit? ', this.fromPost);
        console.log('data? ', this.data);
        console.log('context? ', this.context);
        console.log("this.item ", this.item)

        console.log("this.item2 ", this.item)
        if (this.context) {
          this.isPushedWithContext = true;  // flag this view as a contexted view
          this.context = this.context;

          // Then pass event data to event function.
          let data = this.data;
          this.setEventData(data);
        }
      }
      if (this.postId) {
        // We don't need to trigger this as a contexted view since this is a
        // Post Details view but from a notification.
        console.log("Post ID: ", this.postId);
        let postId = this.postId;
        this.getSinglePostDetails(postId);
        this.pageIsLoading = true; // flag the page as loading in order to show the skeleton loaders
        this.isPushedFromNotification = true;
      }

      // Subscribe to save post event
      this.events.subscribe("refresh-post-details", (refresh?) => {
        this.progressBar.start();
        this.currentPage = 1;
        console.log('Refreshing UserPost')
        // this.ngOnInit();
        this.getSinglePostDetails().then(() => {
          this.getComments(true).then(() => {
            if (refresh) {
              refresh.complete();
            } else {
              console.log("Post details update complete.");
            }
          });
        });
      });

    });

    console.log('Is from edit? ', this.fromPost);
    console.log('data? ', this.data);
    console.log('context? ', this.context);
    console.log("this.item ", this.item)

    console.log("this.item2 ", this.item)
    if (this.context) {
      this.isPushedWithContext = true;  // flag this view as a contexted view
      this.context = this.context;

      // Then pass event data to event function.
      let data = this.data;
      this.setEventData(data);
    }

    // This context is used to handle displaying the post referred to in
    // a notification. Pass the parameter received as an argument to fetch the
    // post's details.
    if (this.postId) {
      // We don't need to trigger this as a contexted view since this is a
      // Post Details view but from a notification.
      console.log("Post ID: ", this.postId);
      let postId = this.postId;
      this.getSinglePostDetails(postId);
      this.pageIsLoading = true; // flag the page as loading in order to show the skeleton loaders
      this.isPushedFromNotification = true;
    }

    this.storage.get("user").then(user => {
      this.profileInfo = user;
      // console.log(this.profileInfo);
    });

    // Flip the pageIsLoading immediately if this page is not from notifications.
    if (Object.is(this.isPushedFromNotification, false) == true) {
      this.pageIsLoading = false;
    }
    // this.dataSource.serviceData.subscribe(data=>{
    //   console.log(data);
    //   this.item = data['item'] ? data['item'] :null;
    //   this.otherUser = data['otherUser'] ? data['otherUser'] :null;
    //   this.fromPost = data['fromPost'] ? data['fromPost'] :null;
    //   this.temp_photo = data['temp_photo'] ? data['temp_photo'] :null;
    //   this.error = data['error'] ? data['error'] :null;
    //   this.context = data['context'] ? data['context']: null;
    //   this.data = data['data'] ? data['data']: null;
    //   this.postId = data['postId'] ? data['postId']: null;
    // });


  }
  ngAfterViewInit() {
    if (this.isAndroid) {
      this.imageDash = this.item['photo'];
    } else {
      this.imageDash = this.item.photo;
    }
  }
  ionViewWillEnter() {
    // this.pageIsLoading = true;
  }

  ngOnInit() {
    if (this.item.length == 0 && this.context != 'event') {
      if (this.isNotified && this.postId) {
        console.log("Post ID: ", this.postId);
        let postId = this.postId;
        this.getSinglePostDetails(postId);
        this.pageIsLoading = true; // flag the page as loading in order to show the skeleton loaders
        this.isPushedFromNotification = true;
      } else {
        this.storage.get('temp-post').then(res => {
          if (res) {
            console.log("res item: ", res.item);
            this.item = res['item'] ? res['item'] : [];
            this.context = res.isPushedWithContext;
            this.otherUser = this.item.userinfo;
            console.log("RES: ", res)
            console.log("item", this.item)
            this.getSinglePostDetails(this.item.id);
            this.fromPost = 4;
          }
        }).catch((reason: any) => {

        });
      }
    }
    // this.storage.set('temp-post', this.item).then( res=>{
    //   console.log(res['userinfo'])
    // });
    // this.storage.get('temp-post').then( res=>{
    //   console.log(res['item']);
    //   var i = res['item'];
    //   console.log(i.userinfo.profile_profile_pic);
    //   console.log(i)
    // });
    // if(this.item.length == 0){
    //   this.storage.get('temp-post').then( res  =>{
    //     this.item = res['item']? res['item']: [];
    //     this.context = res.isPushedWithContext;
    //     this.otherUser = this.item.userinfo;
    //     console.log("RES: ", res)
    //     console.log("item", this.item)
    //     this.getSinglePostDetails(this.item.id);
    //     this. mm m,, = 4;
    //   });
    // }

  }
  ionViewDidEnter() {

    console.log("ionViewDidLoad PostDetailsPage");
    console.log("this.item", this.item);
    console.log('Other user: ', this.otherUser);

    // This event is published by the Comment Tree page.
    // Fired when a user replies to the tree using the page.
    this.events.subscribe("update-comment-tree", commentPosition => {
      console.log(
        "Updating comment tree on Post Details for comment at position: ",
        commentPosition
      );
      this.getComments(true, true, commentPosition);
    });
    this.getComments();
    // Since this portion is used for Posts context,
    // activate it only if the page is loaded with a Post context.
    console.log('items before to edit: ', this.item);
    if (
      this.isPushedWithContext === false &&
      this.isPushedFromNotification === false
    ) {
      // this.getSinglePostDetails('129');
      if (this.fromPost) {
        this.getSinglePostDetails();
      }

      console.log("Subscribing to edit.");
      // this.events.subscribe("gotoedit", (item, photo, b64) => {
      //   this.navCtrl.pop().then(() => {
      //     this.navCtrl.navigateRoot(PostPage, {
      //       item: item,
      //       photo: photo,
      //       editBase64: b64
      //     });
      //   });
      // });
      this.events.subscribe("afterdelete", () => {
        this.navCtrl.pop();
      });

      this.updateReacts();
    }

    // Subscribe to this event to push the Comment Tree every time a reply is posted.
    this.events.subscribe('reply-posted', (parentComment?) => {
      console.log('reply-posted event fired; pushing Comment Tree view.');
      if (parentComment) {
        console.log('Parent comment: ', parentComment);
        this.getReplies(parentComment['id']).then(response => {
          if (response['error'] == 0) {
            console.log('Current parent comment: ', this.comments[parentComment['position']]);
            console.log('This comment tree\'s reply tree: ', response);

            let newTree = {
              comment: parentComment,
              maxReplyPages: response['total_page'],
              position: parentComment['position'],
              replies: response['datas'],
              replyCount: response['total_count']
            }

            console.log('New tree: ', newTree);
            this.presentCommentTree(newTree);
          }
        });
      }
    });
  }
  ionViewWillLeave() {
    this.subscription.unsubscribe();
  }

  ionViewDidLeave() {
    if (Object.is(this.isPushedWithContext, false) == true) {
      console.log("Unsubscribing from edit.");
      this.events.destroy("gotoedit");
      this.events.destroy("afterdelete");
    }
    this.counting = false;
    this.events.destroy('refresh-post-details');
    this.events.destroy("update-comment-tree");
    this.events.destroy('reply-posted');
    console.log("IONVIEWDIDLEAVE")
    this.progressBar.complete();
  }
  // goToModal(item) {
  //   let modal;
  //   if (this.otherUser) {
  //     modal = this.modalCtrl.create(PromptModalPage, {
  //       item: item,
  //       isMine: item.userId == this.profileInfo["id"] ? true : false,
  //       isStacked: this.isStacked,
  //       otherUser: this.otherUser
  //     });
  //   }
  //   else {
  //     modal = this.modalCtrl.create(PromptModalPage, {
  //       item: item,
  //       isMine: item.userId == this.profileInfo["id"] ? true : false,
  //       isStacked: this.isStacked
  //     });
  //   }
  //   modal.present();
  //   this.events.subscribe("dismissmodal", () => {
  //     modal.dismiss().then(() => {
  //       this.navCtrl.pop();
  //     });
  //   });
  // }

  gotoHome() {
    this.navCtrl.navigateRoot(
      ['/tabs/tabs/dashboard']
    );
  }
  goToProfile(otherUser, fromComment?) {

    console.log(otherUser.id);
    console.log(this.profileInfo["id"]);
    if (otherUser.id == this.profileInfo["id"]) {
      this.storage.set('temp-post', { item: this.item, isPushedWithContext: true });
      this.navCtrl.navigateRoot(['/tabs/tabs/my-stylin']);
    } else {
      if (fromComment) {
        let navigationExtras: NavigationExtras = {
          state: {
            otherUser: {
              id: otherUser.user_id,
              profile_about: "",
              profile_first_name: otherUser.user_first_name,
              profile_last_name: otherUser.user_last_name,
              profile_profile_pic: otherUser.user_profile_pic_url
            },
            status: otherUser,
            type: "fromStylin"
          }
        };
        if (this.fromPost != 4) {
          this.storage.set('temp-post', { item: this.item, isPushedWithContext: true });
        }
        // this.events.publish('refresh-main-profile-feed-get-connection-list')
        this.navCtrl.navigateForward(['/tabs/tabs/my-stylin'], navigationExtras);

      } else {
        let navigationExtras: NavigationExtras = {
          state: {
            otherUser: otherUser,
            status: otherUser
          }
        };
        if (this.fromPost != 4) {
          this.storage.set('temp-post', { item: this.item, isPushedWithContext: true });
        }
        this.navCtrl.navigateForward(['/tabs/tabs/my-stylin'], navigationExtras);

      }
    }
  }

  gotoTagsRelatedPosts(tag) {
    let retag = {
      tag_id: tag['id'],
      tag_name: tag['tags'].slice(1, tag['tags'].length)
    }
    let navigationExtras: NavigationExtras = {
      state: { context: 'tags', item: retag, from: 'from dashboard' }
    };
    // this.dataSource.changeData({context: 'tags', item: retag})
    if (this.fromPost != 4) {
      this.storage.set('temp-post', { item: this.item, isPushedWithContext: true });
    }
    this.navCtrl.navigateForward(['/tabs/tabs/discover/discover-inner'], navigationExtras);
    // const relatedPostsModal = this.modalCtrl.create(DiscoverInnerPage, {context: 'tags', item: retag});
    // relatedPostsModal.present();
  }
  resizeTextarea() {
    this.commentField.nativeElement.style.height =
      this.commentField.nativeElement.scrollHeight + "px";
  }

  doRefresh(event) {
    console.log('Begin async operation');
    this.events.publish("refresh-post-details", this.progressBar);
    this.progressBar.complete();
    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }
  currentPage = 1;        // current page for parent comments
  maxPages: any;          // max pages available for parent comments
  currentReplyPage = 1;   // current page for child replies
  maxReplyPages: any;     // max pages available for specific child replies
  scrollMeDown(event) {
    this.completeInfinite = false
    this.isLoadedComment = true;
    this.currentPage += 1;
    console.log(this.currentPage, this.maxPages);

    this.getComments('infinite').then(() => {
      event.target.complete();
      this.completeInfinite = true

      if (this.currentPage >= parseInt(this.maxPages)) {
        event.disabled;
      }
      this.isLoadedComment = false;
    });
  }
  showError = false;
  // Refresh post details on after Save/Unsave event.
  async getSinglePostDetails(postId?) {
    if (postId) {
      console.log("Triggered by notification tap.");
      console.log("From post details: ", postId);
      this.postsProvider
        .getPostByIdSingular("id", postId)
        .then(response => {
          console.log(response);
          if (response["error"] == 0) {
            this.item = [];
            this.item = response["datas"];
            this.pageIsLoading = false;

            console.log('Chaining getComment request.');
            this.getComments();
          } else {
            this.showError = true;
            console.log('request not found...');
            // this.pageIsLoading = false;
          }
        })
        .catch(ex => {
          console.log("Error getting this post details: ", ex);
          this.navCtrl.pop();
        });
      // .then(() => {
      //   console.log("Chaining getComment request.");
      //   this.getComments(); // get this post's comments after assigning values
      //   this.pageIsLoading = false; // revert the page to filled state
      // });
    } else {
      let postId = this.item["id"];
      console.log(postId);
      await this.postsProvider
        .getPostByIdSingular("id", postId)
        .then(response => {
          console.log(response);
          if (response["error"] == 0) {
            this.item = []; // reset the current item data
            this.item = response["datas"]; // then assign the updated values to it.
            this.item['isLoaded'] = true;
          }
        })
        .catch(ex => {
          console.log("Error getting this post details: ", ex);
          this.navCtrl.pop();
        });
    }
  }

  // COMMENTS AND REPLIES SECTION
  // This function will also get the replies for a comment, and construct
  // the comment tree.
  // Used for comments
  commentText: any;           // container for comment entry text
  comments = [];              // container for all comments for this post
  commentCount = 0;           // override this value after getting the comments
  lastParentPosition: any;    // used to record the last parent position in the comment tree
  async getComments(refresh?, isEvent?, commentPosition?) {
    if (refresh) {
      if (refresh == 'infinite') {
        // This block is executed if the refresh parameter has a value of 'infinite'.
        // This is triggered by the ionInfiniteScroll.
        console.log('isInfiniteScroll');
        console.log('Last parent position: ', this.lastParentPosition);
        let postId = this.item["id"];

        // Update the pagination if the page is infiniteScrolled.
        await this.postsProvider.getComments('getcomments', postId, this.currentPage, 8).then(response => {
          console.log('response: ', response)
          if (response['error'] == 0) {
            let parentComments = response['datas'];
            return parentComments;
          }
          else {
            console.log('Error getting paginated parent comments: ', response);
          }
        }).then(parents => {
          if (parents) {
            let rootComments = parents;

            // Iterate through each parent comment, call the getCommentReplies API,
            // then iterate through them (if there are replies) then push them to the
            // comment tree container.
            rootComments.forEach((root, i) => {
              this.lastParentPosition += 1; // increment the lastParentPosition by 1 for every loop
              let data = {
                position: this.lastParentPosition,
                comment: root,
                replies: [],
                maxReplyPages: 0,
                replyCount: 0
              };

              // Get replies
              // Only get the paginated replies inside the Comment Tree component.
              this.getReplies(root.id, 1, 8)
                .then(response => {
                  if (response["error"] == 0) {
                    let replies = response["datas"];
                    data.replies = replies; // set the values returned as replies for this root comment
                    data.maxReplyPages = response['total_page'];
                    data.replyCount = response['total_count'];
                  } else {
                    console.log("Error getting paginated child comment: ", response);
                  }
                })
                .catch(ex => {
                  console.log("Error getting paginated child comment: ", ex);
                });

              // Push comments and replies to container
              this.comments.push(data);
            });
            console.log(this.comments);
          }

          // Mark progress as done once complete.
          this.progressBar.complete();
        }).catch(ex => {
          console.log('Error getting paginated parent comments: ', ex);
        });
      }
      else {
        // This block is executed if the refresh parameter has a value of true.
        // This is triggered by the ionRefresher.
        // Reset the whole page if refreshed.
        this.comments = [];
        this.currentPage = 1;
        this.maxPages = null;
        this.currentReplyPage = 1;
        this.maxReplyPages = null;
        // this.infiniteScroll.enable(true);
        this.lastParentPosition = 0;

        // This block is executed only during the initial load, where all params for getComments are null.
        console.log("This post ID: ", this.item["id"]);
        let postId = this.item["id"];

        this.progressBar.start();
        // this.commentsAreLoading = true;
        await this.postsProvider
          .getComments("getcomments", postId, 1, 8)
          .then(response => {
            // First get all the parent comments from the getComments API, then chain
            // a call to the getCommentReplies API.
            if (response) {
              if (response["error"] == 0) {
                this.commentCount = response["total_count"];
                this.item.no_of_comments = this.commentCount;
                this.maxPages = response['total_page'];
                let parentComments = response["datas"];
                return parentComments; // return all parent comments for the next chain
              } else {
                console.log("Error getting parent comments: ", response);
              }
            }
          })
          .then(parents => {
            // Iterate through the returned comments.
            if (parents) {
              let rootComments = parents;

              // Iterate through each parent comment, call the getCommentReplies API,
              // then iterate through them (if there are replies) then push them to the
              // comment tree container.
              rootComments.forEach((root, i) => {
                let data = {
                  position: i,
                  comment: root,
                  replies: [],
                  maxReplyPages: 0,
                  replyCount: 0
                };

                // Get replies
                this.getReplies(root.id, 1, 8)
                  .then(response => {
                    if (response["error"] == 0) {
                      let replies = response["datas"];
                      data.replies = replies; // set the values returned as replies for this root comment
                      data.maxReplyPages = response['total_page'];
                      data.replyCount = response['total_count'];
                    } else {
                      console.log("Error getting child comment: ", response);
                    }
                  })
                  .catch(ex => {
                    console.log("Error getting child comment: ", ex);
                  });

                // Push comments and replies to container
                this.comments.push(data);
                this.lastParentPosition = i;
              });
              console.log(this.comments);
            }

            // Mark progress as done once complete.
            this.progressBar.complete();

            // If this function is triggered by an event, publish the responding event.
            if (isEvent) {
              this.events.publish(
                "comment-tree-updated",
                this.comments[commentPosition]
              );
            }
          })
          .catch(ex => {
            console.log("Error getting comments: ", ex);
            this.progressBar.complete();
          });
      }
    }
    else {
      // This block is executed only during the initial load, where all params for getComments are null.
      // This is also executed when an update-comment-tree event is published since that one does not pass a refresh parameter.
      console.log("This post ID: ", this.item["id"]);
      let postId = this.item["id"];

      this.progressBar.start;
      // this.commentsAreLoading = true;
      await this.postsProvider
        .getComments("getcomments", postId, 1, 8)
        .then(response => {
          // First get all the parent comments from the getComments API, then chain
          // a call to the getCommentReplies API.
          if (response) {
            if (response["error"] == 0) {
              this.comments = [];
              this.commentCount = response["total_count"];
              this.item.no_of_comments = this.commentCount;
              this.maxPages = response['total_page'];
              let parentComments = response["datas"];
              return parentComments; // return all parent comments for the next chain
            } else {
              console.log("Error getting parent comments: ", response);
            }
          }
        })
        .then(parents => {
          // Iterate through the returned comments.
          if (parents) {
            let rootComments = parents;

            // Iterate through each parent comment, call the getCommentReplies API,
            // then iterate through them (if there are replies) then push them to the
            // comment tree container.
            rootComments.forEach((root, i) => {
              let data = {
                position: i,
                comment: root,
                replies: [],
                maxReplyPages: 0,
                replyCount: 0
              };

              // Get replies
              this.getReplies(root.id, 1, 8)
                .then(response => {
                  if (response["error"] == 0) {
                    let replies = response["datas"];
                    data.replies = replies; // set the values returned as replies for this root comment
                    data.maxReplyPages = response['total_page'];
                    data.replyCount = response['total_count'];
                  } else {
                    console.log("Error getting child comment: ", response);
                  }
                })
                .catch(ex => {
                  console.log("Error getting child comment: ", ex);
                });

              // Push comments and replies to container
              this.comments.push(data);
              this.lastParentPosition = i;
            });
            console.log(this.comments);
          }

          // Mark progress as done once complete.
          this.progressBar.complete();

          // If this function is triggered by an event, publish the responding event.
          if (isEvent) {
            this.events.publish(
              "comment-tree-updated",
              this.comments[commentPosition]
            );
          }
        })
        .catch(ex => {
          console.log("Error getting comments: ", ex);
          this.progressBar.complete();
        });
    }
  }
  async getReplies(commentId, page?, limit?) {
    return await new Promise(resolve => {
      this.postsProvider
        .getReplies("getcommentreplies", commentId, page, limit)
        .then(response => {
          if (response["error"] == 0) {
            resolve(response);
          } else {
            resolve({ error: 1, trace: response });
          }
        })
        .catch(ex => {
          resolve(ex);
        });
    });
  }

  async presentCommentTree(tree) {
    console.log('This profile info: ', this.profileInfo);
    let navigateExtras: NavigationExtras = {
      state: {
        tree: tree,
        context: "post",
        profile: this.profileInfo
      }
    }
    if (this.fromPost != 4) {
      this.storage.set('temp-post', { item: this.item, isPushedWithContext: true });
    }
    this.navCtrl.navigateForward(['/comment-tree'], navigateExtras);
    // const commentTreeModal = await this.modalCtrl.create({
    //   cssClass:"commentTreePage",
    //   mode:'ios',
    //   component: CommentTreePage,
    //   backdropDismiss: true, 
    //   componentProps:{
    //     tree: tree,
    //     context: "post",
    //     profile: this.profileInfo
    //   }
    // });
    // commentTreeModal.onDidDismiss();
    // return await commentTreeModal.present();
  }
  async likesDislikesModal(item) {
    // this.dataSource.changeData(item);
    this.storage.set('temp-post', { item: this.item, isPushedWithContext: true })
    const modal = await this.modalCtrl.create({
      componentProps: {
        item: item
      },
      mode: 'ios',
      component: LikesDislikesComponent,
      backdropDismiss: true,
    });

    await modal.present();
  }
  resetFieldSize() {
    this.commentField.nativeElement.style.height = "24px"; // reset the field's height by default
  }

  // Toggle the Reply context for the Comment Entry field
  isReply: boolean = false; // flag this as true if toggled
  replyingTo: any; // container for the reply snippet
  toggleReply(comment, clear?, position?) {
    // Check first the shared context is active
    if (Object.is(this.isEditing, true) == true) {
      this.isEditing = false;
      this.editingWhich = null;
    }

    if (clear) {
      this.replyingTo = null;
      this.isReply = false;
    } else {
      let commentData = comment.comment;
      this.replyingTo = {
        id: commentData["id"],
        name: commentData["user_first_name"],
        comment: commentData["comment"],
        userId: commentData["userId"],
        postId: commentData["postId"],
        position: position,
        user_profile_pic_url: commentData['user_profile_pic_url'],
        user_first_name: commentData['user_first_name'],
        user_last_name: commentData['user_last_name'],
        created_at: commentData['created_at']
      };
      console.log("commentData", commentData);
      this.isReply = true;
    }

    console.log(this.isReply, this.replyingTo);
  }

  isEditing: boolean = false;
  editingWhich: any;
  toggleEdit(comment, clear?) {
    // Check first the shared context is active
    if (Object.is(this.isReply, true) == true) {
      this.isReply = false;
      this.replyingTo = null;
    }

    if (clear) {
      this.editingWhich = null;
      this.isEditing = false;
      this.commentText = "";
    } else {
      let commentData = comment.comment;
      this.editingWhich = {
        id: commentData["id"],
        comment: commentData["comment"]
      };

      this.commentText = commentData["comment"];
      this.isEditing = true;
    }

    console.log(this.isEditing, this.editingWhich);
  }

  // Post an awesome - not shitpost - comment.
  isPosting: boolean = false; // flag this as true if the comment is sending; disables the Send button
  async postComment(reply?) {
    this.keyboard.hide();

    // Fork immediately if this comment is posted as a new one or a reply.
    if (reply) {
      console.log("Posting this comment as a reply: ", this.commentText);
      console.log(this.replyingTo["id"], this.item["id"]);

      let data = {
        commentId: this.replyingTo["id"],
        comment: this.commentText
      };

      this.progressBar.start();
      this.isPosting = true;
      await this.postsProvider
        .postComment("savecommentreply", data, true)
        .then(response => {
          if (response["error"] == 0) {
            console.log("Posting reply: ", response);
            this.getComments(true);
            this.events.publish('reply-posted', this.replyingTo);

            // Reset the reply context
            this.replyingTo = null;
            this.isReply = false;
            // this.commentField.nativeElement.style.height = '24px';  // reset the field's height by default
            // this.events.publish('reply-posted', this.replyingTo['id']);
            this.postsProvider.postCommentNotif("savecommentreplynotif", data, true).then((res: any) => {
              console.log(res);
            });
          } else {
            console.log("Error posting reply: ", response);
          }
        })
        .catch(ex => {
          console.log("Error posting reply: ", ex);
        })
        .then(() => {
          this.progressBar.complete();
          this.isPosting = false;
          this.commentText = null; // clear the comment field
          // this.getComments(true);
        });
    } else {
      console.log("Post ID: ", this.item.id, " Comment: ", this.commentText);
      let data = {
        postId: this.item.id,
        comment: this.commentText
      };

      this.progressBar.start();
      this.isPosting = true;
      await this.postsProvider
        .postComment("savecomment", data)
        .then(response => {
          if (response["error"] == 0) {
            console.log("Posting: ", response);
            this.getComments(true);
            this.item.no_of_comments = this.commentCount;
            this.postsProvider.postCommentNotif("savecommentnotif", data).then((res: any) => {
              console.log(res);
            });
            // this.commentField.nativeElement.style.height = '24px';  // reset the field's height by default
          } else {
            console.log("Error posting this comment: ");
          }

        })
        .catch(ex => {
          console.log("Error posting comment: ", ex);
          this.progressBar.complete();
          this.isPosting = false;
        })
        .then(() => {
          this.progressBar.complete();
          this.isPosting = false;
          this.commentText = null; // clear the comment field
          // this.getComments(true);
        });
    }

    // this.commentField.nativeElement.style.height = '24px';  // reset the field's height by default
    this.resetFieldSize();
  }
  async editComment() {
    console.log("Editing comment: ", this.editingWhich["id"]);
    console.log("Post ID: ", this.item.id, " Comment: ", this.commentText);
    let data = {
      postId: this.item.id,
      comment: this.commentText,
      commentId: this.editingWhich["id"]
    };

    this.progressBar.start();
    this.isPosting = true;
    await this.postsProvider
      .postComment("savecomment", data, null, true)
      .then(response => {
        if (response["error"] == 0) {
          console.log("Editing: ", response);
          this.getComments(true);

          // Reset the editing context
          this.isEditing = false;
          this.editingWhich = null;
          // this.commentField.nativeElement.style.height = '24px';  // reset the field's height by default
        } else {
          console.log("Error editing this comment: ", response);
        }
      })
      .catch(ex => {
        console.log("Error editing comment: ", ex);
        this.progressBar.complete();
        this.isPosting = false;
      })
      .then(() => {
        this.progressBar.complete();
        this.isPosting = false;
        this.commentText = null; // clear the comment field
        // this.getComments(true);
      });

    this.resetFieldSize();
  }

  async presentDeletePrompt(comment, reply?) {
    const deleteAlert = await this.alertCtrl.create({
      mode: "md",
      /*   title: "Delete Comment", */
      message:
        "This action is irreversible. Are you sure you want to delete this comment?",
      buttons: [

        {
          text: "cancel",
          role: "cancel",
          handler: () => { }
        },
        {
          text: "YES",
          handler: () => {
            reply
              ? this.deleteComment(comment, reply)
              : this.deleteComment(comment);
          }
        },
      ]
    });
    deleteAlert.present();
  }

  async deleteComment(comment, reply?) {
    console.log("Deleting comment: ", comment, this.item["id"]);
    let paramData;

    // Fork here to check if the comment being deleted is a reply or parent.
    if (reply) {
      // TODO
    } else {
      paramData = {
        postId: this.item["id"],
        isDeleted: 0,
        commentId: comment.comment["id"]
      };

      this.progressBar.start();
      this.isPosting = true; // temporarily disable comment posting while a delete action is pending
      await this.postsProvider
        .deleteComment("savecomment", paramData)
        .then(response => {
          if (response["error"] == 0) {
            console.log("Delete: ", response);
            this.getComments(true);
          } else {
            console.log("Error deleting this comment: ", response);
          }
        })
        .catch(ex => {
          console.log("Error deleting this comment: ", ex);
          this.progressBar.complete();
          this.isPosting = false;
        })
        .then(() => {
          this.progressBar.complete();
          this.isPosting = false;
        });
    }
  }

  async updateReacts() {
    // Get reactions
    this.postsProvider.getPostLikes(this.item.id, 1, 1).then(response => {
      if (response['error'] == 0) {
        this.item['no_of_likes'] = response['total_count'];
      }
    }).catch(ex => {
      console.log('Error getting likes: ', ex);
    });

    this.postsProvider.getPostLikes(this.item.id, 0, 1).then(response => {
      if (response['error'] == 0) {
        this.item['no_of_dislikes'] = response['total_count'];
      }
    }).catch(ex => {
      console.log('Error getting dislikes: ', ex);
    });
  }

  // like(value,item) {
  //   console.log("gana?")
  //   if (this.item.isLiked === value) {
  //     this.isReacting = true;
  //     this.postsProvider.likePost({ postId: this.item.id }).then(res => {
  //       this.item.no_of_likes = res["no_of_likes"];
  //       this.item.no_of_dislikes = res["no_of_dislikes"];
  //     });
  //     this.item.isLiked = null;
  //     this.isReactingTo = false;
  //   } else {
  //     this.postsProvider
  //       .likePost({ postId: this.item.id, isLiked: value })
  //       .then(res => {
  //         this.item.no_of_likes = res["no_of_likes"];
  //         this.item.no_of_dislikes = res["no_of_dislikes"];
  //       });
  //     this.item.isLiked = value;
  //     this.isReactingTo = item['id'];
  //     this.isReacting = true;
  //   }
  // }
  message_notif: any = "";
  async like(value, item) {
    let action = value;
    let currentReact = item['isLiked'];

    console.log('Action: ', action);
    console.log('Item is currently: ', currentReact);
    if (action == '1') {
      // Trap first if the item is already liked.
      // If the item is already liked, no request will be sent.
      if (item['isLiked'] == 1) {
        this.isReacting = true;
        await this.postsProvider
          .likePost({ postId: item.id, isLiked: null })
          .then(response => {
            console.log("Dislike: ", response);
            if (response["error"] == 0) {
              item.isLiked = null;
              item.no_of_likes = parseInt(item.no_of_likes) - 1;
            } else {
              console.log("Error unliking post: ", response);
            }
          })
          .catch(dislikeError => {
            console.log("Error unliking post: ", dislikeError);
          });
      }
      else {
        this.isReactingTo = item['id'];
        this.isReacting = true;

        // If the item is not yet liked, request for it to be liked.
        await this.postsProvider.likePost({ postId: item.id, isLiked: 1 }).then(response => {
          console.log('Like: ', response);
          this.message_notif = response['message_notif'];
          if (response['error'] == 0) {
            item.isLiked = 1;
            // If the item is previously unreacted to, simply add to the
            // respective counter. Else, add and deduct to the respective counters.
            if (currentReact == null) {
              item.no_of_likes = parseInt(item.no_of_likes) + 1;
            }
            else if (currentReact != null) {
              item.no_of_likes = parseInt(item.no_of_likes) + 1;
              item.no_of_dislikes = parseInt(item.no_of_dislikes) - 1;
              console.log('No. of dislikes: ', item.no_of_dislikes);
            }
          }
          else {
            console.log('Error liking post: ', response);
          }
        }).catch(likeError => {
          console.log('Error liking post: ', likeError);
        }).then(async () => {
          this.isReacting = false;
          this.isReactingTo = null;
          await this.postsProvider.likePostNotif({ postId: item.id, isLiked: 1, message_notif: this.message_notif }).then(res => {
            console.log(res);
          });
        });
      }
    }
    else if (action == '0') {
      // Similar to likes, trap first if the item is already disliked.
      if (item['isLiked'] == 0) {
        this.isReacting = true;
        await this.postsProvider.likePost({ postId: item.id, isLiked: null }).then(response => {
          console.log('Dislike: ', response);
          if (response['error'] == 0) {
            item.isLiked = null;
            item.no_of_dislikes = parseInt(item.no_of_dislikes) - 1;
          }
          else {
            console.log('Error unliking post: ', response);
          }
        }).catch(dislikeError => {
          console.log('Error unliking post: ', dislikeError);
        });
      }
      else {
        this.isReactingTo = item['id'];
        this.isReacting = true;

        await this.postsProvider.likePost({ postId: item.id, isLiked: 0 }).then(response => {
          console.log('Dislike: ', response);
          this.message_notif = response['message_notif'];
          if (response['error'] == 0) {
            item.isLiked = 0;
            if (currentReact == null) {
              item.no_of_dislikes = parseInt(item.no_of_dislikes) + 1;
            }
            else if (currentReact != null) {
              item.no_of_dislikes = parseInt(item.no_of_dislikes) + 1;
              item.no_of_likes = parseInt(item.no_of_likes) - 1;
              console.log('No. of likes: ', item.no_of_dislikes);
            }
          }
          else {
            console.log('Error unliking post: ', response);
          }
        }).catch(dislikeError => {
          console.log('Error unliking post: ', dislikeError);
        }).then(async () => {
          this.isReacting = false;
          this.isReactingTo = null;
          await this.postsProvider.likePostNotif({ postId: item.id, isLiked: 1, message_notif: this.message_notif }).then(res => {
            console.log(res);
          });
        });
      }
    }
  }
  getMoment(stamp) {
    if (this.platform.is('ios')) {
      return this.componentsProvider.getTimestampFormat(stamp, 'YYYY-MM-DD hh:mm:ss');
    }
    else {
      return (stamp);
    }
  }

  goToLearnMore() {
    console.log('LINK', this.eventUrl);
    if (this.eventUrl || this.eventUrl != '') {
      // window.open(this.eventUrl, '_system');
      let target = "_blank";
      this.theInAppBrowser.create(this.eventUrl, target, this.options);
    }
  }

  async goToLikesDislikes() {
    // let modal = await this.modalCtrl.create({
    //   mode:'ios',
    //   component: LikesDislikesPage,
    //   backdropDismiss: true, 
    //   componentProps:{
    //     item: this.item,
    //   }
    // });
    // modal.present();
    // this.events.subscribe("dismissmodal", () => {
    //   modal.dismiss().then(() => {
    //     this.navCtrl.pop();
    //   });
    // });
  }

  // Used for Events context
  eventTitle: any;
  eventBanner: any;
  // eventDate: any;
  eventStartDate: any;
  eventEndDate: any;
  eventLocation: any;
  eventDesc: any;
  eventCity: any;
  eventUrl: any;
  eventFullLocation: any;
  disableInfinite: any = false;
  setEventData(data) {
    // Switch page titles depending on context
    // Add other conditions accordingly.
    if (this.context == "event") {
      console.log("EVENT DATA: ", data);
      // this.isPushedWithContext = false; 
      this.isPushedWithContext = true;
      this.counting = true;
      this.disableInfinite = true;
      this.pageTitle = data["event_title"];
      this.eventBanner = data["photo"];
      this.eventUrl = data['event_url'];
      // this.eventDate = this.componentsProvider.getMomentFormat(data["event_date"], "YYYY-MM-DD", 'events');
      this.eventStartDate = this.componentsProvider.getMomentFormat(data["start_date"], "YYYY-MM-DD", 'events');
      this.eventEndDate = this.componentsProvider.getMomentFormat(data["end_date"], "YYYY-MM-DD", 'events');
      this.eventLocation = (data["city"] == "" || data['city'] == null) && (data["state"] == "" || data['state'] == null) ? "" : data["city"] + ", " + data["state"];
      this.eventFullLocation = data['location'] + " " + data['city'] + " " + data['state'];
      this.eventDesc = data["description"];
      this.eventCity = data["city"] == "" || data['city'] == null ? "" : data['city'];
      this.discoverProvider.viewEvent(data["id"]);
      this.isEvent = true;
      // Cache this event's data.
      let cacheId = this.componentsProvider.eventDetailsCacheId + data['id'];
      this.cachePostData(cacheId, data);
    }
  }

  // Cache data
  cachePostData(cacheId, cacheData) {
    this.storage.get(cacheId).then(data => {
      if (data) {
        console.log('Updating data for cache: ', cacheId);
      }
      else {
        console.log('Setting new cache for: ', cacheId);
      }

      this.storage.set(cacheId, cacheData);
    });
  }

  // View photo in full screen
  viewPhoto(src, photoText?, filter?) {
    if (photoText) {
      this.componentsProvider.viewFullPhotoNew(src, photoText, filter);
    }
    else {
      this.componentsProvider.viewFullPhotoNew(src);
    }
  }

  likeComment(item) {
    console.log('Tapped like button!', item);
    this.postsProvider.likeComment(this.profileInfo["id"], item.comment.id).then(res => {
      if (res['error'] == 0) {
        console.log(res);
        if (item.comment.is_liked) {
          item.comment.total_comments--;
          item.comment.is_liked = false;
        } else {
          item.comment.total_comments++;
          item.comment.is_liked = true;
        }

      } else {
        console.log('Something went wrong! ', res);
      }
    }).catch(e => {
      console.log('Something went wrong! ', e);
    })
  }
  backToDashboard() {
    this.events.publish('refresh-main-profile-feed');
    let animations: AnimationOptions = {
      animated: true,
      animationDirection: "back"
    }
    this.navCtrl.back(animations);
    // console.log("click")
  }
  async editPostModal(item) {
    // console.log("OTHER USER POST DETAIL", this.otherUser)
    // if(this.otherUser && item['userinfo']['isFriend'] == 'unconnected'){
    //   const modal = await this.modalCtrl.create({
    //     componentProps:{
    //       item: item,
    //       isMine: item.userId == this.profileInfo["id"] ? true : false,
    //       isStacked: this.isStacked,
    //       otherUser: this.otherUser
    //     },
    //     cssClass: 'editPostModal',
    //     mode:'ios',
    //     component: EditPostModalComponent,
    //     backdropDismiss: true,
    //   });
    //   await modal.present();

    // }else if(item['userinfo']['isFriend'] == 'connected'){
    //   const modal = await this.modalCtrl.create({
    //     componentProps: {
    //       item: item,
    //       isMine: item.userId == this.profileInfo["id"] ? true : false,
    //       otherUser: item['userinfo']
    //     },
    //     cssClass: 'editFriendPostModal',
    //     mode:'ios',
    //     component: EditPostModalComponent,
    //     backdropDismiss: true,
    //   });
    //   await modal.present();

    //  }else{
    //   const modal = await this.modalCtrl.create({
    //     componentProps:{
    //       item: item,
    //       isMine: item.userId == this.profileInfo["id"] ? true : false,
    //       isStacked: this.isStacked,
    //       // otherUser: this.otherUser
    //     },
    //     cssClass: 'editOwnPostModal',
    //     mode:'ios',
    //     component: EditPostModalComponent,
    //     backdropDismiss: true,
    //   });
    //   await modal.present();
    // }
    // let mine = item.userId == this.profileInfo['id'] ? true : false;
    if (item.userId == this.profileInfo['id']) {
      // this.dataSource.changeData({
      //   item: item,
      //   isMine: item.userId == this.profileInfo["id"] ? true : false
      // });
      console.log("ITEEEEM", item)
      const modal = await this.modalCtrl.create({
        componentProps: {
          item,
          isMine: item.userId == this.profileInfo["id"] ? true : false,
          fromPost: this.fromPost ? this.fromPost : 3
        },
        cssClass: 'editOwnPostModal',
        mode: 'ios',
        component: EditPostModalComponent,
        backdropDismiss: true,
      });
      await modal.present();
      // }else if(item['']){

    } else if (item['userinfo']['is_style_concierge'] == '1' && item['userinfo']['isFriend'] == 'connected') {
      const modal = await this.modalCtrl.create({
        componentProps: {
          item: item,
          isMine: item.userId == this.profileInfo["id"] ? true : false,
          otherUser: item['userinfo']
        },
        cssClass: 'editFriendStyleConceirgePostModal',
        mode: 'ios',
        component: EditPostModalComponent,
        backdropDismiss: true,
      });
      await modal.present();
    } else if (item['userinfo']['isFriend'] == 'connected') {
      const modal = await this.modalCtrl.create({
        componentProps: {
          item: item,
          isMine: item.userId == this.profileInfo["id"] ? true : false,
          otherUser: item['userinfo']
        },
        cssClass: 'editFriendPostModal',
        mode: 'ios',
        component: EditPostModalComponent,
        backdropDismiss: true,
      });
      await modal.present();


    } else if (item['userinfo']['is_style_concierge'] == '1') {
      const modal = await this.modalCtrl.create({
        componentProps: {
          item: item,
          isMine: item.userId == this.profileInfo["id"] ? true : false,
          otherUser: item['userinfo']
        },
        cssClass: 'editStyleConceirge',
        mode: 'ios',
        component: EditPostModalComponent,
        backdropDismiss: true,
      });
      await modal.present();
    } else if (item['userinfo']['isFriend'] == 'pending') {
      const modal = await this.modalCtrl.create({
        componentProps: {
          item: item,
          isMine: item.userId == this.profileInfo["id"] ? true : false,
          otherUser: item['userinfo']
        },
        cssClass: 'editFriendPostModal',
        mode: 'ios',
        component: EditPostModalComponent,
        backdropDismiss: true,
      });
      await modal.present();
    }
    else {
      if (!item['userinfo']['isFriend']) {
        item['userinfo']['isFriend'] = 'unconnected';
        console.log("USERINFO: ", item['userinfo']['isFriend'])
        const modal = await this.modalCtrl.create({
          componentProps: {
            item: item,
            isMine: item.userId == this.profileInfo["id"] ? true : false,
            otherUser: item['userinfo']
          },
          cssClass: 'editPostModal',
          mode: 'ios',
          component: EditPostModalComponent,
          backdropDismiss: true,
        });
        await modal.present();
      } else {
        console.log("USERINFO: ", item['userinfo']['isFriend'])
        const modal = await this.modalCtrl.create({
          componentProps: {
            item: item,
            isMine: item.userId == this.profileInfo["id"] ? true : false,
            otherUser: item['userinfo']
          },
          cssClass: 'editPostModal',
          mode: 'ios',
          component: EditPostModalComponent,
          backdropDismiss: true,
        });
        await modal.present();
      }

    }


  }
  viewImage() {
    // this.photoViewer.show('https://getstylin.com/public/deploy1599536530/images/lns/sb/L2ltYWdlcy91cGxvYWRzL3Byb2ZpbGVwaWMvMTQ3/type/toheight/height/500/allow_enlarge/0/1582504925_yw456vuwtejxiqxwok56.jpg', 'Testing Title', {share: false});
  }
  isLoadedImg(item) {
    console.log("isLoaded image...");
    if (item) {
      item.isLoaded = true;
    }
  }
  errorLoad() {
    this.imageDash.src = "/assets/css/imgs/empty-states/fallback.svg";
  }
  onImgLoad(e) {
    // console.log("High quality image loaded?", e.loaded);
  }
  onThumbLoad(e) {
    // console.log("Low qaulity thumbnail loaded?", e.loaded);
  }
  backDashboardRoot() {
    this.storage.remove('temp-post').then(res => {
      this.navCtrl.navigateRoot('/tabs/tabs/dashboard');
    });
    this.navCtrl.back();
    // this.navCtrl.navigateRoot('/tabs/tabs/dashboard');
  }
  backClearStorage() {
    this.storage.remove('temp-post').then(res => {
      this.navCtrl.navigateBack('/tabs/tabs/dashboard');
    })
  }
  async goToProfile2(otherUser) {
    console.log('User: ', otherUser, this.profileInfo);
    if (otherUser.id == this.profileInfo["id"]) {
      // this.events.publish("changeTab", 1);
      this.storage.set('temp-post', { item: this.item, isPushedWithContext: true });
      this.navCtrl.navigateForward(['/tabs/tabs/my-stylin']);

    }
    else {
      if(otherUser.isBlocked == undefined){
        let loader = await this.loadingCtrl.create({
          message: 'Almost there...'
        })
        loader.present();
        this.userProvider.getProfileInfo(otherUser.id).then( res =>{
        console.log(res)
        let navigationExtras: NavigationExtras = {
          state: {
            otherUser: res['userinfo'],
            status: res['userinfo'],
          }
        };
        if (this.fromPost != 4) {
          this.storage.set('temp-post', { item: this.item, isPushedWithContext: true });
        }
        this.navCtrl.navigateForward(['/tabs/tabs/my-stylin'],navigationExtras);
        loader.dismiss(); 
      })
      }else{
        let navigationExtras: NavigationExtras = {
          state: {
            otherUser: this.otherUser,
            status: otherUser
          }
        }
        if (this.fromPost != 4) {
          this.storage.set('temp-post', { item: this.item, isPushedWithContext: true });
        }
        this.navCtrl.navigateForward(['/tabs/tabs/my-stylin'], navigationExtras);
      }
      
    }
  }
  errorLoad2(item) {
    console.log("erorr")
    console.log(this.imageDash.src)
    item.errorImage = true;
    this.imageDash.src = "/assets/css/imgs/empty-states/no-user-photo.png";
  }
  errorLoadComment(comment) {
    comment.errorComment = true;
    comment.isLoadedCommentImg = true;
  }
  isLoadedCommentImg(comment) {
    comment.isLoadedCommentImg = true;
  }
}
