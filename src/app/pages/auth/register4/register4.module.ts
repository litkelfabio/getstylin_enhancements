import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Register4PageRoutingModule } from './register4-routing.module';

import { Register4Page } from './register4.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Register4PageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [Register4Page]
})
export class Register4PageModule {}
