import { Component, OnInit } from '@angular/core';
import { DatasourceService } from 'src/app/services/datasource/datasource.service';
import { EventsService } from 'src/app/services/events.service';

@Component({
  selector: 'app-tutorial-popover',
  templateUrl: './tutorial-popover.component.html',
  styleUrls: ['./tutorial-popover.component.scss'],
})
export class TutorialPopoverComponent implements OnInit {

  title: string;
  body: string;
  img: string;
  index: any;
  constructor(
    private dataSource: DatasourceService,
    private events : EventsService
  ) {
    // this.dataSource.serviceData.subscribe(res=>{
    // this.title =  res['title'] ? res['title']: null;
    // this.body =  res['body'] ? res['body']: null;
    // this.img = res['img'] ? res['img']: null;
    // this.index = res['index']? res['index'] : null;
    // console.log(this.title)
    // });
    
   }

  ngOnInit() {
    console.log(this.index)
  }
  next() {
    console.log("pindot to")
    this.events.publish('tutorial:next');
  }

  skip() {
    this.events.publish('tutorial:skip');
  }


}
