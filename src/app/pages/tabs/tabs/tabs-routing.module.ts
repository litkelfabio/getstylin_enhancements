import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

// const routes: Routes = [
//   {
//     path: '',
//     component: TabsPage
//   }
// ];
const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      // {
      //   path: 'home',
      //   children: [
      //     {
      //       path: '',
      //       loadChildren: () =>
      //         import('../home/home.module').then(m => m.HomePageModule)
      //     }
      //   ]
      // },
      {
        path: 'dashboard',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../dashboard/dashboard.module').then(m => m.DashboardPageModule)
          },
          {
            path: 'my-stylin',
            children: [
              {
                path: '',
                loadChildren: () =>
                  import('../my-stylin/my-stylin.module').then(m => m.MyStylinPageModule)
              }
            ]
          },
          {
            path: 'messages',
            children: [
              {
                path: '',
                loadChildren: () =>
                  import('../../messages/messages.module').then(m => m.MessagesPageModule)
              }
            ]
          },
          {
            path: 'notifications',
            children: [
              {
                path: '',
                loadChildren: () =>
                  import('../../notifications/notifications.module').then(m => m.NotificationsPageModule)
              }
            ]
          },
          {
            path: 'my-stylin',
            children: [
              {
                path: '',
                loadChildren: () =>
                  import('../my-stylin/my-stylin.module').then(m => m.MyStylinPageModule)
              },
              {
                path: 'connection-requests',
                children: [
                  {
                    path: '',
                    loadChildren: () =>
                      import('../../connection-requests/connection-requests.module').then(m => m.ConnectionRequestsPageModule)
                  }
                ]
              },
            ]
          },
        ]
      },
      {
        path: 'my-stylin',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../my-stylin/my-stylin.module').then(m => m.MyStylinPageModule)
          },
          
          {
            path: 'member-privileges',
            children: [
              {
                path: '',
                loadChildren: () =>
                  import('../../member-privileges/member-privileges.module').then(m => m.MemberPrivilegesPageModule)
              }
            ]
          },
          {
            path: 'talk-to-us',
            children: [
              {
                path: '',
                loadChildren: () =>
                  import('../../talk-to-us/talk-to-us.module').then(m => m.TalkToUsPageModule)
              }
            ]
          },
          {
            path: 'faqs',
            children: [
              {
                path: '',
                loadChildren: () =>
                  import('../../faqs/faqs.module').then(m => m.FaqsPageModule)
              }
            ]
          },
          {
            path: 'page-view-privileges',
            children: [
              {
                path: '',
                loadChildren: () =>
                  import('../../page-view-privileges/page-view-privileges.module').then(m => m.PageViewPrivilegesPageModule)
              }
            ]
          },
          {
            path: 'connection-requests',
            children: [
              {
                path: '',
                loadChildren: () =>
                  import('../../connection-requests/connection-requests.module').then(m => m.ConnectionRequestsPageModule)
              }
            ]
          },
        ]
      },
      {
        path: 'rewards',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../rewards/rewards.module').then(m => m.RewardsPageModule)
          },
          {
            path: 'my-rewards',
            children: [
              {
                path: '',
                loadChildren: () =>
                  import('../../my-rewards/my-rewards.module').then(m => m.MyRewardsPageModule)
              }
            ]
          },
          {
            path: 'reward-detail',
            children: [
              {
                path: '',
                loadChildren: () =>
                  import('../../reward-detail/reward-detail.module').then(m => m.RewardDetailPageModule)
              }
            ]
          },
          {
            path: 'style-challenges',
            children: [
              {
                path: '',
                loadChildren: () =>
                  import('../../style-challenges/style-challenges.module').then(m => m.StyleChallengesPageModule)
              }
            ]
          },
          {
            path: 'reward-detail',
            children: [
              {
                path: '',
                loadChildren: () =>
                  import('../../reward-detail/reward-detail.module').then(m => m.RewardDetailPageModule)
              }
            ]
          },
          
        ]
      },
      {
        path: 'discover',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../discover/discover.module').then(m => m.DiscoverPageModule)
          },
          {
            path: 'discover-inner',
            children: [
              {
                path: '',
                loadChildren: () =>
                  import('../discover/discovery-inner/discovery-inner.module').then(m => m.DiscoveryInnerPageModule)
              }
            ]
          },
          {
            path: 'my-stylin',
            children: [
              {
                path: '',
                loadChildren: () =>
                import('../my-stylin/my-stylin.module').then(m => m.MyStylinPageModule)
              }
            ]
          },
        ]
      },
      
      
      // {
      //   path: 'upload',
      //   children: [
      //     {
      //       path: '',
      //       loadChildren: () =>
      //         import('../upload/upload.module').then(m => m.UploadPageModule)
      //     }
      //   ]
      // },
      {
        path: 'tabs',
        redirectTo: '/tabs/dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'tabs',
    redirectTo: '/tabs/dashboard',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
