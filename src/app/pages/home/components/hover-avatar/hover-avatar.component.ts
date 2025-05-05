import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { FollowService } from '../../../../core/services/follow/follow.service';
import { TokenService } from '../../../../core/services/oauth/token.service';

@Component({
  selector: 'app-hover-avatar',
  imports: [CommonModule],
  templateUrl: './hover-avatar.component.html',
  styleUrl: './hover-avatar.component.css'
})
export class HoverAvatarComponent implements OnChanges {
  @Input() profileData: any; 
  @Input() position?: { top: number; left: number }; 
  currentUserId: string | null = null;
  isFollowing: boolean = false;

  constructor(private router: Router, private followService: FollowService,    private tokenService: TokenService
  ) {}
  
  ngOnInit(): void {
    this.currentUserId = this.tokenService.getUserId();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['profileData'] && changes['profileData'].currentValue) {
      this.checkIfFollowing();
    }
  }

  navigateToProfileUser(idPerfil: string) {
    this.router.navigate(['/profile', idPerfil]);
  }

  checkIfFollowing(): void {
    if (!this.currentUserId || !this.profileData?.idUsuario) return;

    this.followService.getFollowersByUserId(this.profileData.idUsuario).subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          this.isFollowing = response.data.some(
            (follower: any) => follower.idSeguidor === this.currentUserId
          );
        } else {
          console.error('Error al verificar si sigue al usuario:', response.listMessage);
        }
      },
      error: (error) => {
        console.error('Error en la solicitud de seguidores:', error);
      }
    });
  }

  followUser(): void {
    if (!this.currentUserId || !this.profileData?.idUsuario) return;

    this.followService.followUser(this.currentUserId, this.profileData.idUsuario).subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          this.isFollowing = true; // Actualizar el estado
          this.profileData.totalFollowers += 1; // Incrementar el contador de seguidores
        } else {
          console.error('Error al seguir al usuario:', response.listMessage);
        }
      },
      error: (error) => {
        console.error('Error en la solicitud de seguir usuario:', error);
      }
    });
  }

  unfollowUser(): void {
    if (!this.currentUserId || !this.profileData?.idUsuario) return;

    this.followService.unfollowUser(this.currentUserId, this.profileData.idUsuario).subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          this.isFollowing = false; // Actualizar el estado
          this.profileData.totalFollowers -= 1; // Decrementar el contador de seguidores
        } else {
          console.error('Error al dejar de seguir al usuario:', response.listMessage);
        }
      },
      error: (error) => {
        console.error('Error en la solicitud de dejar de seguir usuario:', error);
      }
    });
  }

}
