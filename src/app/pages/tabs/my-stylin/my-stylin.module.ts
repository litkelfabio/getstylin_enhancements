import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyStylinPageRoutingModule } from './my-stylin-routing.module';

import { MyStylinPage } from './my-stylin.page';
import { NgxMasonryModule } from 'ngx-masonry';
import { NgProgressModule } from 'ngx-progressbar';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyStylinPageRoutingModule,
    NgxMasonryModule,
    NgProgressModule
  ],
  declarations: [MyStylinPage]
})
export class MyStylinPageModule {}
