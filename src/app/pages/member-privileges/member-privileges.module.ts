import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MemberPrivilegesPageRoutingModule } from './member-privileges-routing.module';

import { MemberPrivilegesPage } from './member-privileges.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MemberPrivilegesPageRoutingModule,
  ],
  declarations: [MemberPrivilegesPage]
})
export class MemberPrivilegesPageModule {}
