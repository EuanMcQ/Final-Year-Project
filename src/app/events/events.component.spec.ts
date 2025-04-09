import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventsComponent } from './events.component';
import { FirebaseService } from '../firebase.service';
import { of } from 'rxjs';

class MockFirebaseService {
  getAllEvents = jasmine.createSpy('getAllEvents').and.returnValue(Promise.resolve([{ 
    activityName: 'Test Event', 
    date: '2025-01-01', 
    description: 'Test Description', 
    houseAddress: 'Test Address', 
    maxCapacity: 10, 
    currentCount: 0, 
    usersAccepted: ['testUser'],
    username: 'testUser' 
  }]));
  
  addTicketForUserEvents = jasmine.createSpy('addTicketForUserEvents').and.returnValue(Promise.resolve());
  incrementTicketCountEvents = jasmine.createSpy('incrementTicketCountEvents').and.returnValue(Promise.resolve());
  deleteEvent = jasmine.createSpy('deleteEvent').and.returnValue(Promise.resolve());
}

describe('EventsComponent', () => {
  let component: EventsComponent;
  let fixture: ComponentFixture<EventsComponent>;
  let firebaseService: MockFirebaseService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EventsComponent],
      providers: [{ provide: FirebaseService, useClass: MockFirebaseService }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventsComponent);
    component = fixture.componentInstance;
    firebaseService = TestBed.inject(FirebaseService) as unknown as MockFirebaseService;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch events on init', async () => {
    await component.ngOnInit();
    expect(firebaseService.getAllEvents).toHaveBeenCalled();
    expect(component.events.length).toBe(1);
  });

  it('should open and close form', () => {
    component.openForm();
    expect(component.showForm).toBeTrue();
    
    component.closeForm();
    expect(component.showForm).toBeFalse();
  });

  it('should add an event', async () => {
    component.newEvent = { activityName: 'New Event', date: '2025-02-01', description: 'Desc', houseAddress: 'Address', maxCapacity: 5, currentCount: 0 };
    await component.addEvent();
    
    expect(firebaseService.addTicketForUserEvents).toHaveBeenCalled();
    expect(firebaseService.getAllEvents).toHaveBeenCalled();
    expect(component.showForm).toBeFalse();
  });

  it('should not add an event with negative max capacity', async () => {
    spyOn(window, 'alert');
    component.newEvent.maxCapacity = -1;
    await component.addEvent();
    
    expect(window.alert).toHaveBeenCalledWith('Max Capacity must be at least 0 or above!');
    expect(firebaseService.addTicketForUserEvents).not.toHaveBeenCalled();
  });

  it('should accept an event', async () => {
    const event = component.events[0];
    await component.onAcceptEvent(event);
    
    expect(firebaseService.incrementTicketCountEvents).toHaveBeenCalledWith(event);
    expect(firebaseService.getAllEvents).toHaveBeenCalled();
  });

  it('should verify if user has accepted an event', () => {
    spyOn(localStorage, 'getItem').and.returnValue('testUser');
    
    const mockEvent = {
      usersAccepted: ['testUser']
    };
  
    expect(component.hasUserAccepted(mockEvent)).toBeTrue();
  });

  it('should check if max capacity is reached', () => {
    const event = { currentCount: 10, maxCapacity: 10 };
    expect(component.isMaxCapacityReached(event)).toBeTrue();
  });

  it('should delete an event', async () => {
    const event = component.events[0];
    await component.deleteEvent(event);
    
    expect(firebaseService.deleteEvent).toHaveBeenCalledWith(event);
    expect(firebaseService.getAllEvents).toHaveBeenCalled();
  });

  it('should check if user is the ticket creator', () => {
    spyOn(localStorage, 'getItem').and.returnValue('testUser');
  
    const mockEvent = {
      username: 'testUser'
    };
  
    expect(component.isTicketCreator(mockEvent)).toBeTrue();
  });
});