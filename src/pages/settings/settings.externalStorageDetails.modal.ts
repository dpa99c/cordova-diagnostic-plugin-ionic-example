import {Component} from '@angular/core';
import {NavParams, ViewController} from 'ionic-angular';

@Component({
    selector: 'modal-externalStorageDetails',
    templateUrl: 'settings.externalStorageDetails.modal.html'
})
export class ExternalStorageDetailsModal {

    public details: any;
    private writableFilePath: string;

    constructor(
        public params: NavParams,
        public viewCtrl: ViewController
    ) {
        this.details = this.params.get('details');

        this.details.forEach((detail) => {
            if(detail.canWrite){
                this.writableFilePath = detail.filePath;
            }
        });
    }

    dismiss() {
        this.viewCtrl.dismiss({writableFilePath: this.writableFilePath});
    }
}