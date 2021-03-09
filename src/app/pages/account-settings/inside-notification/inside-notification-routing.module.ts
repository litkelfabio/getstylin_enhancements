import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InsideNotificationPage } from './inside-notification.page';

const routes: Routes = [
  {
    path: '',
    component: InsideNotificationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InsideNotificationPageRoutingModule {}
