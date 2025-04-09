import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SignUpComponent } from './sign-up.component';
import { FirebaseService } from '../firebase.service';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

describe('SignUpComponent', () => {
  let component: SignUpComponent;
  let fixture: ComponentFixture<SignUpComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockFirebaseService: jasmine.SpyObj<FirebaseService>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockFirebaseService = jasmine.createSpyObj('FirebaseService', ['addUserToFirestore']);

    await TestBed.configureTestingModule({
      declarations: [SignUpComponent],
      imports: [FormsModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: FirebaseService, useValue: mockFirebaseService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not submit if passwords do not match', async () => {
    component.user.password = 'test123';
    component.user.confirmPassword = 'wrong123';
    spyOn(window, 'alert');
    await component.onSignUpSubmit();
    expect(window.alert).toHaveBeenCalledWith('Passwords do not match!');
  });

  it('should not submit if required fields are missing', async () => {
    component.user = {
      fName: '',
      lName: '',
      username: '',
      password: '',
      confirmPassword: '',
      estate: '',
      description: '',
      image: '',
    };
    spyOn(window, 'alert');
    await component.onSignUpSubmit();
    expect(window.alert).toHaveBeenCalledWith('Please fill in all fields!');
  });

  it('should call FirebaseService and navigate on successful signup', async () => {
    component.user = {
      fName: 'John',
      lName: 'Doe',
      username: 'johndoe',
      password: 'password123',
      confirmPassword: 'password123',
      estate: 'Estate1',
      description: '',
      image: '',
    };
    mockFirebaseService.addUserToFirestore.and.returnValue(of(undefined).toPromise());

    await component.onSignUpSubmit();
    expect(mockFirebaseService.addUserToFirestore).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should show an error alert if FirebaseService fails', async () => {
    spyOn(window, 'alert');
    component.user = {
      fName: 'John',
      lName: 'Doe',
      username: 'johndoe',
      password: 'password123',
      confirmPassword: 'password123',
      estate: 'Estate1',
      description: '',
      image: '',
    };
    mockFirebaseService.addUserToFirestore.and.returnValue(Promise.reject('Firebase error'));
    
    await component.onSignUpSubmit();
    expect(window.alert).toHaveBeenCalledWith('An error occurred while signing up. Please try again.');
  });
});
