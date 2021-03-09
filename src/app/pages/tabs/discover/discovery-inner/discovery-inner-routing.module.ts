import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DiscoveryInnerPage } from './discovery-inner.page';

const routes: Routes = [
  {
    path: '',
    component: DiscoveryInnerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DiscoveryInnerPageRoutingModule {}
