import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StylistApplicationPage } from './stylist-application.page';

const routes: Routes = [
  {
    path: '',
    component: StylistApplicationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StylistApplicationPageRoutingModule {}
