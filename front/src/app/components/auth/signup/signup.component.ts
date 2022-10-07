//Gère l'affichage et les intéractions faites sur la page
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, EMPTY, switchMap, tap } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  //<app-signup> </app-signup>
  selector: 'app-signup',
  //Liaison avec le fichier signup.component.html
  templateUrl: './signup.component.html',
  //Liaison avec le fichier signup.component.scss
  styleUrls: ['./signup.component.scss']
})


export class SignupComponent implements OnInit {

  //Formulaire d'inscription
  signupForm!: FormGroup;
  //Indicateur sur l'état du chargement de la page
  loading!: boolean;
  //Message d'erreur
  errorMsg!: string;

  //Injection de dépendances
  constructor(private formBuilder: FormBuilder,
              private authService: AuthService,
              private router: Router) { }

  //Initialie un formulaire vide            
  ngOnInit() {
    //Crée un formulaire avec comme champs email et password
    this.signupForm = this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, Validators.required]
    });
  }

  //Création d'un compte
  onSignup() {
    //La page est en train de charger
    this.loading = true;
    //Récupère la valeur des champs email et password
    const email = this.signupForm.get('email')!.value;
    const password = this.signupForm.get('password')!.value;
    //Appel de la méthode createUser de authService
    this.authService.createUser(email, password).pipe(
      //switchMap
      //
      switchMap(() => this.authService.loginUser(email, password)),
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
