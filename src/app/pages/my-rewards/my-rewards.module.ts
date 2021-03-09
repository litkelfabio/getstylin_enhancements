import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyRewardsPageRoutingModule } from './my-rewards-routing.module';

import { MyRewardsPage } from './my-rewards.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyRewardsPageRoutingModule,
  ],
  declarations: [MyRewardsPage]
})
export class MyRewardsPageModule {}
