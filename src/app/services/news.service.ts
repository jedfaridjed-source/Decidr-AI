import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
   URL ='http://localhost:3000/news'

  constructor(private http :HttpClient) { }

postNews(news: any) {
  console.log(news);
  
  return this.http.post<any>(this.URL, news);
}

getAllNews (){
 return this.http.get(this.URL)
}
}
