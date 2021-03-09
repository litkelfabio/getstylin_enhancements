import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StyleChallengesPage } from './style-challenges.page';

const routes: Routes = [
  {
    path: '',
    component: StyleChallengesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StyleChallengesPageRoutingModule {}
