import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../firebase.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  complaintText: string = '';  // holds the complaint
  isComplaintVisible: boolean = false;  
  newPostContent: string = '';
  posts: { content: string; author: string; date: Date; id: string }[] = [];
  selectedPost: any = null;
  userName: string = '';
  fName: string = '';
  lName: string = ''; //storing username of person who made the post

  constructor(private router: Router, private firebase: FirebaseService) {}

  ngOnInit(): void {
    const user = this.firebase.getUserFullName();
    if (user) {
      this.fName = user.fName;
      this.lName = user.lName;
      this.userName = `${this.fName} ${this.lName}`;
    }// easy fetch from local storage
    const savedPosts = localStorage.getItem('bulletinPosts');
    if (savedPosts) {
      this.posts = JSON.parse(savedPosts);
    }
  }

  onSignOut(): void {
    this.router.navigate(['/']);
  }

  onProfile(): void {
    this.router.navigate(['/profile']);
  }

  addPost(): void {
    if (this.newPostContent.trim()) {
      const newPost = {
        content: this.newPostContent,
        author: this.userName,  
        date: new Date(),
        id: new Date().getTime().toString(), //generating a unique id
      };

      this.posts.unshift(newPost);
      localStorage.setItem('bulletinPosts', JSON.stringify(this.posts));
      this.newPostContent = '';  
    }
  }

  deletePost(index: number): void {
    const post = this.posts[index]; 
  
    
    if (post.author === this.userName) {
      // ensuring that only the current user can delete the post
      this.posts.splice(index, 1); 
      localStorage.setItem('bulletinPosts', JSON.stringify(this.posts)); // update storage
      console.log('Post deleted successfully');
    } else {
      console.log('You cannot delete someone else\'s post');
      alert('You can only delete your own posts');
    }
  }

  flagPost(post: any): void {
    this.selectedPost = post;
    this.isComplaintVisible = true;
  }

  async onComplaint(): Promise<void> {
    const postId = this.selectedPost?.id;  // retrieving the unique id for the post
    const complaintText = this.complaintText;  
  
    if (!postId || !complaintText || !this.userName) {
      console.error('Complaint data is invalid:', postId, complaintText, this.userName);
      return; 
    }
  
    try {
      await this.firebase.addComplaintToFirebase(postId, complaintText, this.userName);

      // once complaint is submitted form is then resetted.
      this.complaintText = '';
      this.isComplaintVisible = false;
      console.log('Complaint submitted successfully!');
    } catch (error) {
      console.error('Error submitting complaint:', error);
    }
  }
}
