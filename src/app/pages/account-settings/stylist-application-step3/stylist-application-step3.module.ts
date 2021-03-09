import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { NgProgressModule } from 'ngx-progressbar';
import { IonicModule } from '@ionic/angular';

import { StylistApplicationStep3PageRoutingModule } from './stylist-application-step3-routing.module';

import { StylistApplicationStep3Page } from './stylist-application-step3.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StylistApplicationStep3PageRoutingModule,
    NgProgressModule,
    ReactiveFormsModule
  ],
  declarations: [StylistApplicationStep3Page, ]
})
export class StylistApplicationStep3PageModule {}
