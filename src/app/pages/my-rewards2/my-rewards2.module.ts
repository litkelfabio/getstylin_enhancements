import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyRewards2PageRoutingModule } from './my-rewards2-routing.module';

import { MyRewards2Page } from './my-rewards2.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyRewards2PageRoutingModule
  ],
  declarations: [MyRewards2Page]
})
export class MyRewards2PageModule {}
