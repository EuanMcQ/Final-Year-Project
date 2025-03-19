import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../firebase.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {
  activityName: string = '';
  date: string = '';
  description: string = '';
  maxCapacity: number | null = null;
  showForm: boolean = false;
  events: any[] = [];  // Array to hold events
  newEvent: any = {
    activityName: '',
    date: '',
    description: '',
    maxCapacity: null,
    currentCount: 0
  };

  constructor(private firebaseService: FirebaseService) {}

  async ngOnInit() {
    this.events = await this.firebaseService.getAllEvents();  // Fetch events from Firebase
    console.log('Fetched Events:', this.events);
  }

  openForm() {
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
  }

  async addEvent() {
    try {
      await this.firebaseService.addTicketForUserEvents(this.newEvent);  // Assuming you have a method to add events

      // Fetch updated events list from Firestore
      this.events = await this.firebaseService.getAllEvents();

      // Reset the form
      this.newEvent = { activityName: '', date: '', description: '', maxCapacity: null, currentCount: 0 };
      this.showForm = false;
    } catch (error) {
      console.error('Error adding event:', error);
    }
  }

  async onAcceptEvent(event: any) {
    try {
      // Assuming you have an increment method for events
      await this.firebaseService.incrementTicketCountEvents(event);

      // Refresh the event list after accepting
      this.events = await this.firebaseService.getAllEvents();
      console.log('Event accepted!');
    } catch (error) {
      console.error('Error accepting event:', error);
    }
  }

  hasUserAccepted(event: any): boolean {
    const username = localStorage.getItem('username');
    return event.usersAccepted && event.usersAccepted.includes(username);  // Check if user has already accepted
  }

  isMaxCapacityReached(event: any): boolean {
    return event.currentCount >= event.maxCapacity;  // Check if max capacity is reached
  }

  async deleteEvent(event: any) {
    try {
      await this.firebaseService.deleteEvent(event); // Assuming deleteTicket exists in FirebaseService
      this.events = await this.firebaseService.getAllEvents(); // Refresh ticket list
    } catch (error) {
      console.error('Error deleting ticket:', error);
    }
  }
  
  isTicketCreator(event: any): boolean {
    const username = localStorage.getItem('username');
    console.log('Current User:', username);  // Logs the current logged-in user
    console.log('Event Creator:', event.creator);  // Logs the event creator's username
    return event.creator === username;  // Check if the current user is the creator
  }
}
