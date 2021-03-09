import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountSettingsInsidePage } from './account-settings-inside.page';

const routes: Routes = [
  {
    path: '',
    component: AccountSettingsInsidePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountSettingsInsidePageRoutingModule {}
