import { Component, OnInit, ViewChild, ElementRef, } from '@angular/core';
import { ModalController, NavController, AlertController, Platform, IonRefresher } from '@ionic/angular';
import { NgProgress, NgProgressComponent } from 'ngx-progressbar';
import { ComponentsService } from 'src/app/services/components/components.service';
import { EventsService } from 'src/app/services/events.service';
import { PostService } from 'src/app/services/post/post.service';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { MyStylinPage } from '../../tabs/my-stylin/my-stylin.page';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { QuestionService } from 'src/app/services/question/question.service';
import { IonRouterOutlet } from '@ionic/angular';
import { Storage } from '@ionic/storage';
@Component({
  selector: 'app-comment-tree',
  templateUrl: './comment-tree.page.html',
  styleUrls: ['./comment-tree.page.scss'],
})
export class CommentTreePage implements OnInit {
  @ViewChild("refresherRef") refresherRef: IonRefresher;
  // InfiniteScroll
  @ViewChild(NgProgressComponent) progressBar: NgProgressComponent;
  // Textarea resize
  @ViewChild("commentField") commentField: ElementRef;
  replyingTo: any;
  isReply: any;
  page: any;
  totalPages: any;
  profileInfo: any;     // container for profile info
  commentTree: any = [];     // comment tree to render
  context: any;         // context switcher for the page
  commentText: any;     // container for comment entry text
  repliesAreUpdating: boolean = false; // flag as true if the replies are being updated.
  isEditing: boolean = false;
  editingWhich: any;
  currentPage = 1;
  maxPages: any;
  isPosting: boolean = false;  
  loading = false;
  subscription: any;
   // flag this as true if the comment is sending; disables the Send button
  constructor(
    private routerOutlet: IonRouterOutlet,
    private modalCtrl: ModalController,
    public navCtrl: NavController,
    // public viewCtrl: ViewController,
    public componentsProvider: ComponentsService,
    public events: EventsService,
    public ngProgress: NgProgress,
    private postsProvider: PostService,
    private questionsProvider: QuestionService,
    private keyboard: Keyboard,
    public alertCtrl: AlertController,
    private platform: Platform,
    private route: ActivatedRoute,
    private router: Router,
    private storage: Storage
  ) {
    // if(!this.commentTree){
    //   this.storage.get('temp-commentTree').then( comments =>{
    //     this.commentTree = comments
    //   })
    // }
    // if(!this.profileInfo){
    //   this.storage.get("user").then( data =>{
    //     this.profileInfo = data
    //     console.log(this.profileInfo)
    //   })
    // }
    this.subscription =  this.platform.backButton.subscribeWithPriority(10, () => {
      console.log('Back button clicked!');
      this.goToPostDetails();
    });
    console.log('this.commentTree: ', this.commentTree.length)
    console.log('this.profileInfo: ', this.profileInfo)
    console.log('this.maxPages: ', this.maxPages)

    

  }

  ngOnInit() {
    this.routerOutlet.swipeGesture = false;
    this.route.queryParams.subscribe(async params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.commentTree = this.router.getCurrentNavigation().extras.state.tree;
        this.context = this.router.getCurrentNavigation().extras.state.context;
        this.profileInfo = this.router.getCurrentNavigation().extras.state.profile;
      }
      if (this.commentTree && this.profileInfo) {
        this.profileInfo = this.profileInfo;
        this.commentTree = this.commentTree;
        this.maxPages = this.commentTree['maxReplyPages'];
      }else if (this.commentTree.length < 1) {
        this.loading = true
        await this.storage.get('temp-commentTree').then(async comments => {
          this.commentTree = comments.commentTree
          this.context = comments.context
          console.log(this.commentTree)
          await this.storage.get('user').then( user =>{
            this.profileInfo = user
            console.log(this.profileInfo)
            this.loading = false;
          });
        })
      }
      else {
        this.componentsProvider.showToast('Cannot load comment tree at this moment.');
        this.modalCtrl.dismiss();
      }
      this.context = this.context;
    });
  }
  ionViewDidEnter() {
    console.log('Received comment tree: ', this.commentTree);
    console.log('Received profile details: ', this.profileInfo);
  }
  ionViewDidLeave() {
    this.events.destroy('comment-tree-updated');
    this.events.destroy('sc-comment-tree-updated');
  }

  getMoment(stamp) {
    if (this.platform.is('ios')) {
      return this.componentsProvider.getTimestampFormat(stamp, 'YYYY-MM-DD hh:mm:ss');
    }
    else {
      return (stamp);
    }
  }
  toggleEdit(comment, clear?) {
    console.log(comment);

    if (clear) {
      this.editingWhich = null;
      this.isEditing = false;
      this.commentText = '';
    }
    else {
      let commentData = comment;

      if (this.context == 'post') {
        this.editingWhich = {
          id: commentData['id'],
          comment: commentData['commentReply'],
          commentId: commentData['commentId']
        }

        this.commentText = commentData['commentReply'];
      }
      else {
        this.editingWhich = {
          id: commentData['id'],
          comment: commentData['reply'],
          commentId: commentData['column_commentId']
        }

        this.commentText = commentData['reply'];
      }

      this.isEditing = true;
    }

    console.log(this.isEditing, this.editingWhich);
  }

  // For deleting replies
  async presentDeletePrompt(comment, reply?) {
    console.log('Before deleting: ', comment);
    let deleteAlert = await this.alertCtrl.create({
      mode: "md",
      /* title: 'Delete Reply', */
      message: 'This cannot be undone. Are you sure you want to proceed?',
      buttons: [
        {
          text: 'cancel',
          role: 'cancel',
          handler: () => { }
        },
        {
          text: 'YES',
          // handler: () => { console.log('Deleting.'); }
          handler: () => { reply ? this.deleteComment(comment, true) : this.deleteComment(comment); }
        },
      ]
    });
    deleteAlert.present();
  }
  async deleteComment(comment, reply?) {
    console.log('Deleting comment: ', comment);
    let paramData;

    // Fork here to check if the comment being deleted is a reply or parent.
    if (reply) {
      if (this.context == 'post') {
        console.log('Deleting a reply from Post.');
        paramData = {
          commentId: comment['commentId'],
          isDeleted: 0,
          commentReplyId: comment['id']
        }

        this.progressBar.start();
        this.repliesAreUpdating = true;
        await this.postsProvider.deleteComment('savecommentreply', paramData, true).then(response => {
          if (response['error'] == 0) {
            console.log('Delete okay: ', response);
            this.repliesAreUpdating = false;
            this.commentTree['replies'] = this.commentTree['replies'].filter(item => item != comment);
            this.events.publish('update-comment-tree', this.commentTree['position']);
          }
          else {
            this.repliesAreUpdating = false;
            console.log('Delete failed: ', response);
            this.componentsProvider.showToast('Cannot delete reply at this time. Please try again.');
          }
        }).catch(deleteReplyError => {
          this.componentsProvider.showToast('Cannot delete reply at this time. Please try again.');
          console.log('Error deleting comment: ', deleteReplyError);
        }).then(() => {
          this.progressBar.complete();
        });
      }
      else {
        console.log('Deleting a reply from Style Column.');
        paramData = {
          column_commentId: comment['column_commentId'],
          isDeleted: 0,
          commentReplyId: comment['id']
        }

        this.progressBar.start();
        this.repliesAreUpdating = true;
        await this.questionsProvider.deleteResponse('savecommentreplies', paramData, true).then(response => {
          if (response['error'] == 0) {
            this.repliesAreUpdating = false;
            console.log('Delete okay: ', response);
            this.events.publish('sc-update-comment-tree', this.commentTree['position']);
          }
          else {
            this.repliesAreUpdating = false;
            console.log('Delete failed:', response);
          }
        }).catch(deleteResponseError => {
          this.componentsProvider.showToast('Cannot delete reply at this time. Please try again.');
          console.log('Error deleting response: ', deleteResponseError);
        }).then(() => {
          this.progressBar.complete();
        });
      }
    }
    this.doRefresh(this.refresherRef)
  }

  async updateCommentTree(type, page?) {
    let url;
    if (type == 'post') {
      let commentId = this.commentTree['comment']['id'];
      if (page) {
        await this.postsProvider.getReplies('getcommentreplies', commentId, this.currentPage, 8).then(response => {
          if (response['error'] == 0) {
            console.log('Comment tree for this comment: ', response);

            if (response['datas'].length > 0) {
              this.maxPages = response['total_page'];
              console.log('Response: ', response['datas']);
              let repliesInfiniteScroll = response['datas'];
              repliesInfiniteScroll.forEach(item => {
                this.commentTree['replies'].push(item);
              });
            }
          }
          else {
            console.log('Error getting paginated child replies in comment tree view: ', response);
          }
        }).catch(ex => {
          console.log('Error getting paginated child replies in comment tree view: ', ex);
        }).then(() => {
          this.repliesAreUpdating = false;
          this.progressBar.complete();
        });
      }
      else {
        this.currentPage = 1;
        this.refresherRef.disabled = false;

        await this.postsProvider.getReplies('getcommentreplies', commentId, 1, 8).then(response => {
          if (response['error'] == 0) {
            console.log('This comment\'s comment tree: ', response);
            this.commentTree['replies'] = [];
            this.commentTree['replies'] = response['datas'];
            this.maxPages = response['total_page'];
          }
          else {
            console.log('Error getting replies: ', response);
            this.componentsProvider.showToast('Cannot get replies at this time. Please try again later.');
          }
        }).catch(ex => {
          console.log('Error getting replies: ', ex);
          this.componentsProvider.showToast('Cannot get replies at this time. Please try again later.');
          this.progressBar.complete();
          this.repliesAreUpdating = false;
        }).then(() => {
          this.progressBar.complete();
          this.repliesAreUpdating = false;
        });
      }
    }
    else {
      // For Style Column responses
      console.log(this.commentTree);
      let questionId = this.commentTree['response']['id'];
      if (page) {
        await this.questionsProvider.retrieveReplies('getcommentreplies', questionId, this.currentPage, 8).then(response => {
          if (response['error'] == 0) {
            console.log('Response: ', response['datas']);
            let repliesInfiniteScroll = response['datas'];
            repliesInfiniteScroll.forEach(item => {
              this.commentTree['replies'].push(item);
            });
          }
        }).catch(ex => {
          console.log('Error getting paginated child replies in comment tree view: ', ex);
        }).then(() => {
          this.progressBar.complete();
          this.repliesAreUpdating = false;
        });
      }
      else {
        this.currentPage = 1;
        this.refresherRef.disabled = false;

        await this.questionsProvider.retrieveReplies('getcommentreplies', questionId, 1, 8).then(response => {
          if (response['error'] == 0) {
            console.log('Response: ', response['datas']);
            this.commentTree['replies'] = [];
            this.commentTree['replies'] = response['datas'];
            this.maxPages = response['total_page'];
          }
          else {
            console.log('Error getting responses: ', response);
          }
        }).catch(ex => {
          console.log('Error getting responses: ', ex);
          this.componentsProvider.showToast('Cannot get responses at this time. Please try again later.');
          this.progressBar.complete();
        }).then(() => {
          this.progressBar.complete();
          this.repliesAreUpdating = false;
        });
      }
    }
  }

  ionViewWillLeave() {
    this.progressBar.complete();
    this.subscription.unsubscribe();
  }
  doRefresh(event) {
    this.currentPage = 1;

    this.progressBar.start();
    this.updateCommentTree(this.context).then(() => {
      event.target.complete();
      this.refresherRef.disabled = false;
    });
  }
  doInfinite(event) {
    this.currentPage += 1;

    this.updateCommentTree(this.context, this.currentPage).then(() => {
      if (this.currentPage >= parseInt(this.maxPages)) {
        event.enable(false);
      }

      event.target.complete();
    });
  }
  resetFieldSize() {
    this.commentField.nativeElement.style.height = '24px';  // reset the field's height by default
  }
  async postComment(reply?, edit?) {
    this.keyboard.hide();

    // In this page, all submissions are definitely replies.
    if (reply) {
      console.log('Posting this comment as a reply: ', this.commentText);
      console.log('Replying to comment ID: ', this.commentTree['comment']['id']);

      let data = {
        commentId: this.commentTree['comment']['id'],
        comment: this.commentText,
      }

      this.progressBar.start();
      this.isPosting = true;
      await this.postsProvider.postComment('savecommentreply', data, true).then(response => {
        if (response['error'] == 0) {
          console.log('Posted reply: ', response);
          this.events.publish('update-comment-tree', this.commentTree['position']);
          this.repliesAreUpdating = true;
          this.updateCommentTree('post');
        }
        else {
          console.log('Error posting reply: ', response);
          this.componentsProvider.showToast('Cannot post reply right now. Please try again later.');
        }
      }).catch(ex => {
        console.log('Error posting reply: ', ex);
        this.componentsProvider.showToast('Cannot post reply right now. Please try again later.');
      }).then(() => {
        this.progressBar.complete();
        this.isPosting = false;
        this.commentText = '';  // clear the comment field
        this.resetFieldSize();
      });
    }

    // Simply pass a null,true argument to this function to trigger this block.
    if (edit) {
      console.log('Editing Post reply.');
      console.log('editingWhich: ', this.editingWhich);

      let paramData = {
        commentId: this.editingWhich['commentId'],
        commentReply: this.commentText,
        commentReplyId: this.editingWhich['id']
      }

      this.progressBar.start();
      this.repliesAreUpdating = true;
      await this.postsProvider.editReply('savecommentreply', paramData).then(response => {
        if (response['error'] == 0) {
          console.log('Edit okay: ', response);
          this.events.publish('update-comment-tree', this.commentTree['position']);
          this.updateCommentTree('post');

          this.isEditing = false;
          this.editingWhich = null;
          this.commentText = null;
          this.resetFieldSize();
        }
        else {
          console.log('Edit failed: ', response);
          this.componentsProvider.showToast('Cannot update reply right now. Please try again.');
          this.repliesAreUpdating = false;
        }
      }).catch(ex => {
        console.log('Error updating reply: ', ex);
        this.componentsProvider.showToast('Cannot update reply right now. Please try again.');
        this.repliesAreUpdating = false;
      }).then(() => {
        this.progressBar.complete();
      });
    }
    // this.commentField.nativeElement.style.height = '24px';  // reset the field's height by default
    this.resetFieldSize();
    this.doRefresh(this.refresherRef);
  }
  async postResponse(reply?, edit?) {
    // In this page, all submissions are definitely replies.
    if (reply) {
      console.log('Replying to a response with: ', this.commentText);
      console.log('Replying to: ', this.commentTree['response']['id']);

      let data = {
        column_commentId: this.commentTree['response']['id'],
        reply: this.commentText
      }

      this.progressBar.start();
      this.isPosting = true;
      await this.questionsProvider.postAnswer('savecommentreplies', data, true).then(response => {
        if (response['error'] == 0) {
          console.log(response);
          this.events.publish('sc-update-comment-tree', this.commentTree['position']);
          this.repliesAreUpdating = true;
          this.updateCommentTree('stylecolumn');
        }
        else {
          this.componentsProvider.showToast('Cannot post reply right now. Please try again later.');
        }
      }).catch(ex => {
        console.log('Error posting reply: ', ex);
        this.componentsProvider.showToast('Cannot post reply right now. Please try again later.');
      }).then(() => {
        this.progressBar.complete();
        this.isPosting = false;
        this.commentText = '';
        this.resetFieldSize();
      });
    }

    if (edit) {
      console.log('Editing Style Column reply.');
      console.log('editingWhich: ', this.editingWhich);

      let paramData = {
        column_commentId: this.editingWhich['commentId'],
        reply: this.commentText,
        commentReplyId: this.editingWhich['id']
      }

      this.progressBar.start();
      this.repliesAreUpdating = true;
      await this.questionsProvider.editReply('savecommentreplies', paramData).then(response => {
        if (response['error'] == 0) {
          console.log('Edit okay: ', response);;
          this.events.publish('sc-update-comment-tree', this.commentTree['position']);
          this.updateCommentTree('stylecolumn');

          this.isEditing = false;
          this.repliesAreUpdating = false;
          this.editingWhich = null;
          this.commentText = null;
          this.resetFieldSize();
        }
        else {
          console.log('Error updating reply: ', response);
          this.componentsProvider.showToast('Cannot update reply at this time. Please try again.');
          this.repliesAreUpdating = false;
        }
      }).catch(ex => {
        console.log('Error updating reply: ', ex);
        this.componentsProvider.showToast('Cannot update reply right now. Please try again.');
        this.repliesAreUpdating = false;
      }).then(() => {
        this.progressBar.complete();
      });
    }

    this.resetFieldSize();
  }
  async viewUserProfile(data) {
    console.log('This profile data: ', data);
    let user = data;
    // let userData = {id: data['userId']} 
    // const profileViewModal = await this.modalCtrl.create({
    //   cssClass:"commentTreePage",
    //   mode:'ios',
    //   component: MyStylinPage,
    //   backdropDismiss: true, 
    //   componentProps:{ otherUser: userData, status: data }
    // }
    //   );
    // profileViewModal.present();
    let saveToStorage = {
      commentTree: this.commentTree,
      context: this.context
    }
    this.storage.set('temp-commentTree', saveToStorage)
    if (user.userId == this.profileInfo['id']) {
      this.navCtrl.navigateForward('/tabs/tabs/my-stylin');
      // this.navCtrl.pop().then(() => {
      // this.events.publish("changeTab", 1);
      // });
    }
    else {
      // this.navCtrl.pop().then(() => {
      let navigateExtras: NavigationExtras = {
        state: {
          otherUser: {
            id: user.userId,
            profile_about: '',
            profile_first_name: user.user_first_name,
            profile_last_name: user.user_last_name,
            profile_profile_pic: user.user_profile_pic_url
          },
          status: user,
          pop: true
        }
      }
      this.navCtrl.navigateForward('/tabs/tabs/my-stylin', navigateExtras);
      // });
    }
  }
  likeComment(item) {
    console.log('Tapped like button!', item);
    this.postsProvider.likeComment(this.profileInfo["id"], item['id'], 1).then(res => {
      if (res['error'] == 0) {
        console.log(res);
        if (item.is_liked) {
          item.is_liked = false;
          item.total_comments--;
        } else {
          item.total_comments++;
          item.is_liked = true;
        }

      } else {
        console.log('Something went wrong! ', res);
      }
    }).catch(e => {
      console.log('Something went wrong! ', e);
    })
  }
  goToPostDetails() {
    this.storage.remove('temp-commentTree').then( res =>{
      this.navCtrl.back();
    })
  }

}
