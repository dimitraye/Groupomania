//Gère l'affichage et les intéractions faites sur la page
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PostsService } from '../../services/posts.service';
import { Post } from '../../models/Post.model';
import { AuthService } from '../../services/auth.service';
import { catchError, EMPTY, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-post-form',
    //Liaison avec le fichier post-form.component.scss
    templateUrl: './post-form.component.html',
    //Liaison avec le fichier post-form.component.scss
    styleUrls: ['./post-form.component.scss']
})
export class PostFormComponent implements OnInit {

  postForm!: FormGroup;
  mode!: string;
  loading!: boolean;
  post!: Post;
  errorMsg!: string;
  imagePreview!: string;
  cardTitle!: string;

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private postService: PostsService,
              private authService: AuthService) { }

  //Initialise un formulaire vide ou rempli
  ngOnInit() {
    this.loading = true;
    this.route.params.pipe(
      switchMap(params => {
        //S'il n'y a pas d'Id , on renvoie un formulaire vide (création d'un post)
        if (!params['id']) {
          this.mode = 'new';
          this.initEmptyForm();
          this.loading = false;
          return EMPTY;
        } else { //Sinon, On récupère le post en fonction de son Id 
          this.mode = 'edit';
          return this.postService.getPostById(params['id'])
        }
      }),
      tap(post => {
        //Si le post existe déjà, alors lui affect les éléments de notre objet post
        if (post) {
          this.post = post;
          //Appel de la fonction qui initialise la modification d'un poste
          this.initModifyForm(post);
          this.loading = false;
        }
      }),
      catchError(error => this.errorMsg = JSON.stringify(error))
    ).subscribe();
  }

  //Initialise un formulaire vide
  initEmptyForm() {
    this.postForm = this.formBuilder.group({
      title: [null, Validators.required],
      content: [null, Validators.required],
      image: [null, Validators.required]
    });
    this.cardTitle = 'Nouveau Post';
  }

  //Initialise le formulaire de modification d'un post existant
  initModifyForm(post: Post) {
    this.postForm = this.formBuilder.group({
      title: [post.title, Validators.required],
      content: [post.content, Validators.required],
      image: [post.imageUrl, Validators.required]
    });
    this.imagePreview = this.post.imageUrl;
    this.cardTitle = 'Modifier Post';
  }

  //Modification/Création d'un post (s'exécute quand on appuie sur le bouton 'Publier')
  onSubmit() {
    this.loading = true;
    const newPost = new Post();
    //Récupère les valeurs entrées dans les champs
    newPost.title = this.postForm.get('title')!.value;
    newPost.content = this.postForm.get('content')!.value;
    newPost.userId = this.authService.getUserId();
    //S'il s'agit d'un nouveau post, appel de la fonction 'createPost' 
    if (this.mode === 'new') {
      this.postService.createPost(newPost, this.postForm.get('image')!.value).pipe(
        tap(({ message }) => {
          console.log(message);
          this.loading = false;
          //Redirige vers la page posts
          this.router.navigate(['/posts']);
        }),
        catchError(error => {
          console.error(error);
          this.loading = false;
          this.errorMsg = error.message;
          return EMPTY;
        })
      ).subscribe();
    } else if (this.mode === 'edit') { //Sinon, s'il s'agit d'un post déjà existant, appel de la fonction 'modifyPost'
      this.postService.modifyPost(this.post._id, newPost, this.postForm.get('image')!.value).pipe(
        tap(({ message }) => {
          console.log(message);
          this.loading = false;
          //Redirige vers la page posts
          this.router.navigate(['/posts']);
        }),
        catchError(error => {
          console.error(error);
          this.loading = false;
          this.errorMsg = error.message;
          return EMPTY;
        })
      ).subscribe();
    }
  }

  //
  onFileAdded(event: Event) {
    const file = (event.target as HTMLInputElement).files![0];
    this.postForm.get('image')!.setValue(file);
    this.postForm.updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      //Affiche une version miniature de l'image (preview)
      this.imagePreview = reader.result as string;
      console.log('imagePreview :', this.imagePreview);
    };
    reader.readAsDataURL(file);
  }
}
