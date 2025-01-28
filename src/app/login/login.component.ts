import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../firebase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private router: Router, private firebaseService: FirebaseService) {}

  async onLoginButtonClick() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in both fields.';
      return;
    }

    try {
      //query to firebase for email and password verification
      const user = await this.firebaseService.login(this.email, this.password);
      
      if (user) {
        this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      this.errorMessage = this.getErrorMessage(error);
    }
  }

  private getErrorMessage(error: any): string {
    if (error.message === 'Incorrect username or password') {
      return 'Incorrect credentials. Please check your details.';
    } else {
      return 'An unexpected error occurred. Please try again.';
    }
  }
}
