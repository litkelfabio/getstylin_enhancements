import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StyleColumnPageRoutingModule } from './style-column-routing.module';
import { IonicStorageModule } from '@ionic/storage';
import { StyleColumnPage } from './style-column.page';
import { NgProgressModule } from 'ngx-progressbar';
import { PipesModule } from 'src/app/pipes/pipes.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StyleColumnPageRoutingModule,
    NgProgressModule,
    IonicStorageModule,
    PipesModule
  ],
  declarations: [StyleColumnPage]
})
export class StyleColumnPageModule {}
