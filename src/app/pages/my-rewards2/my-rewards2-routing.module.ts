import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyRewards2Page } from './my-rewards2.page';

const routes: Routes = [
  {
    path: '',
    component: MyRewards2Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyRewards2PageRoutingModule {}
