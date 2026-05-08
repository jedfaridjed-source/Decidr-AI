import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DecisionFeedService {

  constructor(private http : HttpClient) { }


  getFeed() {
    return this.http.get<any[]>('http://localhost:3000/api/decisions-feed');
  }
}
