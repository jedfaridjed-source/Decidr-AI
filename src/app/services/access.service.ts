import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DeviceService } from './device.service';

@Injectable({
  providedIn: 'root'
})
export class AccessService {

  constructor(
    private http: HttpClient,
    private device: DeviceService
  ) {}

  checkAccess() {
    return this.http.post<any>(
      'http://localhost:3000/api/decision/check-access',
      {
        deviceId: this.device.getDeviceId()
      }
    );
  }
}