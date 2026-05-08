import { Component, OnInit} from '@angular/core';
import { DecisionFeedService } from 'src/app/services/decision-feed.service';
import { NewsService } from 'src/app/services/news.service';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit  {
 
  feed: any[] = [];
  constructor(private service: DecisionFeedService,
              private news : NewsService
  ) {}
    ngOnInit() {
    // this.service.getFeed().subscribe(data => {
    //   this.feed = data;
    //   console.log(this.feed);
      
    //   this.news.postNews(this.feed).subscribe(response=>{
    //     console.log(response);
        
    //   })
    // });

    
  }

   getColor(signal: string) {
    switch (signal) {
      case 'BUY': return 'buy';
      case 'SELL': return 'sell';
      case 'WATCH': return 'watch';
      default: return 'ignore';
    }
  }
}
