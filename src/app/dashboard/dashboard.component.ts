import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  constructor(private router: Router) {}

  onSignOut(): void {
    this.router.navigate(['/']);
  }

  onProfile(): void {
    this.router.navigate(['/profile'])
  }
}
