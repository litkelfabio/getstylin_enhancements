import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InnerConnectionRequestPageRoutingModule } from './inner-connection-request-routing.module';

import { InnerConnectionRequestPage } from './inner-connection-request.page';

import { NgProgressModule } from 'ngx-progressbar';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InnerConnectionRequestPageRoutingModule,
    NgProgressModule,
  ],
  declarations: [InnerConnectionRequestPage]
})
export class InnerConnectionRequestPageModule {}
