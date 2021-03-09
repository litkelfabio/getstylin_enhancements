import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { takeWhile } from 'rxjs/operators';
import { FaqsService } from 'src/app/services/faqs/faqs.service';

@Component({
  selector: 'app-faqs',
  templateUrl: './faqs.page.html',
  styleUrls: ['./faqs.page.scss'],
})
export class FaqsPage implements OnInit {
  showDetails = false;
  // faqs: any =[];
  faqs = false;
  constructor(
    private faqsService: FaqsService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    let limit = 8;
    this.faqsService.getFaqsListing({limit:limit}).then(result =>{
      this.faqs = result['data']
      console.log(result)
    })
  }

  back(){
    this.navCtrl.navigateBack('/tabs/tabs/my-stylin');
  }
  show(faqs){
    console.log(faqs.showDetails)
    if(faqs.showDetails == undefined){
      faqs.showDetails = true;
    }else{
      faqs.showDetails == false  ? faqs.showDetails = true : faqs.showDetails = false;
    }
  }

}
