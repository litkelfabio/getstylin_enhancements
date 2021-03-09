import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StyleChallengesPageRoutingModule } from './style-challenges-routing.module';

import { StyleChallengesPage } from './style-challenges.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StyleChallengesPageRoutingModule,
  ],
  declarations: [StyleChallengesPage]
})
export class StyleChallengesPageModule {}
