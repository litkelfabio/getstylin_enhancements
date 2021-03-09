import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RewardDetailPageRoutingModule } from './reward-detail-routing.module';

import { RewardDetailPage } from './reward-detail.page';
import { NgProgressModule } from 'ngx-progressbar';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RewardDetailPageRoutingModule,
    NgProgressModule
  ],
  declarations: [RewardDetailPage]
})
export class RewardDetailPageModule {}
