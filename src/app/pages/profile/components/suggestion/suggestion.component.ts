import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../../core/services/user/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-suggestion',
  imports: [CommonModule],
  templateUrl: './suggestion.component.html',
  styleUrl: './suggestion.component.css'
})
export class SuggestionComponent {
  @Input() suggestedUsers: any[] = [];

  constructor(private userService: UserService, private router: Router) { } 

  navigateToProfileUser(idUsuario: string) {
    this.router.navigate(['/profile', idUsuario]);
  }
}
