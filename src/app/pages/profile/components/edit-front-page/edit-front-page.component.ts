import { Component, EventEmitter, Input, Output } from '@angular/core';
import Dropzone from 'dropzone';
import { environment } from '../../../../../environments/environment';
import { TokenService } from '../../../../core/services/oauth/token.service';
import { ProfileService } from '../../../../core/services/profile/profile.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-front-page',
  imports: [CommonModule],
  templateUrl: './edit-front-page.component.html',
  styleUrl: './edit-front-page.component.css'
})
export class EditFrontPageComponent {
  @Input() photoFrontPageUrl: string = ''; 
  @Output() close = new EventEmitter<void>(); 
  @Output() success = new EventEmitter<string>();
  
  private apiProfile = environment.apiProfile;
  private dropzoneInstance: Dropzone | null = null;

  isUpdateFrontPageInProgress: boolean = false;

  private isDefaultPhoto: boolean = false;
  alert: { type: string; message: string } | null = null; 

  constructor(private profileService: ProfileService, private tokenService: TokenService) {}

  showAlert(type: string, message: string): void {
    this.alert = { type, message };
    setTimeout(() => {
      this.alert = null;
    }, 5000);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeDropzone();
    }, 100); 
  }
  
  initializeDropzone(): void {
    this.dropzoneInstance = new Dropzone('#dropzone', {
      url: this.apiProfile + '/update', 
      method: 'put', 
      maxFiles: 1, 
      acceptedFiles: 'image/*',
      maxFilesize: 2, 
      autoProcessQueue: false,
  
      init: function () {
        const dropzoneInstance = this as Dropzone;
        dropzoneInstance.on('thumbnail', function (file) {
          const previews = document.querySelectorAll('.dz-preview img') as NodeListOf<HTMLImageElement>;
          previews.forEach(img => {
            img.style.width = '400px'; 
            img.style.maxWidth = '200px'; 
            img.style.maxHeight = '200px';
            img.style.objectFit = 'contain'; 
          });
        });

        dropzoneInstance.on('addedfile', function (file) {
          // Eliminar cualquier archivo previamente cargado
          if (dropzoneInstance.files.length > 1) {
            dropzoneInstance.files.forEach((f, index) => {
              if (index < dropzoneInstance.files.length - 1) {
                dropzoneInstance.removeFile(f); 
              }
            });
          }
          const errorMark = file.previewElement?.querySelector('.dz-error-mark');
          const successMark = file.previewElement?.querySelector('.dz-success-mark');
        
          if (errorMark) errorMark.remove();
          if (successMark) successMark.remove();
          
          const allowedExtensions = ['png', 'jpg', 'jpeg', 'webp'];
          const fileExtension = file.name.split('.').pop()?.toLowerCase();
          if (!allowedExtensions.includes(fileExtension ?? '')) {
            dropzoneInstance.removeFile(file);
            (document.getElementById('dropzone') as any).componentRef.showAlert('error', 'Formato no permitido. Solo se aceptan imágenes PNG, JPG, JPEG y WEBP.');
            return;
          }

          if (file.size > (dropzoneInstance.options.maxFilesize ?? 0) * 1024 * 1024) {
            dropzoneInstance.removeFile(file);
            (document.getElementById('dropzone') as any).componentRef.showAlert('error', 'El tamaño máximo permitido es de 2MB.');
            return;
          }
  
          // Leer el archivo y actualizar la imagen actual
          const reader = new FileReader();
          reader.onload = (e: any) => {
            (document.getElementById('dropzone') as any).componentRef.photoFrontPageUrl = e.target.result;
            (document.getElementById('dropzone') as any).componentRef.isDefaultPhoto = false;
          };
          reader.readAsDataURL(file);
        });

        this.on('sending', function (file, xhr, formData) {
          const idUsuario = (document.getElementById('dropzone') as any).componentRef.tokenService.getUserId();
          if (!idUsuario) {
            console.error('El idUsuario no está disponible en el token.');
            return;
          }
  
          formData.append('idUsuario', idUsuario);
          formData.append('fotoPortada', file, file.name);
        });
  
        dropzoneInstance.on('success', (file, response) => {
          const componentRef = (document.getElementById('dropzone') as any).componentRef;
          componentRef.isUpdateFrontPageInProgress = false;

          const responseObject = typeof response === 'string' ? JSON.parse(response) : response;

          (document.getElementById('dropzone') as any).componentRef.photoUrl = responseObject.data.fotoPortada;

          (document.getElementById('dropzone') as any).componentRef.success.emit('Actualizado correctamente. Recarga para ver cambios.');

          (document.getElementById('dropzone') as any).componentRef.close.emit();
        });
        
        this.on('error', function (file, errorMessage) {
          (document.getElementById('dropzone') as any).componentRef.isUpdateFrontPageInProgress = false;
        });
      }
    });
  
    (document.getElementById('dropzone') as any).componentRef = this;
  } 
  
  updateFrontPage(): void {
    if (!this.dropzoneInstance) return;

    const files = this.dropzoneInstance.files;

    if (this.isDefaultPhoto && files.length === 0) {
      const idUsuario = this.tokenService.getUserId();

      if (!idUsuario) {
        console.error('El ID de usuario es nulo o indefinido.');
        return;
      }
      const formData = new FormData();
      formData.append('idUsuario', idUsuario);
      fetch(this.photoFrontPageUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'defaul_cover.webp', { type: 'image/webp' });
          formData.append('fotoPortada', file);
          this.isUpdateFrontPageInProgress = true; 
          this.profileService.updateProfile(formData).subscribe({
            next: (res) => {
              this.isUpdateFrontPageInProgress = false;
              (document.getElementById('dropzone') as any).componentRef.success.emit('Actualizado correctamente. Recarga para ver cambios.');
              this.close.emit();
            },
            error: (err) => {
              this.isUpdateFrontPageInProgress = false;
              this.showAlert('error', 'Error al actualizar la imagen de portada.');
              console.error(err);
            }
          });
        });
      return;
    }

    if (files.length > 0) {
      const file = files[0];

      if (file.size > (2 * 1024 * 1024)) {
        this.showAlert('error', 'La imagen supera los 2MB permitidos.');
        return;
      }
      this.isUpdateFrontPageInProgress = true;
      this.dropzoneInstance.processQueue();
    } else {
      this.showAlert('warning', 'No se realizaron cambios en la imagen de portada.');
    }
  }
  deletePhoto(): void {
    this.photoFrontPageUrl = '/assets/img/profile/default_cover.webp';
    this.isDefaultPhoto = true;
  }
  closeModal(): void {
    this.close.emit();
  }
}
