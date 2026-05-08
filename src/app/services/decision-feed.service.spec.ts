import { TestBed } from '@angular/core/testing';

import { DecisionFeedService } from './decision-feed.service';

describe('DecisionFeedService', () => {
  let service: DecisionFeedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DecisionFeedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
