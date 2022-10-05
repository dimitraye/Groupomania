//Logique métier et appels HTTP 
//surveille l'accès à une route
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, take, tap } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
//Méthode appelée à chaque demande d'accès à une route
//Authorise ou non l'accès vers une route demandée
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.isLoggedIn().pipe(
      take(1),
      tap((auth) => {
//Si l'utilisateur n'est pas connecté, il est redirigé vers la page de connexion        
        if (!auth) {
          this.router.navigate(['/login']);
        }
      })
    );
  }
}
