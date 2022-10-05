import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, EMPTY, tap } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  //Formulaire
  loginForm!: FormGroup;
  //Indique si la page est en train de charger
  loading!: boolean;
  //Message d'erreur
  errorMsg!: string;

  //Injection de dépendances
  //Les services qui seront utilisés
  constructor(private formBuilder: FormBuilder, //Simplifie la création de formulaires
              private authService: AuthService,
              private router: Router) { }

  //Initialisation des données            
  ngOnInit() {
    //Crée un formulaire avec comme champs email et password
    this.loginForm = this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, Validators.required]
    });
  }

  //Connexion
  onLogin() {
    //La page est en train de charger
    this.loading = true;
    //Récupère la valeur des champs email et password
    const email = this.loginForm.get('email')!.value;
    const password = this.loginForm.get('password')!.value;
    //Appel de la méthode loginUser de authService
    this.authService.loginUser(email, password).pipe(
      tap(() => {
        this.loading = false;
        //Redirige sur la page posts
        this.router.navigate(['/posts']);
      }),
      catchError(error => {
        this.loading = false;
        this.errorMsg = error.message;
        return EMPTY;
      })
    ).subscribe();
  }

}
