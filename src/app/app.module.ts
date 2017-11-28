import {NgModule, ErrorHandler} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {IonicApp, IonicModule, IonicErrorHandler} from 'ionic-angular';
import {MyApp} from './app.component';
import {GlobalVars} from './app.globals';

import {StatePage} from '../pages/state/state';
import {SettingsPage} from '../pages/settings/settings';
import {ExternalStorageDetailsModal} from '../pages/settings/settings.externalStorageDetails.modal';
import {TabsPage} from '../pages/tabs/tabs';
import {StatusBar} from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import {Diagnostic} from '@ionic-native/diagnostic';
import {Device} from '@ionic-native/device';
import {DiagnosticService} from "./diagnostic.service";
import {AlertController} from 'ionic-angular';
import {LoadingController} from 'ionic-angular';
import {Geolocation} from '@ionic-native/geolocation';
import {Camera} from '@ionic-native/camera';
import {File} from '@ionic-native/file';
import {BackgroundFetch} from '@ionic-native/background-fetch';

let components = [
    MyApp,
    StatePage,
    SettingsPage,
    ExternalStorageDetailsModal,
    TabsPage
];
@NgModule({
    declarations: components,
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
    entryComponents: components,
  providers: [
        {provide: ErrorHandler, useClass: IonicErrorHandler},
    StatusBar,
    SplashScreen,
        Diagnostic,
        DiagnosticService,
        Device,
        GlobalVars,
        AlertController,
        LoadingController,
        Geolocation,
        Camera,
        File,
        BackgroundFetch
  ]
})
export class AppModule {}
