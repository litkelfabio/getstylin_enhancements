import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConnectionRequest2Page } from './connection-request2.page';

const routes: Routes = [
  {
    path: '',
    component: ConnectionRequest2Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConnectionRequest2PageRoutingModule {}
