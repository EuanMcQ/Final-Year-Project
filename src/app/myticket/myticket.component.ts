import { Component } from '@angular/core';
import { FirebaseService } from '../firebase.service';

@Component({
  selector: 'app-myticket',
  templateUrl: './myticket.component.html',
  styleUrls: ['./myticket.component.css']
})
export class MyticketComponent {
  myTickets: any[] = [];
  myEvents: any[] = [];

  constructor(private firebaseService: FirebaseService) {}

  async ngOnInit(): Promise<void> {
    await this.fetchUserEvents();
  }

  async fetchUserEvents(): Promise<void> {
    try {
      const { tickets, events } = await this.firebaseService.getUserEvents();
      console.log('Fetched tickets:', tickets); 
      console.log('Fetched events:', events);    
      this.myTickets = tickets;  
      this.myEvents = events;    
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }
}
