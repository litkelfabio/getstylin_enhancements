import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ForgotChangePasswordPage } from './forgot-change-password.page';

const routes: Routes = [
  {
    path: '',
    component: ForgotChangePasswordPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ForgotChangePasswordPageRoutingModule {}
