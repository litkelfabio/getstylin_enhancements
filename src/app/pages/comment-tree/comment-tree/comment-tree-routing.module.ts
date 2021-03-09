import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CommentTreePage } from './comment-tree.page';

const routes: Routes = [
  {
    path: '',
    component: CommentTreePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CommentTreePageRoutingModule {}
