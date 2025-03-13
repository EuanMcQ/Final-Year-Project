import { NgModule } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { RouterModule, Routes } from '@angular/router';
import { SignUpComponent } from './sign-up/sign-up.component';
import { WelcomePageComponent } from './welcome-page/welcome-page.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { HelpingHandComponent } from './helping-hand/helping-hand.component';
import { EventsComponent } from './events/events.component';
import { MyticketComponent } from './myticket/myticket.component';

const routes: Routes = [ //path declerations
  {path: '', component: WelcomePageComponent},
  {path: 'Login', component: LoginComponent},
  {path: 'signUp', component: SignUpComponent},
  {path: 'dashboard', component: DashboardComponent}, 
  {path: 'profile', component: ProfileComponent},
  {path: 'helpingHand', component:HelpingHandComponent},
  {path:'events', component:EventsComponent},
  {path:'myTicket', component:MyticketComponent}

];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
