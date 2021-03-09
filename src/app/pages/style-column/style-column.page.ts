import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NavController, AlertController, ModalController, Platform, IonRefresher, IonImg, IonLabel } from '@ionic/angular';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { NgProgress, NgProgressComponent } from 'ngx-progressbar';
import { Storage } from '@ionic/storage';
import { DiscoverService } from 'src/app/services/discover/discover.service';
import { ComponentsService } from 'src/app/services/components/components.service';
import { QuestionService } from 'src/app/services/question/question.service';
import { UserService } from 'src/app/services/user/user.service';
import { EventsService } from 'src/app/services/events.service';
import { MyStylinPage } from '../tabs/my-stylin/my-stylin.page';
import { ModalMyStylinComponent } from 'src/app/component/modal-my-stylin/modal-my-stylin.component';
import { element } from 'protractor';

@Component({
  selector: 'app-style-column',
  templateUrl: './style-column.page.html',
  styleUrls: ['./style-column.page.scss'],
})
export class StyleColumnPage implements OnInit {
  @ViewChild("image", { static: false }) imageDash: IonImg;
  @ViewChild(NgProgressComponent) progressBar: NgProgressComponent;
  @ViewChild("refresherRef") refresherRef: IonRefresher;
  @ViewChild("answerField") answerField: ElementRef;
  @ViewChild("commentField") commentField: ElementRef;
  profileInfo: any;
  questionData: any;
  pageIsLoading: boolean = true;
  commentsAreLoading: boolean = true;
  isSending: boolean = false;   // flag this as true while submitting the comment/reply in order to prevent spams
  styleName: any = "";
  contextData: any;
  data: any;
  context: any;
  postedBy: any;
  isNotified: boolean = false;
  isAndroid: any;
  isLoadedProfile = false;
  showMore = true;
  subscription: any;
  error = false;
  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private router: Router,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public ngProgress: NgProgress,
    private storage: Storage,
    private discoverProvider: DiscoverService,
    private componentsProvider: ComponentsService,
    private questionsProvider: QuestionService,
    private userProvider: UserService,
    public events: EventsService,
    public platform: Platform,
  ) {
    this.subscription =  this.platform.backButton.subscribeWithPriority(10, () => {
      console.log('Back button clicked!');
      this.back();
    });
    this.isAndroid = this.platform.is('android');
    this.route.queryParams.subscribe(params => {
      let param = this.router.getCurrentNavigation().extras.state;
      if (param) {
        this.data = param.question;
        this.styleName = param.stylecolumnsCategoryName;
        this.context = param.context;
        this.contextData = param.data;
        this.isNotified = param.isNotified;
      }

      if (params && params.state) {
        let param = JSON.parse(params.state);
        if (param) {
          this.data = param.question;
          this.styleName = param.stylecolumnsCategoryName;
          this.context = param.context;
          this.contextData = param.data;
          this.isNotified = param.isNotified;
        }
      }

      if (this.data) {
        console.log(this.styleName);
        this.pageIsLoading = false;
        this.questionData = this.data;
        console.log('This question\'s data: ', this.questionData);

        this.storage.get('user').then(data => {
          this.profileInfo = data;
        });


      }
      if(!this.data){
        this.storage.get('user').then(data => {
          this.profileInfo = data;
        });
        this.storage.get('temp-question').then( question =>{
          this.questionData = question.questionData;
          this.styleName = question.styleName
            this.getResponses();
            this.getQuestionPoster(this.questionData['userId']);
        });
      }

      if (this.context) {
        this.storage.get('user').then(data => {
          this.profileInfo = data;
        });
        console.log(this.contextData['item_id'])
        this.getQuestionById(this.contextData['item_id']);
      }

      console.log('ionViewDidLoad StyleColumnPage');
      if (!this.context) {
        this.getResponses();
      }
      this.events.subscribe('sc-update-comment-tree', (commentPosition) => {
        console.log('Updating comment tree on Style Column Details for comment at position: ', commentPosition);
        this.getResponses(true, true, commentPosition);
      });

      try {
        this.getQuestionPoster(this.questionData['userId']);
      } catch (error) {
        console.log(error)
      }
    })
  }

  ngOnInit() {
  }
  ionViewDidEnter() {
    // this.getResponses();
    
  }
  async getQuestionPoster(userId) {
    await this.userProvider.getProfileInfo(userId).then(response => {
      if (response['error'] == 0) {
        console.log(response);
        let profileData = response['userinfo'];
        this.postedBy = profileData['profile_first_name'] + ' ' + profileData['profile_last_name'];
        console.log(this.postedBy);
      }
      else {
        console.log('Error on getting user profile: ', response);
      }
    }).catch(ex => {
      console.log(ex);
    });
  }
  async getQuestionById(questionId?) {
    // this.progressBar.start();
    await this.discoverProvider.getStyleColumnById(questionId, 'getstylecolumns').then(async response => {
      if (response['error'] == 0) {
        console.log('Manual question request by ID: ', response['datas']);
        this.questionData = response['datas'][0];
        await this.userProvider.getProfileInfo(response['datas'][0]['userId']).then(response => {
          if (response['error'] == 0) {
            console.log(response);
            let profileData = response['userinfo'];
            this.postedBy = profileData['profile_first_name'] + ' ' + profileData['profile_last_name'];
            console.log(this.postedBy);
            this.getResponses();
          }
          else {
            console.log('Error on getting user profile: ', response);
          }
        }).catch(ex => {
          console.log(ex);
        });
        // this.getResponses();
      }
      else {
        console.log('Error getting question data: ', response);
        this.componentsProvider.showAlert('', 'We cannot retrieve the question right now or it is remove by admin. Please try again later.');
        // this.navCtrl.pop();
        this.error = true
      }
    }).catch(getQuestionByIdError => {
      console.log('Error getting question data: ', getQuestionByIdError);
      this.componentsProvider.showAlert('', 'We cannot retrieve the question right now or it is remove by admin. Please try again later.');
      // this.navCtrl.pop();
      this.error = true
    }).then(() => {
      this.progressBar.complete();
      this.pageIsLoading = false;
    });
  }
  ionViewDidLeave() {
    this.events.destroy('sc-update-comment-tree');
    this.progressBar.complete();
  }

  viewPhoto(src, photoText?) {
    if (photoText) {
      this.componentsProvider.viewFullPhotoNew(src, photoText);
    }
    else {
      this.componentsProvider.viewFullPhotoNew(src);
    }
  }
  async goToProfile(user, fromAnswer?) {
    console.log(user);
    if (user.userId == this.profileInfo['id']) {
      // this.navCtrl.pop().then(() => {
      //   this.events.publish("changeTab", 1);
      // });
      this.navCtrl.navigateForward('/tabs/tabs/my-stylin');
    }
    else {
      let saveTostorage ={
        questionData: this.questionData,
        styleName: this.styleName
      }
      this.storage.set('temp-question',saveTostorage);
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
      // let modal = await this.modalCtrl.create({
      //   component: ModalMyStylinComponent
      //   // componentProps: 
      // });
      // modal.present();
    }
  }

  getMomentFormatFromProvider(stamp, format?) {
    if (format) {
      return this.componentsProvider.getMomentFormat(stamp, 'YYYY-MM-DD hh:mm:ss', true);
    }
    else {
      return this.componentsProvider.getMomentFormat(stamp);
    }
  }

  getMoment(stamp) {
    if (this.platform.is('ios')) {
      return this.componentsProvider.getTimestampFormat(stamp, 'YYYY-MM-DD hh:mm:ss');
    }
    else {
      return stamp;
    }
  }

  resetFieldSize(reply?) {
    // if (reply) {
    //   this.commentField.nativeElement.style.height = '24px';
    // }

    // this.answerField.nativeElement.style.height = '30px';  // reset the field's height by default
  }
  doRefresh(event) {
    this.progressBar.start();
    this.pageIsLoading = true;
    this.commentsAreLoading = true;
    this.getResponses(true).then(() => {
      event.target.complete();
      this.refresherRef.disabled = false;
    });
  }
  currentPage = 1;
  maxPages = 0;

  doInfinite(event: any) {
    this.currentPage += 1;
    console.log('Last SC parent position: ', this.lastParentPosition);

    this.progressBar.start();
    this.getResponses('infinite').then(() => {
      if (this.currentPage >= this.maxPages) {
        event.disabled = false;
      }

      event.target.complete();
    });
  }
  isReply: boolean = false;
  replyingTo: any;
  toggleReply(response, clear?) {
    // Check first if the shared context is active.
    if (Object.is(this.isEdit, true) == true) {
      this.isEdit = false;
      this.editingWhich = null;
    }

    if (clear) {
      this.replyingTo = null;
      this.isReply = false;
    }
    else {
      let responseData = response.response;
      this.replyingTo = {
        id: responseData['id'],
        name: responseData['user_first_name'],
        comment: responseData['comment']
      }

      this.isReply = true;
    }

    console.log(this.replyingTo);
  }
  isEdit: boolean = false;
  editingWhich: any;

  toggleEdit(response, clear?) {
    // Check first if the shared context is active.
    if (Object.is(this.isReply, true) == true) {
      this.isReply = false;
      this.replyingTo = null;
    }

    if (clear) {
      this.isEdit = false;
      this.editingWhich = null;
      this.commentText = '';
    }
    else {
      let responseData = response.response;
      this.editingWhich = {
        id: responseData['id'],
        comment: responseData['comment']
      }

      this.commentText = responseData['comment'];
      this.isEdit = true;
    }

    console.log(this.editingWhich);
  }

  // Present the comment tree for a particular response.
  async presentCommentTree(tree) {
    // console.log(tree);
    // let commentTreeModal = await this.modalCtrl.create(CommentTreePage, {tree: tree, context: 'stylecolumn', profile: this.profileInfo});
    // commentTreeModal.onDidDismiss(() => {
    //   console.log('Comment tree modal dismissed.');
    // });
    // await commentTreeModal.present();
    let saveTostorage ={
      questionData: this.questionData,
      styleName: this.styleName
    }
    this.storage.set('temp-question',saveTostorage);
    console.log('This profile info: ', this.profileInfo);
    let navigateExtras: NavigationExtras = {
      state: { tree: tree, context: 'stylecolumn', profile: this.profileInfo }
    }
    this.navCtrl.navigateForward(['/comment-tree'], navigateExtras);
  }

  async getResponses(refresh?, isEvent?, commentPosition?) {
    if (refresh) {
      let questionId = this.questionData['id'];
      if (refresh == 'infinite') {
        console.log('isInfiniteScroll');

        await this.questionsProvider.retrieveComments('getcomment', questionId, this.currentPage, 8).then(async response => {
          if (response['error'] == 0) {
            let parentComments = response['datas'];
            return (parentComments);
          }
          else {
            console.log('Error getting paginated responses: ', response);
            this.componentsProvider.showToast('Cannot fetch more responses at this time. Please try again later.');
          }
        }).then(parents => {
          // BLOCK FOR RETRIEVING REPLIES OF REPLIES
          if (parents) {
            let rootReplies = parents;
            let responseTree = [];

            rootReplies.forEach((root, i) => {
              this.lastParentPosition += 1;
              let data = {
                position: this.lastParentPosition,
                response: root,
                replies: [],
                maxReplyPages: 0,
                replyCount: 0
              }

              this.getChildResponses(root.id).then(response => {
                if (response['error'] == 0) {
                  let responses = response['datas'];
                  data.replies = responses;
                  data.maxReplyPages = response['total_page'];
                  data.replyCount = response['total_count'];

                }
                else {
                  console.log('Error getting child response: ', response);
                }
              }).catch(ex => {
                console.log('Error getting child response: ', ex);
              });

              responseTree.push(data);
              this.responses.push(data);
            });
          }

          // If this function is triggered by an event, publish the responding event.
          if (isEvent) {
            this.events.publish('sc-comment-tree-updated', this.responses[commentPosition]);
          }

          console.log(this.responses);
        }).catch(ex => {
          console.log('Error getting paginated parent responses: ', ex);
          this.componentsProvider.showToast('Cannot fetch more responses at this time. Please try again later.');
        }).then(() => {
          this.progressBar.complete();
        });
      }
      else {
        this.responses = [];
        this.currentPage = 1;
        this.maxPages = 0;
        this.responseCount = 0;
        this.refresherRef.disabled = false;
        this.lastParentPosition = 0;

        await this.questionsProvider.retrieveComments('getcomment', questionId, 1, 8).then(response => {
          if (response['error'] == 0) {
            this.responseCount = response['total_count'];
            console.error(this.responseCount);
            this.maxPages = response['total_page'];
            let parentComments = response['datas'];
            return (parentComments);
          }
          else {
            console.log('Error getting parent responses: ', response);
          }
        }).then(parents => {
          // BLOCK FOR RETRIEVING REPLIES OF REPLIES
          if (parents) {
            let rootReplies = parents;
            let responseTree = [];

            rootReplies.forEach((root, i) => {
              let data = {
                position: i,
                response: root,
                replies: [],
                maxReplyPages: 0,
                replyCount: 0
              }

              this.getChildResponses(root.id).then(response => {
                if (response['error'] == 0) {
                  let responses = response['datas'];
                  data.replies = responses;
                  data.maxReplyPages = response['total_page'];
                  data.replyCount = response['total_count'];
                }
                else {
                  console.log('Error getting child response: ', response);
                }
              }).catch(ex => {
                console.log('Error getting child response: ', ex);
              });

              responseTree.push(data);
              this.responses.push(data);
              this.lastParentPosition = i;
            });
          }

          // If this function is triggered by an event, publish the responding event.
          if (isEvent) {
            this.events.publish('sc-comment-tree-updated', this.responses[commentPosition]);
          }
        }).catch(ex => {
          console.log('Error getting paginated parent responses: ', ex);
          this.componentsProvider.showToast('Cannot fetch more responses at this time. Please try again later.');
        }).then(() => {
          this.progressBar.complete();
          this.pageIsLoading = false;
          this.commentsAreLoading = false;
        });
      }
    }
    else {
      // this.progressBar.start();
      await this.questionsProvider.retrieveComments('getcomment', this.questionData['id'], this.currentPage, 8).then(response => {
        if (response['error'] == 0) {
          let parentComments = response['datas'];
          this.responseCount = response['total_count'];
          console.log(this.responseCount)
          this.maxPages = response['total_page'];
          return (parentComments);
        }
        else {
          console.log('Something wrong: ', response);
        }
      }).then(parents => {
        // BLOCK FOR RETRIEVING REPLIES OF REPLIES
        if (parents) {
          let rootReplies = parents;
          let responseTree = [];

          rootReplies.forEach((root, i) => {
            let data = {
              position: i,
              response: root,
              replies: [],
              maxReplyPages: 0,
              replyCount: 0
            }

            this.getChildResponses(root.id).then(response => {
              if (response['error'] == 0) {
                let responses = response['datas'];
                data.replies = responses;
                data.maxReplyPages = response['total_page'];
                data.replyCount = response['total_count'];
              }
              else {
                console.log('Error getting child response: ', response);
              }
            }).catch(ex => {
              console.log('Error getting child response: ', ex);
            });

            responseTree.push(data);
            this.responses.push(data);
            this.lastParentPosition = i;
          });

          console.log('This Style Question\'s response tree: ', this.responseCount);
          console.log('This Style Question\'s response tree: ', this.responses);
          // if(){

          // }
          
        }

        // If this function is triggered by an event, publish the responding event.
        if (isEvent) {
          this.events.publish('sc-comment-tree-updated', this.responses[commentPosition]);
        }
      }).catch(ex => {
        console.log('Error getting comments: ', ex);
      }).then(() => {
        this.progressBar.complete();
        this.pageIsLoading = false;
        this.commentsAreLoading = false;
      });
    }
  }
  responses = [];   // container for all answers for this particular question
  responseCount = 0;
  lastParentPosition: any;
  async getChildResponses(responseId) {
    return await new Promise(resolve => {
      this.questionsProvider.retrieveReplies('getcommentreplies', responseId, 1, 8).then(response => {
        if (response['error'] == 0) {
          resolve(response);
        }
        else {
          resolve({ error: 1, trace: response });
        }
      }).catch(ex => {
        resolve({ error: 1, trace: ex, request: 'getChildResponses' });
      });
    });
  }
  myResponse: any;
  commentText: any; // shared ngModel by both replying-to and comment editing
  ionViewWillLeave() {
    this.subscription.unsubscribe();
  }
  async postResponse(reply?) {
    // Fork here if this posting is a reply to a reply.
    if (reply) {
      console.log('Replying to a response with: ', this.commentText);
      console.log('Replying to: ', this.replyingTo);

      let data = {
        column_commentId: this.replyingTo['id'],
        reply: this.commentText
      }

      this.progressBar.start();
      this.isSending = true;
      await this.questionsProvider.postAnswer('savecommentreplies', data, true).then(response => {
        if (response['error'] == 0) {
          console.log(response);
          this.getResponses();
          this.componentsProvider.showToast('Reply posted.');
        }
        else {
          this.componentsProvider.showToast('Cannot post response right now. Please try again later.');
        }
      }).catch(ex => {
        console.log('Error posting reply: ', ex);
        this.componentsProvider.showToast('Cannot post response right now. Please try again later.');
      }).then(() => {
        this.progressBar.complete();
        this.isSending = false;
        this.isReply = false;
        this.replyingTo = null;
        this.commentText = '';
        this.resetFieldSize(true);
        this.getResponses(true);
      });
    }
    else {
      if (this.myResponse) {
        let paramData = {
          columnId: this.questionData['id'],
          comment: this.myResponse
        }

        this.progressBar.start();
        this.isSending = true;
        await this.questionsProvider.postAnswer('savecomment', paramData).then(response => {
          if (response['error'] == 0) {
            this.componentsProvider.showToast('Response posted.');
            this.getResponses(true);
          }
          else {
            console.log('Something wrong: ', response);
            this.componentsProvider.showToast('Cannot post response right now. Please try again later.');
          }
        }).catch(ex => {
          console.log('Error posting answer: ', ex);
          this.componentsProvider.showToast('Cannot post response right now. Please try again later.');
        }).then(() => {
          this.isSending = false;
          this.myResponse = null;
          this.resetFieldSize();
        });
      }
    }
  }
  // Submit an edit to a response.
  async editResponse() {
    console.log('Editing comment: ', this.editingWhich);
    let data = {
      columnId: this.questionData['id'],
      comment: this.commentText,
      commentId: this.editingWhich['id']
    }

    this.progressBar.start();
    this.isSending = true;
    await this.questionsProvider.postAnswer('savecomment', data, null, true).then(response => {
      if (response['error'] == 0) {
        console.log(response);
      }
      else {
        console.log('Error in submitting edit: ', response);
        this.componentsProvider.showToast('Cannot edit response right now. Please try again later.');
      }
    }).catch(ex => {
      console.log('Error in submitting edit: ', ex);
      this.componentsProvider.showToast('Cannot edit response right now. Please try again later.');
    }).then(() => {
      this.progressBar.complete();
      this.isSending = false;
      this.isEdit = false;
      this.editingWhich = null;
      this.commentText = '';
      this.resetFieldSize(true);
      // this.getResponses(true);
      this.refresherRef.ionStart;
      this.doRefresh(this.refresherRef)
    });
  }

  // Prompt prior to delete.
  async presentDeletePrompt(response, reply?) {
    let deleteAlert = await this.alertCtrl.create({
      mode: 'md',
      header: 'Delete Response',
      cssClass: 'blockAlert',
      message: 'This cannot be undone. Are you sure you want to proceed?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => { }
        },
        {
          text: 'YES',
          handler: () => { reply ? this.deleteResponse(response, reply) : this.deleteResponse(response); }
        },
      ]
    });
    deleteAlert.present();
  }
  async deleteResponse(response, reply?) {
    console.log('Attempting to delete this response: ', response.response);

    let responseData = response.response;
    let data = {
      columnId: responseData['columnId'],
      commentId: responseData['id']
    }

    this.progressBar.start();
    await this.questionsProvider.deleteResponse('savecomment', data).then(response => {
      if (response['error'] == 0) {
        console.log(response);
      }
      else {
        console.log('Error in deletion: ', response);
        this.componentsProvider.showToast('Cannot delete response. Please try again later.');
      }
    }).catch(ex => {
      console.log('Error in deletion: ', ex);
      this.componentsProvider.showToast('Cannot delete response. Please try again later.');
    }).then(() => {
      this.progressBar.complete();
      this.getResponses(true);
    });
  }

  back() {
    this.storage.remove('temp-question').then(res =>{
      this.navCtrl.back();
    })
  }
  backDashboard() {
    this.navCtrl.navigateRoot(['/tabs/tabs/dashboard']);
  }

  isLoadedImg2(response) {
    console.log("isLoaded image...");
    if (response) {
      response.isLoadedProfile = true;
    }
  }
  errorLoadAvatar(response) {
    console.log("erorr")
    console.log(this.imageDash.src)
    response.errorImage = true;
    response.isLoadedProfile = true;
    this.imageDash.src = "/assets/css/imgs/empty-states/no-user-photo.png";
  }

  showFull(response) {
    console.log(response)
    if (response.showMore == true) {
      response.showMore = false
      // console.log("aa ", response.showMore)
    } else {
      response.showMore = true;
    }
  }

  isTruncated() {
    let el = document.getElementById('commentSection')
    console.log(el.scrollWidth > el.clientWidth) 
  }
}
