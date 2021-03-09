import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TalkToUsPage } from './talk-to-us.page';

const routes: Routes = [
  {
    path: '',
    component: TalkToUsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TalkToUsPageRoutingModule {}
