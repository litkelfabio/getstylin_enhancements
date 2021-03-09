import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VerifyAccountPage } from './verify-account.page';

const routes: Routes = [
  {
    path: '',
    component: VerifyAccountPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VerifyAccountPageRoutingModule {}
