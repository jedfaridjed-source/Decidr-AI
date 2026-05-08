import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component,OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccessService } from 'src/app/services/access.service';
import { DeviceService } from 'src/app/services/device.service';
import { CryptoService } from './services/crypto.service';
import { NewsService } from './services/news.service';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit  {
title = 'Decidr';
loading = true;
  constructor(
    private accessService: AccessService,
    private deviceService: DeviceService,
    private router: Router,
    private http : HttpClient,
    private cryptoService: CryptoService,
    private news : NewsService
    
  
  
  ) {}

   private key = 'device_id';
 ngOnInit(): void {
    // this.checkAccess();
   
    //   this.http.get('http://localhost:3000/api/test-llm')
    // .subscribe({
    //   next: (res) => console.log('✅ DONE', res),
    //   error: (err) => console.error('❌ ERROR', err)
    // });
   this.cryptoService.getAllCryptos().subscribe({
      next: (data) => {
        console.log('✅ crypto data:', data);
      },
      error: (err) => {
        console.error('❌ error:', err);
      }
    });
this.news.getAllNews().subscribe((response)=>{
  console.log(response);
  
})
  }

  checkAccess() {
    const deviceId = this.deviceService.getDeviceId();

   this.accessService.checkAccess().subscribe({
  next: (res) => {
    console.log(res,'res');
    
    this.loading = false;

    if (!res.allowed) {
      this.router.navigate(['/subscription']);
    }
  },
  error: () => {
    this.loading = false;
    this.router.navigate(['/subscription']);
  }
});
  }
}