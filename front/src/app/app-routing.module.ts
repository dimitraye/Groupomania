//Gère la liaison entre une route et un component
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { PostFormComponent } from "./components/post-form/post-form.component";
import { PostListComponent } from "./components/post-list/post-list.component";
import { AuthGuard } from "./services/auth-guard.service";
import { SinglePostComponent } from "./components/single-post/single-post.component";
import { SignupComponent } from "./components/auth/signup/signup.component";
import { LoginComponent } from "./components/auth/login/login.component";

//Déclaration des routes
const routes: Routes = [
  { path: 'signup', title : "Inscription", component: SignupComponent },
  { path: 'login', title : "Connexion", component: LoginComponent },
  { path: 'posts', title : "Accueil", component: PostListComponent, canActivate: [AuthGuard] },
  { path: 'posts/:id', title : "Post", component: SinglePostComponent, canActivate: [AuthGuard] },
  { path: 'new-post', title : "Créer un post", component: PostFormComponent, canActivate: [AuthGuard] },
  { path: 'modify-post/:id', title : "Modifier un post", component: PostFormComponent, canActivate: [AuthGuard] },
//renvoie vers la route posts, si on est à la racine de l'application
  { path: '', pathMatch: 'full', redirectTo: 'posts'},
//Renvoie vers la route posts, peut importe ce que l'on tappe  hormis celles spécifiées ci-dessus
  { path: '**', redirectTo: 'posts' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
