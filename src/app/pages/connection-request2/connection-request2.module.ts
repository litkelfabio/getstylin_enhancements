import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConnectionRequest2PageRoutingModule } from './connection-request2-routing.module';

import { ConnectionRequest2Page } from './connection-request2.page';
import { NgProgressModule } from 'ngx-progressbar';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConnectionRequest2PageRoutingModule,
    NgProgressModule,
  ],
  declarations: [ConnectionRequest2Page]
})
export class ConnectionRequest2PageModule {}
