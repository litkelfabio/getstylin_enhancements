import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
 
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/auth/login/login.module').then( m => m.LoginPageModule)
  },
  // {
  //   path: '',
  //   redirectTo: '/home',
  //   pathMatch: 'full'
  // },
  {
    path: 'forgot-password',
    loadChildren: () => import('./pages/auth/forgot-password/forgot-password.module').then( m => m.ForgotPasswordPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/auth/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'register2',
    loadChildren: () => import('./pages/auth/register2/register2.module').then( m => m.Register2PageModule)
  },
  {
    path: 'register-agreements',
    loadChildren: () => import('./pages/auth/register-agreements/register-agreements.module').then( m => m.RegisterAgreementsPageModule)
  },
  {
    path: 'register3',
    loadChildren: () => import('./pages/auth/register3/register3.module').then( m => m.Register3PageModule)
  },
  {
    path: 'tabs',
    loadChildren: () => import('./pages/tabs/tabs/tabs.module').then( m => m.TabsPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/tabs/dashboard/dashboard.module').then( m => m.DashboardPageModule)
  },
  {
    path: 'my-stylin',
    loadChildren: () => import('./pages/tabs/my-stylin/my-stylin.module').then( m => m.MyStylinPageModule)
  },
  {
    path: 'rewards',
    loadChildren: () => import('./pages/tabs/rewards/rewards.module').then( m => m.RewardsPageModule)
  },
  {
    path: 'discover',
    loadChildren: () => import('./pages/tabs/discover/discover.module').then( m => m.DiscoverPageModule)
  },
  {
    path: 'upload',
    loadChildren: () => import('./pages/tabs/upload/upload.module').then( m => m.UploadPageModule)
  },
  {
    path: 'connection-requests',
    loadChildren: () => import('./pages/connection-requests/connection-requests.module').then( m => m.ConnectionRequestsPageModule)
  },
  {
    path: 'account-settings',
    loadChildren: () => import('./pages/account-settings/account-settings/account-settings.module').then( m => m.AccountSettingsPageModule)
  },
  {
    path: 'privacy',
    loadChildren: () => import('./pages/account-settings/privacy/privacy.module').then( m => m.PrivacyPageModule)
  },
  {
    path: 'profile-settings',
    loadChildren: () => import('./pages/account-settings/profile-settings/profile-settings.module').then( m => m.ProfileSettingsPageModule)
  },
  {
    path: 'stylist-application',
    loadChildren: () => import('./pages/account-settings/stylist-application/stylist-application.module').then( m => m.StylistApplicationPageModule)
  },
  {
    path: 'verify-account',
    loadChildren: () => import('./pages/auth/verify-account/verify-account.module').then( m => m.VerifyAccountPageModule)
  },
  {
    path: 'forgot-change-password',
    loadChildren: () => import('./pages/auth/forgot-change-password/forgot-change-password.module').then( m => m.ForgotChangePasswordPageModule)
  },
  {
    path: 'register4',
    loadChildren: () => import('./pages/auth/register4/register4.module').then( m => m.Register4PageModule)
  },
  {
    path: 'stylist-application-step2',
    loadChildren: () => import('./pages/account-settings/stylist-application-step2/stylist-application-step2.module').then( m => m.StylistApplicationStep2PageModule)
  },
  {
    path: 'stylist-application-step3',
    loadChildren: () => import('./pages/account-settings/stylist-application-step3/stylist-application-step3.module').then( m => m.StylistApplicationStep3PageModule)
  },
  {
    path: 'member-privileges',
    loadChildren: () => import('./pages/member-privileges/member-privileges.module').then( m => m.MemberPrivilegesPageModule)
  },
  {
    path: 'my-rewards',
    loadChildren: () => import('./pages/my-rewards/my-rewards.module').then( m => m.MyRewardsPageModule)
  },
  {
    path: 'page-view-privileges',
    loadChildren: () => import('./pages/page-view-privileges/page-view-privileges.module').then( m => m.PageViewPrivilegesPageModule)
  },
  {
    path: 'edit-profile',
    loadChildren: () => import('./pages/user/edit-profile/edit-profile.module').then( m => m.EditProfilePageModule)
  },
  {
    path: 'messages',
    loadChildren: () => import('./pages/messages/messages.module').then( m => m.MessagesPageModule)
  },
  {
    path: 'notifications',
    loadChildren: () => import('./pages/notifications/notifications.module').then( m => m.NotificationsPageModule)
  },
  {
    path: 'inside-notification',
    loadChildren: () => import('./pages/account-settings/inside-notification/inside-notification.module').then( m => m.InsideNotificationPageModule)
  },
  {
    path: 'inside-security',
    loadChildren: () => import('./pages/account-settings/inside-security/inside-security.module').then( m => m.InsideSecurityPageModule)
  },
  {
    path: 'about',
    loadChildren: () => import('./pages/account-settings/about/about.module').then( m => m.AboutPageModule)
  },
  {
    path: 'username',
    loadChildren: () => import('./pages/account-settings/username/username.module').then( m => m.UsernamePageModule)
  },
  {
    path: 'e-mail',
    loadChildren: () => import('./pages/account-settings/e-mail/e-mail.module').then( m => m.EMailPageModule)
  },
  // {
  //   path: 'post',
  //   loadChildren: () => import('./pages/post/post.module').then( m => m.PostPageModule)
  // },
  {
    path: 'post-detail',
    loadChildren: () => import('./pages/post/post-detail/post-detail.module').then( m => m.PostDetailPageModule)
  },
  {
    path: 'post-detail2',
    loadChildren: () => import('./pages/post/post-detail/post-detail.module').then( m => m.PostDetailPageModule)
  },
  {
    path: 'comment-tree',
    loadChildren: () => import('./pages/comment-tree/comment-tree/comment-tree.module').then( m => m.CommentTreePageModule)
    
  },
  {
    path: 'inner-connection-request',
    loadChildren: () => import('./pages/inner-connection-request/inner-connection-request.module').then( m => m.InnerConnectionRequestPageModule)
  },
  {
    path: 'tutorial',
    loadChildren: () => import('./pages/tutorial/tutorial/tutorial.module').then( m => m.TutorialPageModule)
  },
  {
    path: 'style-column',
    loadChildren: () => import('./pages/style-column/style-column.module').then( m => m.StyleColumnPageModule)
  },
  {
    path: 'style-challenges',
    loadChildren: () => import('./pages/style-challenges/style-challenges.module').then( m => m.StyleChallengesPageModule)
  },
  {
    path: 'reward-detail',
    loadChildren: () => import('./pages/reward-detail/reward-detail.module').then( m => m.RewardDetailPageModule)
  },
  {
    path: 'connection-request2',
    loadChildren: () => import('./pages/connection-request2/connection-request2.module').then( m => m.ConnectionRequest2PageModule)
  },
  {
    path: 'account-settings-inside',
    loadChildren: () => import('./pages/account-settings/account-settings-inside/account-settings-inside.module').then( m => m.AccountSettingsInsidePageModule)
  },
  {
    path: 'other-inner-settings/:type',
    loadChildren: () => import('./pages/account-settings/other-inner-settings/other-inner-settings.module').then( m => m.OtherInnerSettingsPageModule)
  },
  {
    path: 'image-viewer',
    loadChildren: () => import('./pages/image-viewer/image-viewer/image-viewer.module').then( m => m.ImageViewerPageModule)
  },
  {
    path: 'image-viewer',
    loadChildren: () => import('./pages/image-viewer/image-viewer/image-viewer.module').then( m => m.ImageViewerPageModule)
  },
  {
    path: 'my-rewards2',
    loadChildren: () => import('./pages/my-rewards2/my-rewards2.module').then( m => m.MyRewards2PageModule)
  },
  {
    path: 'reward-detail2',
    loadChildren: () => import('./pages/reward-detail2/reward-detail2.module').then( m => m.RewardDetail2PageModule)
  },
  {
    path: 'terms-and-conditions',
    loadChildren: () => import('./pages/auth/terms-and-conditions/terms-and-conditions.module').then( m => m.TermsAndConditionsPageModule)
  },
  {
    path: 'privacy-policy',
    loadChildren: () => import('./pages/auth/privacy-policy/privacy-policy.module').then( m => m.PrivacyPolicyPageModule)
  },
  {
    path: 'faqs',
    loadChildren: () => import('./pages/faqs/faqs.module').then( m => m.FaqsPageModule)
  },
  {
    path: 'talk-to-us',
    loadChildren: () => import('./pages/talk-to-us/talk-to-us.module').then( m => m.TalkToUsPageModule)
  },

  // {
  //   path: 'likes-dislikes',
  //   loadChildren: () => import('./pages/likes-dislikes/likes-dislikes.module').then( m => m.LikesDislikesPageModule)
  // },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { 
      preloadingStrategy: PreloadAllModules,
      onSameUrlNavigation: 'reload' 
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
