import { Injectable } from '@angular/core';
import { Platform, ToastController, AlertController } from "@ionic/angular";
import { EventsService } from "../../services/events.service";
import { Storage } from '@ionic/storage';
import { File } from '@ionic-native/file/ngx';
import { ModalController } from '@ionic/angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxImageCompressService } from 'ngx-image-compress';
import * as moment from 'moment';
import { ViewerModalComponent } from 'ngx-ionic-image-viewer';

// import { ConnectionRequestsPage } from './../../pages/connection-requests/connection-requests';
// import { PostDetailsPage } from './../../pages/post/post-details/post-details';
// import { DiscoverInnerPage } from './../../pages/main/discover-inner/discover-inner';
import  JwtDecode, * as JWT from 'jwt-decode';
declare var PIXI: any;

@Injectable({
  providedIn: 'root'
})
export class ComponentsService {
  generic_error_msg = "Something went wrong. Please try again.";
	offlineMessage = 'You are offline. Your request cannot be processed at this time.';
	network_status: any;
	currentPlatform = '';
  private win: any = window;
  // CACHE/STORAGE IDENTIFIER NAMES
	/*
		dashboardListingCacheId: posts listing in Dashboard
		notificationCacheId: notifications listing in Notifications
		convoInboxListingCacheId: inbox listing in Messages
		stylistsCacheId: stylists listing in Discover > Stylists
		eventsListingCacheId: events listing in Discover > Events
		eventsByCityListingCacheId: events listing by City in Discover > Events
		styleColumnCategoryListingCacheId: style column category listing in Discover > Style Column
		styleColumnGenListingCacheId: style question listing in Dashboard > Style Column
		tagsListingCacheId: tags listing in Discover > Tags
		stylesListingCacheId: styles listing in Discover > Styles
		tosCacheId: Terms of Service
		privCacheId: Privacy Policy

		postDetailsCacheId: post details for post ID 'x'
		convoMessagesCacheId: conversation messages for convo ID 'x'
		userProfileCacheId: user profile data for user ID 'x'
		userPostsCacheId: user post data for user ID 'x'
		userFavesCacheId: user faves data for user ID 'x'
		styleColumnSingleCategoryListingCacheId: style question listing for Style Column category 'x'
		tagsPostListingCacheId: tagged posts listing for tag 'x' in Discover > Tags
		stylesPostListingCacheId: style posts listing for style 'x' in Discover > Styles
		eventDetailsCacheId: event details for event ID 'x'
	*/
	dashboardListingCacheId = 'dashboard';
	notificationCacheId = 'notifications';
	convoInboxListingCacheId = 'conversations';
	stylistsCacheId = 'stylists';
	eventsListingCacheId = 'events';
	eventsByCityListingCacheId = 'eventsCity';
	styleColumnCategoryListingCacheId = 'stylecolumnCategories'
	styleColumnGenListingCacheId = 'stylecolumnAll';
	tagsListingCacheId = 'tags';
	stylesListingCacheId = 'styles';
	tosCacheId = 'tos';
	privCacheId = 'priv';

	postDetailsCacheId = 'post-';
	convoMessagesCacheId = 'cnvMessages-';
	userProfileCacheId = 'userProfile-';
	userPostsCacheId = 'userPosts-';
	userFavesCacheId = 'userFaves-';
	styleColumnSingleCategoryListingCacheId = 'stylecolumnCategory-';
	tagsPostListingCacheId = 'taggedPosts-';
	stylesPostListingCacheId = 'stylePosts-';
	eventDetailsCacheId = 'event-';
	eventByCityCacheId = 'eventCity-';

  constructor(
    private toastCtrl: ToastController,
		private alertCtrl: AlertController,
		public platform: Platform,
		private events: EventsService,
		private statusBar: StatusBar,
		private sanitizer: DomSanitizer,
		private file: File,
		private storage: Storage,
		private imageCompress: NgxImageCompressService,
		
		public modalController: ModalController,
  ) { 
    console.log('ComponentsProvider ready.');
		if (this.platform.is('ios')) {
			this.currentPlatform = 'ios';
		}
		else {
			this.currentPlatform = 'android';
		}
		console.log(this.currentPlatform);

		if (!document.URL.startsWith('http') || document.URL.startsWith('http://localhost:80') === true) {
			if (this.platform.is('cordova') || this.platform.is('android') || this.platform.is('ios')) {
				
				// this.network.onChange().subscribe((data:any) => {
				// 	console.log("data: ",data);
				// 	// this.network_status = data.type;
				// 	// if (this.network_status === 'offline') {
				// 	// 	this.generic_error_msg = 'You are offline. Your request cannot be processed at this time.';
				// 	// }
				// 	// else {
				// 	// 	this.generic_error_msg = "Something went wrong. Please try again.";
				// 	// }

				// 	// // Publish this event so that the auth provider could anticipate offline/online states.
				// 	// this.events.publish('network-changed', this.network_status);
				// },error => { console.log("Error: ",error)});

				this.events.subscribe('app:connection', (status) => {
					console.log('Network event fired: ', status);
					if (status === 'connected') {
						this.showNetworkToast('You are online.', 'online');
					}
					else {
						this.showNetworkToast('You are offline. Some features may be unavailable.', 'offline');
					}
				});
			}
		}
		else {
			console.log('Served from browser; not subscribing to network events.');
		}
  }
  async showToast(message, css?) {
		let options;
		if(css){
			options = {
				message: message,
				position: "top",
				duration: 3000,
				cssClass: css,
				mode: 'ios'
			};
		} else{
			options = {
				message: message,
				position: "top",
				duration: 3000,
				mode: 'ios'
			};
		}
    this.toastCtrl.create(options).then(data=>{
		data.present();
	});
    
	}

	async showNotificationToast(fcmData?, message?, css?) {
		let options;
		if (css) {
			options = {
				animated:true,
				message: message,
				position: 'top',
				mode: 'ios',
				duration: 5000,
				cssClass: css,
				buttons: [
					{
					  side: 'end',
					  text: 'View',
					  role: 'close',
					  handler: () => {
						console.log("go to notified page...")
					  }
					}
				  ]
			}
		}
		else {
			options = {
				animated:true,
				message: message,
				position: 'top',
				mode: 'ios',
				duration: 5000,
				buttons: [
					{
					  side: 'end',
					  text: 'View',
					  role: 'close',
					  handler: () => {
						console.log("go to notified page...");
					  }
					}
				  ]
			}
		}

    this.toastCtrl.create(options).then(data=>{
		data.present();
		data.onDidDismiss().then((res:any) =>{
			if (res.role == 'close') {
				console.log(fcmData, res.role);
				this.events.publish('notification-toast-dismissed', fcmData);
			}
			else {
				console.log('Toast is dismissed by timeout.');
			}
		})
		// data.onDidDismiss().then(data,role)=>{
		// 	if (role == 'close') {
		// 		console.log(fcmData, role);
		// 		this.events.publish('notification-toast-dismissed', fcmData);
		// 	}
		// 	else {
		// 		console.log('Toast is dismissed by timeout.');
		// 	}
		// });
	});
	}

	decodedToken(token){
		let decodedToken = JwtDecode(token);
		return decodedToken;
	}
  showNetworkToast(message, css?) {
		let options;
		if(css){
			options = {
				message: message,
				position: "top",
				duration: 5000,
				cssClass: css,
        mode: 'ios',
        showCloseButton: false,
			};
		} else{
			options = {
				message: message,
				position: "top",
				duration: 5000,
        mode: 'ios',
        cssClass:css,
        showCloseButton: false,
			};
		}
    this.toastCtrl.create(options).then(data=>{
		data.present();
	});
	}


	showAlert(title, message, socialPlatform?, css?) {
		let alert;
		let options;
		if (css) {
			// handle alert prompts with classes passed
		}
		else {
			let appLink;
			if (socialPlatform) {
				if (this.platform.is('android')) {
					// handle Play Store linking for Android
				}
				else if (this.platform.is('ios')) {
					// handle App Store linking for iOS
				}
				else {
					// handle app store linking for everything else
					switch (socialPlatform) {
						case 'facebook':
							appLink = 'https://play.google.com/store/apps/details?id=com.facebook.katana&hl=en';
							break;

						case 'instagram':
							appLink = 'https://play.google.com/store/apps/details?id=com.instagram.android&hl=en';
							break;

						case 'twitter':
							appLink = 'https://play.google.com/store/apps/details?id=com.twitter.android&hl=en';
							break;

						case 'email':
							appLink = 'https://play.google.com/store/apps/details?id=com.google.android.gm&hl=en';
							break;

						default:
							console.log('No platform stated: cannot determine link.');
					}
				}
			}
			options = {
				title: title,
				mode: "md",
				message: message,
				buttons: [
					{
						text: 'Okay',
						handler: () => {}
					}
				]
			}
		}

		alert = this.alertCtrl.create(options).then(data=>{
			data.present();
		});
	
	}

	getGenderLabel(genderId) {
		let label = 'Male';
		switch (genderId) {
			case '1': label = 'Male'; break;
			case '2': label = 'Female'; break;
			case '3': label = 'Other'; break;
			default: label = 'Other'; break;
		}
		return label;
	}

	getMomentFormat(date, format?, isFullDate?) {
    if (format && !isFullDate) {
      // return moment(date).format(format);
			return moment(date, format).format('YYYY-MM-DD');
    } else if (format && isFullDate && isFullDate != 'message') {
			return moment(date, format).format('MMMM DD, YYYY');
		}
		else if (format && isFullDate == 'message') {
			return moment(date, 'YYYY-MM-DD hh:mm:ss').format(format);
		}
		else {
      return moment(date, 'MM/DD/YYYY').format();
    }
  }

	getTimestampFormat(date, format?) {
		if (format) {
			return moment(date, format).format();
		}
		else {
			return moment(date, 'YYYY-MM-DD').format();
		}
	}

	getBirthdateMoment(date, format?) {
		if (format) {
			return moment(date, format).format();
		}
		else {
			return moment(date, 'MM-DD-YYYY').format();
		}
	}

	changeStatusBarColor(hexCode) {
		this.statusBar.backgroundColorByHexString(hexCode);
	}

	trustMe(url) {
		if (this.platform.is('ios')) {
			let trustedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.win.Ionic.WebView.convertFileSrc(url));
		
			return trustedUrl;
		}
		else {
			console.log('You are not on iOS. I trust you now.');
			return this.win.Ionic.WebView.convertFileSrc(url);
		}
	}

	separatePoints(points:number) {
		return points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	async viewFullPhotoNew(src, photoText?, filter?){
		const modal = this.modalController.create({
			component: ViewerModalComponent,
			componentProps: {
			  src: src,
			  filter:filter ? filter : [],
			  text:photoText ? photoText : '' 
			},
			cssClass: 'ion-img-viewer',
			keyboardClose: true,
			showBackdrop: true,
		  });
	  
		  return (await modal).present();
	}
	viewFullPhoto(src, photoText?) {
		// let viewerOptions = {share: false,copyToReference: true,closeButton: false}
		// this.photoViewer.show(src, photoText, viewerOptions);
	}

	/*
		CURRENTLY UNUSED; KEPT FOR LEGACY PURPOSES OR POTENTIAL REUSE.
		Rotation draw specifically for new Posts. This is separated from the Share's
		draw function so that they may not conflict with one another as that function
		takes additional parameters for filters.
	*/
	stage: any;
	renderer: any;
	fairyRotate(imageSrc, rotationAngle) {
		console.log('Rotate image data: ', imageSrc);
		console.log('Rotation angle: ', rotationAngle);

		let rendererWidth = imageSrc.naturalWidth;
		let rendererHeight = imageSrc.naturalHeight;

		return new Promise(resolve => {
			try {
				this.stage = new PIXI.Container();
				// var renderer;

				// Before setting a renderer, determine if the rotate is
				// horizontal or vertical.
				if (rotationAngle == 90 || rotationAngle == 270) {
					// The rotation is horizontal.
					this.renderer = PIXI.autoDetectRenderer({
						transparent: true,
						width: rendererHeight,
						height: rendererWidth,
						resolution: 1,
						preserveDrawingBuffer: true
					});
				}
				else {
					// The rotation is vertical.
					this.renderer = PIXI.autoDetectRenderer({
						transparent: true,
						width: rendererWidth,
						height: rendererHeight,
						resolution: 1,
						preserveDrawingBuffer: true
					});
				}

				let src = imageSrc;
				let pixSprite;
				let pixTexture = new PIXI.Texture(new PIXI.BaseTexture(src));
				console.log('PixTexture: ', pixTexture);
				pixSprite = new PIXI.Sprite(pixTexture);
				console.log('pixSprite: ', pixSprite);

				pixSprite.angle = rotationAngle;
				pixSprite.anchor.x = 0.5;
				pixSprite.anchor.y = 0.5;

				// Adjust position depending on rotate angle.
				if (rotationAngle == 90 || rotationAngle == 270) {
					pixSprite.position.x = rendererHeight / 2;
					pixSprite.position.y = rendererWidth / 2;
				}
				else {
					pixSprite.position.x = rendererWidth / 2;
					pixSprite.position.y = rendererHeight / 2;
				}

				this.stage.addChild(pixSprite);

				var canvasData = this.renderer.view.toDataURL('image/png');
				resolve({error: 0, message: 'PixiJS rotate completed.', canvas: canvasData});

				// loader.add('srcImg', src);
				// loader.load((loader, resources) => {
				// 	// pixSprite = PIXI.Sprite.from(src);
				// 	console.log(loader, resources);
				//
				// });
			}
			catch (fairyRotateError) {
				resolve({error: 1, trace: fairyRotateError, request: 'fairyRotate'});
			}
		});
	}

	update() {
		// window.requestAnimationFrame(this.update());
		this.renderer.render(this.stage);
	}

	// Compress image
	photoCompress(imageUri) {
		return new Promise(resolve => {
			console.log('File URI received by componentsProvider: ', imageUri);

			var srcPath = imageUri['path'];
			var dirSplit = srcPath.lastIndexOf('/');
			var nameSplit = srcPath.lastIndexOf('g');
			var dirPath = srcPath.slice(0, dirSplit + 1);
			var fileName = srcPath.slice(dirSplit + 1, nameSplit + 1);
			console.log('Constructed path: ', dirPath, fileName);

			this.file.readAsDataURL(dirPath, fileName).then(response => {
				var imgData = response;

				this.imageCompress.compressFile(imgData, 1, 75, 75).then(result => {
					var compressedImg = result;
					resolve({error: 0, compressedImg: compressedImg});
				}).catch(compressError => {
					resolve({error: 1, trace: compressError, request: 'photoCompress - compressFile'});
				});
			}).catch(ex => {
				resolve({error: 1, trace: ex, request: 'photoCompress - readAsBase64'});
			});
		});
	}

	photoCompressDefault(imageUri) {
		return new Promise(resolve => {

			
			console.log('File URI received by componentsProvider: ', imageUri);

			// var srcPath = imageUri['path'];
			// var dirSplit = srcPath.lastIndexOf('/');
			// var nameSplit = srcPath.lastIndexOf('g');
			// var dirPath = srcPath.slice(0, dirSplit + 1);
			// var fileName = srcPath.slice(dirSplit + 1, nameSplit + 1);
			// console.log('Constructed path: ', dirPath, fileName);

			this.imageCompress.compressFile(imageUri, 1, 75, 50).then(result => {
				var compressedImg = result;
				resolve({error: 0, compressedImg: compressedImg});

			// this.file.readAsDataURL(dirPath, fileName).then(response => {
			// 	var imgData = response;

			// 	this.imageCompress.compressFile(imgData, 1, 75, 50).then(result => {
			// 		var compressedImg = result;
			// 		resolve({error: 0, compressedImg: compressedImg});
			// 	}).catch(compressError => {
			// 		resolve({error: 1, trace: compressError, request: 'photoCompress - compressFile'});
			// 	});
			}).catch(ex => {
				resolve({error: 1, trace: ex, request: 'photoCompress - readAsBase64'});
			});
		});
	}



	// Convert a file to base64.
	encodeToBase64(file) {
		return new Promise(resolve => {
			let src = file;
			let dirSplit = file.lastIndexOf('/');
			let nameSplit = file.lastIndexOf('g');
			let dirPath = file.slice(0, dirSplit + 1);
			let fileName = file.slice(dirSplit + 1, nameSplit + 1);

			this.file.readAsDataURL(dirPath, fileName).then(response => {
				resolve({error: 0, b64: response});
			}).catch(ex => {
				console.log('Error reading as data URL from Edit: ', ex);
				resolve({error: 1, trace: ex, request: 'encodeToBase64 (promptModal - edit)'});
			});
		});
	}

	// Convert a base64 data URL to a file.
	b64toBlob(b64Data, contentType, sliceSize=512) {
		return new Promise(resolve => {
			try {
				var splitData = b64Data.split(',')[1];
				var byteCharacters = atob(splitData);
		    var byteArrays = [];

		    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
		      var slice = byteCharacters.slice(offset, offset + sliceSize);

		      var byteNumbers = new Array(slice.length);
		      for (let i = 0; i < slice.length; i++) {
		        byteNumbers[i] = slice.charCodeAt(i);
		      }

		      var byteArray = new Uint8Array(byteNumbers);
		      byteArrays.push(byteArray);
		    }

		    var blob = new Blob(byteArrays, {type: contentType});
		    // return (blob);
				resolve({error: 0, generatedBlob: blob});
			}
			catch (blobError) {
				resolve({error: 1, trace: blobError, request: 'b64toBlob'});
			}
		});
  }
  b64toBlobNew(b64Data, contentType='', sliceSize=512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
  }
  
//if the photo is pick 2 times
  b64toBlobNew2(b64Data, contentType='', sliceSize=512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
  }

//
	// Loads data from cache depending on cache ID requested.
	loadDataFromCache(cacheId) {
		return new Promise(resolve => {
			this.storage.get(cacheId).then(data => {
				if (data) {
					resolve({error: 0, cachedData: data});
				}
				else {
					resolve({error: 1, cachedData: null});
				}
			});
		});
	}
}
