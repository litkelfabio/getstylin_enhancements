import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InsideSecurityPage } from './inside-security.page';

const routes: Routes = [
  {
    path: '',
    component: InsideSecurityPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InsideSecurityPageRoutingModule {}
