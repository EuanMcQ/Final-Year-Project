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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize username and posts from localStorage', () => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'username') return 'testUser';
      if (key === 'bulletinPosts') return JSON.stringify([{ content: 'Test post', author: 'testUser', date: new Date(), id: '1' }]);
      return null;
    });
    
    component.ngOnInit();
    expect(component.username).toBe('testUser');
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

  it('should add a post', () => {
    component.username = 'testUser';
    component.newPostContent = 'New Test Post';
    component.posts = [];
    component.addPost();
    
    expect(component.posts.length).toBe(1);  
    expect(component.posts[0].content).toBe('New Test Post');
    expect(component.posts[0].author).toBe('testUser');
  });
  

  it('should delete own post', () => {
    component.username = 'testUser';
    component.posts = [{ content: 'Test post', author: 'testUser', date: new Date(), id: '1' }];
    component.deletePost(0);
    
    expect(component.posts.length).toBe(0);
  });

  it('should not delete another users post', () => {
    spyOn(window, 'alert');
    component.username = 'testUser';
    component.posts = [{ content: 'Test post', author: 'otherUser', date: new Date(), id: '1' }];
    component.deletePost(0);
    
    expect(component.posts.length).toBe(1);
    expect(window.alert).toHaveBeenCalledWith('You can only delete your own posts');
  });

  it('should flag a post', () => {
    const post = { content: 'Flagged Post', author: 'user', date: new Date(), id: '1' };
    component.flagPost(post);
    
    expect(component.selectedPost).toEqual(post);
    expect(component.isComplaintVisible).toBeTrue();
  });

  it('should submit a complaint', async () => {
    component.username = 'testUser';
    component.selectedPost = { id: '1' };
    component.complaintText = 'This post is inappropriate';
    
    await component.onComplaint();
    expect(firebase.addComplaintToFirebase).toHaveBeenCalledWith('1', 'This post is inappropriate', 'testUser');
    expect(component.complaintText).toBe('');
    expect(component.isComplaintVisible).toBeFalse();
  });
});