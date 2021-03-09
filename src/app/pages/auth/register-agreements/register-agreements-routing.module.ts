import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegisterAgreementsPage } from './register-agreements.page';

const routes: Routes = [
  {
    path: '',
    component: RegisterAgreementsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegisterAgreementsPageRoutingModule {}
