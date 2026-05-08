import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  private Url = 'http://localhost:3000/api/crypto';

  constructor(private http: HttpClient) {}

  getAllCryptos(): Observable<any> {
    return this.http.get(`${this.Url}`);
  }

  getCrypto(symbol: string): Observable<any> {
    return this.http.get(`${this.Url}/${symbol}`);
  }
}