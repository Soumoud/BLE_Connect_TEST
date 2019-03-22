import { Component, NgZone } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
import * as moment from 'moment';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  devices: any[] = [];
  device_name:any;
  device_addr:any;
  device_temp:any;
  device_time:any;
  constructor(public navCtrl: NavController,
    private toastCtrl: ToastController,
        private ble: BLE,
              private ngZone: NgZone) {
                console.log('ionViewDidEnter');
                this.scan();

  }
  scan() {
    
    this.devices = [];  // clear list

    this.ble.scan([], 5).subscribe(
      device => this.onDeviceDiscovered(device), 
      error => this.scanError(error)
    );

   
  }
  onDeviceDiscovered(device) {
    console.log('Discovered ' + JSON.stringify(device, null, 2));
    this.ngZone.run(() => {
      this.devices.push(device);
    });
  }

  // If location permission is denied, you'll end up here
  scanError(error) {
    
    let toast = this.toastCtrl.create({
      message: 'Error scanning for Bluetooth low energy devices',
      position: 'middle',
      duration: 5000
    });
    toast.present();
  }
  deviceSelected(device) {
    this.ble.connect(device.id).subscribe(
      peripheral  => this.onConnected(peripheral),
      _ => {this.onDeviceDisconnected()}
    );
  }
  onDeviceDisconnected(): any {
    let toast = this.toastCtrl.create({
      message: 'The peripheral unexpectedly disconnected',
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
  
  onConnected(peripheral: any): any {
    this.ngZone.run(() => {
      //getting device name
      this.device_name=peripheral.name;
      this.device_addr=peripheral.id;
      //reading Temperature chracteristic
      this.ble.read(peripheral.id, "BEBE","2A26").then((value) => {
         this.device_temp=this.bytesToString(value)
        }).catch(err => {
          console.log('Reading temperature  err' +err);
        });
        //reading Time chracteristic
        this.ble.read(peripheral.id, "BEBE","2A22").then((value) => {
        this.device_time=moment.unix(this.byteArrayToLong(value)).format('dddd, MMMM Do, YYYY h:mm:ss A')
     
        }).catch(err => {
          console.log('Reading Time version err' +err);
        });
       
  
     
 
    });
  }
  bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint16Array(buffer));
 
 }

byteArrayToLong (byteArray) {
  var value = 0;
  for ( var i = byteArray.length - 1; i >= 0; i--) {
      value = (value * 256) + byteArray[i];
  }

  return value;
};
}
