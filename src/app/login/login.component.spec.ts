import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { Router } from '@angular/router';
import { FirebaseService } from '../firebase.service';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

class MockFirebaseService {
  login = jasmine.createSpy('login');
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let firebaseService: MockFirebaseService;
  let router: MockRouter;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [FormsModule],
      providers: [
        { provide: FirebaseService, useClass: MockFirebaseService },
        { provide: Router, useClass: MockRouter }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    firebaseService = TestBed.inject(FirebaseService) as unknown as MockFirebaseService;
    router = TestBed.inject(Router) as unknown as MockRouter;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set error message if fields are empty', async () => {
    component.email = '';
    component.password = '';
    await component.onLoginButtonClick();
    expect(component.errorMessage).toBe('Please fill in both fields.');
  });

  it('should attempt login and navigate on success', async () => {
    component.email = 'test@example.com';
    component.password = 'password123';
    firebaseService.login.and.returnValue(Promise.resolve(true));
    
    await component.onLoginButtonClick();
    expect(firebaseService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should show error message on login failure', async () => {
    component.email = 'test@example.com';
    component.password = 'wrongpassword';
    firebaseService.login.and.returnValue(Promise.reject(new Error('Incorrect username or password')));
    
    await component.onLoginButtonClick();
    expect(component.errorMessage).toBe('Incorrect credentials. Please check your details.');
  });

  it('should show generic error message on unexpected error', async () => {
    component.email = 'test@example.com';
    component.password = 'password123';
    firebaseService.login.and.returnValue(Promise.reject(new Error('Some unexpected error')));
    
    await component.onLoginButtonClick();
    expect(component.errorMessage).toBe('An unexpected error occurred. Please try again.');
  });
});
