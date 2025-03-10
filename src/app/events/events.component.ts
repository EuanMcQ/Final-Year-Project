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
    events: any[] = [];
    newEvent: any = {
      activityName: '',
      date: '',
      description: '',
      maxCapacity: null,
      currentCount: 0
    };
  
    constructor(private firebaseService: FirebaseService) {}
  
    async ngOnInit() {
      this.events = await this.firebaseService.getAllTicketsEvents();
    }
  
    openForm() {
      this.showForm = true;
    }
  
    closeForm() {
      this.showForm = false;
    }
  
    async addEvent() {
      try {
        await this.firebaseService.addTicketForUserEvents(this.newEvent);
  
        // Fetch updated tickets list from Firestore
        this.events = await this.firebaseService.getAllTicketsEvents();
  
        // Reset the form
        this.newEvent = { activityName: '', date: '', description: '', maxCapacity: null, currentCount: 0 };
        this.showForm = false;
      } catch (error) {
        console.error('Error adding ticket:', error);
      }
    }
  
    async onAcceptEvent(event: any) {
      try {
        // Call the incrementTicketCount method
        await this.firebaseService.incrementTicketCountEvents(event);
    
        // Refresh the ticket list after accepting
        this.events = await this.firebaseService.getAllTicketsEvents();
        console.log('Event accepted!');
      } catch (error) {
        console.error('Error accepting ticket:', error);
      }
    }
    
    
    hasUserAccepted(event: any): boolean {
      const username = localStorage.getItem('username');
      return event.usersAccepted && event.usersAccepted.includes(username); // Check if user has already accepted
    }
    
    isMaxCapacityReached(event: any): boolean {
      return event.currentCount >= event.maxCapacity; // Check if max capacity is reached
    } 
}
