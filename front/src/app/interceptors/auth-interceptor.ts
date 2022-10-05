//intercepte la requête pour effectuer différents traitements avant d'envoyer la requête au serveur
//Ajoute le token dans les requêtes 

import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}
//Intercepte la requête http et y ajoute un token
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authToken = this.authService.getToken();
    const newRequest = req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + authToken)
    });  
    return next.handle(newRequest);
  }
}
