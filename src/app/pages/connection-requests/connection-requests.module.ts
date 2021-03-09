import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConnectionRequestsPageRoutingModule } from './connection-requests-routing.module';

import { ConnectionRequestsPage } from './connection-requests.page';

import { NgProgressModule } from 'ngx-progressbar';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConnectionRequestsPageRoutingModule,NgProgressModule,
  ],
  declarations: [ConnectionRequestsPage]
})
export class ConnectionRequestsPageModule {}
