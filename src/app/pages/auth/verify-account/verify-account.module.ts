import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VerifyAccountPageRoutingModule } from './verify-account-routing.module';

import { VerifyAccountPage } from './verify-account.page';
import { NgProgressModule } from 'ngx-progressbar';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VerifyAccountPageRoutingModule,
    ReactiveFormsModule,
    NgProgressModule,
  ],
  declarations: [VerifyAccountPage]
})
export class VerifyAccountPageModule {}
