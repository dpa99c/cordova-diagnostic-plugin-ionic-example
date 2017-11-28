import {Component} from '@angular/core';
import {DiagnosticService} from '../../app/diagnostic.service';
import {Diagnostic} from '@ionic-native/diagnostic';
import {ExternalStorageDetailsModal} from './settings.externalStorageDetails.modal';
import {GlobalVars} from '../../app/app.globals';
import {AlertController, LoadingController, ModalController, Platform} from 'ionic-angular';
import {Geolocation} from '@ionic-native/geolocation';
import {Camera, CameraOptions} from '@ionic-native/camera';
import {File, DirectoryEntry} from '@ionic-native/file';
import {BackgroundFetch} from '@ionic-native/background-fetch';


@Component({
    selector: 'page-settings',
    templateUrl: 'settings.html'
})
export class SettingsPage {

    private loader;

    private writableExternalStoragePath: string;
    private backgroundFetching: boolean = false;


    constructor(
        private diagnostic: Diagnostic,
        private diagnosticService: DiagnosticService,
        private globals: GlobalVars,
        private platform: Platform,
        private alertCtrl: AlertController,
        private loadingCtrl: LoadingController,
        private modalCtrl: ModalController,
        private geolocation: Geolocation,
        private camera: Camera,
        private file: File,
        private backgroundFetch: BackgroundFetch

    ) {

        platform.ready().then(() => {
            if(this.globals.platform === "ios"){
                this.backgroundFetch.configure({}).then(() => {
                    console.log("Background fetch successful");
                    this.backgroundFetch.finish();
                });
            }

        });

    }

    private onError(title: string, msg: string){
        this.hideLoader();
        this.showAlert(msg, title);
        this.globals.onError(msg);
    }

    private showAlert(msg: string, title?: string){
        let alert = this.alertCtrl.create({
            title: title,
            subTitle: msg
        });
        alert.present();
    }

    private showLoader(){
        this.loader = this.loadingCtrl.create({
            content: "Please wait..."
        });
        this.loader.present();
    }

    private hideLoader(){
        this.loader.dismiss();
    }

    public showCurrentLocation(){
        let posOptions = { timeout: 10000, enableHighAccuracy: false, maximumAge: 10000 };
        this.showLoader();
        this.geolocation.getCurrentPosition(posOptions).then((position) => {
            this.hideLoader();
            this.showAlert("lat="+position.coords.latitude+", lon="+position.coords.longitude, "Current location");
        }).catch((err) => {
            this.hideLoader();
            this.showAlert("code="+ err.code + "\nmessage=" + err.message, "Position error");
        });
    }

    public useCamera(){
        let opts : CameraOptions = {
            saveToPhotoAlbum: false,
            destinationType: this.camera.DestinationType.DATA_URL
        };

        this.camera.getPicture(opts).then(() => {
            this.showAlert("Successfully took a photo");
        }, this.onError.bind(this, "Camera error"));
    }

    public enableBluetooth(){
        this.diagnostic.setBluetoothState(true).then(() =>{
            this.showAlert("Successfully enabled Bluetooth");
            this.diagnosticService.checkState();
        }, this.onError.bind(this, "Enable Bluetooth error"))
    }

    public disableBluetooth(){
        this.diagnostic.setBluetoothState(false).then(() =>{
            this.showAlert("Successfully disabled Bluetooth");
            this.diagnosticService.checkState();
        }, this.onError.bind(this, "Disable Bluetooth error"))
    }

    public enableWifi(){
        this.diagnostic.setWifiState(true).then(() =>{
            this.showAlert("Successfully enabled Wifi");
            this.diagnosticService.checkState();
        }, this.onError.bind(this, "Enable Wifi error"))
    }

    public disableWifi(){
        this.diagnostic.setWifiState(false).then(() =>{
            this.showAlert("Successfully disabled Wifi");
            this.diagnosticService.checkState();
        }, this.onError.bind(this, "Disable Wifi error"))
    }

    public getExternalStorageDetails(){
        this.diagnostic.getExternalSdCardDetails().then((details) => {
            let modal = this.modalCtrl.create(ExternalStorageDetailsModal, {details: details});
            modal.onDidDismiss(data => {
                if(data.writableFilePath){
                    this.writableExternalStoragePath = data.writableFilePath;
                }
            });
            modal.present();
        });
    }

    public writeToExternalStorage(){
        let $this = this;

        let onFail = (error) => {
            $this.onError.bind($this, "Write to external storage error")
        };

        let targetDir = this.writableExternalStoragePath;
        let filename = "test.txt";
        let targetFilepath = targetDir + "/" + filename;

        this.file.resolveLocalFilesystemUrl(targetDir).then((dirEntry: DirectoryEntry) => {
            this.file.getFile(dirEntry, filename, {
                create: true,
                exclusive: false
            }).then((fileEntry) => {
                fileEntry.createWriter(function (writer) {
                    writer.onwriteend = function (evt) {
                        $this.showAlert(targetFilepath, "Successfully wrote file");
                    };
                    writer.onerror = onFail;
                    writer.write("Hello world");
                }, onFail);
            }, onFail);
        }, onFail);
    }

    public isBackgroundFetching(){
        return this.backgroundFetching;
    }

    public startBackgroundFetching(){
        this.backgroundFetch.start();
        this.backgroundFetching = true;
        this.showAlert("Started background fetching");
    }

    public stopBackgroundFetching(){
        this.backgroundFetch.stop();
        this.backgroundFetching = false;
        this.showAlert("Stopped background fetching");
    }

}
