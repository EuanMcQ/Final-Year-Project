import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../firebase.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
})
export class SignUpComponent {
  user = {
    fName: '',
    lName: '',
    username: '',
    password: '',
    confirmPassword: '',
    estate: '',
    //Following are placeholder fields. Can be updated on profile page.
    description: '',
    image: '',
  };

  constructor(private router: Router, private firebaseService: FirebaseService) {}

  async onSignUpSubmit() {
    // password match checker
    if (this.user.password !== this.user.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    //required fields
    if (this.isValidForm()) {
      const userConfig = {
        fName: this.user.fName,
        lName: this.user.lName,
        username: this.user.username,
        password: this.user.password,
        estate: this.user.estate,
        description: this.user.description,
        image: this.user.image,
      };

      try {
        await this.firebaseService.addUserToFirestore(userConfig); // using service
        console.log('User added to Firestore successfully.');
        this.router.navigate(['/']);
        this.resetForm();
      } catch (error) {
        console.error('Error adding user:', error);
        alert('An error occurred while signing up. Please try again.');
      }
    } else {
      alert('Please fill in all fields!');
    }
  }

  private isValidForm(): boolean {
    return !!(
      this.user.fName &&
      this.user.lName &&
      this.user.username &&
      this.user.password &&
      this.user.estate
    );
  }

  private resetForm() {
    this.user.fName = '';
    this.user.lName = '';
    this.user.username = '';
    this.user.password = '';
    this.user.confirmPassword = '';
    this.user.estate = '';
  }
}
