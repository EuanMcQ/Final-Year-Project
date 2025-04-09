import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HelpingHandComponent } from './helping-hand.component';
import { FirebaseService } from '../firebase.service';
import { of } from 'rxjs';

class MockFirebaseService {
  getAllTickets = jasmine.createSpy('getAllTickets').and.returnValue(Promise.resolve([{ 
    activityName: 'Test Help', 
    date: '2025-01-01', 
    description: 'Test Description', 
    houseAddress: 'Test Address', 
    maxCapacity: 10, 
    currentCount: 0, 
    usersAccepted: ['testUser'],
    username: 'testUser' 
  }]));
  
  addTicketForUser = jasmine.createSpy('addTicketForUser').and.returnValue(Promise.resolve());
  incrementTicketCount = jasmine.createSpy('incrementTicketCount').and.returnValue(Promise.resolve());
  deleteTicket = jasmine.createSpy('deleteTicket').and.returnValue(Promise.resolve());
}

describe('HelpingHandComponent', () => {
  let component: HelpingHandComponent;
  let fixture: ComponentFixture<HelpingHandComponent>;
  let firebaseService: MockFirebaseService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HelpingHandComponent],
      providers: [{ provide: FirebaseService, useClass: MockFirebaseService }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpingHandComponent);
    component = fixture.componentInstance;
    firebaseService = TestBed.inject(FirebaseService) as unknown as MockFirebaseService;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch tickets on init', async () => {
    await component.ngOnInit();
    expect(firebaseService.getAllTickets).toHaveBeenCalled();
    expect(component.tickets.length).toBe(1);
  });

  it('should open and close form', () => {
    component.openForm();
    expect(component.showForm).toBeTrue();
    
    component.closeForm();
    expect(component.showForm).toBeFalse();
  });

  it('should add a ticket', async () => {
    component.newTicket = { activityName: 'New Help', date: '2025-02-01', description: 'Desc', houseAddress: 'Address', maxCapacity: 5, currentCount: 0 };
    await component.addTicket();
    
    expect(firebaseService.addTicketForUser).toHaveBeenCalled();
    expect(firebaseService.getAllTickets).toHaveBeenCalled();
    expect(component.showForm).toBeFalse();
  });

  it('should not add a ticket with negative max capacity', async () => {
    spyOn(window, 'alert');
    component.newTicket.maxCapacity = -1;
    await component.addTicket();
    
    expect(window.alert).toHaveBeenCalledWith('Max Capacity can not be below 0');
    expect(firebaseService.addTicketForUser).not.toHaveBeenCalled();
  });

  it('should accept a ticket', async () => {
    const ticket = component.tickets[0];
    await component.onAcceptTicket(ticket);
    
    expect(firebaseService.incrementTicketCount).toHaveBeenCalledWith(ticket);
    expect(firebaseService.getAllTickets).toHaveBeenCalled();
  });

  it('should verify if user has accepted a ticket', async () => {
    await component.ngOnInit(); 
    spyOn(localStorage, 'getItem').and.returnValue('testUser');
    expect(component.hasUserAccepted(component.tickets[0])).toBeTrue();
  });
  

  it('should check if max capacity is reached', () => {
    const ticket = { currentCount: 10, maxCapacity: 10 };
    expect(component.isMaxCapacityReached(ticket)).toBeTrue();
  });

  it('should delete a ticket', async () => {
    const ticket = component.tickets[0];
    await component.deleteTicket(ticket);
    
    expect(firebaseService.deleteTicket).toHaveBeenCalledWith(ticket);
    expect(firebaseService.getAllTickets).toHaveBeenCalled();
  });

  it('should check if user is the ticket creator', () => {
    const mockTicket = {
      activityName: 'Test Help', 
      date: '2025-01-01', 
      description: 'Test Description', 
      houseAddress: 'Test Address', 
      maxCapacity: 10, 
      currentCount: 0, 
      usersAccepted: ['testUser'],
      username: 'testUser'
    };
    
    component.tickets = [mockTicket]; 
    spyOn(localStorage, 'getItem').and.returnValue('testUser'); 
    
    expect(component.isTicketCreator(mockTicket)).toBeTrue();
  });
  
});
