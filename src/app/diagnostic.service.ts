import {Injectable} from '@angular/core';
import {Diagnostic} from '@ionic-native/diagnostic';
import {GlobalVars} from './app.globals';
import {Platform} from 'ionic-angular';
import { Events } from 'ionic-angular';
import {Observable} from 'rxjs/Rx';

@Injectable()
export class DiagnosticService {

    /*********************
     * Internal properties
     *********************/
    
    private stateCheckCount: number;
    private stateChanged: boolean;
    private stateChecking: boolean;

    private checkTimer;


    /********************
     * Public properties
     ********************/

    public static instance: DiagnosticService;

    public locationAvailable: boolean;
    public locationEnabled: boolean;
    public locationAuthorized: boolean;
    public locationAuthorizationStatus: string;
    public gpsLocationAvailable: boolean;
    public networkLocationAvailable: boolean;
    public gpsLocationEnabled: boolean;
    public networkLocationEnabled: boolean;
    public locationMode: string;

    public cameraAvailable: boolean;
    public cameraPresent: boolean;
    public cameraAuthorized: boolean;
    public cameraAuthorizationStatus: string;

    public cameraRollAuthorized: boolean;
    public cameraRollAuthorizationStatus: string;

    public wifiAvailable: boolean;
    public wifiEnabled: boolean;

    public bluetoothAvailable: boolean;
    public bluetoothEnabled: boolean;
    public bluetoothSupported: boolean;
    public bluetoothLESupported: boolean;
    public bluetoothPeripheralSupported: boolean;
    public bluetoothState: string;

    public microphoneAuthorized: boolean;
    public microphoneAuthorizationStatus: string;

    public contactsAuthorized: boolean;
    public contactsAuthorizationStatus: string;

    public calendarAuthorized: boolean;
    public calendarAuthorizationStatus: string;

    public remindersAuthorized: boolean;
    public remindersAuthorizationStatus: string;

    public backgroundRefreshAuthorized: boolean;
    public backgroundRefreshAuthorizationStatus: string;

    public remoteNotificationsEnabled: boolean;
    public remoteNotificationsRegistered: boolean;
    public remoteNotificationsTypes: {string: boolean};

    public motionTrackingAvailable: boolean;
    public motionAuthorizationStatusAvailable: boolean;
    public motionAuthorizationStatus: string;

    public nfcAvailable: boolean;
    public nfcPresent: boolean;
    public nfcEnabled: boolean;

    public externalSdAuthorized: boolean;
    public externalSdAuthorizationStatus: string;

    /********************
     * Internal functions
     ********************/
    private resetStateCheckCount(){
        let $this = DiagnosticService.instance;
        $this.stateCheckCount = 0;
        $this.stateChanged = false;
        $this.stateChecking = true;
    }
    
    private beginStateCheckFn(){
        let $this = DiagnosticService.instance;
        $this.stateCheckCount++;
    }

    private endStateCheckFn(){
        let $this = DiagnosticService.instance;
        $this.stateCheckCount--;
        if($this.stateCheckCount === 0){
            $this.stateChecking = false;
            if($this.stateChanged){
                $this.events.publish('diagnostic:stateupdated');
            }
        }
    }
    
    private onStateCheckError(error){
        let $this = DiagnosticService.instance;
        $this.endStateCheckFn();
        $this.globals.onError(error);
    }
    

    /**********************
     * Public API functions
     **********************/
    constructor(private diagnostic: Diagnostic,
                private globals: GlobalVars,
                private platform: Platform,
                private events: Events) {

        DiagnosticService.instance = this;

        platform.ready().then(() => {
            // Initial check and poll every 1s
            this.checkTimer = Observable.timer(0, 1000);
            this.checkTimer.subscribe(this.checkState);

            // Add state change listeners
            if (this.globals.platform === "android" || this.globals.platform === "ios") {
                this.diagnostic.registerBluetoothStateChangeHandler((state) => {
                    console.info("Bluetooth state changed to: " + state);
                    this.checkState();
                });
                this.diagnostic.registerLocationStateChangeHandler((state) => {
                    console.info("Location state changed to: " + state);
                    this.checkState();
                });
            }

            if (this.globals.platform === "android"){
                this.diagnostic.registerPermissionRequestCompleteHandler((statuses) => {
                    let msg = "Permission request complete: ";
                    for (var permission in statuses){
                        switch(statuses[permission]){
                            case this.diagnostic.permissionStatus.GRANTED:
                                msg += "permission granted to use "+permission;
                                break;
                            case this.diagnostic.permissionStatus.NOT_REQUESTED:
                                msg += "permission to use "+permission+" has not been requested yet";
                                break;
                            case this.diagnostic.permissionStatus.DENIED:
                                msg += "permission denied to use "+permission;
                                break;
                            case this.diagnostic.permissionStatus.DENIED_ALWAYS:
                                msg += "permission permanently denied to use "+permission;
                                break;
                        }
                    }
                    console.info(msg);
                });
                this.diagnostic.registerNFCStateChangeHandler((state) => {
                    console.info("NFC state changed to: " + state);
                    this.checkState();
                });
            }
        });

        this.platform.resume.subscribe(this.checkState);
    }

    public checkState() {
        let $this = DiagnosticService.instance;

        if($this.stateChecking){
            return;
        }
        
        $this.resetStateCheckCount();
        
        // All platforms
        $this.beginStateCheckFn();
        $this.diagnostic.isLocationAvailable().then((available) => {
            if($this.locationAvailable !== available){
                $this.stateChanged = true;
            }
            $this.locationAvailable = available;
            $this.endStateCheckFn();
        }, $this.onStateCheckError).catch($this.onStateCheckError);

        $this.beginStateCheckFn();
        $this.diagnostic.isCameraAvailable().then((available) => {
            if($this.cameraAvailable !== available){
                $this.stateChanged = true;
            }
            $this.cameraAvailable = available;
            $this.endStateCheckFn();
        }, $this.onStateCheckError).catch($this.onStateCheckError);

        $this.beginStateCheckFn();
        $this.diagnostic.isWifiAvailable().then((available) => {
            if($this.wifiAvailable !== available){
                $this.stateChanged = true;
            }
            $this.wifiAvailable = available;
            $this.endStateCheckFn();
        }, $this.onStateCheckError).catch($this.onStateCheckError);

        $this.beginStateCheckFn();
        $this.diagnostic.isWifiEnabled().then((enabled) => {
            if($this.wifiEnabled !== enabled){
                $this.stateChanged = true;
            }
            $this.wifiEnabled = enabled;
            $this.endStateCheckFn();
        }, $this.onStateCheckError).catch($this.onStateCheckError);

        $this.beginStateCheckFn();
        $this.diagnostic.isBluetoothAvailable().then((available) => {
            if($this.bluetoothAvailable !== available){
                $this.stateChanged = true;
            }
            $this.bluetoothAvailable = available;
            $this.endStateCheckFn();
        }, $this.onStateCheckError).catch($this.onStateCheckError);

        // Android & iOS
        if ($this.globals.platform === "android" || $this.globals.platform === "ios") {
            $this.beginStateCheckFn();
            $this.diagnostic.isLocationEnabled().then((enabled) => {
                if($this.locationEnabled !== enabled){
                    $this.stateChanged = true;
                }
                $this.locationEnabled = enabled;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.isLocationAuthorized().then((authorized) => {
                if($this.locationAuthorized !== authorized){
                    $this.stateChanged = true;
                }
                $this.locationAuthorized = authorized;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.getLocationAuthorizationStatus().then((status) => {
                if($this.locationAuthorizationStatus !== status){
                    $this.stateChanged = true;
                }
                $this.locationAuthorizationStatus = status;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.isCameraPresent().then((present) => {
                if($this.cameraPresent !== present){
                    $this.stateChanged = true;
                }
                $this.cameraPresent = present;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.isCameraAuthorized().then((authorized) => {
                if($this.cameraAuthorized !== authorized){
                    $this.stateChanged = true;
                }
                $this.cameraAuthorized = authorized;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.getCameraAuthorizationStatus().then((status) => {
                if($this.cameraAuthorizationStatus !== status){
                    $this.stateChanged = true;
                }
                $this.cameraAuthorizationStatus = status;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.getBluetoothState().then((state) => {
                if($this.bluetoothState !== state){
                    $this.stateChanged = true;
                }
                $this.bluetoothState = state;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.isMicrophoneAuthorized().then((authorized) => {
                if($this.microphoneAuthorized !== authorized){
                    $this.stateChanged = true;
                }
                $this.microphoneAuthorized = authorized;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.getMicrophoneAuthorizationStatus().then((status) => {
                if($this.microphoneAuthorizationStatus !== status){
                    $this.stateChanged = true;
                }
                $this.microphoneAuthorizationStatus = status;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.isContactsAuthorized().then((authorized) => {
                if($this.contactsAuthorized !== authorized){
                    $this.stateChanged = true;
                }
                $this.contactsAuthorized = authorized;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.getContactsAuthorizationStatus().then((status) => {
                if($this.contactsAuthorizationStatus !== status){
                    $this.stateChanged = true;
                }
                $this.contactsAuthorizationStatus = status;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.isCalendarAuthorized().then((authorized) => {
                if($this.calendarAuthorized !== authorized){
                    $this.stateChanged = true;
                }
                $this.calendarAuthorized = authorized;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.getCalendarAuthorizationStatus().then((status) => {
                if($this.calendarAuthorizationStatus !== status){
                    $this.stateChanged = true;
                }
                $this.calendarAuthorizationStatus = status;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);
        }

        // Android only
        if ($this.globals.platform === "android") {
            $this.beginStateCheckFn();
            $this.diagnostic.isGpsLocationAvailable().then((available) => {
                if($this.gpsLocationAvailable !== available){
                    $this.stateChanged = true;
                }
                $this.gpsLocationAvailable = available;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.isNetworkLocationAvailable().then((available) => {
                if($this.networkLocationAvailable !== available){
                    $this.stateChanged = true;
                }
                $this.networkLocationAvailable = available;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.isGpsLocationEnabled().then((enabled) => {
                if($this.gpsLocationEnabled !== enabled){
                    $this.stateChanged = true;
                }
                $this.gpsLocationEnabled = enabled;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.isNetworkLocationEnabled().then((enabled) => {
                if($this.networkLocationEnabled !== enabled){
                    $this.stateChanged = true;
                }
                $this.networkLocationEnabled = enabled;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.getLocationMode().then((mode) => {
                if($this.locationMode !== mode){
                    $this.stateChanged = true;
                }
                $this.locationMode = mode;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.isBluetoothEnabled().then((enabled) => {
                if($this.bluetoothEnabled !== enabled){
                    $this.stateChanged = true;
                }
                $this.bluetoothEnabled = enabled;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.hasBluetoothSupport().then((supported) => {
                if($this.bluetoothSupported !== supported){
                    $this.stateChanged = true;
                }
                $this.bluetoothSupported = supported;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.hasBluetoothLESupport().then((supported) => {
                if($this.bluetoothLESupported !== supported){
                    $this.stateChanged = true;
                }
                $this.bluetoothLESupported = supported;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.hasBluetoothLEPeripheralSupport().then((supported) => {
                if($this.bluetoothPeripheralSupported !== supported){
                    $this.stateChanged = true;
                }
                $this.bluetoothPeripheralSupported = supported;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.isNFCAvailable().then((available) => {
                if($this.nfcAvailable !== available){
                    $this.stateChanged = true;
                }
                $this.nfcAvailable = available;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.isNFCPresent().then((present) => {
                if($this.nfcPresent !== present){
                    $this.stateChanged = true;
                }
                $this.nfcPresent = present;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.isNFCEnabled().then((enabled) => {
                if($this.nfcEnabled !== enabled){
                    $this.stateChanged = true;
                }
                $this.nfcEnabled = enabled;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.isExternalStorageAuthorized().then((authorized) => {
                if($this.externalSdAuthorized !== authorized){
                    $this.stateChanged = true;
                }
                $this.externalSdAuthorized = authorized;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.getExternalStorageAuthorizationStatus().then((status) => {
                if($this.externalSdAuthorizationStatus !== status){
                    $this.stateChanged = true;
                }
                $this.externalSdAuthorizationStatus = status;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);
        }

        if($this.globals.platform === "ios"){
            $this.beginStateCheckFn();
            $this.diagnostic.isCameraRollAuthorized().then((authorized) => {
                if($this.cameraRollAuthorized !== authorized){
                    $this.stateChanged = true;
                }
                $this.cameraRollAuthorized = authorized;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.getCameraRollAuthorizationStatus().then((status) => {
                if($this.cameraRollAuthorizationStatus !== status){
                    $this.stateChanged = true;
                }
                $this.cameraRollAuthorizationStatus = status;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.isRemindersAuthorized().then((authorized) => {
                if($this.remindersAuthorized !== authorized){
                    $this.stateChanged = true;
                }
                $this.remindersAuthorized = authorized;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.getRemindersAuthorizationStatus().then((status) => {
                if($this.remindersAuthorizationStatus !== status){
                    $this.stateChanged = true;
                }
                $this.remindersAuthorizationStatus = status;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.isBackgroundRefreshAuthorized().then((authorized) => {
                if($this.backgroundRefreshAuthorized !== authorized){
                    $this.stateChanged = true;
                }
                $this.backgroundRefreshAuthorized = authorized;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.getBackgroundRefreshStatus().then((status) => {
                if($this.backgroundRefreshAuthorizationStatus !== status){
                    $this.stateChanged = true;
                }
                $this.backgroundRefreshAuthorizationStatus = status;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.isRemoteNotificationsEnabled().then((enabled) => {
                if($this.remoteNotificationsEnabled !== enabled){
                    $this.stateChanged = true;
                }
                $this.remoteNotificationsEnabled = enabled;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.isRegisteredForRemoteNotifications().then((registered) => {
                if($this.remoteNotificationsRegistered !== registered){
                    $this.stateChanged = true;
                }
                $this.remoteNotificationsRegistered = registered;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.getRemoteNotificationTypes().then((types) => {
                if($this.remoteNotificationsTypes !== types){
                    $this.stateChanged = true;
                }
                $this.remoteNotificationsTypes = types;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.isMotionAvailable().then((available) => {
                if($this.motionTrackingAvailable !== available){
                    $this.stateChanged = true;
                }
                $this.motionTrackingAvailable = available;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.isMotionRequestOutcomeAvailable().then((available) => {
                if($this.motionAuthorizationStatusAvailable !== available){
                    $this.stateChanged = true;
                }
                $this.motionAuthorizationStatusAvailable = available;
                if(!available){
                    $this.motionAuthorizationStatus = $this.diagnostic.permissionStatus.RESTRICTED;
                }
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);

            $this.beginStateCheckFn();
            $this.diagnostic.requestAndCheckMotionAuthorization().then((status) => {
                if($this.motionAuthorizationStatus !== status){
                    $this.stateChanged = true;
                }
                $this.motionAuthorizationStatus = status;
                $this.endStateCheckFn();
            }, $this.onStateCheckError).catch($this.onStateCheckError);
        }
    }

    // Location helpers
    public isLocationAvailable(){
        return this.locationAvailable;
    }

    public canRequestLocationAuthorization(){
        return this.locationAuthorizationStatus === this.diagnostic.permissionStatus.NOT_REQUESTED
            || this.locationAuthorizationStatus === this.diagnostic.permissionStatus.DENIED;
    }

    public requestLocationAuthorization(mode: string){
        this.diagnostic.requestLocationAuthorization(mode).then((status) => {
            console.log("Successfully requested location authorization: authorization was " + status);
            this.checkState();
        }, this.globals.onError).catch(this.globals.onError);
    }

    // Wifi helpers
    public canEnableWifi(){
        return !this.wifiEnabled;
    }

    public canDisableWifi(){
        return this.wifiEnabled;
    }

    // Bluetooth helpers
    public canEnableBluetooth(){
        return this.bluetoothState === this.diagnostic.bluetoothState.POWERED_OFF;
    }

    public canDisableBluetooth(){
        return this.bluetoothState === this.diagnostic.bluetoothState.POWERED_ON;
    }

    public canRequestBluetoothAuthorization(){
        return this.bluetoothState === this.diagnostic.bluetoothState.UNKNOWN
            || this.bluetoothState === this.diagnostic.bluetoothState.UNAUTHORIZED;
    }

    public requestBluetoothAuthorization(){
        this.diagnostic.requestBluetoothAuthorization().then(() => {
            this.checkState();
        }, this.globals.onError).catch(this.globals.onError);
    }

    // Camera helpers
    public isCameraAvailable(){
        return this.cameraAvailable;
    }

    public canRequestCameraAuthorization(){
        return this.cameraAuthorizationStatus === this.diagnostic.permissionStatus.NOT_REQUESTED
            || this.cameraAuthorizationStatus === this.diagnostic.permissionStatus.DENIED;
    }

    public requestCameraAuthorization(){
        this.diagnostic.requestCameraAuthorization().then(() => {
            this.checkState();
        }, this.globals.onError).catch(this.globals.onError);
    }

    // Camera Roll helpers
    public canRequestCameraRollAuthorization(){
        return this.cameraRollAuthorizationStatus === this.diagnostic.permissionStatus.NOT_REQUESTED
            || this.cameraRollAuthorizationStatus === this.diagnostic.permissionStatus.DENIED;
    }

    public requestCameraRollAuthorization(){
        this.diagnostic.requestCameraRollAuthorization().then(() => {
            this.checkState();
        }, this.globals.onError).catch(this.globals.onError);
    }

    // Microphone helpers
    public canRequestMicrophoneAuthorization(){
        return this.microphoneAuthorizationStatus === this.diagnostic.permissionStatus.NOT_REQUESTED
            || this.microphoneAuthorizationStatus === this.diagnostic.permissionStatus.DENIED;
    }

    public requestMicrophoneAuthorization(){
        this.diagnostic.requestMicrophoneAuthorization().then(() => {
            this.checkState();
        }, this.globals.onError).catch(this.globals.onError);
    }

    // Contacts helpers
    public canRequestContactsAuthorization(){
        return this.contactsAuthorizationStatus === this.diagnostic.permissionStatus.NOT_REQUESTED
            || this.contactsAuthorizationStatus === this.diagnostic.permissionStatus.DENIED;
    }

    public requestContactsAuthorization(){
        this.diagnostic.requestContactsAuthorization().then(() => {
            this.checkState();
        }, this.globals.onError).catch(this.globals.onError);
    }

    // Calendar helpers
    public canRequestCalendarAuthorization(){
        return this.calendarAuthorizationStatus === this.diagnostic.permissionStatus.NOT_REQUESTED
            || this.calendarAuthorizationStatus === this.diagnostic.permissionStatus.DENIED;
    }

    public requestCalendarAuthorization(){
        this.diagnostic.requestCalendarAuthorization().then(() => {
            this.checkState();
        }, this.globals.onError).catch(this.globals.onError);
    }

    // Reminders helpers
    public canRequestRemindersAuthorization(){
        return this.remindersAuthorizationStatus === this.diagnostic.permissionStatus.NOT_REQUESTED
            || this.remindersAuthorizationStatus === this.diagnostic.permissionStatus.DENIED;
    }

    public requestRemindersAuthorization(){
        this.diagnostic.requestRemindersAuthorization().then(() => {
            this.checkState();
        }, this.globals.onError).catch(this.globals.onError);
    }

    // Motion helpers
    public canRequestMotionAuthorization(){
        return this.motionTrackingAvailable && (
            this.motionAuthorizationStatus === this.diagnostic.permissionStatus.NOT_REQUESTED
            || this.motionAuthorizationStatus === this.diagnostic.permissionStatus.DENIED);
    }

    public requestAndCheckMotionAuthorization(){
        this.diagnostic.requestAndCheckMotionAuthorization().then(() => {
            this.checkState();
        }, this.globals.onError).catch(this.globals.onError);
    }

    // External SD helpers
    public canRequestExternalStorageAuthorization(){
        return this.externalSdAuthorizationStatus === this.diagnostic.permissionStatus.NOT_REQUESTED
            || this.externalSdAuthorizationStatus === this.diagnostic.permissionStatus.DENIED;
    }

    public requestExternalStorageAuthorization(){
        this.diagnostic.requestExternalStorageAuthorization().then(() => {
            this.checkState();
        }, this.globals.onError).catch(this.globals.onError);
    }

    public canGetExternalStorageDetails(){
        return this.externalSdAuthorizationStatus === this.diagnostic.permissionStatus.GRANTED;
    }



}