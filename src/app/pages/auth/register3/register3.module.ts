import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule  } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Register3PageRoutingModule } from './register3-routing.module';

import { Register3Page } from './register3.page';
import { BirthdayModalComponent } from 'src/app/components/modals/birthday-modal/birthday-modal.component';
import { FavoriteBrandModalComponent } from 'src/app/components/modals/favorite-brand-modal/favorite-brand-modal.component';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Register3PageRoutingModule,
    ReactiveFormsModule,
    IonicSelectableModule
  ],
  declarations: [Register3Page , FavoriteBrandModalComponent],
  entryComponents: [ FavoriteBrandModalComponent]
})
export class Register3PageModule {}
