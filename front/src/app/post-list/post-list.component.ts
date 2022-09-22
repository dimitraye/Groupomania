import { Component, OnInit } from '@angular/core';
import { PostsService } from '../services/posts.service';
import { catchError, Observable, of, tap } from 'rxjs';
import { Post } from '../models/Post.model';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss'],
})
export class PostListComponent implements OnInit {
  posts$!: Observable<Post[]>;
  posts: Post[] = [];
  loading!: boolean;
  errorMsg!: string;
  userId!: string;
  isAdmin!: boolean;
  constructor(
    private postService: PostsService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loading = true;
    this.userId = this.authService.getUserId();
    this.isAdmin = this.authService.getLocalUserRole() == 'admin';

    /* this.posts$ = this.postService.posts$.pipe(
      tap(() => {
        this.loading = false;
        this.errorMsg = '';
      }),
      catchError(error => {
        this.errorMsg = JSON.stringify(error);
        this.loading = false;
        return of([]);
      })
    );
    this.postService.getPosts(); */

    this.postService.getAll().subscribe((data: Post[]) => {
      this.posts = data;
      console.log(this.posts);
      this.loading = false;
    });
  }

  onPostDeleted(post: Post) {
    this.posts = this.posts.filter((item) => item._id !== post._id);
    console.log('Post removed from list posts!');
  }

  onClickPost(id: string) {
    this.router.navigate(['post', id]);
  }

  onModify(id: any) {
    this.router.navigate(['/modify-post', id]);
  }

  onDelete(id: any) {
    this.loading = true;
    this.postService.deletePost(id).subscribe(
      (response) => {
        console.log(response);
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        console.log(error);
      }
    );
    this.router.navigate(['/posts']);
  }
}
