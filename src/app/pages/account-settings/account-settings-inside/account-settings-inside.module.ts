import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AccountSettingsInsidePageRoutingModule } from './account-settings-inside-routing.module';

import { AccountSettingsInsidePage } from './account-settings-inside.page';
import { NgProgressModule } from 'ngx-progressbar';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AccountSettingsInsidePageRoutingModule,
    ReactiveFormsModule,
    NgProgressModule
  ],
  declarations: [AccountSettingsInsidePage]
})
export class AccountSettingsInsidePageModule {}
