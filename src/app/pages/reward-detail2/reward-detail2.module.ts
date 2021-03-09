import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RewardDetail2PageRoutingModule } from './reward-detail2-routing.module';

import { RewardDetail2Page } from './reward-detail2.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RewardDetail2PageRoutingModule
  ],
  declarations: [RewardDetail2Page]
})
export class RewardDetail2PageModule {}
