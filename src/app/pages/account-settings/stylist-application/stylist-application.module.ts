import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StylistApplicationPageRoutingModule } from './stylist-application-routing.module';

import { StylistApplicationPage } from './stylist-application.page';
import {BirthdayModal2Component} from 'src/app/components/modals/birthday-modal2/birthday-modal2.component'
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StylistApplicationPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [StylistApplicationPage, BirthdayModal2Component],
  entryComponents: [BirthdayModal2Component]
})
export class StylistApplicationPageModule {}
