import { Component, ViewChild, OnInit } from '@angular/core';
import { NavController, LoadingController, Platform } from "@ionic/angular";
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { Device } from '@ionic-native/device/ngx';
import { Facebook } from '@ionic-native/facebook/ngx';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { ApiService } from 'src/app/services/api/api.service';
import { EventsService } from 'src/app/services/events.service';
import { ComponentsService } from 'src/app/services/components/components.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DatasourceService } from 'src/app/services/datasource/datasource.service';
import { environment } from "src/environments/environment";
import { IonRouterOutlet } from '@ionic/angular';
import { MenuController } from '@ionic/angular'
import { NavigationExtras } from '@angular/router';
import { ChatService } from 'src/app/services/chat/chat.service';
declare var cordova: any;
@Component({
	selector: 'app-login',
	templateUrl: './login.page.html',
	styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit {
	showPassword = false;
	passwordToggleIcon = 'eye';

	@ViewChild('input') myInput;

	public loginForm: FormGroup;
	passwordType = "password";
	passwordIcon = "md-eye-off";
	passwordStatus = "hide";
	is_submit: boolean = false;
	modal_page = null;
	emailExistence = true;
	public isIos: any;
	public whatPlatformVersion: any;
	isLoggedIn = false;
	versionDataNumber: any;
	users = { id: '', name: '', email: '', picture: { data: { url: '' } } };
	constructor(
		private apiService: ApiService,
		private eventService: EventsService,
		private facebook: Facebook,
		private formBuilder: FormBuilder,
		private googlePlus: GooglePlus,
		private device: Device,
		private loadingCtrl: LoadingController,
		private navCtrl: NavController,
		private storage: Storage,
		private keyboard: Keyboard,
		private platform: Platform,
		private componentService: ComponentsService,
		private authService: AuthService,
		private datasource: DatasourceService,
		private menu: MenuController,
		private routerOutlet: IonRouterOutlet,
		private chatService: ChatService
	) {

		facebook.getLoginStatus()
			.then(res => {
				console.log(res.status);
				if (res.status === 'connect') {
					this.isLoggedIn = true;
				} else {
					this.isLoggedIn = false;
				}
			}).catch(e => console.log(e));
		this.loginForm = this.formBuilder.group({
			email: [
				'',
				Validators.compose([
					Validators.required,
				])
			],
			password: [
				'',
				Validators.compose([
					Validators.minLength(8),
					Validators.required
				])
			],
		});

		this.componentService.changeStatusBarColor('#FFFFFF');

	}
	hasLoaded: boolean = true;
	ngOnInit() {

	}
	ionViewDidEnter() {
		this.routerOutlet.swipeGesture = false;
		// this.apiService.getDeviceToken().then(data =>{
		// 	this.apiService.getGuestAccessToken().then(data=>{
		// 		console.log("guess_token received: ",data);
		// 	  });
		// 	console.log("token received: ",data);
		//   });

		this.menu.enable(false, 'content')
		this.isIos = this.platform.is('ios');
		this.whatPlatformVersion = this.device.version;
		console.log(this.whatPlatformVersion)
		let versionData = parseInt(this.whatPlatformVersion);
		this.versionDataNumber = Number(versionData);
		console.log(this.versionDataNumber);
	}
	switch: boolean = true;
	tapped(e) {
		console.log(e);
		if (this.switch) {
			this.keyboard.show();
			// this.hasLoaded = false;
			this.switch = false;
			// this.hasLoaded = true;
			// setTimeout(() => {
			// 	this.showLable = true
			// },150);
		}
	}

	// togglePassword() {
	// 	if (this.passwordStatus == "hide") {
	// 		this.passwordStatus = "show";
	// 		this.passwordType = "text";
	// 		this.passwordIcon = "md-eye";
	// 	} else {
	// 		this.passwordStatus = "hide";
	// 		this.passwordType = "password";
	// 		this.passwordIcon = "md-eye-off";
	// 	}
	// }
	togglePassword(): void {
		this.showPassword = !this.showPassword;

		if (this.passwordToggleIcon == 'eye') {
			this.passwordToggleIcon = 'eye-off';
		} else {
			this.passwordToggleIcon = 'eye';
		}
	}

	isPushing = false;
	async goToRegistration() {
		if (!this.isPushing) {
			this.isPushing = true;
			await this.tokenOnDemand().then(response => {
				if (response['error'] == 0) {
					this.isPushing = false;
					this.navCtrl.navigateRoot(['/register']);
				}
			});
		}
	}

	async goToForgotPassword() {
		if (!this.isPushing) {
			this.isPushing = true;
			await this.tokenOnDemand().then(response => {
				if (response['error'] == 0) {
					this.isPushing = false;
					this.navCtrl.navigateRoot(['/forgot-password']);
				}
			});
		}

	}

	async tokenOnDemand() {
		return new Promise(resolve => {
			this.storage.get('guest_token').then(data => {
				if (data) {
					console.log('GuestAccess token is present; not requesting a new one.');
					resolve({ error: 0 });  // tokens are already present at this point so let's resolve it.
				}
				else {
					this.apiService.getDeviceToken().then(devicetoken => {
						this.apiService.getGuestAccessToken().then(guestaccesstoken => {
							resolve({ error: 0 });
						});
					});
				}
			});
		});
	}

	async login() {
		this.is_submit = true;
		console.log('LOGIN!!');
		if (this.loginForm.valid) {
			const loader = await this.loadingCtrl.create({
				cssClass: 'my-custom-class',
				message: 'Signing in...',
			});
			await loader.present();


			await this.apiService.getDeviceToken().then(devicetoken => {
				console.log('DeviceToken received. ', devicetoken);
				this.apiService.getGuestAccessToken().then(guestaccesstoken => {
					console.log('GuestAccess token received. ', guestaccesstoken);
					this.authService.auth('login', this.loginForm.value, null, guestaccesstoken).then(result => {
						/* loader.dismiss(); */

						if (result['error'] == 0) {
							this.storage.set("user", result['user']).then((data) => {
								this.storage.remove("guest_token");
								this.storage.set("user_token", result['token']).then(() => {
									// this.chatService.initChatSocket(data.id);
									if (data.user_role_id == 3) {
										console.log(data.profile_first_name);
										if (!data.username || !data.profile_first_name || !data.profile_last_name || !data.profile_gender) {
											this.navCtrl.navigateForward(['/register2']);
											console.log(data);
											loader.dismiss();
										} else {
											console.log(data);
											let navigationExtras: NavigationExtras = {
												state: {
													context: 'from login'
												}
											}
											this.navCtrl.navigateRoot(['/tabs/tabs/dashboard'], navigationExtras);
											loader.dismiss();
										}
									} else {
										console.log(data);
										let navigationExtras: NavigationExtras = {
											state: {
												context: 'from login'
											}
										}
										this.navCtrl.navigateRoot(['/tabs/tabs/dashboard'], navigationExtras);
										// this.navCtrl.setRoot(TabsPage, {}, {
										// 	animate: true,
										// 	animation: 'ios-transition',
										// 	direction: 'forward'
										//   });
										loader.dismiss();
									}
								}).catch(e => {
									console.log('error', e);
									loader.dismiss();
									this.componentService.showToast(result['message']);
								});
							}).catch(e => {
								console.log('error', e);
								loader.dismiss();
								this.componentService.showToast(result['message']);
							});
						} else if (result['error'] == 2) {
							loader.dismiss();
							this.componentService.showToast('Your account has been disabled');
						} else {
							console.log(result['error']);
							loader.dismiss();
							this.componentService.showToast(result['message']);
						}
					}).catch(e => {
						console.log('Error on login: ', e);
						loader.dismiss();
						this.componentService.showToast("Can't log in to account. Please try again.");
					});
				}).catch(ex => {
					console.log('GetGuestAccessToken error: ', ex);
				});
			}).catch(ex => {
				console.log('GetDeviceToken error: ', ex);
			});
		}
	}

	changeIsSubmit() {
		if (this.is_submit === true) {
			this.is_submit = false;
		}
	}



	loginFacebook() {
		console.log("facebook hello");
		this.facebook.logout().then(res => { }).catch(e => console.log('Error logout from Facebook', e));
		this.facebook.login(['public_profile', 'email'])
			.then(res => {
				if (res.status === 'connected') {
					console.log(res);
					this.isLoggedIn = true;
					this.getUserDetail(res.authResponse.userID);
				} else {
					this.componentService.showToast("Cannot connect to Facebook.");
					this.isLoggedIn = false;
				}
			}).catch(e => console.log('Error logging into Facebook', e));

	}

	async getUserDetail(userId) {
		const loader = await this.loadingCtrl.create({
			cssClass: 'my-custom-class',
			message: 'Signing in using Facebook...',
			duration: 2000
		});
		this.facebook.api('/' + userId + '/?fields=id,email,name,picture,first_name,last_name', ['public_profile']).then(result => {
			let facebook_details = {
				"id": result.id,
				"email": result.email,
				"name": result.name,
				"first_name": result.first_name,
				"last_name": result.last_name,
				"image_url": result.picture.data.url,
			};
			let userData = {
				'type': 'facebook',
				'social_id': result.id,
				'first_name': result.first_name,
				'last_name': result.last_name,
				'email': result.email,
				'image_url': result.picture.data.url,
				'facebook': facebook_details,
			};

			loader.present();
			console.log("userData: ", userData);
			this.apiService.getDeviceToken().then(devicetoken => {
				console.log('Device token issued: ', devicetoken);
				this.apiService.getGuestAccessToken().then(guestaccesstoken => {
					console.log('Guest Access Token issued: ', guestaccesstoken);
					this.authService.auth('sociallogin', userData).then(result => {
						loader.dismiss();
						if (result['error'] === 1) {
							console.log('Error using social login: ', result);
							this.componentService.showToast(result['message']);
						} else {
							if (!result['data']['username'] || !result['data']['profile_first_name'] || !result['data']['profile_last_name'] || !result['data']['profile_gender']) {
								/* this.storage.remove("guest_token"); */
								this.storage.set("user_token", result['token']).then(() => {
									this.datasource.changeData({ isSocial: true, social_type: 'facebook', social_details: userData });
									this.navCtrl.navigateRoot(['/register2']);
								});
							} else {
								this.storage.set("user", result['data']).then(data => {
									// Pull the current user data again.
									this.storage.get('user').then(data => {
										var socialLoginUserData = data;
										socialLoginUserData['isSocial'] = 'facebook';
										this.storage.set('user', socialLoginUserData);
									});
									this.storage.remove("guest_token");
									this.storage.set("user_token", result['token']).then(() => {
										let navigationExtras: NavigationExtras = {
											state: {
												context: 'from login'
											}
										}
										this.navCtrl.navigateRoot(['/tabs/tabs/dashboard'], navigationExtras);
									});
								});
							}
						}
					});
				}).catch(ex => {
					console.log('GetGuestAccessToken error: ', ex);
					this.componentService.showToast('Cannot login using Facebook right now.');
				});
			}).catch(ex => {
				console.log('GetDeviceToken error: ', ex);
				this.componentService.showToast('Cannot login using Facebook right now.');
			});
		}).catch(e => {
			console.log(e);
		});

	}

	async loginGoogle() {
		const loader = await this.loadingCtrl.create({
			message: 'Signing in using Google...',
		});
		try {
			this.googlePlus.logout();
		} catch (error) {
			console.log(error)
		}

		this.googlePlus.login({
			webClientId: environment.webClientId,
			offline: false
		}).then(res => {
			console.log("1", res);
			let google_details = {
				"userId": res.userId,
				"displayName": res.displayName,
				"email": res.email,
				"familyName": res.familyName,
				"givenName": res.givenName,
				"image_url": res.imageUrl,
			};
			let userData = {
				'type': 'google',
				'social_id': res.userId,
				'first_name': res.givenName,
				'last_name': res.familyName,
				'email': res.email,
				'image_url': res.imageUrl,
				'google': google_details,
			};

			loader.present();
			// await this.apiProvider.getDeviceToken().then(devicetoken => {
			//   console.log('DeviceToken received.');
			//   this.apiProvider.getGuestAccessToken().then(guestaccesstoken => {
			this.apiService.getDeviceToken().then(devicetoken => {
				this.apiService.getGuestAccessToken().then(guestaccesstoken => {
					this.authService.auth('sociallogin', userData).then(result => {
						loader.dismiss();
						if (result['error'] === 1) {
							this.componentService.showToast(result['message']);
						} else {
							if (!result['data']['username'] || !result['data']['profile_first_name'] || !result['data']['profile_last_name'] || !result['data']['profile_gender']) {
								/* this.storage.remove("guest_token"); */
								this.storage.set("user_token", result['token']).then(() => {
									this.datasource.changeData({ isSocial: true, social_type: 'google', social_details: userData });
									this.navCtrl.navigateRoot(['/register2']);
								});
							} else {
								this.storage.set("user", result['data']).then(data => {
									// Pull the current user data again.
									this.storage.get('user').then(data => {
										var socialLoginUserData = data;
										socialLoginUserData['isSocial'] = 'google';
										this.storage.set('user', socialLoginUserData);
									});
									this.storage.remove("guest_token");
									this.storage.set("user_token", result['token']).then(() => {
										this.navCtrl.navigateRoot(['/tabs/tabs/dashboard']);
									});
								});
							}
						}
					}).catch(ex => {
						console.log('Error in social login: ', ex);
					});
				}).catch(ex => {
					console.log('GetGuestAccessToken error: ', ex);
					this.componentService.showToast('Cannot login using Google right now.');
				});
			}).catch(ex => {
				console.log('GetDeviceToken error: ', ex);
				this.componentService.showToast('Cannot login using Google right now.');
			});
		}).catch(e => {
			console.log(e);
			if (e == 'cordova_not_available') {
				this.componentService.showToast(e);
			}
		});
	}

	async loginApple() {
		if (this.platform.is('ios')) {
			const loader = await this.loadingCtrl.create({
				message: 'Signing in using Apple account...',
			});
			await cordova.plugins.SignInWithApple.signin(
				{ requestedScopes: [0, 1] },
				(succ) => {
					console.log("success: ", succ);
					let formData = {
						'autorizationCode': succ.authorizationCode,
						'email': succ.email,
						'first_name': succ.fullName.givenName,
						'last_name': succ.fullName.familyName,
						'identityToken': succ.identityToken,
						'state': succ.state,
						'user': succ.user
					};

					loader.present();
					this.apiService.getDeviceToken().then(devicetoken => {
						this.apiService.getGuestAccessToken().then(guestaccesstoken => {
							this.authService.saveAppple(formData).then((res: any) => {
								console.log("result: ", res);
								if (res['error'] == 0) {
									let userData = {
										'type': 'apple',
										'social_id': res.data.user,
										'name': res.data.first_name + ' ' + res.data.last_name,
										'first_name': res.data.first_name,
										'last_name': res.data.last_name,
										'email': res.data.email,
										'image_url': '',
										'apple': JSON.stringify(formData),
									};
									this.authService.auth('sociallogin', userData).then(result => {
										loader.dismiss();
										if (result['error'] === 1) {
											this.componentService.showToast(result['message']);
										} else {
											if (!result['data']['username'] || !result['data']['profile_first_name'] || !result['data']['profile_last_name'] || !result['data']['profile_gender']) {
												/* this.storage.remove("guest_token"); */
												this.storage.set("user_token", result['token']).then(() => {
													this.datasource.changeData({ isSocial: true, social_type: 'apple', social_details: userData });
													this.navCtrl.navigateRoot(['/register2']);
												});
											} else {
												this.storage.set("user", result['data']).then(data => {
													// Pull the current user data again.
													this.storage.get('user').then(data => {
														var socialLoginUserData = data;
														socialLoginUserData['isSocial'] = 'apple';
														this.storage.set('user', socialLoginUserData);
													});

													this.storage.remove("guest_token");
													this.storage.set("user_token", result['token']).then(() => {
														localStorage.removeItem('temp_apple_id');
														this.storage.set("user_token", result['token']).then(() => {
															this.navCtrl.navigateRoot(['/tabs/tabs/dashboard']);
														});
													});
												});
											}
										}
									}).catch(ex => {
										console.log('Error in social login: ', ex);
									});
								} else {
									this.componentService.showToast(res['message']);
								}

							}).catch(e => {
								console.log(e);
							});
						}).catch(ex => {
							console.log('GetGuestAccessToken error: ', ex);
							this.componentService.showToast('Cannot login using Apple right now.');
						});
					}).catch(ex => {
						console.log('GetDeviceToken error: ', ex);
						this.componentService.showToast('Cannot login using Apple right now.');
					});


				},
				(err) => {
					console.error(err)
					console.log(JSON.stringify(err))
				}
			);

		} else {
			console.log("its not a ios platform");
		}
	}

}
