import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabsPageRoutingModule } from './tabs-routing.module';

import { TabsPage } from './tabs.page';
import { PostPageModule } from '../../post/post.module';
import { PostPage } from '../../post/post.page';
// import { PostPage } from '../../post/post.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabsPageRoutingModule,
    PostPageModule
  ],
  declarations: [TabsPage],
  entryComponents: [PostPage]
})
export class TabsPageModule {}
