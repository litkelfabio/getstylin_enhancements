import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EMailPage } from './e-mail.page';

const routes: Routes = [
  {
    path: '',
    component: EMailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EMailPageRoutingModule {}
