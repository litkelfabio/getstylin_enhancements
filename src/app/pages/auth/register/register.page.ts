import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import { NavController, LoadingController, Platform, } from "@ionic/angular";
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { Device } from '@ionic-native/device/ngx';
import { Facebook } from '@ionic-native/facebook/ngx';
import { GooglePlus } from '@ionic-native/google-plus/ngx';

// import { ActivatePage } from './../activate/activate';
// import { RegisterPage } from './../register/register';
// import { Register2Page } from './../register2/register2';
// import { ForgotPasswordPage } from './../forgot-password/forgot-password';

// import { TabsPage } from './../../components/tabs/tabs';

// import { SignInWithApple,AppleSignInResponse, AppleSignInErrorResponse, ASAuthorizationAppleIDRequest, SignInWithAppleOriginal } from '@ionic-native/sign-in-with-apple';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { ApiService } from 'src/app/services/api/api.service';
import { EventsService } from 'src/app/services/events.service';
import { ComponentsService } from 'src/app/services/components/components.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router, NavigationExtras } from '@angular/router';
import { DatasourceService } from 'src/app/services/datasource/datasource.service';
import { environment } from "src/environments/environment";

import { IonRouterOutlet } from '@ionic/angular';
import { UserService } from 'src/app/services/user/user.service';
declare var cordova: any;
@Component({
	selector: 'app-register',
	templateUrl: './register.page.html',
	styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

	//   @ViewChild('input') input: ElementRef;
	public registrationForm: FormGroup;
	passwordType = ["password", "password"];
	passwordIcon = ["eye-off", "eye-off"];
	passwordStatus = ["hide", "hide"];

	showPassword = false;
	showConfirmPassword = false;
	passwordToggleIcon = 'eye';
	confirmPasswordtoggleIcon = 'eye';
	emailExistence: any;
	usernameExistence: any;
	pushTermsModal: any;
	pushPrivacyModal: any;
	isLoggedIn = false;
	isIos:any;
	versionDataNumber:any;
	e: any;
	users = { id: '', name: '', email: '', picture: { data: { url: '' } } };
	public whatPlatform: any;
	public whatPlatformVersion: any;
	constructor(
		private routerOutlet: IonRouterOutlet,
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
		private router: Router,
		private datasource: DatasourceService,
		private userService: UserService
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

	}

	ngOnInit() {
		this.routerOutlet.swipeGesture = false;
		this.registrationForm = this.formBuilder.group({
			email: [
				'',
				Validators.compose([
					Validators.required,
					Validators.pattern(/(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i)
				])
			],
			password: [
				'',
				Validators.compose([
					Validators.minLength(8),
					Validators.required
				])
			],
			confirm_password: [
				''
			],
			referral_code: [
				'',
				Validators.compose([
					Validators.minLength(6),
					Validators.maxLength(6),
				])
			],
		}, {
			validator: [this.authService.MatchPassword]
		});
		console.log('ionViewDidLoad RegistrationPage');

		this.isIos = this.platform.is('ios');
		this.whatPlatformVersion = this.device.version;
		console.log(this.whatPlatformVersion)
		let versionData = parseInt(this.whatPlatformVersion);
		this.versionDataNumber = Number(versionData);
		console.log(this.versionDataNumber);
		// let versionData = this.whatPlatformVersion.split('.');
		//  this.versionDataNumber = Number(versionData[0]);
	}
	togglePassword(num: any) {
		// if (this.passwordStatus[num] == "hide") {
		// 	this.passwordStatus[num] = "show";
		// 	this.passwordType[num] = "text";
		// 	this.passwordIcon[num] = "eye";
		// } else {
		// 	this.passwordStatus[num] = "hide";
		// 	this.passwordType[num] = "password";
		// 	this.passwordIcon[num] = "eye-off";
		// }

		this.showPassword = !this.showPassword;

		if (this.passwordToggleIcon == 'eye') {
			this.passwordToggleIcon = 'eye-off';
		} else {
			this.passwordToggleIcon = 'eye';
		}
	}

	toggleConfirmPassword() {
		this.showConfirmPassword = !this.showConfirmPassword;

		if (this.confirmPasswordtoggleIcon == 'eye') {
			this.confirmPasswordtoggleIcon = 'eye-off';
		} else {
			this.confirmPasswordtoggleIcon = 'eye';
		}
	}
	register() {
		// let navigationExtras: NavigationExtras = {
		// 	state: {
		// 		type:'register',registration:this.registrationForm.value
		// 	}
		//   };
		this.datasource.changeData({ isSocial: false, registration: this.registrationForm.value });
		this.navCtrl.navigateRoot(['/register2']);
	}
	showMaxLength: boolean = true;
	validateInfo(email: String) {
		console.log(email.length);

		if (email.length < 60) {
			this.showMaxLength = true;
		}

		if (email.length == 60) {
			if (this.showMaxLength) {
				this.componentService.showToast(
					"You reach the maximum length for email"
				);
				this.showMaxLength = false;
			}

		}

		if (email.includes("..")) {
			this.registrationForm.controls["email"].setErrors({ pattern: true });
		}

		if (this.registrationForm.controls['email'].valid) {
			this.authService.auth("validateemail", { email: email }).then(data => {
				console.log(data);
				if (data["error"] == 0) {
					this.emailExistence = false;
				} else {
					this.emailExistence = true;
				}
			});
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
										this.navCtrl.navigateRoot(['/tabs/tabs/dashboard']);
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
			console.log(error);
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

	goToLogIn() {
		this.navCtrl.navigateRoot(['/login'])
	}

	// validateRefferal(refCode){
	// 	let formData = new FormData();
	// 	console.log("REFCODE: ", refCode);
	// 	formData.append('unique_id', refCode)

	// 	this.apiService.getDeviceToken().then( devicetoken=>{
	// 		this.apiService.getGuestAccessToken().then( guestToken =>{
	// 			this.userService.validateReferral({'unique_id': refCode}).then( res =>{
	// 				console.log("RES: ", res)
	// 			});
	// 		})
	// 	})
	// }
}
