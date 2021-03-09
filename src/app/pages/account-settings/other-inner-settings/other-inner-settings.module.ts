import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OtherInnerSettingsPageRoutingModule } from './other-inner-settings-routing.module';

import { OtherInnerSettingsPage } from './other-inner-settings.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OtherInnerSettingsPageRoutingModule
  ],
  declarations: [OtherInnerSettingsPage]
})
export class OtherInnerSettingsPageModule {}
