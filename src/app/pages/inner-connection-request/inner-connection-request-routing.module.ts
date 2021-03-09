import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InnerConnectionRequestPage } from './inner-connection-request.page';

const routes: Routes = [
  {
    path: '',
    component: InnerConnectionRequestPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InnerConnectionRequestPageRoutingModule {}
