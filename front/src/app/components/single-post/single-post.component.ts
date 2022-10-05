import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Post } from '../../models/Post.model';
import { PostsService } from '../../services/posts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
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
  //Liaison avec le fichier single-post.component.scss
  templateUrl: './single-post.component.html',
  //Liaison avec le fichier single-post.component.scss
  styleUrls: ['./single-post.component.scss'],
})
export class SinglePostComponent implements OnInit {
  loading!: boolean;
  post$!: Observable<Post>;
  userId!: string;
  //
  likePending!: boolean;
  liked!: boolean;
  disliked!: boolean;
  errorMessage!: string;
  isAdmin$!: Observable<Boolean>;
  isAdmin!: boolean;
  role!: string;
  decodedToken!: {};
  id!: string;
  @Input() post!: Post;
  //variable qui indique si l'utilisateur se trouve sur la liste des posts
  @Input() onListPage!: boolean;
  @Output() public postDeleted: EventEmitter<any> = new EventEmitter();

  //Injection de dépendances
  constructor(
    private postService: PostsService,
    private route: ActivatedRoute,
    private authService: AuthService,

    private router: Router
  ) {}

  //Initialisation des données
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
      //Récupère le poste en fonction de son Id
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

  //Fonction qui redirige sur la page du poste lorsque l'on clique sur celui-ci
  onClickPost(id: string) {
    console.log('on click post');
    //Redirige vers la page post en fonction de son Id
    this.router.navigate(['posts', id]);
  }

  //Gère les like
  onLike($event: Event) {
    //Empêche la propagation de l'evenement clique sur la card
    $event.stopPropagation();
    //Si dislike vaut true, on sort de  la méthode onLike
    if (this.disliked) {
      return;
    }
    //La gestion du like est en cours de traitement
    this.likePending = true;
    this.postService
      .likePost(this.post._id, !this.liked)
      .pipe(
        tap((liked) => {
          this.likePending = false;
          this.liked = liked;
        }),
        map((liked) => ({
          //Récupère toutes les propriétés de post
          ...this.post,
          likes: liked ? this.post.likes + 1 : this.post.likes - 1,
        })),
        tap((post) => (this.post = post))
      )
      .subscribe();
  }
  
  //Gère les dislike
  onDislike($event: Event) {
    //Empêche la propagation de l'evenement clique sur la card
    $event.stopPropagation();
    //Si like vaut true, on sort de  la méthode onDisLike
    if (this.liked) {
      return;
    }
    //La gestion du like est en cours de traitement
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

  //Renvoie vers la page posts
  onBack() {
    this.router.navigate(['/posts']);
  }

  //Renvoie vers la page pour modifier un post
  onModify() {
    this.router.navigate(['/modify-post', this.post._id]);
  }

  //Permet de supprimer un post
  onDelete() {
    this.loading = true;
    if (confirm('Voulez vous vraiment supprimer ce post')) {
      this.postService.deletePost(this.post._id).subscribe((res) => {
        this.router.navigate(['/posts']);
        console.log('Post deleted successfully!');
        this.loading = false;
      });
    }
  }
}
