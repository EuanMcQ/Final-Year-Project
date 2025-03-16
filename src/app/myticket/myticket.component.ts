import { Component } from '@angular/core';
import { FirebaseService } from '../firebase.service';

@Component({
  selector: 'app-myticket',
  templateUrl: './myticket.component.html',
  styleUrl: './myticket.component.css'
})
export class MyticketComponent {
  myEvents: any[] = [];

  constructor(private firebaseService: FirebaseService) {}

  async ngOnInit(): Promise<void> {
    await this.fetchUserEvents();
  }

  async fetchUserEvents(): Promise<void> {
    try {
      this.myEvents = await this.firebaseService.getUserEvents();
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }
}

