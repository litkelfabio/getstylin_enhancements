import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StyleColumnPage } from './style-column.page';

const routes: Routes = [
  {
    path: '',
    component: StyleColumnPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StyleColumnPageRoutingModule {}
