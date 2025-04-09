import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { FirebaseService } from '../firebase.service';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from '../app-routing.module';
import { of } from 'rxjs';

class MockFirebaseService {
  getUserFullName = jasmine.createSpy('getUserFullName').and.returnValue({ fName: 'John', lName: 'Doe' });
  getUserDescription = jasmine.createSpy('getUserDescription').and.returnValue(Promise.resolve('Sample description'));
  getUserImage = jasmine.createSpy('getUserImage').and.returnValue(Promise.resolve('sample-image-url'));
  addDescriptionToFirestore = jasmine.createSpy('addDescriptionToFirestore').and.returnValue(Promise.resolve());
  addImageToFirestore = jasmine.createSpy('addImageToFirestore').and.returnValue(Promise.resolve());
}

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let firebaseService: MockFirebaseService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [FormsModule, AppRoutingModule],
      providers: [{ provide: FirebaseService, useClass: MockFirebaseService }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    firebaseService = TestBed.inject(FirebaseService) as unknown as MockFirebaseService;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize user data on ngOnInit', async () => {
    await component.ngOnInit();
    expect(component.fName).toBe('John');
    expect(component.lName).toBe('Doe');
    expect(component.userName).toBe('John Doe');
    expect(firebaseService.getUserDescription).toHaveBeenCalled();
    expect(firebaseService.getUserImage).toHaveBeenCalled();
  });

  it('should save description successfully', async () => {
    spyOn(window, 'alert');
    component.description = 'New description';
    await component.onDescriptionSubmit();
    expect(firebaseService.addDescriptionToFirestore).toHaveBeenCalledWith('New description');
    expect(window.alert).toHaveBeenCalledWith('Description saved successfully!');
  });

  it('should handle empty description submission', async () => {
    spyOn(window, 'alert');
    component.description = '';
    await component.onDescriptionSubmit();
    expect(window.alert).toHaveBeenCalledWith('Description is empty');
  });

  it('should save image successfully', async () => {
    spyOn(window, 'alert');
    component.selectedImage = new File([''], 'image.png', { type: 'image/png' });
    component.image = 'base64-image-string';
    await component.onImageSubmit();
    expect(firebaseService.addImageToFirestore).toHaveBeenCalledWith('base64-image-string');
    expect(window.alert).toHaveBeenCalledWith('Image saved successfully!');
  });

  it('should handle no image selected scenario', async () => {
    spyOn(window, 'alert');
    component.selectedImage = null;
    await component.onImageSubmit();
    expect(window.alert).toHaveBeenCalledWith('No image selected');
  });
});
