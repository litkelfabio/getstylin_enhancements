import { NgModule } from '@angular/core';
import { BrowserModule,BrowserTransferStateModule, TransferState } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouteReuseStrategy } from '@angular/router';
import { FCM } from 'cordova-plugin-fcm-with-dependecy-updated/ionic/ngx';
//import {  FCM } from '@ionic-native/fcm/ngx'
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { Facebook } from '@ionic-native/facebook/ngx';
import { IonicStorageModule } from '@ionic/storage';
import { Network } from "@ionic-native/network/ngx";
import { HttpClientModule } from '@angular/common/http';
import { File } from '@ionic-native/file/ngx';

import { NgxImageCompressService } from 'ngx-image-compress';
import { ImagePicker } from '@ionic-native/image-picker/ngx';

import { Device } from '@ionic-native/device/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { CacheModule } from "ionic-cache";

import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';

import {  NgProgressModule } from 'ngx-progressbar';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { Camera } from '@ionic-native/camera/ngx';
// import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { PipesModule } from './pipes/pipes.module';

import { NgxMasonryModule } from 'ngx-masonry';
import { EditPostModalComponent } from './components/modals/edit-post-modal/edit-post-modal.component';
import { PostDetailsComponent } from './components/modals/post-details/post-details.component';
import { SkipModalComponent } from './components/modals/skip-modal/skip-modal.component';
import { LikesDislikesComponent } from './components/modals/likes-dislikes/likes-dislikes.component';

import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Instagram } from '@ionic-native/instagram/ngx';
import { TutorialModalComponent } from './components/modals/tutorial-modal/tutorial-modal.component';
import { TutorialPopoverComponent } from './components/modals/tutorial-popover/tutorial-popover.component';
import { TutorialComponent } from './components/modals/tutorial/tutorial.component';
import { FilePath } from '@ionic-native/file-path/ngx';
import { TutorialPage } from './pages/tutorial/tutorial/tutorial.page';
import { JoinModalComponent } from './components/modals/join-modal/join-modal.component';
import { MessageUserComponent } from './components/modals/message-user/message-user.component';
//import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { QRCodeModule } from 'angularx-qrcode';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommentTreePage } from './pages/comment-tree/comment-tree/comment-tree.page';
import { BirthdayModalComponent } from './components/modals/birthday-modal/birthday-modal.component';
import { MessageModalComponent } from './components/modals/message-modal/message-modal.component';

import { TagInputModule } from 'ngx-chips';

import { ConnectFriendsModalComponent } from './connect-friends-modal/connect-friends-modal.component';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { QuestionModalComponent } from './components/modals/question-modal/question-modal.component';
import { Crop } from '@ionic-native/crop/ngx';
import { ImageCropperModule } from 'ngx-image-cropper';

import { ImageCropperPageModule } from './components/modals/image-cropper/image-cropper.module';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { ConvoOptionModalComponent } from './component/modals/convo-option-modal/convo-option-modal.component';
import { NgxIonicImageViewerModule } from 'ngx-ionic-image-viewer';
import { PostPageModule } from '../app/pages/post/post.module';
import { Market } from '@ionic-native/market/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { ModalMyStylinComponent } from './component/modal-my-stylin/modal-my-stylin.component';

import { Adjust} from '@ionic-native/adjust/ngx';
import { MediaCapture} from '@ionic-native/media-capture/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';


@NgModule({
 
  declarations: [
    AppComponent,EditPostModalComponent,
    PostDetailsComponent,
    SkipModalComponent,
    LikesDislikesComponent,TutorialModalComponent, 
    TutorialPopoverComponent, 
    TutorialPage,
    JoinModalComponent,
    MessageUserComponent,
    BirthdayModalComponent,
    MessageModalComponent,
    ConnectFriendsModalComponent,
    QuestionModalComponent,
    ConvoOptionModalComponent,
    TutorialComponent,
    ModalMyStylinComponent
    // ImageCropperPageModule
  ],
    
  entryComponents: [
    EditPostModalComponent,
    PostDetailsComponent,
    SkipModalComponent,
    LikesDislikesComponent,
    TutorialModalComponent, 
    TutorialPopoverComponent, 
    TutorialComponent,
    TutorialPage,
    MessageUserComponent,
    JoinModalComponent,
    BirthdayModalComponent,
    MessageModalComponent,
    ConnectFriendsModalComponent,
    ConvoOptionModalComponent,
    QuestionModalComponent,
    ModalMyStylinComponent
    // ImageCropperPageModule
  ],
  imports: [BrowserModule,NgxMasonryModule, IonicModule.forRoot({
  //tabsHideOnSubPages:  "false",
  mode:  "ios",
  backButtonText:  "",
  backButtonIcon:  "",
  infiniteLoadingSpinner:  "crescent",
  loadingSpinner:  "crescent",
  refreshingSpinner:  "crescent",
  spinner:  "crescent",
  }),PipesModule,
  NgxIonicImageViewerModule,
  ImageCropperModule,
  
  PipesModule.forRoot(),AppRoutingModule,
  IonicStorageModule.forRoot(),
  HttpClientModule, 
  FormsModule, 
  ReactiveFormsModule,CacheModule.forRoot(),
  NgProgressModule,
  NgCircleProgressModule.forRoot({
    // set defaults here
    // radius: 100,
    innerStrokeColor:'grey',
    // animationDuration: 300,
    outerStrokeColor:'white',
    showInnerStroke:true,
    //showUnits:false,
    innerStrokeWidth: 5,
    space:-5,
    titleColor:'white',
    unitsColor:'white'
  }), 
  QRCodeModule,
  BrowserAnimationsModule,
  TagInputModule,
  
],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    Facebook,
    FCM,
    Network,
    File,
    NgxImageCompressService,
    BrowserModule, 
    Device,
    Keyboard,
    FileTransfer,
    GooglePlus,
    ImagePicker,
    WebView,
    Camera,
    SocialSharing,
    Instagram,
    FilePath,
    Clipboard,
    Crop,
    InAppBrowser,
    Market,
    AppVersion,
    Adjust,
    MediaCapture,
    AndroidPermissions
   // BarcodeScanner
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
