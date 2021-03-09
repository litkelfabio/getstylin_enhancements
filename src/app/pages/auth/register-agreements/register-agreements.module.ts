import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegisterAgreementsPageRoutingModule } from './register-agreements-routing.module';

import { RegisterAgreementsPage } from './register-agreements.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegisterAgreementsPageRoutingModule
  ],
  declarations: [RegisterAgreementsPage]
})
export class RegisterAgreementsPageModule {}
