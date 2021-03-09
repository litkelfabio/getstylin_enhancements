import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OtherInnerSettingsPage } from './other-inner-settings.page';

const routes: Routes = [
  {
    path: '',
    component: OtherInnerSettingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OtherInnerSettingsPageRoutingModule {}
