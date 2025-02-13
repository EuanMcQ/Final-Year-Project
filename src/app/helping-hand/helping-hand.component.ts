import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../firebase.service';

@Component({
  selector: 'app-helping-hand',
  templateUrl: './helping-hand.component.html',
  styleUrls: ['./helping-hand.component.css']
})
export class HelpingHandComponent implements OnInit {
  activityName: string = '';
  date: string = '';
  description: string = '';
  maxCapacity: number | null = null; // Allow maxCapacity to be either a number or null
  showForm: boolean = false; // Control the visibility of the form modal
  tickets: any[] = []; // List of created tickets
  newTicket: any = {
    activityName: '',
    date: '',
    description: '',
    maxCapacity: null,
    currentCount: 0 // Track how many people accepted
  };

  constructor(private firebaseService: FirebaseService) {}

  async ngOnInit() {
    // Fetch tickets on component load
    this.tickets = await this.firebaseService.getTicketsForUser();
  }

  openForm() {
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
  }

  async addTicket() {
    try {
      await this.firebaseService.addTicketForUser(this.newTicket);

      // Fetch updated tickets list from Firestore
      this.tickets = await this.firebaseService.getTicketsForUser();

      // Reset the form
      this.newTicket = { activityName: '', date: '', description: '', maxCapacity: null, currentCount: 0 };
      this.showForm = false;
    } catch (error) {
      console.error('Error adding ticket:', error);
    }
  }

  async acceptTicket(ticket: any) {
    const user = localStorage.getItem('username');
    if (!user) return;

    if (ticket.currentCount < ticket.maxCapacity) {
      await this.firebaseService.incrementTicketCount(user, ticket);

      // Fetch updated ticket list
      this.tickets = await this.firebaseService.getTicketsForUser();
    }
  }

  isMaxCapacityReached(ticket: any): boolean {
    return ticket.currentCount >= ticket.maxCapacity;
  }
}
