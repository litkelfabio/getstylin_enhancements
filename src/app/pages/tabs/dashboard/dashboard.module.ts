import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardPageRoutingModule } from './dashboard-routing.module';

import { DashboardPage } from './dashboard.page';

import { NgCircleProgressModule } from 'ng-circle-progress';
import { NgProgressModule } from 'ngx-progressbar';
import { PipesModule } from 'src/app/pipes/pipes.module';

import { IonicStorageModule } from '@ionic/storage';
import { PostPageModule } from '../../post/post.module';
import { PostPage } from '../../post/post.page';
import { SlidesComponent } from 'src/app/component/slides/slides.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DashboardPageRoutingModule,

    NgCircleProgressModule,
    NgProgressModule,

    PipesModule,IonicStorageModule
    
    // PostPage
    // PostPageModule
    

  ],
  declarations: [DashboardPage, SlidesComponent ],
  entryComponents:[SlidesComponent]
})
export class DashboardPageModule {}
