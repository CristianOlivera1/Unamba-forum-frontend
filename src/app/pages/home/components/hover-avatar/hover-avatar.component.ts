import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hover-avatar',
  imports: [CommonModule],
  templateUrl: './hover-avatar.component.html',
  styleUrl: './hover-avatar.component.css'
})
export class HoverAvatarComponent {
  @Input() profileData: any; 
  @Input() position?: { top: number; left: number }; 
}
