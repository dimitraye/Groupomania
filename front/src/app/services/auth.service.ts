//Logique métier et appels HTTP
//Liés à l'authentification

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
  host = 'http://localhost:3000';


  constructor(private http: HttpClient, private router: Router) {}

  //Crée un utilisateur
  createUser(email: string, password: string) {
    //exécute requête http en mode POST
    return this.http.post<{ message: string }>(
      this.host + '/api/auth/signup', //URL
      { email: email, password: password } //Corps
    );
  }

  //Récupère le token
  getToken() {
    let token = this.authToken || this.getLocalToken();
    return token ? token : '';
  }

  //Récupère le token dans le local Storage
  getLocalToken() {
    //Récupère un item (token) dans le local Storage
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

  //Récupère l'id de l'utilisateur enregistré dans le local storage
  getLocalUserId() {
    //Récupère le token stocké dans le local storage
    let token: string | any = this.getLocalToken();
    //Décode le token
    let decodedToken = this.getDecodedAccessToken(token);
    console.log('this.userId', this.userId);
    console.log('tokenInfo.userId', decodedToken.userId);
    //Si le token n'est pas nul, on retourne le userId du token décodé, sinon on retourne une chaine vide
    return decodedToken != null ? decodedToken.userId : '';
  }

  //Récupère le role de l'utilisateur enregistré dans le local storage
  getLocalUserRole() {
    let token: string | any = this.getLocalToken();
    let decodedToken = this.getDecodedAccessToken(token);
    console.log('this.userRole getLocalUserRole', this.userRole);
    console.log('tokenInfo.userRole getLocalUserRole', decodedToken.role);
    //Si le token n'est pas nul, on retourne le role du token décodé, sinon on retourne une chaine vide
    return decodedToken != null ? decodedToken.role : '';
  }

  //Récupère l'id de l'utilisateur
  getUserId() {
    //retourne soit le userId, soit le userId enregistré dans le local storage 
    return this.userId || this.getLocalUserId();
  }

  //Regarde si l'utilisateur a le role 'Admin'
  isAdmin() {
    return this.userRole == 'admin';
  }

  //Vérifie si l'utilisateur est connecté
  public isLoggedIn(): Observable<boolean> {
    //Si l'élément isLoggedIn du localStorage vaut true, Auth vaut true (initialisé de base à false) 
    if (localStorage.getItem('isLoggedIn') == 'true') {
      this.isAuth$.next(true);
    } 
    //Sinon, auth vaut false
    else {
      this.isAuth$.next(false);
    }
    console.log('isLoggedIn');
    return this.isAuth$;
  }

  //Connecte un utilisateur
  loginUser(email: string, password: string) {
    //requête http en mode POST
    return this.http
      .post<{ userId: string; token: string; role: string }>(
        this.host + '/api/auth/login', //URL
        { email: email, password: password } //corps
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

  //Déconnecte l'utilisateur
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
