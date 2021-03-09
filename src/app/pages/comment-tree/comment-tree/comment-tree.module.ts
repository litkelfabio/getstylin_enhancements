import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CommentTreePageRoutingModule } from './comment-tree-routing.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { CommentTreePage } from './comment-tree.page';
import { NgProgressModule } from 'ngx-progressbar';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CommentTreePageRoutingModule,
    NgProgressModule,
    PipesModule
  ],
  declarations: [CommentTreePage]
})
export class CommentTreePageModule {}
