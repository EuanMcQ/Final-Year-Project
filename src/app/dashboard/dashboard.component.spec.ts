import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { FirebaseService } from '../firebase.service';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

class MockFirebaseService {
  getUserFullName = jasmine.createSpy('getUserFullName').and.returnValue({ fName: 'John', lName: 'Doe' });
  getAllBulletinPosts = jasmine.createSpy('getAllBulletinPosts').and.returnValue(Promise.resolve([{ content: 'Test post', author: 'John Doe', date: new Date(), id: '1' }]));
  addPostToFirebase = jasmine.createSpy('addPostToFirebase').and.returnValue(Promise.resolve());
  deletePostFromFirebase = jasmine.createSpy('deletePostFromFirebase').and.returnValue(Promise.resolve());
  addComplaintToFirebase = jasmine.createSpy('addComplaintToFirebase').and.returnValue(Promise.resolve());
}

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let router: MockRouter;
  let firebase: MockFirebaseService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      imports: [FormsModule],
      providers: [
        { provide: Router, useClass: MockRouter },
        { provide: FirebaseService, useClass: MockFirebaseService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as unknown as MockRouter;
    firebase = TestBed.inject(FirebaseService) as unknown as MockFirebaseService;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize username and posts from firebase', async () => {
    await component.ngOnInit();  // async working correctly check
    expect(component.userName).toBe('John Doe');
    expect(component.posts.length).toBe(1);
  });

  it('should navigate to home on sign out', () => {
    component.onSignOut();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should navigate to profile on profile click', () => {
    component.onProfile();
    expect(router.navigate).toHaveBeenCalledWith(['/profile']);
  });

  it('should delete own post', async () => {
    component.userName = 'John Doe';
    component.posts = [{ content: 'Test post', author: 'John Doe', date: new Date(), id: '1' }];
    
    await component.deletePost(0);
    
    expect(component.posts.length).toBe(0);  // Ensuring the array is empty again
    expect(firebase.deletePostFromFirebase).toHaveBeenCalledWith('1', 'John Doe');
  });
  
  it('should add a post', async () => {
    component.userName = 'John Doe';
    component.newPostContent = 'New Test Post';
    component.posts = []; // ensure initially empty so it can be added gracefully
  
    await component.addPost();
  
    expect(component.posts.length).toBe(1);
    expect(component.posts[0].content).toBe('New Test Post');
    expect(component.posts[0].author).toBe('John Doe');
    expect(firebase.addPostToFirebase).toHaveBeenCalledWith(jasmine.objectContaining({
      content: 'New Test Post',
      author: 'John Doe',
      date: jasmine.any(Date),
      id: jasmine.any(String),
    }), 'John Doe');
  });
  
  it('should flag a post', () => {
    const post = { content: 'Flagged Post', author: 'user', date: new Date(), id: '1' };
    component.flagPost(post);
    
    expect(component.selectedPost).toEqual(post);
    expect(component.isComplaintVisible).toBeTrue();
  });

  it('should submit a complaint', async () => {
    component.userName = 'John Doe';
    component.selectedPost = { id: '1', postId: '1' };  
    component.complaintText = 'This post is inappropriate';
    
    await component.onComplaint();
    expect(firebase.addComplaintToFirebase).toHaveBeenCalledWith('1', 'This post is inappropriate', 'John Doe', component.selectedPost);
    expect(component.complaintText).toBe('');
    expect(component.isComplaintVisible).toBeFalse();
  });
});
