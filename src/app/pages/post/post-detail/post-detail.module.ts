import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NgProgressModule } from 'ngx-progressbar';
import { IonicModule } from '@ionic/angular';

import { PostDetailPageRoutingModule } from './post-detail-routing.module';

import { PostDetailPage } from './post-detail.page';

import { PipesModule } from 'src/app/pipes/pipes.module';
import { EditPostModalComponent } from 'src/app/components/modals/edit-post-modal/edit-post-modal.component';
import { PostPageModule } from '../post.module';
import { PostPage } from '../post.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PostDetailPageRoutingModule,
    NgProgressModule,
    PipesModule,
    // PostPage
   PostPageModule
  ],
  declarations: [PostDetailPage],
  entryComponents: [PostPage]
})
export class PostDetailPageModule {}
