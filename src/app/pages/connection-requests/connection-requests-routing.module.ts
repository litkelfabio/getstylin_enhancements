import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConnectionRequestsPage } from './connection-requests.page';

const routes: Routes = [
  {
    path: '',
    component: ConnectionRequestsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConnectionRequestsPageRoutingModule {}
