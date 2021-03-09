import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyStylinPage } from './my-stylin.page';

const routes: Routes = [
  {
    path: '',
    component: MyStylinPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyStylinPageRoutingModule {}
