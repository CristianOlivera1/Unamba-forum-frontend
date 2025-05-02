import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../../core/services/user/user.service';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../../../core/services/profile/profile.service';
import { HoverAvatarComponent } from '../../../home/components/hover-avatar/hover-avatar.component';

@Component({
  selector: 'app-suggestion',
  imports: [CommonModule],
  templateUrl: './suggestion.component.html',
  styleUrl: './suggestion.component.css'
})
export class SuggestionComponent {
  @Input() suggestedUsers: any[] = [];
  hoverProfileData: any = null;
  hoverPosition = { top: 0, left: 0 };
  isHoverModalVisible = false;
  isHovering = false;

  constructor(private router: Router, private profileService: ProfileService) { }

  navigateToProfileUser(idUsuario: string) {
    this.router.navigate(['/profile', idUsuario]);
  }
}
