import { ThrowStmt } from '@angular/compiler';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, PopoverController,IonSlides } from '@ionic/angular';
import { EventsService } from 'src/app/services/events.service';
import { TutorialPopoverComponent } from '../tutorial-popover/tutorial-popover.component';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.scss'],
})
export class TutorialComponent implements OnInit, AfterViewInit {
  @ViewChild(IonSlides) slides: IonSlides;

  messageTabIcon = "custom-message";
  currentIndex: any;
  isLoaded: boolean = false;
  tutorialData = [
    {
      title: "Discover",
      body: "Discover how everyone is wearing the latest styles! Consult with our stylists on the latest trends. Stay up to date with events near you.",
      img: 'assets/imgs/tutorials/tutorial-logo-1.png'
    },
    {
      title: "Upload & Create",
      body: "Show your great style! Snap a photo or choose a look from your library. Apply to be a stylist and share more with our community.",
      img: 'assets/imgs/tutorials/tutorial-logo-2.png'
    },
    {
      title: "Point System",
      body: "Every like, comment and style challenge earns you style points! The more style points you collect, the higher your tier is. Access exclusive benefits as you progress to the top.",
      img: 'assets/imgs/tutorials/tutorial-logo-3.png'
    },
    {
      title: "Rewards",
      body: "Stay active in the community to earn rewards. Redeem gifts and have access to great deals! Enjoy awesome perks, promotions, and more!",
      img: 'assets/imgs/tutorials/tutorial-logo-4.png'
    }
  ]

  constructor(
    private viewCtrl: ModalController,
    public popoverCtrl: PopoverController,
    private events: EventsService
    ) {
      this.events.subscribe('tutorial:next', () => {
        console.log("NEXTT")
        this.popover.dismiss();
        this.next();
      })
  
      this.events.subscribe('tutorial:skip', () => {
        console.log("DISMISS")
        this.popover.dismiss();
        this.skip();
      })
  }
  ngOnInit(){
  }
  ngAfterViewInit(){
    this.isLoaded = true
  }



  popover: any;
   async present(event, boundingClientRect?, data?) {

    let cssClass: any;
    switch (data.index) {
      case 1:
        cssClass = 'tutorial-popover-0'
        break;
      case 2:
        cssClass = 'tutorial-popover-1'
        break;
        case 3:
        cssClass = 'tutorial-popover-2'
        break;
      default:
        cssClass = 'tutorial-popover'
        break;
    };


    if(event.target.getBoundingClientRect()) {
      console.log(event.target.getBoundingClientRect())
    }  else {
      let eventGetBound = boundingClientRect;
      console.log(boundingClientRect);
      event.target.getBoundingClientRect = () => {
        return {
          top: eventGetBound.top,
          right: eventGetBound.right,
          left: eventGetBound.left,
          buttom: eventGetBound.buttom
        }
      }
    }
  
    this.popover = await this.popoverCtrl.create({
      component: TutorialPopoverComponent,
      cssClass:cssClass,
      event: event,
      componentProps:{
        title: data.title,
        body: data.body,
        img: data.img,
        index: data.index
      }, backdropDismiss: false,
    });

    console.log(event.target.getBoundingClientRect());
    

    this.popover.present({
      ev: event
    });
  }

  tempClick(e) {
    console.log(e.target.getBoundingClientRect());
  }

  click(select, index) {
    console.log('event click');
    var event = new Event('click');
    console.log('document.getElementById',document.getElementById(select))
    console.log('dispatchEvent',document.getElementById(select).dispatchEvent(event));
    this.tutorialData[index]['index'] = index;

    this.present(
      event,
      document.getElementById(select).getBoundingClientRect(),
      this.tutorialData[index]);
  }


  ionViewDidEnter() {
    console.log('ionViewDidLoad TutorialPage');
    this.slides.lockSwipes(true);

    setTimeout(() => {
      this.click('select0', 0)
    }, 300)
   
  }

  skip() {
    this.viewCtrl.dismiss();
  }

  ionViewDidLeave() {
    this.events.destroy('tutorial:next');
    this.events.destroy('tutorial:skip');
    this.slides.lockSwipes(false);
    console.log("WILLLEAVE")
  }

  next() {
    console.log("NEXT2")
    this.slides.lockSwipes(false);  
    try {
      this.slides.slideNext();
      console.log("NEXT3", this.slides)
    } catch (error) {
      console.log("ERROR: ", error)
    }
    this.slides.lockSwipes(true);    
    console.log("NEXT4")
  }

  async slideChanged(e){
    console.log("E ", e.target.value)
    console.log("SLIDECHANGED")
     await this.slides.getActiveIndex().then(res =>{
       this.currentIndex =  res;
      console.log("RES: ",res)
      switch (this.currentIndex) {
        case 1:
          this.click('select1', 1);
          break;
        case 2:
          this.click('select2', 2);
          break;
        default:
          this.click('select3', 3);
          break;
      }
    });
    console.log('Current index is', this.currentIndex);
  }

}
