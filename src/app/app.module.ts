import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DecisionComponent } from './components/decision/decision.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { LandingComponent } from './components/landing/landing.component';
import { NavComponent } from './components/nav/nav.component';
import { SubscriptionComponent } from './components/subscription/subscription.component';
import { LoginComponent } from './components/login/login.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { FeedComponent } from './components/feed/feed.component';

@NgModule({
  declarations: [
    AppComponent,
    DecisionComponent,
    LandingComponent,
    NavComponent,
    SubscriptionComponent,
    LoginComponent,
    CheckoutComponent,
    FeedComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
       FormsModule
  
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
