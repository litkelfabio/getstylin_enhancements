import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InsideSecurityPageRoutingModule } from './inside-security-routing.module';

import { InsideSecurityPage } from './inside-security.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InsideSecurityPageRoutingModule
  ],
  declarations: [InsideSecurityPage]
})
export class InsideSecurityPageModule {}
