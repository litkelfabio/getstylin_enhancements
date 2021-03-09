import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InsideNotificationPageRoutingModule } from './inside-notification-routing.module';

import { InsideNotificationPage } from './inside-notification.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InsideNotificationPageRoutingModule
  ],
  declarations: [InsideNotificationPage]
})
export class InsideNotificationPageModule {}
