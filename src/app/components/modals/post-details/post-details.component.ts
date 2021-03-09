import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular'
import {EditPostModalComponent} from '../../../components/modals/edit-post-modal/edit-post-modal.component'
import { Router } from '@angular/router';

@Component({
  selector: 'app-post-details',
  templateUrl: './post-details.component.html',
  styleUrls: ['./post-details.component.scss'],
})
export class PostDetailsComponent implements OnInit {

  img = "https://getstylin.com/public/deploy1599536530/images/lns/sb/L2ltYWdlcy91cGxvYWRzL3Byb2ZpbGVwaWMvMTQ3/type/toheight/height/500/allow_enlarge/0/1582504925_yw456vuwtejxiqxwok56.jpg";
  data = false;
  constructor(
    private modalCtrl: ModalController,
    private router: Router
  ) { }

  ngOnInit() {}

  doRefresh(event) {
    console.log('Begin async operation');

    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }
  backToDashboard(){
    this.modalCtrl.dismiss();
    console.log("click")
  }
  async editPostModal(){
    const modal = await this.modalCtrl.create({
      cssClass: 'editPostModal',
      mode:'ios',
      component: EditPostModalComponent,
      backdropDismiss: true,
    });
    await modal.present();
  }
  viewImage(){
    // this.photoViewer.show('https://getstylin.com/public/deploy1599536530/images/lns/sb/L2ltYWdlcy91cGxvYWRzL3Byb2ZpbGVwaWMvMTQ3/type/toheight/height/500/allow_enlarge/0/1582504925_yw456vuwtejxiqxwok56.jpg', 'Testing Title', {share: false});
  }
  goToReplies(){
    this.modalCtrl.dismiss();
    this.router.navigateByUrl('/comment-tree')
  }
  goToProfile(){
    
  }

}
