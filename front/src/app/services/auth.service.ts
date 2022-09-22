import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isAuth$ = new BehaviorSubject<boolean>(false);
  isAdmin$ = new BehaviorSubject<boolean>(false);
  private authToken = '';
  private userId = '';
  userRole = '';

  constructor(private http: HttpClient, private router: Router) {}

  createUser(email: string, password: string) {
    return this.http.post<{ message: string }>(
      'http://localhost:3000/api/auth/signup',
      { email: email, password: password }
    );
  }

  getToken() {
    let token = this.authToken || this.getLocalToken();
    return token? token:'' ;
  }

  getLocalToken() {
    return localStorage.getItem('token');
  }
  //décode le token
  getDecodedAccessToken(token: string): any {
    try {
      return jwt_decode(token);
    } catch (Error) {
      return null;
    }
  }

  //
  getLocalUserId() {
    let token:string | any = this.getLocalToken();
    let tokenInfo = this.getDecodedAccessToken(token);
    console.log('this.userId',this.userId);
    console.log('tokenInfo.userId',tokenInfo.userId);
    return tokenInfo != null ? tokenInfo.userId : '';
  }

  getLocalUserRole() {
    let token:string | any = this.getLocalToken();
    let tokenInfo = this.getDecodedAccessToken(token);
    console.log('this.userRole getLocalUserRole',this.userRole);
    console.log('tokenInfo.userRole getLocalUserRole',tokenInfo.role);
    return tokenInfo != null ? tokenInfo.role : '';
  }

  getUserId() {
    return this.userId || this.getLocalUserId();
  }

  isAdmin() {
    return this.userRole == 'admin';
  }

  public isLoggedIn(): Observable<boolean> {
    if (localStorage.getItem('isLoggedIn') == 'true') {
      this.isAuth$.next(true);
    } else {
      this.isAuth$.next(false);
    }
    console.log('isLoggedIn');
    return this.isAuth$;
  }

  loginUser(email: string, password: string) {
    return this.http
      .post<{ userId: string; token: string; role: string }>(
        'http://localhost:3000/api/auth/login',
        { email: email, password: password }
      )
      .pipe(
        tap(({ userId, token, role }) => {
          this.userId = userId;
          this.authToken = token;
          this.userRole = role;
          this.isAuth$.next(true);
          this.isAdmin$.next(this.userRole == 'admin');
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('token', token);
        })
      );
  }

  logout() {
    this.authToken = '';
    this.userId = '';
    this.isAuth$.next(false);
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('token');
    console.log('localstorage removed');
    this.router.navigate(['login']);
  }
}








