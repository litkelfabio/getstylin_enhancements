import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';

@Component({
  selector: 'app-slides',
  templateUrl: './slides.component.html',
  styleUrls: ['./slides.component.scss'],
})
export class SlidesComponent implements OnInit {
  @Input() item ;
  @ViewChild('slides') slides : IonSlides
  constructor() { }

  activeIndex = 1;

  ngOnInit() {
    console.log('this item: ',this.item);
  }

  ionSlideDidChange(e){
    this.slides.getActiveIndex().then( (index) =>{
      this.activeIndex = index + 1;
      console.log(index)
    })
    // console.log("SLIDES", )
    // this.slides.getActiveIndex( index)
  }

}
