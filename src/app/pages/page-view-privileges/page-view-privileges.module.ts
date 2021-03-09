import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PageViewPrivilegesPageRoutingModule } from './page-view-privileges-routing.module';

import { PageViewPrivilegesPage } from './page-view-privileges.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PageViewPrivilegesPageRoutingModule
  ],
  declarations: [PageViewPrivilegesPage]
})
export class PageViewPrivilegesPageModule {}
