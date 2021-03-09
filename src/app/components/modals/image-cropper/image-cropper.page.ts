import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { ComponentsService } from './../../../services/components/components.service';

@Component({
  selector: 'app-image-cropper',
  templateUrl: './image-cropper.page.html',
  styleUrls: ['./image-cropper.page.scss'],
})
export class ImageCropperPage implements OnInit {
	
	@ViewChild(ImageCropperComponent, { static: false }) angularCropper: ImageCropperComponent;
  	@Input() imageBase64: string;
	@Input() type: string;
	@Input() aspect_height: number;
	@Input() aspect_width: number;
	@Input() cropSelected: number;

  	imageChangedEvent: any = '';
  	croppedFileImage: any = '';

	rotate: number = 0;

  	constructor(
		private modalCtrl: ModalController,
		private componentsService: ComponentsService
  	) { 

  	}

  	ngOnInit() {
  	}

	imageCropped(event: ImageCroppedEvent){
		this.croppedFileImage = event;
	}
	
	 rotateRight(){
		 this.rotate += 1;
		 /* this.angularCropper.transform.rotate
		this.angularCropper.canvasRotation = 1; */
		 /* this.angularCropper.transform.rotate.toFixed(90); */
		/* this.angularCropper.rotateRight(); */
	}
	
	rotateLeft(){
	     /* this.angularCropper.rotateLeft(); */
	}

	dismiss(event = null) {
		let data: any;
		if (event) {
			data = null;
		} else {
			console.log("this.croppedFileImage.base64", this.croppedFileImage.base64);
			let imgBlob = this.componentsService.b64toBlobNew(this.croppedFileImage.base64.replace("data:image/jpeg;base64,", ""), 'image/jpeg', 512);
			data = {
		    	'fileBlob': imgBlob,
				'base64': this.croppedFileImage.base64,
				'cropSelected': this.cropSelected ? this.cropSelected : 0
			};
			console.log("dismiss", data);
		}
		this.modalCtrl.dismiss(data);
	}
  	stopPropagation(e) {
    	e.stopPropagation();
	  }
	  exit(){
		  console.log('exit')
		  this.modalCtrl.dismiss();
	  }
}