import { Injectable } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, arrayUnion } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private firebaseConfig = {
    apiKey: 'AIzaSyBYcAozYjRmTo0RYAe7cIjNb-XY1dlLVdc',
    authDomain: 'close-quarters-30df2.firebaseapp.com',
    projectId: 'close-quarters-30df2',
    storageBucket: 'close-quarters-30df2.appspot.com',
    messagingSenderId: '145048371036',
    appId: '1:145048371036:web:6a6d333ba89cd5124fcb99',
    measurementId: 'G-HTBYD5DTMV',
  };

  private app: FirebaseApp;
  private db: any;
  private loggedInUser: any = null;

  constructor() {
    this.app = initializeApp(this.firebaseConfig);
    this.db = getFirestore(this.app);
  }

  // Helper function to get user from Firestore
  private async fetchUserFromFirestore(email: string): Promise<any> {
    try {
      const credentialsDocRef = doc(this.db, 'User', 'Credentials');
      const docSnapshot = await getDoc(credentialsDocRef);

      if (docSnapshot.exists()) {
        const users = docSnapshot.data()?.['users'];
        return users?.find((user: any) => user.username === email) || null;
      } else {
        console.error('No Credentials document found.');
        return null;
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Add user to Firestore
  async addUserToFirestore(userConfig: any): Promise<void> {
    try {
      const credentialsDocRef = doc(this.db, 'User', 'Credentials');
      await setDoc(
        credentialsDocRef,
        { users: arrayUnion(userConfig) },
        { merge: true }
      );
    } catch (error) {
      console.error('Error adding user to Firestore:', error);
      throw error;
    }
  }

  // Login user and store user data
  async login(email: string, password: string): Promise<any> {
    const user = await this.fetchUserFromFirestore(email);

    if (user && user.password === password) {
      console.log('User logged in successfully:', user);
      this.loggedInUser = user; // Store logged-in user

      // Store details in localStorage for access
      localStorage.setItem('firstName', user.fName || 'First Name Not Available');
      localStorage.setItem('lastName', user.lName || 'Last Name Not Available');
      localStorage.setItem('username', user.username);
      return user;
    } else {
      throw new Error('Incorrect username or password');
    }
  }

  // Get user credentials for the profile
  async getUserCredentials(email: string): Promise<any> {
    const user = await this.fetchUserFromFirestore(email);

    if (user) {
      // Store user data in localStorage for easy access later
      localStorage.setItem('firstName', user.fName || 'First Name Not Available');
      localStorage.setItem('lastName', user.lName || 'Last Name Not Available');
      console.log('Matched user:', user);
      return user;
    }
    return null;
  }

  // Get the full name of the logged-in user (either from localStorage or current user)
  getUserFullName(): { fName: string; lName: string; username: string } | null {
    const user = this.loggedInUser || {
      fName: localStorage.getItem('firstName'),
      lName: localStorage.getItem('lastName'),
      username: localStorage.getItem('username'),
    };

    if (user?.fName && user?.lName && user?.username) {
      return {
        fName: user.fName || 'First Name Not Available',
        lName: user.lName || 'Last Name Not Available',
        username: user.username,
      };
    }
    return null;
  }

  // Update user profile
  async updateUserProfile(userConfig: any): Promise<void> {
    try {
      const credentialsDocRef = doc(this.db, 'User', 'Credentials');
      const docSnapshot = await getDoc(credentialsDocRef);

      if (docSnapshot.exists()) {
        const users = docSnapshot.data()?.['users'] || [];
        const updatedUsers = users.map((u: any) =>
          u.username === userConfig.username ? { ...u, ...userConfig } : u
        );

        // Save the updated users array back to Firestore
        await setDoc(credentialsDocRef, { users: updatedUsers }, { merge: true });
      } else {
        throw new Error('No credentials document found.');
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Add description to Firestore
  async addDescriptionToFirestore(description: string): Promise<void> {
    const user = this.getUserFullName();
    if (!user) {
      throw new Error('No logged-in user.');
    }

    try {
      const credentialsDocRef = doc(this.db, 'User', 'Credentials');
      const docSnapshot = await getDoc(credentialsDocRef);

      if (docSnapshot.exists()) {
        const users = docSnapshot.data()?.['users'] || [];
        const updatedUsers = users.map((u: any) => //Update the description if it changes.
          u.username === user.username ? { ...u, description } : u
        );

        // Save the updated users array back to Firestore
        await setDoc(credentialsDocRef, { users: updatedUsers }, { merge: true });
        console.log('Description updated successfully for:', user.username);
      } else {
        throw new Error('No credentials document found.');
      }
    } catch (error) {
      console.error('Error updating description in Firestore:', error);
      throw error;
    }
  }

  // Get user description
  async getUserDescription(): Promise<string | null> {
    const user = this.getUserFullName(); //get user full name
    if (!user) {
      throw new Error('No logged-in user.');
    }

    try {
      const credentialsDocRef = doc(this.db, 'User', 'Credentials'); //Reference Firebase db
      const docSnapshot = await getDoc(credentialsDocRef); //fetch document

      if (docSnapshot.exists()) { //check document it exists
        const users = docSnapshot.data()?.['users'] || []; //retrieve the users to match and ensure
        const matchedUser = users.find((u: any) => u.username === user.username); //Find the matching user
        return matchedUser?.description || null; //return if exists
      } else {
        throw new Error('No credentials document found.');
      }
    } catch (error) {
      console.error('Error fetching user description:', error);
      throw error;
    }
  }

  async addImageToFirestore(image: string): Promise<void> {
    const user = this.getUserFullName();
    if (!user) {
      throw new Error('No logged-in user');
    }
  
    try {
      const credentialsDocRef = doc(this.db, 'User', 'Credentials');
      const docSnapshot = await getDoc(credentialsDocRef);
  
      if (docSnapshot.exists()) {
        const users = docSnapshot.data()?.['users'] || [];
        const updatedUsers = users.map((u: any) => //update the image if the username does match
          u.username === user.username ? { ...u, image } : u
        );
  
        // Save the updated users array back to Firestore
        await setDoc(credentialsDocRef, { users: updatedUsers }, { merge: true });
        console.log('Image updated successfully for:', user.username);
      } else {
        throw new Error('No credentials document found.');
      }
    } catch (error) {
      console.error('Error updating image in Firestore:', error);
      throw error;
    }
  }
  

  async getUserImage(): Promise<string | null> {
    const user = this.getUserFullName();
    if (!user) {
      throw new Error('No logged-in user.');
    }
  
    try {
      const credentialsDocRef = doc(this.db, 'User', 'Credentials');
      const docSnapshot = await getDoc(credentialsDocRef);
  
      if (docSnapshot.exists()) {
        const users = docSnapshot.data()?.['users'] || [];
        const matchedUser = users.find((u: any) => u.username === user.username);
        return matchedUser?.image || null;  // Fixed to return the image
      } else {
        throw new Error('No credentials document found.');
      }
    } catch (error) {
      console.error('Error fetching user image:', error);
      throw error;
    }
  }
}
