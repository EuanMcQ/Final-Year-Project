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
  houseAddress: string = '';
  maxCapacity: number | null = null;
  showForm: boolean = false;
  showInfoPopup: boolean = false;
  tickets: any[] = [];
  newTicket: any = {
    activityName: '',
    date: '',
    description: '',
    houseAddress: '',
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

    if (this.newTicket.maxCapacity === null || this.newTicket.maxCapacity < 0) {
      alert('Max Capacity can not be below 0');
      return;
    }

    try {
      await this.firebaseService.addTicketForUser(this.newTicket);

      //fetch all the tickets
      this.tickets = await this.firebaseService.getAllTickets();

      this.newTicket = { activityName: '', date: '', description: '', houseAddress: '', maxCapacity: null, currentCount: 0 };
      this.showForm = false;
    } catch (error) {
      console.error('Error adding ticket:', error);
    }
  }

  async onAcceptTicket(ticket: any) {
    try {
      await this.firebaseService.incrementTicketCount(ticket);
  
      // refreshes the ticket count if user accepts
      this.tickets = await this.firebaseService.getAllTickets();
      console.log('Ticket accepted!');
    } catch (error) {
      console.error('Error accepting ticket:', error);
    }
  }
  
  
  hasUserAccepted(ticket: any): boolean {
    const username = localStorage.getItem('username');
    return ticket.usersAccepted && ticket.usersAccepted.includes(username); // ensure user hasn't already accepted
  }
  
  isMaxCapacityReached(ticket: any): boolean {
    return ticket.currentCount >= ticket.maxCapacity; // ensure max capacity is reached
  }  

  async deleteTicket(ticket: any) {
    try {
      await this.firebaseService.deleteTicket(ticket);
      this.tickets = await this.firebaseService.getAllTickets(); // refresh the list
    } catch (error) {
      console.error('Error deleting ticket:', error);
    }
  }  
  
  isTicketCreator(event: any): boolean {
    const userEmail = localStorage.getItem('username'); 
    return event.username === userEmail; // only show delete if the user is the creator
  } 
}

