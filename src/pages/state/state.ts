import {Component} from '@angular/core';
import {DiagnosticService} from '../../app/diagnostic.service';
import { NavController } from 'ionic-angular';
import {Platform} from 'ionic-angular';
import { Events } from 'ionic-angular';

@Component({
  selector: 'page-state',
  templateUrl: 'state.html'
})
export class StatePage {
  public keysGetter: Function;

  private eventsSubscribed = false;


  constructor(
      private diagnosticService: DiagnosticService,
      private navCtrl: NavController,
      private platform: Platform,
      private events: Events

  ) {
    this.keysGetter = Object.keys;

    platform.ready().then(() => {
      if(!this.eventsSubscribed){
        this.events.subscribe('diagnostic:stateupdated', () => {
          this.navCtrl.setRoot(this.navCtrl.getActive().component);
        });
        this.eventsSubscribed = true;
      }
    });
  }

}
