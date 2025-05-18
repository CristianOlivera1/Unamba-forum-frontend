import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { ProfileService } from '../../core/services/profile/profile.service';
import { TokenService } from '../../core/services/oauth/token.service';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user/user.service';

@Component({
  selector: 'app-config',
  imports: [CommonModule, HeaderComponent, FooterComponent, FormsModule],
  templateUrl: './config.component.html',
  styleUrl: './config.component.css'
})
export class ConfigComponent implements OnInit {
  activeTab: 'personal' | 'security' = 'personal';

  profile: any = {
    nombre: '',
    apellidos: '',
    descripcion: '',
    fechaNacimiento: '',
    genero: null
  };

  isLoading = false;
  isSaving = false;
  alert: { type: string; message: string } | null = null;

  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  isUpdatingPassword = false;

showCurrentPassword: boolean = false;
showNewPassword: boolean = false;
showConfirmPassword: boolean = false;
  constructor(
    private tokenService: TokenService,
    private profileService: ProfileService,
    private http: HttpClient,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    const userId = this.tokenService.getUserId();
    if (userId) {
      this.loadUserProfile(userId);
    }
  }

  private loadUserProfile(userId: string): void {
    this.isLoading = true;
    this.profileService.getProfileByUserId(userId).subscribe({
      next: (res: any) => {
        if (res.type === 'success') {
          this.profile = {
            nombre: res.data.nombre || '',
            apellidos: res.data.apellidos || '',
            descripcion: res.data.descripcion || '',
            fechaNacimiento: res.data.fechaNacimiento ? res.data.fechaNacimiento.substring(0, 10) : '',
            genero: res.data.genero !== null && res.data.genero !== undefined ? Number(res.data.genero) : null
          };
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showAlert('error', 'No se pudo cargar el perfil.');

      }
    });
  }

  saveProfile(): void {
    if (
      this.profile.genero === null ||
      this.profile.genero === undefined ||
      this.profile.genero === 'null'
    ) {
      this.showAlert('warning', 'Por favor, selecciona un género válido.');
      return;
    }

    if (!this.profile.fechaNacimiento) {
      this.showAlert('warning', 'Por favor, ingresa una fecha de nacimiento válida.');
      return;
    }

    // Validar que sea mayor de 18 años
    const birthDate = new Date(this.profile.fechaNacimiento);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    const day = today.getDate() - birthDate.getDate();
    const is18 =
      age > 18 ||
      (age === 18 && (m > 0 || (m === 0 && day >= 0)));

    if (!is18) {
      this.showAlert('error', 'Debes ser mayor de 18 años.');
      return;
    }

    this.isSaving = true;
    const userId = this.tokenService.getUserId();
    const formData = new FormData();
    formData.append('idUsuario', userId || '');
    formData.append('nombre', this.profile.nombre);
    formData.append('apellidos', this.profile.apellidos);
    formData.append('descripcion', this.profile.descripcion);
    formData.append('fechaNacimiento', this.profile.fechaNacimiento);
    formData.append('genero', this.profile.genero);

    this.profileService.updateProfile(formData).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        if (res.type === 'success') {
          this.showAlert('success', 'Perfil actualizado correctamente.');

        } else {
          this.showAlert('error', 'No se pudo actualizar el perfil.');
        }
      },
      error: () => {
        this.isSaving = false;
        this.showAlert('error', 'No se pudo actualizar el perfil.');
      }
    });
  }

  updatePassword(): void {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.showAlert('warning', 'Completa todos los campos de contraseña.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.showAlert('warning', 'Las contraseñas no coinciden.');
      return;
    }
    if (this.newPassword.length < 8) {
      this.showAlert('warning', 'La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    this.isUpdatingPassword = true;
    const userId = this.tokenService.getUserId();
    const formData = new FormData();
    formData.append('idUsuario', userId || '');
    formData.append('contrasenha', this.newPassword);
    formData.append('currentPassword', this.currentPassword);

    this.userService.updateUserPassword(formData).subscribe({
      next: (res: any) => {
        this.isUpdatingPassword = false;
        if (res.type === 'success') {
          this.showAlert('success', 'Contraseña actualizada correctamente.');
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
        } else {
          this.showAlert('error', res.listMessage?.[0] || 'No se pudo actualizar la contraseña.');
        }
      },
      error: () => {
        this.isUpdatingPassword = false;
        this.showAlert('error', 'No se pudo actualizar la contraseña.');
      }
    });
  }

  showAlert(type: string, message: string): void {
    this.alert = { type, message };
    setTimeout(() => {
      this.alert = null;
    }, 5000);
  }
toggleCurrentPasswordVisibility(): void {
  this.showCurrentPassword = !this.showCurrentPassword;
}
toggleNewPasswordVisibility(): void {
  this.showNewPassword = !this.showNewPassword;
}
toggleConfirmPasswordVisibility(): void {
  this.showConfirmPassword = !this.showConfirmPassword;
}
}
