import { NgModule } from '@angular/core';
import { FormsModule} from '@angular/forms';
import { AppComponent } from '../app.component';
import { LoginComponent } from '../login/login.component';
import { SignUpComponent } from '../sign-up/sign-up.component';
import { AppRoutingModule } from '../app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { WelcomePageComponent } from '../welcome-page/welcome-page.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { ProfileComponent } from '../profile/profile.component';
import { FirebaseService } from '../firebase.service';



@NgModule({ //module allows components to be declared and work together
  declarations: [AppComponent, WelcomePageComponent,  LoginComponent, SignUpComponent, DashboardComponent, ProfileComponent],
  imports: [AppRoutingModule, BrowserModule, FormsModule],
  providers: [FirebaseService],
  bootstrap: [AppComponent],
})
export class CQModule { }
