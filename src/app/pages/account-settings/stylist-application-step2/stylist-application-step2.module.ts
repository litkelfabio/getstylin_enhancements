import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StylistApplicationStep2PageRoutingModule } from './stylist-application-step2-routing.module';

import { StylistApplicationStep2Page } from './stylist-application-step2.page';
import { BirthdayModalComponent } from 'src/app/components/modals/birthday-modal/birthday-modal.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StylistApplicationStep2PageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [StylistApplicationStep2Page]
})
export class StylistApplicationStep2PageModule {}
