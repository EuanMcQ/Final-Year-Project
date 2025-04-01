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
  houseAddress: string = '';
  maxCapacity: number | null = null;
  showForm: boolean = false;
  showInfoPopup: boolean = false;
  events: any[] = [];

  newEvent: any = {
    activityName: '',
    date: '',
    description: '',
    houseAddress: '',
    maxCapacity: null,
    currentCount: 0
  };

  constructor(private firebaseService: FirebaseService) {}

  async ngOnInit() {
    this.events = await this.firebaseService.getAllEvents();
    console.log('Fetched Events:', this.events);
  }

  openForm() {
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
  }

  async addEvent() {
    if (this.newEvent.maxCapacity === null || this.newEvent.maxCapacity < 0) {
      alert('Max Capacity must be at least 0!');
      return;
    }

    try {
      await this.firebaseService.addTicketForUserEvents(this.newEvent);
      this.events = await this.firebaseService.getAllEvents();
      this.newEvent = { activityName: '', date: '', description: '', houseAddress: '', maxCapacity: null, currentCount: 0 };
      this.showForm = false;
    } catch (error) {
      console.error('Error adding event:', error);
    }
  }

  async onAcceptEvent(event: any) {
    try {
      await this.firebaseService.incrementTicketCountEvents(event);
      this.events = await this.firebaseService.getAllEvents();
      console.log('Event accepted!');
    } catch (error) {
      console.error('Error accepting event:', error);
    }
  }

  hasUserAccepted(event: any): boolean {
    const username = localStorage.getItem('username');
    return event.usersAccepted && event.usersAccepted.includes(username);
  }

  isMaxCapacityReached(event: any): boolean {
    return event.currentCount >= event.maxCapacity;
  }

  async deleteEvent(event: any) {
    try {
      await this.firebaseService.deleteEvent(event);
      this.events = await this.firebaseService.getAllEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  }

  isTicketCreator(event: any): boolean {
    const userEmail = localStorage.getItem('username');
    return event.username === userEmail;
  }
}
