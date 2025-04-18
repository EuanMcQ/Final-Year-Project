import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../firebase.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  complaintText: string = '';  //holds the complaint
  isComplaintVisible: boolean = false;  
  newPostContent: string = '';
  posts: { content: string; author: string; date: Date; id: string }[] = [];
  selectedPost: any = null;
  userName: string = '';
  fName: string = '';
  lName: string = ''; //storing username of person who made the post

  constructor(private router: Router, private firebase: FirebaseService) {}

  async ngOnInit(): Promise<void> {
    try {
      const user = this.firebase.getUserFullName();
      if (user) {
        this.fName = user.fName;
        this.lName = user.lName;
        this.userName = `${this.fName} ${this.lName}`;
      }
  
      this.posts = await this.firebase.getAllBulletinPosts();
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
  }
  
  

  onSignOut(): void {
    this.router.navigate(['/']);
  }

  onProfile(): void {
    this.router.navigate(['/profile']);
  }

  async addPost(): Promise<void> {
    if (this.newPostContent.trim()) {
      const newPost = {
        content: this.newPostContent,
        author: this.userName,
        date: new Date(),
        id: new Date().getTime().toString(),
      };
  
      try {
        await this.firebase.addPostToFirebase(newPost, this.userName);
        this.posts.unshift(newPost);
        this.newPostContent = '';
      } catch (error) {
        console.error('Failed to post to Firebase:', error);
      }
    }
  }
  
  async deletePost(index: number): Promise<void> {
    const post = this.posts[index];
    if (post.author === this.userName) {
      this.posts.splice(index, 1);
      await this.firebase.deletePostFromFirebase(post.id, this.userName);
      console.log('Post deleted successfully');
    } else {
      alert('You can only delete your own posts');
    }
  }
  
  flagPost(post: any): void {
    this.selectedPost = post;
    this.isComplaintVisible = true;
  }
  
  async onComplaint(): Promise<void> {
    const postId = this.selectedPost?.postId || this.selectedPost?.id;
    const complaintText = this.complaintText;
  
    if (!postId || !complaintText || !this.userName) {
      console.error('Complaint data is invalid:', postId, complaintText, this.userName);
      return;
    }
  
    try {
      await this.firebase.addComplaintToFirebase(postId, complaintText, this.userName, this.selectedPost);
      this.complaintText = '';
      this.isComplaintVisible = false;
      console.log('Complaint submitted successfully!');
    } catch (error) {
      console.error('Error submitting complaint:', error);
    }
  }
}
