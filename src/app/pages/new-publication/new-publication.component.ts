import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, OnInit, Output, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HttpClient } from '@angular/common/http';
import { CategoryService } from '../../core/services/category/category.service';
import { TokenService } from '../../core/services/oauth/token.service';
import { PublicationService } from '../../core/services/publication/publication.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-new-publication',
  imports: [CommonModule, FormsModule, QuillModule, HeaderComponent, FooterComponent
  ],
  templateUrl: './new-publication.component.html',
  styleUrl: './new-publication.component.css'
})
export class NewPublicationComponent implements OnInit {
  category: any[] = [];
  newPublicationData: any = {
    idUsuario: null,
    idCategoria: '',
    titulo: '',
    contenido: '',
    archivos: []
  };

  isChecked = false;
  selectedCategory = signal<string>('');
  title = signal<string>('');
  characterCount = signal<number>(0);
  mediaFiles: File[] = [];
  isDragging = false;
  previewUrls: string[] = [];
  randomImage: string | null = null;
  apiCat = environment.apiCat;

  alert: { type: 'success' | 'error' | 'warning'; message: string } | null = null;
  updateCharacterCount(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.characterCount.set(inputElement.value.length);
    }
  }

  constructor(private http: HttpClient, private categoryService: CategoryService,
    private tokenService: TokenService, private publicationService: PublicationService, private router: Router) { }

  ngOnInit(): void {
    this.getCategories();
    this.newPublicationData.idUsuario = this.tokenService.getUserId();
  }

  getCategories(): void {
    this.categoryService.getAllCategory().subscribe({
      next: (response) => {
        this.category = response.data;
      },
      error: (err) => {
        console.error('Error al obtener las categorías:', err);
      }
    });
  }

  handleFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const fileArray = Array.from(input.files);
      const validFiles = fileArray.filter(file => {
        if (file.size > 2 * 1024 * 1024) {
          this.showToast(`El archivo ${file.name} excede el tamaño máximo de 2 MB.`, 'warning');
          return false;
        }
        return file.type.includes('image') || file.type.includes('video');
      });

      if (this.mediaFiles.length + validFiles.length > 4) {
        this.showToast('Solo puedes subir un máximo de 4 archivos.', 'warning');
        return;
      }

      this.addMedia(validFiles);
      this.showToast(`${validFiles.length} archivo(s) cargado(s) con éxito.`, 'success');
    }
  }

  handleDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  handleDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  handleDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;

    if (event.dataTransfer?.files) {
      const fileArray = Array.from(event.dataTransfer.files);
      const validFiles = fileArray.filter(file =>
        file.type.includes('image') || file.type.includes('video')
      );

      if (validFiles.length === 0) {
        this.showToast('Por favor, suelta archivos de imagen o video válidos.', 'warning');
        return;
      }

      // Agregar los archivos a mediaFiles
      this.mediaFiles = [...this.mediaFiles, ...validFiles];

      // Generar URLs de vista previa
      const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
      this.previewUrls = [...this.previewUrls, ...newPreviewUrls];

      this.showToast(`${validFiles.length} archivo(s) cargado(s) con éxito.`, 'success');
    }
  }

  addMedia(newMedia: File[]): void {
    this.mediaFiles = [...this.mediaFiles, ...newMedia];

    const newPreviewUrls = newMedia.map(file => URL.createObjectURL(file));
    this.previewUrls = [...this.previewUrls, ...newPreviewUrls];
  }

  removeMedia(index: number): void {
    this.mediaFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }

  insertPublication(): void {
    console.log(this.newPublicationData.contenido);
    if (!this.newPublicationData.idCategoria || !this.newPublicationData.titulo || !this.newPublicationData.contenido) {
      this.showToast('Por favor, completa todos los campos obligatorios.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('idUsuario', this.newPublicationData.idUsuario);
    formData.append('idCategoria', this.newPublicationData.idCategoria);
    formData.append('titulo', this.newPublicationData.titulo);
    formData.append('contenido', this.newPublicationData.contenido);

    if (this.randomImage) {
      formData.append('archivos', this.randomImage);
    }

    this.mediaFiles.forEach((file, index) => {
      formData.append(`archivos`, file);
    });

    this.publicationService.insertPublication(formData).subscribe({
      next: (response) => {
        this.showToast('Publicación creada con éxito.', 'success');
        this.router.navigate(['/publication', response.data.idPublicacion]);

      },
      error: (err) => {
        console.error('Error al insertar la publicación:', err);
        this.showToast('Error al crear la publicación.', 'error');
      }
    });
  }

  resetForm(): void {
    this.newPublicationData = {
      idUsuario: this.tokenService.getUserId(),
      idCategoria: '',
      titulo: '',
      contenido: '',
      archivos: []
    };
    this.mediaFiles = [];
    this.randomImage = null;
    this.isChecked = false;
  }

  showToast(message: string, type: 'success' | 'error' | 'warning'): void {
    this.alert = { type, message };

    setTimeout(() => {
      this.alert = null;
    }, 5000);

  }

  /*markdown */
  editorConfig = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ header: 1 }, { header: 2 }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean'],
      ['code-block'],
    ],
    clipboard: {
      matchVisual: false,
    },
  };

  toggleButton(event: any): void {
    this.isChecked = event.target.checked;

    if (this.isChecked) {
      this.addRandomImage()
    } else {
      this.previewUrls = this.previewUrls.filter(file => file !== this.randomImage);
      this.randomImage = null;
    }
  }

  addRandomImage(): void {
    this.http.get<any[]>(this.apiCat).subscribe({
      next: (response) => {
        if (response.length > 0) {
          const randomImgUrl = response[0].url;

          // Eliminar cualquier imagen aleatoria existente
          this.previewUrls = this.previewUrls.filter(url => url !== this.randomImage);

          // Actualizar la URL de la imagen aleatoria
          this.randomImage = randomImgUrl;
          this.previewUrls.push(randomImgUrl);

          this.showToast('Imagen aleatoria añadida con éxito.', 'success');
        }
      },
      error: (err) => {
        console.error('Error al obtener la imagen aleatoria:', err);
        this.showToast('Error al obtener la imagen aleatoria.', 'error');
      }
    });
  }

}