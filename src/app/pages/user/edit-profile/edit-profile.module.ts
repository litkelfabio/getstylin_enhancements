import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditProfilePageRoutingModule } from './edit-profile-routing.module';

import { EditProfilePage } from './edit-profile.page';
import { IonicSelectableModule } from 'ionic-selectable';
import { ImageCropperPageModule } from 'src/app/components/modals/image-cropper/image-cropper.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditProfilePageRoutingModule,
    IonicSelectableModule,
    ReactiveFormsModule,
    ImageCropperPageModule
  ],
  declarations: [EditProfilePage]
})
export class EditProfilePageModule {}
