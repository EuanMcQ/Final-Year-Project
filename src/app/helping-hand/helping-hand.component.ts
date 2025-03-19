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
  maxCapacity: number | null = null;
  showForm: boolean = false;
  tickets: any[] = [];
  newTicket: any = {
    activityName: '',
    date: '',
    description: '',
    maxCapacity: null,
    currentCount: 0
  };

  constructor(private firebaseService: FirebaseService) {}

  async ngOnInit() {
    this.tickets = await this.firebaseService.getAllTickets();
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
      this.tickets = await this.firebaseService.getAllTickets();

      // Reset the form
      this.newTicket = { activityName: '', date: '', description: '', maxCapacity: null, currentCount: 0 };
      this.showForm = false;
    } catch (error) {
      console.error('Error adding ticket:', error);
    }
  }

  async onAcceptTicket(ticket: any) {
    try {
      // Call the incrementTicketCount method
      await this.firebaseService.incrementTicketCount(ticket);
  
      // Refresh the ticket list after accepting
      this.tickets = await this.firebaseService.getAllTickets();
      console.log('Ticket accepted!');
    } catch (error) {
      console.error('Error accepting ticket:', error);
    }
  }
  
  
  hasUserAccepted(ticket: any): boolean {
    const username = localStorage.getItem('username');
    return ticket.usersAccepted && ticket.usersAccepted.includes(username); // Check if user has already accepted
  }
  
  isMaxCapacityReached(ticket: any): boolean {
    return ticket.currentCount >= ticket.maxCapacity; // Check if max capacity is reached
  }  

  async deleteTicket(ticket: any) {
    try {
      await this.firebaseService.deleteTicket(ticket); // Assuming deleteTicket exists in FirebaseService
      this.tickets = await this.firebaseService.getAllTickets(); // Refresh ticket list
    } catch (error) {
      console.error('Error deleting ticket:', error);
    }
  }
  
  isTicketCreator(ticket: any): boolean {
    const username = localStorage.getItem('username');
    return ticket.creator === username; // Check if the current user is the creator
  }
}

