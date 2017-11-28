import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import {Device} from '@ionic-native/device';
import {GlobalVars} from './app.globals';

import {TabsPage} from '../pages/tabs/tabs';

declare global {
    interface Document {
        arrive: any;
    }
}



@Component({
  templateUrl: 'app.html'
})
export class MyApp {
    rootPage: any = TabsPage;

    public platform: string;

    constructor(
        platform: Platform,
        statusBar: StatusBar,
        splashScreen: SplashScreen,
        device: Device,
        globals: GlobalVars
    ) {
    platform.ready().then(() => {
      statusBar.styleDefault();
            setTimeout(() => {
      splashScreen.hide();
            }, 100);
            if(device.platform){
                globals.platform = device.platform.toLowerCase();
                if(globals.platform.match(/win/)){
                    globals.platform = "windows";
                }
                let body = document.getElementsByTagName('body')[0];
                body.classList.add(globals.platform);
            }
    });
  }
}

