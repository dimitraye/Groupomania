import { Component, OnInit } from '@angular/core';
import { PostsService } from '../../services/posts.service';
import { catchError, Observable, of, tap } from 'rxjs';
import { Post } from '../../models/Post.model';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-post-list',
  //Liaison avec le fichier post-list.component.html
  templateUrl: './post-list.component.html',
  //Liaison avec le fichier post-list.component.scss
  styleUrls: ['./post-list.component.scss'],
})
export class PostListComponent implements OnInit {
  posts$!: Observable<Post[]>;
  posts: Post[] = [];
  loading!: boolean;
  errorMsg!: string;
  userId!: string;
  isAdmin!: boolean;

  //Injection de dépendances
  constructor(
    private postService: PostsService,
    private router: Router,
    private authService: AuthService
  ) {}

  //
  ngOnInit() {
    this.loading = true;
    this.userId = this.authService.getUserId();
    this.isAdmin = this.authService.getLocalUserRole() == 'admin';
    this.postService.getAll().subscribe((data: Post[]) => {
      this.posts = data;
      console.log(this.posts);
      this.loading = false;
    });
  }
}
