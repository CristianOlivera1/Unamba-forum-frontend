import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { SuggestionComponent } from './components/suggestion/suggestion.component';
import { DetailComponent } from './components/detail/detail.component';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../../core/services/profile/profile.service';

@Component({
  selector: 'app-profile',
  imports: [HeaderComponent,FooterComponent,HeaderComponent,SuggestionComponent,DetailComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  userProfile: any = null;
  userDetails: any = null;

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    const idUsuario = this.route.snapshot.paramMap.get('idUsuario');
    if (idUsuario) {
      this.loadUserProfile(idUsuario);
      this.loadUserDetails(idUsuario);
    }
  }

  loadUserProfile(userId: string): void {
    this.profileService.getUserProfileHover(userId).subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          this.userProfile = response.data;
        } else {
          console.error('Error al cargar el perfil:', response.listMessage);
        }
      },
      error: (error) => {
        console.error('Error en la solicitud del perfil:', error);
      }
    });
  }

  loadUserDetails(userId: string): void {
    this.profileService.getUserProfileDetail(userId).subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          this.userDetails = response.data;
        } else {
          console.error('Error al cargar los detalles:', response.listMessage);
        }
      },
      error: (error) => {
        console.error('Error en la solicitud de los detalles:', error);
      }
    });
  }
}
