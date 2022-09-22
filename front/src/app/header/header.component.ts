import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Observable, shareReplay } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  isAuth$!: Observable<boolean>;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.isAuth$ = this.authService.isAuth$.pipe(
      shareReplay(1)
    );
  }

  onLogout() {
    this.authService.logout();
  }

}
