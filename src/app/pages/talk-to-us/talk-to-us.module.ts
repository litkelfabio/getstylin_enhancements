import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TalkToUsPageRoutingModule } from './talk-to-us-routing.module';

import { TalkToUsPage } from './talk-to-us.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TalkToUsPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [TalkToUsPage]
})
export class TalkToUsPageModule {}
