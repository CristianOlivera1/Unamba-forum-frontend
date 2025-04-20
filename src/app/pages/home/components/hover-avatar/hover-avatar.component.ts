import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hover-avatar',
  imports: [CommonModule],
  templateUrl: './hover-avatar.component.html',
  styleUrl: './hover-avatar.component.css'
})
export class HoverAvatarComponent {
  @Input() profileData: any; 
  @Input() position?: { top: number; left: number }; 
  constructor(private router:Router){}

  navigateToProfileUser(idPerfil: string) {
    this.router.navigate(['/profile', idPerfil]);
  }

}
