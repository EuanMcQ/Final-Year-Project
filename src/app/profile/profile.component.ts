import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../firebase.service';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

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
  imagePreview: string | null = null; // For displaying the selected image preview

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
    } else {
      console.error('No logged-in user data available.');
    }
  }
  

  uploadedImage(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file; // Store the file for future use
      const reader = new FileReader();
  
      reader.onload = () => {
        this.imagePreview = reader.result as string; // Convert to base64 and store it
        console.log('Image Preview:', this.imagePreview); // Debugging: Check the preview URL
      };
  
      reader.readAsDataURL(file); // Read the file and trigger onload
    } else {
      console.log('No file selected');
      this.imagePreview = null; // Reset preview if no file is selected
    }
  }
  

  async onDescriptionSubmit(): Promise<void> {
    if (!this.description) {
      alert('Description is empty');
      return;
    }
  
    try {
      await this.firebaseService.addDescriptionToFirestore(this.description);
      alert('Description saved successfully!');
    } catch (error) {
      console.error('Error saving description:', error);
      alert('Failed to save description. Please try again.');
    }
  }  
}
