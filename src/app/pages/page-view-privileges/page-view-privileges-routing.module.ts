import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PageViewPrivilegesPage } from './page-view-privileges.page';

const routes: Routes = [
  {
    path: '',
    component: PageViewPrivilegesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PageViewPrivilegesPageRoutingModule {}
