import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { PublicationService } from '../../core/services/publication/publication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../core/services/category/category.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { QuillModule } from 'ngx-quill';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { ProfileService } from '../../core/services/profile/profile.service';

@Component({
  selector: 'app-edit-publication',
  imports: [HeaderComponent, CommonModule, QuillModule, FormsModule, FooterComponent],
  templateUrl: './edit-publication.component.html',
  styleUrl: './edit-publication.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class EditPublicationComponent implements OnInit {
  publication: any = {
    idPublicacion: '',
    idCategoria: '',
    titulo: '',
    contenido: '',
    archivos: []
  };
  categories: any[] = [];
  isUpdating: boolean = false;
  mediaFiles: File[] = [];
  previewUrls: string[] = [];
  isDragging: boolean = false;
  isChecked = false;
  randomImage: string | null = null;
  apiCat = environment.apiCat;
  originalPublication: any = {};
  alert: { type: 'success' | 'error' | 'warning'; message: string } | null = null;

  characterCount = signal<number>(0);

  showEmojiPicker: boolean = false;
    userDetails: any = null; 
  constructor(
    private route: ActivatedRoute,
    private publicationService: PublicationService,
    private categoryService: CategoryService,
    private router: Router, private http: HttpClient,@Inject(PLATFORM_ID) private platformId: Object,private profileService:ProfileService
  ) { }

  ngOnInit() {
    this.loadCategories();
    this.loadPublicationById();
  }

  loadCategories(): void {
    this.categoryService.getAllCategory().subscribe({
      next: (response) => {
        this.categories = response.data;
      },
      error: (err) => {
        console.error('Error al obtener las categorías:', err);
      }
    });
  }

  loadPublicationById(): void {
    const idPublicacion = this.route.snapshot.paramMap.get('idPublicacion');
    if (idPublicacion) {
      this.publicationService.getPublicationById(idPublicacion).subscribe({
        next: (response: any) => {
          this.publication = response.data;

          this.originalPublication = JSON.parse(JSON.stringify(response.data));
          // Precargar archivos existentes
          this.previewUrls = this.publication.archivos.map((archivo: any) => archivo.rutaArchivo);
        },
        error: (err) => {
          console.error('Error al obtener la publicación:', err);
        }
      });
    } else {
      console.error('idPublicacion es null');
    }

    
        if (isPlatformBrowser(this.platformId)) {
          import('emoji-picker-element');
        }
  }

  updateCharacterCount(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.characterCount.set(inputElement.value.length);
    }
  }
  toggleEmojiPicker(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any): void {
    const emoji = event.detail.unicode;
    this.publication.contenido += emoji;
    this.showEmojiPicker = false;
  }

  handleFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const fileArray = Array.from(input.files);
      const validFiles = fileArray.filter(file => {
        if (file.size > 2 * 1024 * 1024) {
          alert(`El archivo ${file.name} excede el tamaño máximo de 2 MB.`);
          return false;
        }
        return file.type.includes('image') || file.type.includes('video');
      });

      if (this.mediaFiles.length + validFiles.length > 3) {
        alert('Solo puedes subir un máximo de 3 archivos.');
        return;
      }

      this.addMedia(validFiles);
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
        this.showToast('Por favor, suelta archivos de imagen o video válidos.','warning');
        return;
      }
      // Agregar los archivos a mediaFiles
      this.mediaFiles = [...this.mediaFiles, ...validFiles];

      // Generar URLs de vista previa
      const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
      this.previewUrls = [...this.previewUrls, ...newPreviewUrls];

      this.showToast(`${validFiles.length} archivo(s) cargado(s) con éxito.`, "success");
    }
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
  addMedia(newMedia: File[]): void {
    this.mediaFiles = [...this.mediaFiles, ...newMedia];

    const newPreviewUrls = newMedia.map(file => URL.createObjectURL(file));
    this.previewUrls = [...this.previewUrls, ...newPreviewUrls];
  }

  removeMedia(index: number): void {

    if (index < this.mediaFiles.length) {
      this.mediaFiles.splice(index, 1);
    } else {
      const existingFileIndex = index - this.mediaFiles.length;
      this.publication.archivos.splice(existingFileIndex, 1);
    }

    this.previewUrls.splice(index, 1);
  }
  updatePublication(): void {
    // Verificar si no hay cambios en los campos
    const noChanges =
      this.publication.titulo === this.originalPublication.titulo &&
      this.publication.idCategoria === this.originalPublication.idCategoria &&
      this.publication.contenido === this.originalPublication.contenido &&
      this.previewUrls.length === this.originalPublication.archivos.length &&
      this.previewUrls.every((url, index) =>
        url === this.originalPublication.archivos[index].rutaArchivo
      ) &&
      this.mediaFiles.length === 0 &&
      !this.randomImage;

    if (noChanges) {
      this.showToast('No se realizaron cambios en la publicación.', 'warning');
      return;
    }

    // Validar que el total de archivos no exceda el límite de 3
    if (this.previewUrls.length > 3) {
      this.showToast('Solo puedes subir un máximo de 3 archivos.', 'warning');
      return;
    }

    this.isUpdating = true;

    const formData = new FormData();
    formData.append('idPublicacion', this.publication.idPublicacion);
    formData.append('idCategoria', this.publication.idCategoria);
    formData.append('titulo', this.publication.titulo);
    formData.append('contenido', this.publication.contenido);

    // Convertir las URLs de los archivos existentes en objetos File
    const filePromises = this.publication.archivos.map((archivo: any) =>
      this.urlToFile(archivo.rutaArchivo, archivo.tipo)
    );

    // Esperar a que todos los archivos se conviertan y luego enviarlos
    Promise.all(filePromises).then((existingFiles) => {
      // Agregar los archivos existentes convertidos
      existingFiles.forEach((file) => {
        formData.append('archivos', file);
      });

      // Agregar los nuevos archivos cargados
      this.mediaFiles.forEach((file) => {
        formData.append('archivos', file);
      });

      // Agregar la imagen aleatoria como URL si existe
      if (this.randomImage) {
        formData.append('archivos', this.randomImage);
      }

      // Enviar la solicitud al backend
      this.publicationService.updatePublication(formData).subscribe({
        next: (response) => {
          this.showToast('Publicación actualizada con éxito.', 'success');
          this.router.navigate(['/publication', this.publication.idPublicacion]);
          this.isUpdating = false;
        },
        error: (err) => {
          console.error('Error al actualizar la publicación:', err);
          this.showToast('Error al actualizar la publicación.', 'error');
          this.isUpdating = false;
        }
      });
    });
  }

  // Método para convertir una URL en un objeto File
  urlToFile(url: string, tipo: string): Promise<File> {
    return fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const fileName = url.split('/').pop() || 'archivo';
        return new File([blob], fileName, { type: tipo });
      });
  }

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

          this.previewUrls = this.previewUrls.filter(url => url !== this.randomImage);

          // Actualizar la URL de la imagen aleatoria
          this.randomImage = randomImgUrl;
          this.previewUrls.push(randomImgUrl);

        }
      },
      error: (err) => {
        console.error('Error al obtener la imagen aleatoria:', err);
        this.showToast('Error al obtener la imagen aleatoria.', 'error');
      }
    });
  }

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

  showToast(message: string, type: 'success' | 'error' | 'warning'): void {
    this.alert = { type, message };

    setTimeout(() => {
      this.alert = null;
    }, 5000);

  }
}
