import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ForgotChangePasswordPageRoutingModule } from './forgot-change-password-routing.module';

import { ForgotChangePasswordPage } from './forgot-change-password.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ForgotChangePasswordPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [ForgotChangePasswordPage]
})
export class ForgotChangePasswordPageModule {}
