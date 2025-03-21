import { Injectable } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { collection, getFirestore, getDoc, getDocs, doc, setDoc, deleteDoc, arrayUnion, updateDoc} from 'firebase/firestore';

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

  async addTicketForUser(ticket: any): Promise<void> {
    const username = localStorage.getItem('username');
    const firstName = localStorage.getItem('firstName');
    const lastName = localStorage.getItem('lastName');
  
    if (!username || !firstName || !lastName) {
      throw new Error('User details are missing.');
    }
  
    // Add the creator field with the full name and initialize usersAccepted array
    const newTicket = {
      ...ticket,
      creator: `${firstName} ${lastName}`,
      username: username,
      usersAccepted: [], // Initialize an empty array to track accepted users
    };
  
    console.log("Saving ticket:", newTicket);
  
    try {
      // Store ticket under the user's document
      const ticketsDocRef = doc(this.db, 'tickets', username);
      const docSnapshot = await getDoc(ticketsDocRef);
  
      if (docSnapshot.exists()) {
        // If document exists, add the ticket to the user's ticket list
        await setDoc(ticketsDocRef, { tickets: arrayUnion(newTicket) }, { merge: true });
      } else {
        // If document doesn't exist, create a new one with the ticket list
        await setDoc(ticketsDocRef, { tickets: [newTicket] });
      }
  
      console.log('Ticket added successfully for:', username);
    } catch (error) {
      console.error('Error adding ticket:', error);
      throw error;
    }
  }  

  async getAllTickets(): Promise<any[]> {
    try {
        const ticketsCollectionRef = collection(this.db, 'tickets');
        const querySnapshot = await getDocs(ticketsCollectionRef);
        let allTickets: any[] = [];

        querySnapshot.forEach((doc) => {
            const userTickets = doc.data()?.['tickets'] || [];
            userTickets.forEach((ticket: any) => {
                allTickets.push(ticket);
            });
        });

        return allTickets;
    } catch (error) {
        console.error('Error fetching all tickets:', error);
        throw error;
    }
  }



  async incrementTicketCount(ticket: any): Promise<void> {
    const username = localStorage.getItem('username');
    if (!username) {
      throw new Error('No logged-in user');
    }
  
    try {
      const ticketsDocRef = doc(this.db, 'tickets', ticket.username); // Reference to the creator's ticket document
      const docSnapshot = await getDoc(ticketsDocRef); // Get the user's tickets document
  
      if (docSnapshot.exists()) {
        const ticketsData = docSnapshot.data()?.['tickets'] || []; // Array of tickets
  
        // Find the specific ticket by activityName and date
        const ticketIndex = ticketsData.findIndex(
          (t: any) => t.activityName === ticket.activityName && t.date === ticket.date
        );
  
        if (ticketIndex !== -1) {
          // Get the current list of users who have accepted this ticket
          const usersAccepted = ticketsData[ticketIndex].usersAccepted || [];
  
          // Check if the user has already accepted this ticket
          if (usersAccepted.includes(username)) {
            console.log('You have already accepted this ticket.');
            return; // Prevent multiple accepts by the same user
          }
  
          // Check if there's still space left (maxCapacity not reached)
          if (ticketsData[ticketIndex].currentCount < ticketsData[ticketIndex].maxCapacity) {
            // Increment the current count of the ticket
            ticketsData[ticketIndex].currentCount += 1;
  
            // Add the username to the accepted users list
            usersAccepted.push(username);
            ticketsData[ticketIndex].usersAccepted = usersAccepted;
  
            // Save the updated ticket data back to Firestore
            await setDoc(ticketsDocRef, { tickets: ticketsData }, { merge: true });
            console.log('Ticket count updated successfully!');
          } else {
            console.log('Max capacity reached.');
          }
        } else {
          console.error('Ticket not found.');
        }
      } else {
        console.error('No tickets document found for this user.');
      }
    } catch (error) {
      console.error('Error updating ticket count:', error);
      throw error;
    }
  } 

  async deleteTicket(eventToDelete: any): Promise<void> {
    const userEmail = localStorage.getItem('username'); // Use email as document ID
  
    if (!userEmail) {
      console.error('No logged-in user');
      return;
    }
  
    // Ensure only the creator can delete their own event
    if (eventToDelete.username !== userEmail) {
      console.error('Unauthorized: You can only delete tickets you created.');
      return;
    }
  
    try {
      const ticketsDocRef = doc(this.db, 'tickets', userEmail);
      const docSnapshot = await getDoc(ticketsDocRef);
  
      if (!docSnapshot.exists()) {
        console.error('No ticket document found for this user.');
        return;
      }
  
      const ticketData = docSnapshot.data();
      const updatedTickets = ticketData['tickets'].filter((event: any) => 
        event.activityName !== eventToDelete.activityName || 
        event.date !== eventToDelete.date
      );
  
      await updateDoc(ticketsDocRef, { tickets: updatedTickets });
  
      console.log('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  }  

  async addTicketForUserEvents(event: any): Promise<void> {
    const username = localStorage.getItem('username');
    const firstName = localStorage.getItem('firstName');
    const lastName = localStorage.getItem('lastName');

    if (!username || !firstName || !lastName) {
      throw new Error('User details are missing.');
    }

    // Create event object with creator info
    const newEvent = {
      ...event,
      creator: `${firstName} ${lastName}`,
      username: username,
      usersAccepted: [], // Initialize accepted users array
      currentCount: 0, // Ensure we have an initial count
    };

    console.log('Saving event:', newEvent);

    try {
      const eventsDocRef = doc(this.db, 'events', username);
      const docSnapshot = await getDoc(eventsDocRef);

      if (docSnapshot.exists()) {
        // Merge new ticket with existing tickets
        await setDoc(eventsDocRef, { events: arrayUnion(newEvent) }, { merge: true });
      } else {
        // Create a new document with the ticket array
        await setDoc(eventsDocRef, { events: [newEvent] });
      }

      console.log('Event added successfully for:', username);
    } catch (error) {
      console.error('Error adding ticket:', error);
      throw error;
    }
  }

  async getAllEvents(): Promise<any[]> {
    try {
      const eventsCollectionRef = collection(this.db, 'events');
      const querySnapshot = await getDocs(eventsCollectionRef);
      let allEvents: any[] = [];
      
      querySnapshot.forEach((doc) => {
        const userEvents = doc.data()?.['events'] || [];
        console.log('User Events:', userEvents);  // Check the events data
        
        userEvents.forEach((event: any) => {
          allEvents.push(event);
        });
      });
      
      console.log('All Events:', allEvents);  // Check the final allEvents array
      return allEvents;
    } catch (error) {
      console.error('Error fetching all events:', error);
      throw error;
    }
  }
    
  async incrementTicketCountEvents(event: any): Promise<void> {
    const username = localStorage.getItem('username');
    if (!username) {
      throw new Error('No logged-in user');
    }

    try {
      const eventsDocRef = doc(this.db, 'events', event.username); // Reference to creator's tickets
      const docSnapshot = await getDoc(eventsDocRef);

      if (docSnapshot.exists()) {
        let eventData = docSnapshot.data()?.['events'] || []; // Retrieve event tickets

        // Find specific event in tickets
        const eventIndex = eventData.findIndex(
          (e: any) => e.activityName === event.activityName && e.date === event.date
        );

        if (eventIndex !== -1) {
          const selectedEvent = eventData[eventIndex];
          const usersAccepted = selectedEvent.usersAccepted || [];

          // Prevent duplicate user acceptance
          if (usersAccepted.includes(username)) {
            console.log('You have already accepted this event.');
            return;
          }

          // Check capacity
          if (selectedEvent.currentCount < selectedEvent.maxCapacity) {
            selectedEvent.currentCount += 1;
            selectedEvent.usersAccepted.push(username); // Add user

            // Update Firestore with new data
            eventData[eventIndex] = selectedEvent;
            await setDoc(eventsDocRef, { events: eventData }, { merge: true });

            console.log('event count updated successfully!');
          } else {
            console.log('Max capacity reached.');
          }
        } else {
          console.error('Event not found.');
        }
      } else {
        console.error('No events document found for this user.');
      }
    } catch (error) {
      console.error('Error updating event count:', error);
      throw error;
    }
  }

  async deleteEvent(eventToDelete: any): Promise<void> {
    const userEmail = localStorage.getItem('username'); // Use email as document ID
  
    if (!userEmail) {
      console.error('No logged-in user');
      return;
    }
  
    // Ensure only the creator can delete their own event
    if (eventToDelete.username !== userEmail) {
      console.error('Unauthorized: You can only delete events you created.');
      return;
    }
  
    try {
      const eventsDocRef = doc(this.db, 'events', userEmail);
      const docSnapshot = await getDoc(eventsDocRef);
  
      if (!docSnapshot.exists()) {
        console.error('No event document found for this user.');
        return;
      }
  
      const eventData = docSnapshot.data();
      const updatedEvents = eventData['events'].filter((event: any) => 
        event.activityName !== eventToDelete.activityName || 
        event.date !== eventToDelete.date
      );
  
      await updateDoc(eventsDocRef, { events: updatedEvents });
  
      console.log('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  }  

  async addComplaintToFirebase(postId: string, complaintText: string, username: string): Promise<void> {
    // Validate inputs to ensure they are not undefined
    if (!postId || !complaintText || !username) {
      console.error('Invalid data for complaint submission:', postId, complaintText, username);
      throw new Error('Complaint data is invalid');
    }

    // Get the post details (e.g., content and author) based on postId
    const postDetails = this.getPostDetails(postId);  // Method to retrieve the post details from localStorage or Firebase

    const complaintData = {
      complaint: complaintText,
      date: new Date(),
      reportedBy: username,  // Store the username of the person reporting
      reportedByName: localStorage.getItem('fullName') || 'Anonymous',  // Store the full name if available
      postId: postId,  // Store the ID of the ticket/post being complained about
      postContent: postDetails.content,  // Store the content of the post being complained about
      postAuthor: postDetails.author,  // Store the author of the post being reported
      postAuthorName: postDetails.authorName,  // Store the author's name of the post
    };

    try {
      // Document reference for the specific ticket in the 'reports' collection
      const reportsDocRef = doc(this.db, 'reports', postId);  // Use postId as the document ID

      // Add complaint data to the 'complaints' array under the ticket (postId)
      await setDoc(
        reportsDocRef,
        { complaints: arrayUnion(complaintData) },  // Append the complaint to the complaints array
        { merge: true }  // Merge data instead of overwriting
      );
      console.log('Complaint added to Firestore!');
    } catch (error) {
      console.error('Error adding complaint to Firestore:', error);
      throw error;
    }
  }

  // Helper method to retrieve post details based on postId (could be from localStorage or Firebase)
  getPostDetails(postId: string): any {
    const savedPosts = JSON.parse(localStorage.getItem('bulletinPosts') || '[]');
    const post = savedPosts.find((p: any) => p.id === postId);
    
    return {
      content: post?.content || 'No content available',
      author: post?.author || 'Unknown author',
      authorName: post?.author || 'Unknown author' // You could use full name from localStorage if available
    };
  }
  
  async getUserEvents(): Promise<{ tickets: any[]; events: any[] }> {
    const username = localStorage.getItem('username');
    if (!username) {
      console.error('No user is logged in.');
      return { tickets: [], events: [] }; // Return empty arrays if no user
    }
  
    try {
      // Fetch tickets from 'tickets' collection
      const ticketsDocRef = doc(this.db, 'tickets', username);
      const ticketsDocSnapshot = await getDoc(ticketsDocRef);
  
      // Fetch events from 'events' collection
      const eventsDocRef = doc(this.db, 'events', username);
      const eventsDocSnapshot = await getDoc(eventsDocRef);
  
      let tickets = [];
      let events = [];
  
      if (ticketsDocSnapshot.exists()) {
        const ticketsData = ticketsDocSnapshot.data();
        tickets = ticketsData['tickets'] || [];  // Default to empty if 'tickets' doesn't exist
      }
  
      if (eventsDocSnapshot.exists()) {
        const eventsData = eventsDocSnapshot.data();
        events = eventsData['events'] || [];  // Default to empty if 'events' doesn't exist
      }
  
      return { tickets, events };  // Return both tickets and events
    } catch (error) {
      console.error('Error fetching user events:', error);
      throw error;
    }
  }  
}
