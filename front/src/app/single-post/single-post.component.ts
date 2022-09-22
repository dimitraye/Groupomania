import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Post } from '../models/Post.model';
import { PostsService } from '../services/posts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import {
  catchError,
  EMPTY,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
  take,
  tap,
} from 'rxjs';

@Component({
  selector: 'app-single-post',
  templateUrl: './single-post.component.html',
  styleUrls: ['./single-post.component.scss'],
})
export class SinglePostComponent implements OnInit {
  loading!: boolean;
  post$!: Observable<Post>;
  @Input() post!: Post;
  userId!: string;
  likePending!: boolean;
  liked!: boolean;
  disliked!: boolean;
  errorMessage!: string;
  isAdmin$!: Observable<Boolean>;
  isAdmin!: boolean;
  role!: string;
  decodedToken!: {};
  id!: string;
  @Input() onListPage!: boolean;
  @Output() public postDeleted: EventEmitter<any> = new EventEmitter();
  constructor(
    private postService: PostsService,
    private route: ActivatedRoute,
    private authService: AuthService,

    private router: Router
  ) {}

  ngOnInit() {
    this.loading = true;
    this.userId = this.authService.getUserId();
    this.role = this.authService.getLocalUserRole();
    this.isAdmin = this.authService.getLocalUserRole() == 'admin';
    let token: string | null = this.authService.getToken();
    this.decodedToken = this.authService.getDecodedAccessToken(token);
    console.log('decodedToken', this.decodedToken);
    this.id = this.route.snapshot.params['id'];

    console.log('id---------------------', this.id);
    if (this.id) {
      //on est sur la page single post
      this.postService.getPostById(this.id).subscribe((data: Post) => {
        this.post = data;
        this.loading = false;
        if (this.post.usersLiked.find((user) => user === this.userId)) {
          this.liked = true;
        } else if (
          this.post.usersDisliked.find((user) => user === this.userId)
        ) {
          this.disliked = true;
        }
      });
    }
    if (this.post) {
      this.loading = false;
      if (this.post.usersLiked.find((user) => user === this.userId)) {
        this.liked = true;
      } else if (this.post.usersDisliked.find((user) => user === this.userId)) {
        this.disliked = true;
      }
    }

    this.isAdmin$ = this.authService.isAdmin$.pipe(shareReplay(1));
  }

  onClickPost(id: string) {
    console.log('on click post');
    this.router.navigate(['post', id]);
  }

  onLike($event: Event) {
    $event.stopPropagation();
    if (this.disliked) {
      return;
    }
    this.likePending = true;
    this.postService
      .likePost(this.post._id, !this.liked)
      .pipe(
        tap((liked) => {
          this.likePending = false;
          this.liked = liked;
        }),
        map((liked) => ({
          ...this.post,
          likes: liked ? this.post.likes + 1 : this.post.likes - 1,
        })),
        tap((post) => (this.post = post))
      )
      .subscribe();
  }
  onDislike($event: Event) {
    $event.stopPropagation();
    if (this.liked) {
      return;
    }
    this.likePending = true;

    this.postService
      .dislikePost(this.post._id, !this.disliked)
      .pipe(
        tap((disliked) => {
          this.likePending = false;
          this.disliked = disliked;
        }),
        map((disliked) => ({
          ...this.post,
          dislikes: disliked ? this.post.dislikes + 1 : this.post.dislikes - 1,
        })),
        tap((post) => (this.post = post))
      )
      .subscribe();
  }

  onBack() {
    this.router.navigate(['/posts']);
  }

  onModify() {
    this.router.navigate(['/modify-post', this.post._id]);
  }

  onDelete() {
    this.loading = true;
    if (confirm('Voulez vous vraiment supprimer ce post')) {
      this.postService.deletePost(this.post._id).subscribe((res) => {
        if (this.onListPage) {
          console.log('onListPage');
          this.postDeleted.emit();
        } else {
          this.router.navigate(['/posts']);
        }
        console.log('Post deleted successfully!');
        this.loading = false;
      });
    }
  }
}
