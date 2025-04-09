import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyticketComponent } from './myticket.component';
import { FirebaseService } from '../firebase.service';
import { AppRoutingModule } from '../app-routing.module';
import { of } from 'rxjs';

class MockFirebaseService {
  getUserEvents = jasmine.createSpy('getUserEvents');
}

describe('MyticketComponent', () => {
  let component: MyticketComponent;
  let fixture: ComponentFixture<MyticketComponent>;
  let firebaseService: MockFirebaseService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyticketComponent],
      imports: [AppRoutingModule],
      providers: [{ provide: FirebaseService, useClass: MockFirebaseService }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyticketComponent);
    component = fixture.componentInstance;
    firebaseService = TestBed.inject(FirebaseService) as unknown as MockFirebaseService;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch user events on initialization', async () => {
    const mockData = { tickets: [{ id: 1, name: 'Test Ticket' }], events: [{ id: 2, name: 'Test Event' }] };
    firebaseService.getUserEvents.and.returnValue(Promise.resolve(mockData));
    
    await component.ngOnInit();
    
    expect(firebaseService.getUserEvents).toHaveBeenCalled();
    expect(component.myTickets).toEqual(mockData.tickets);
    expect(component.myEvents).toEqual(mockData.events);
  });

  it('should handle errors when fetching user events', async () => {
    spyOn(console, 'error');
    firebaseService.getUserEvents.and.returnValue(Promise.reject('Error fetching data'));
    
    await component.fetchUserEvents();
    
    expect(console.error).toHaveBeenCalledWith('Error fetching events:', 'Error fetching data');
  });
});
