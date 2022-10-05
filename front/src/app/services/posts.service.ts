//Logique métier et appels HTTP
//Lié à la gestion des posts

import { Injectable } from '@angular/core';
import {
  catchError,
  mapTo,
  Observable,
  of,
  Subject,
  tap,
  throwError,
} from 'rxjs';
import { Post } from '../models/Post.model';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  host = 'http://localhost:3000';
  domain = '/api/posts';

  posts$ = new Subject<Post[]>();

  constructor(private http: HttpClient, private authService: AuthService) {}

  //Récupère tous les posts
  getAll(): Observable<any> {
    return (
      this.http
        //requête http en mode GET
        .get(this.host + this.domain) //URL
        .pipe(catchError(this.errorHandler))
    );
  }
  //Message d'erreur
  errorHandler(error: any) {
    let errorMessage = '';
    //Vérifie si l'erreur est de type errorEvent
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } 
    //Sinon, renvoie le status de l'erruer ainsi qu'un message
    else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }

  //Récupère un post via son Id
  getPostById(id: string) {
    //requête http en mode GET
    return this.http
      .get<Post>(this.host + this.domain + '/' + id) //URL
      .pipe(catchError((error) => throwError(error.error.message)));
  }

  //Like un post
  likePost(id: string, liked: boolean) {
    //requête http en mode POST
    return this.http
      .post<{ message: string }>(
        this.host + this.domain + '/' + id + '/like', //URL
        { userId: this.authService.getUserId(), like: liked ? 1 : 0 }
      )
      .pipe(
        mapTo(liked),
        catchError((error) => throwError(error.error.message))
      );
  }
  //Dislike un post
  dislikePost(id: string, disliked: boolean) {
    //requête http en mode POST
    return this.http
      .post<{ message: string }>(
        this.host + this.domain + '/' + id + '/like', //URL
        { userId: this.authService.getUserId(), like: disliked ? -1 : 0 }
      )
      .pipe(
        mapTo(disliked),
        catchError((error) => throwError(error.error.message))
      );
  }

  //Création d'un post
  createPost(post: Post, image: File) {
    //Strucure de données permetant d'encapsuler les champs d'un formulaire sous forme de paires clef/valeur
    const formData = new FormData();
    formData.append('post', JSON.stringify(post));
    formData.append('image', image);
    //requête http en mode POST
    return this.http
      .post<{ message: string }>(
        this.host + this.domain, //URL
        formData //corps de la requête
      ) 
      .pipe(catchError((error) => throwError(error.error.message)));
  }

  //Modification d'un post
  modifyPost(id: string, post: Post, image: string | File) {
    //Si image est de type String (Image non modifiée)
    if (typeof image === 'string') {
      //requête http en mode PUT
      return this.http
        .put<{ message: string }>(
          this.host + this.domain + '/' + id, //URL
          post //corps
        ) 
        .pipe(catchError((error) => throwError(error.error.message)));
    } //Sinon Image === file (image modifiée)
    else {
      //Strucure de données permetant d'encapsuler les champs d'un formulaire sous forme de paires clef/valeur
      const formData = new FormData();
      formData.append('post', JSON.stringify(post));
      formData.append('image', image);
      return (
        this.http
          //requête http en mode PUT
          .put<{ message: string }>(
            this.host + this.domain + '/' + id, //URL
            formData //corps de la requête
          )
          .pipe(catchError((error) => throwError(error.error.message)))
      );
    }
  }

  //Supprime un post
  deletePost(id: string) {
    return (
      this.http
        //requête http en mode DELETE
        .delete<{ message: string }>('http://localhost:3000/api/posts/' + id) //URL
        .pipe(catchError((error) => throwError(error.error.message)))
    );
  }
}
