import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DiscoveryInnerPageRoutingModule } from './discovery-inner-routing.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { DiscoveryInnerPage } from './discovery-inner.page';
import { NgxMasonryModule } from 'ngx-masonry';
import { NgProgressModule } from "ngx-progressbar";
import { ImageCropperPageModule } from 'src/app/components/modals/image-cropper/image-cropper.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DiscoveryInnerPageRoutingModule,
    ReactiveFormsModule,
    PipesModule,
    NgxMasonryModule,
    NgProgressModule,
    ImageCropperPageModule
  ],
  declarations: [DiscoveryInnerPage]
})
export class DiscoveryInnerPageModule {}
