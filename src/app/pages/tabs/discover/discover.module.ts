import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DiscoverPageRoutingModule } from './discover-routing.module';

import { DiscoverPage } from './discover.page';
import { NgxMasonryModule } from 'ngx-masonry';

import { NgProgressModule } from 'ngx-progressbar';

import { PipesModule } from 'src/app/pipes/pipes.module';

import { TagInputModule } from 'ngx-chips';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DiscoverPageRoutingModule,NgxMasonryModule,
    NgProgressModule,
 
    PipesModule,
    TagInputModule,
  ],
  declarations: [DiscoverPage],
  entryComponents:[],
})
export class DiscoverPageModule {}
