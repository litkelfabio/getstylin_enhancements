import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.page.html',
  styleUrls: ['./image-viewer.page.scss'],
})
export class ImageViewerPage implements OnInit {
  src:any;
  filter:any;
  photoText:any;
  constructor() { 
    console.log(this.filter);
  }
 
  ngOnInit() {
  }

}
