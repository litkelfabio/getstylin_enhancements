import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StylistApplicationStep3Page } from './stylist-application-step3.page';

const routes: Routes = [
  {
    path: '',
    component: StylistApplicationStep3Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StylistApplicationStep3PageRoutingModule {}
