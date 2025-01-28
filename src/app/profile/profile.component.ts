import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../firebase.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userName: string = '';
  fName: string = '';
  lName: string = '';
  description: string = '';
  image: string = '';
  selectedImage: File | null = null;
  imagePreview: string | null = null;

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    const user = this.firebaseService.getUserFullName();
    if (user) {
      this.fName = user.fName;
      this.lName = user.lName;
      this.userName = `${this.fName} ${this.lName}`;
  
      // Load the description for the logged-in user
      this.firebaseService.getUserDescription().then((desc) => {
        if (desc) {
          this.description = desc;
        }
      }).catch((error) => {
        console.error('Error fetching description:', error);
      });

      // Load the image for the logged-in user if available
      this.firebaseService.getUserImage().then((imageUrl) => {
        if (imageUrl) {
          this.imagePreview = imageUrl;
        }
      }).catch((error) => {
        console.error('Error fetching image:', error);
      });
    } else {
      console.error('No logged-in user data available.');
    }
  }

  async uploadedImage(event: any): Promise<void> {
    const file = event.target.files[0]; //get and display selected file
    if (file) {
      this.selectedImage = file; //store the selected file in variable
      const reader = new FileReader(); // Helps read contents of file
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.image = reader.result as string; // Store base64 string for image
      };
      reader.readAsDataURL(file); // Start reading the file as a base64 data URL
    } else {
      console.log('No file selected');
      this.imagePreview = null;
    }
  }

  //button which calls the service file and executes the save
  async onDescriptionSubmit(): Promise<void> {
    if (!this.description) {
      alert('Description is empty');
      return;
    }
    try { // calling the firebase service file
      await this.firebaseService.addDescriptionToFirestore(this.description); 
      alert('Description saved successfully!');
    } catch (error) {
      console.error('Error saving description:', error);
      alert('Failed to save description. Please try again.');
    }
  }

  async onImageSubmit(): Promise<void> {
    if (!this.selectedImage) {
      alert('No image selected');
      return;
    }
    try {
      await this.firebaseService.addImageToFirestore(this.image); //calls the firestore and adds it
      alert('Image saved successfully!');
    } catch (error) {
      console.error('Error saving image', error);
      alert('Failed to save the image');
    }
  }
}
