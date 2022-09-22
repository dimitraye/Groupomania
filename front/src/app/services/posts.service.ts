import { Injectable } from '@angular/core';
import { catchError, mapTo, Observable, of, Subject, tap, throwError } from 'rxjs';
import { Post } from '../models/Post.model';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  host = 'http://localhost:3000';
  domain = '/api/posts';


  getAll(): Observable<any> {
    return this.http
      .get(this.host + this.domain)
      .pipe(catchError(this.errorHandler));
  }

  errorHandler(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }

  posts$ = new Subject<Post[]>();

  constructor(private http: HttpClient, private authService: AuthService) {}

  getPosts() {
    this.http
      .get<Post[]>('http://localhost:3000/api/posts')
      .pipe(
        tap((posts) => this.posts$.next(posts)),
        catchError((error) => {
          console.error(error.error.message);
          return of([]);
        })
      )
      .subscribe();
  }

  getPostById(id: string) {
    return this.http
      .get<Post>('http://localhost:3000/api/posts/' + id)
      .pipe(catchError((error) => throwError(error.error.message)));
  }

  likePost(id: string, like: boolean) {
    return this.http
      .post<{ message: string }>(
        'http://localhost:3000/api/posts/' + id + '/like',
        { userId: this.authService.getUserId(), like: like ? 1 : 0 }
      )
      .pipe(
        mapTo(like),
        catchError((error) => throwError(error.error.message))
      );
  }

  dislikePost(id: string, dislike: boolean) {
    return this.http
      .post<{ message: string }>(
        'http://localhost:3000/api/posts/' + id + '/like',
        { userId: this.authService.getUserId(), like: dislike ? -1 : 0 }
      )
      .pipe(
        mapTo(dislike),
        catchError((error) => throwError(error.error.message))
      );
  }

  createPost(post: Post, image: File) {
    const formData = new FormData();
    formData.append('post', JSON.stringify(post));
    formData.append('image', image);
    return this.http
      .post<{ message: string }>('http://localhost:3000/api/posts', formData)
      .pipe(catchError((error) => throwError(error.error.message)));
  }

  modifyPost(id: string, post: Post, image: string | File) {
    if (typeof image === 'string') {
      return this.http
        .put<{ message: string }>('http://localhost:3000/api/posts/' + id, post)
        .pipe(catchError((error) => throwError(error.error.message)));
    } else {
      const formData = new FormData();
      formData.append('post', JSON.stringify(post));
      formData.append('image', image);
      return this.http
        .put<{ message: string }>(
          'http://localhost:3000/api/posts/' + id,
          formData
        )
        .pipe(catchError((error) => throwError(error.error.message)));
    }
  }

  deletePost(id: string) {
    return this.http
      .delete<{ message: string }>('http://localhost:3000/api/posts/' + id)
      .pipe(catchError((error) => throwError(error.error.message)));
  }
}
