import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-decision',
  templateUrl: './decision.component.html',
  styleUrls: ['./decision.component.scss']
})
export class DecisionComponent {

 category = 'business';
question = '';

messages: any[] = [];
result: any;
loading = false;

  constructor(private api: ApiService) {}



ask() {
  if (!this.question.trim()) return;

  const userQuestion = this.question;

  // USER MESSAGE
  this.messages.push({
    type: 'user',
    text: userQuestion,
    category: this.category
  });

  this.question = '';
  this.loading = true;

  // AI RESPONSE
  setTimeout(() => {

    const aiResponse = {
      decision: "Go for it",
      confidence: 87,
      reasons: [
        "High demand",
        "Low risk",
        "Good timing"
      ]
    };

    this.messages.push({
      type: 'ai',
      text: "Here is your decision analysis:",
      data: aiResponse
    });

    this.loading = false;

  }, 800);
}
}