//Gère l'affichage et les intéractions faites sur la page
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Observable, shareReplay } from 'rxjs';

@Component({
  //<app-header> </app-header>
  selector: 'app-header',
    //Liaison avec le fichier header.component.scss
  templateUrl: './header.component.html',
    //Liaison avec le fichier header.component.scss
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit {

  //Booléen qui dit si l'utilisateur est connecté
  isAuth$!: Observable<boolean>;

  //Injection de dépendance (un service)
  constructor(private authService: AuthService) { }

  //Initialise la donnée isAuth 
  ngOnInit() {
    this.isAuth$ = this.authService.isAuth$.pipe(
      //Pre,d la première valeur (à revoir..)
      shareReplay(1)
    );
  }

  //Déconnexion (s'exécute quand on clique sur le bouton 'Déconnexion')
  onLogout() {
  //Exécute la fonction logout de authService
  this.authService.logout();
  }

}
