import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { DecisionComponent } from './components/decision/decision.component';
import { SubscriptionComponent } from './components/subscription/subscription.component';
import { FeedComponent } from './components/feed/feed.component';

const routes: Routes = [
{ path: '', redirectTo: 'landing', pathMatch: 'full' },
{ path: 'landing', component: LandingComponent },
{path : 'decision' , component:DecisionComponent},
{path : 'subscription' , component : SubscriptionComponent},
{path : 'feed' , component : FeedComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
