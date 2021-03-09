import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StylistApplicationStep2Page } from './stylist-application-step2.page';

const routes: Routes = [
  {
    path: '',
    component: StylistApplicationStep2Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StylistApplicationStep2PageRoutingModule {}
