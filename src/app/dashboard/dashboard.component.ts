import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../firebase.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  complaintText: string = '';  // Holds the complaint text input
  isComplaintVisible: boolean = false;  // Toggles complaint form visibility
  newPostContent: string = '';
  posts: { content: string; author: string; date: Date; id: string }[] = [];
  selectedPost: any = null;
  username: string | null = null;  // Store the username here

  constructor(private router: Router, private firebase: FirebaseService) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username'); // Fetch the username from localStorage
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
        author: this.username || 'Anonymous',  // Use the username here
        date: new Date(),
        id: new Date().getTime().toString(), // Generate a unique ID for each post
      };

      this.posts.unshift(newPost);
      localStorage.setItem('bulletinPosts', JSON.stringify(this.posts));
      this.newPostContent = '';  // Clear the new post content field
    }
  }

  deletePost(index: number): void {
    const post = this.posts[index]; // Get the post to be deleted
  
    // Check if the logged-in user is the author of the post
    if (post.author === this.username) {
      // If the current user is the author of the post, allow deletion
      this.posts.splice(index, 1); // Delete the post
      localStorage.setItem('bulletinPosts', JSON.stringify(this.posts)); // Update localStorage with the new list
      console.log('Post deleted successfully');
    } else {
      // If the user is not the author, prevent deletion and show a message
      console.log('You cannot delete someone else\'s post');
      alert('You can only delete your own posts');
    }
  }

  flagPost(post: any): void {
    this.selectedPost = post;
    this.isComplaintVisible = true;
  }

  // Submit the complaint with postId, complaintText, and username
  async onComplaint(): Promise<void> {
    const postId = this.selectedPost?.id;  // Get the post ID (ticket ID) from selectedPost
    const complaintText = this.complaintText;  // Get complaint text
  
    if (!postId || !complaintText || !this.username) {
      console.error('Complaint data is invalid:', postId, complaintText, this.username);
      return;  // Exit if any data is missing
    }
  
    try {
      // Proceed with submitting the complaint if data is valid
      await this.firebase.addComplaintToFirebase(postId, complaintText, this.username);

      // After submission, reset complaint form
      this.complaintText = '';
      this.isComplaintVisible = false;
      console.log('Complaint submitted successfully!');
    } catch (error) {
      console.error('Error submitting complaint:', error);
    }
  }
}
