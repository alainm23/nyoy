import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

// Services
import { AuthService } from '../services/auth.service';
import { DatabaseService } from '../services/database.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  usuario: any;

  constructor (
    private authService: AuthService,
    private database: DatabaseService,
    private router: Router) {
    }
  canActivate () {
    return this.authService.isLogin ()
      .then (async (user: any) => {
        if (user) {
            return true;
        } else {
          this.router.navigate(['/slides']);
          return false;
        }
      });
  }
}
