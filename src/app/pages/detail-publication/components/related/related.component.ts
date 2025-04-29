import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TimeUtils } from '../../../../Utils/TimeElapsed';
import { Router } from '@angular/router';
import { ProfileService } from '../../../../core/services/profile/profile.service';

@Component({
  selector: 'app-related',
  imports: [CommonModule],
  templateUrl: './related.component.html',
  styleUrl: './related.component.css'
})
export class RelatedComponent {
  @Input() publicationRelated: any[] = [];

  hoverProfileData: any = null;
  hoverPosition = { top: 0, left: 0 };
  isHoverModalVisible = false;
  isHovering = false;

  constructor(private router: Router, private profileService: ProfileService) { }

  getTimeElapsedWrapper(fechaRegistro: string): string {
    return TimeUtils.getTimeElapsed(fechaRegistro);
  }

  navigateToDetailPublication(idPublication: string) {
    this.router.navigate(['/publication', idPublication]);
  }
}
