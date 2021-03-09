import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

// import { PostPageRoutingModule } from './post-routing.module';

import { PostPage } from './post.page';

import { TagInputModule } from 'ngx-chips';
import { ImageCropperPageModule } from 'src/app/components/modals/image-cropper/image-cropper.module';
import { NgxMasonryModule } from 'ngx-masonry';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    // PostPageRoutingModule,
    TagInputModule,
    ReactiveFormsModule,
    ImageCropperPageModule,
    NgxMasonryModule
  ],
  declarations: [PostPage]
})
export class PostPageModule {}
