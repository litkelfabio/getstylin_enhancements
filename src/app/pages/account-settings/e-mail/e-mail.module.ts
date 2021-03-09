import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EMailPageRoutingModule } from './e-mail-routing.module';

import { EMailPage } from './e-mail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    EMailPageRoutingModule
  ],
  declarations: [EMailPage]
})
export class EMailPageModule {}
