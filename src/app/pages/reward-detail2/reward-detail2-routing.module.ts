import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RewardDetail2Page } from './reward-detail2.page';

const routes: Routes = [
  {
    path: '',
    component: RewardDetail2Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RewardDetail2PageRoutingModule {}
