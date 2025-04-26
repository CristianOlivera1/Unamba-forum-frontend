import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from 'express';
import { ModalLoginService } from '../../../core/services/modal/modalLogin.service';
import { GoogleAuthService } from '../../../core/services/oauth/google-auth.service';
import { LoginService } from '../../../core/services/oauth/login.service';
import { TokenService } from '../../../core/services/oauth/token.service';
import { ModalInfoCompleteService } from '../../../core/services/modal/modalCompleteInfo.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CareerService } from '../../../core/services/career/career.service';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../../core/services/profile/profile.service';

@Component({
  selector: 'app-complete-info-register-google',
  imports: [CommonModule, FormsModule],
  templateUrl: './complete-info-register-google.component.html',
  styleUrl: './complete-info-register-google.component.css'
})
export class CompleteInfoRegisterGoogleComponent implements OnInit {
  careers: any[] = [];
  formData = {
    idUsuario: '',
    carrera: '',
    genero: '',
    descripcion: '',
    fechaNacimiento: ''
  };
  alert: { type: string; message: string } | null = null;
  isLoading: boolean = false;

  constructor(
    private careerService: CareerService,
    private modalInfoCompleteService: ModalInfoCompleteService,
    private userProfileService: ProfileService, private tokenService: TokenService
  ) { }

  ngOnInit(): void {
    this.loadCareers();
  }

  loadCareers(): void {
    this.careerService.getAllCareer().subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          this.careers = response.data;
        } else {
          console.error('Error al cargar las carreras:', response.listMessage);
        }
      },
      error: (error) => {
        console.error('Error en la solicitud:', error);
        this.showAlert('error', 'Error al cargar las carreras.');

      }
    });
  }

  closeModal(): void {
    this.modalInfoCompleteService.hideInfoCompleteModal();
  }

  submitForm(): void {
    const idUsuario = this.tokenService.getUserId();
    if (!idUsuario) {
      this.showAlert('error', 'Error: No se pudo obtener el ID del usuario.');
      return;
    }

    if (!this.formData.carrera) {
      this.showAlert('error', 'Por favor, selecciona tu carrera.');
      return;
    }

    this.isLoading = true;
    const payload = new FormData();
    payload.append('idUsuario', idUsuario);
    payload.append('idCarrera', this.formData.carrera);
    if (!this.formData.carrera) {
      this.showAlert('error', 'Por favor, selecciona tu carrera.');
      return;
    }
    if (this.formData.genero !== null) {
      payload.append('genero', this.formData.genero);
    }
    if (this.formData.descripcion) {
      payload.append('descripcion', this.formData.descripcion);
    }
    if (this.formData.fechaNacimiento) {
      payload.append('fechaNacimiento', this.formData.fechaNacimiento);
    }

    this.userProfileService.updateProfile(payload).subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          this.showAlert('success', 'Perfil actualizado correctamente.');
          this.closeModal();
        } else {
          this.showAlert('error', 'Error al actualizar el perfil.');
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.showAlert('error', 'Error en la solicitud. Inténtalo de nuevo.');
        this.isLoading = false;
      }
    });
  }
  showAlert(type: string, message: string): void {
    this.alert = { type, message };
    setTimeout(() => {
      this.alert = null;
    }, 5000);
  }
}
