import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  private key = 'device_id';

  getDeviceId(): string {
    let id = localStorage.getItem(this.key);

    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(this.key, id);
    }

    return id;
  }
}