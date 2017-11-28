import {Injectable} from '@angular/core';


@Injectable()
export class GlobalVars {

    public platform: string;

    constructor() {
        this.platform = "unknown";
    }

    public onError(error) {
        console.error("Error: " + error);
    }

}