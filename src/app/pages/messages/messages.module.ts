import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MessagesPageRoutingModule } from './messages-routing.module';

import { MessagesPage } from './messages.page';
import { MessageModalComponent } from 'src/app/components/modals/message-modal/message-modal.component';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { NgProgressModule } from 'ngx-progressbar';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    MessagesPageRoutingModule,
    NgProgressModule
  ],
  declarations: [MessagesPage],
  entryComponents:[]
})
export class MessagesPageModule {}
