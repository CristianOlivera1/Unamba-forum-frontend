import { AfterViewInit, ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CareerService } from '../../core/services/career/career.service';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../core/services/profile/profile.service';
import { TokenService } from '../../core/services/oauth/token.service';
import { NotesService } from '../../core/services/career/notes.service';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { TimeUtils } from '../../Utils/TimeElapsed';
import { RolService } from '../../core/services/rol/rol.service';
import { PublicationWithFilesCareerComponent } from './components/publication-with-files-career/publication-with-files-career.component';
import { PublicationWithoutFilesCareerComponent } from './components/publication-without-files-career/publication-without-files-career.component';
import { FilterCareerComponent } from './components/filter-career/filter-career.component';
import { LoginModalComponent } from '../home/components/login-modal/login-modal.component';
import { CompleteInfoRegisterGoogleComponent } from '../oauth/complete-info-register-google/complete-info-register-google.component';
import { ModalInfoCompleteService } from '../../core/services/modal/modalCompleteInfo.service';
import { ModalLoginService } from '../../core/services/modal/modalLogin.service';

@Component({
  selector: 'app-career',
  standalone: true,
  imports: [CommonModule, FooterComponent, CommonModule, FormsModule, HeaderComponent, PublicationWithFilesCareerComponent, PublicationWithoutFilesCareerComponent, FilterCareerComponent, LoginModalComponent, CompleteInfoRegisterGoogleComponent],
  templateUrl: './career.component.html',
  styleUrl: './career.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class CareerComponent implements OnInit, AfterViewInit {
  career: any;
  notes: any[] = [];
  selectedCategory: string = '';
  careerId: string = '';

  @ViewChild('canvasContainer') canvasContainer!: ElementRef;
  @ViewChild('miCanvas') canvas!: ElementRef<HTMLCanvasElement>;

  ctx!: CanvasRenderingContext2D;
  scale = 1;
  translateX = 0;
  translateY = 0;
  isPanning = false;
  startPan = { x: 0, y: 0 };
  animationFrameId: number | null = null;
  isDraggingNote: boolean = false;
  draggedNoteIndex: number | null = null;
  lastClickTime = 0;
  nombre: string = '';
  message: string = '';
  selectedColor: string | null = null;
  userProfile: any = null;
  currentUserId: string | null = null;
  isCurrentUserAdmin: boolean = false;
  showEmojiPicker: boolean = false;

  isNoteFormVisible: boolean = true;
  screenSize: string = '';

  isLoginModalVisible$: any;
  isInfoCompleteModalVisible$: any;

  isPublishing: boolean = false;
  alert: { type: 'success' | 'error' | 'warning'; message: string } | null = null;

  constructor(
    private route: ActivatedRoute, private tokenService: TokenService, private notesService: NotesService,
    private careerService: CareerService, private profileService: ProfileService, @Inject(PLATFORM_ID) private platformId: Object, private rolService: RolService, private cdr: ChangeDetectorRef, private modalService: ModalLoginService, private modalInfoCompleteService: ModalInfoCompleteService
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.currentUserId = this.tokenService.getUserId();
    this.isLoginModalVisible$ = this.modalService.isLoginModalVisible$;
    this.isInfoCompleteModalVisible$ = this.modalInfoCompleteService.isInfoCompleteModalVisible$;

    if (this.currentUserId) {
      this.checkIfCurrentUserIsAdmin();
    }

    this.cdr.detectChanges();
    if (!isPlatformBrowser(this.platformId)) {
      if (typeof window === 'undefined') {

      }
      return;
    } else {
      import('emoji-picker-element');
      const width = window.innerWidth;
      this.screenSize = width < 640 ? 'sm' : 'lg';
      if (this.screenSize === 'sm') {
        this.isNoteFormVisible = false;
      }
    }

    this.route.params.subscribe(params => {
      const newidCareer = params['idCarrera'];
      if (newidCareer === 'all') {
        // Cargar todas las notas
        this.loadAllNotes();
        this.loadUserProfile();
        this.initCanvas();
        this.setupEventListeners();
        this.setupZoomControls();
        this.renderCanvas();
        this.career = {
          nombre: 'Todas las Carreras',
          descripcion: 'Explora las notas de todas las carreras disponibles.',
          logo: '/assets/img/career/todascarreras.webp'
        };
        this.careerId = 'all';
        this.cdr.detectChanges();

      } else if (newidCareer && newidCareer !== this.careerId) {
        this.careerId = newidCareer;
        this.loadUserProfile();
        this.initCanvas();
        this.setupEventListeners();
        this.setupZoomControls();
        this.loadNotesByCareer();
        this.renderCanvas();
        this.loadCareerById();
        this.cdr.detectChanges();
      }
    });
  }
  handleTextareaClick(): void {
    if (!this.tokenService.isLoggedIn()) {
      this.modalService.showLoginModal();
      return;
    }
  }
  loadAllNotes(): void {
    this.notesService.getAllNotes().subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          this.notes = response.data.map((note: any) => ({
            ...note,
            x: Math.random() * this.canvas.nativeElement.width / this.scale,
            y: Math.random() * this.canvas.nativeElement.height / this.scale,
          }));
          this.renderCanvas();
        }
      },
      error: (err) => {
        console.error('Error al cargar todas las notas:', err);
      },
    });
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  loadNotesByCareer(): void {
    const idCarrera = this.route.snapshot.paramMap.get('idCarrera');
    if (idCarrera) {
      this.notesService.getNotesByCareer(idCarrera).subscribe({
        next: (response: any) => {
          if (response.type === 'success') {
            this.notes = response.data.map((note: any) => ({
              ...note,
              x: Math.random() * this.canvas.nativeElement.width / this.scale,
              y: Math.random() * this.canvas.nativeElement.height / this.scale,
            }));
            this.renderCanvas();
          }
        },
        error: (err) => {
          console.error('Error al cargar las notas:', err);
        },
      });
    }
  }

  loadCareerById(): void {
    const idCarrera = this.route.snapshot.paramMap.get('idCarrera');
    if (idCarrera) {
      this.careerService.getCareerById(idCarrera).subscribe({
        next: (response: any) => {
          this.career = response.data;
        },
        error: (err) => {
          console.error('Error al obtener la carrera:', err);
        },
      });
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    const width = event.target.innerWidth;
    this.screenSize = width < 640 ? 'sm' : 'lg';
    if (this.screenSize === 'sm') {
      this.isNoteFormVisible = false;
    }
  }

  toggleNoteForm(): void {
    this.isNoteFormVisible = !this.isNoteFormVisible;
  }

  setupZoomControls() {
    const zoomInBtn = document.getElementById('zoom-in-btn')!;
    const zoomOutBtn = document.getElementById('zoom-out-btn')!;
    const zoomIndicator = document.getElementById('zoom-indicator')!;

    zoomInBtn.addEventListener('click', () => {
      const zoomIntensity = 0.1;
      const newScale = this.scale * (1 + zoomIntensity);

      if (newScale <= 5) {
        this.scale = newScale;
        this.renderCanvas();
        zoomIndicator.textContent = `${Math.round(this.scale * 100)}%`;
      }
    });

    zoomOutBtn.addEventListener('click', () => {
      const zoomIntensity = 0.1;
      const newScale = this.scale / (1 + zoomIntensity);

      if (newScale >= 0.1) {
        this.scale = newScale;
        this.renderCanvas();
        zoomIndicator.textContent = `${Math.round(this.scale * 100)}%`;
      }
    });
  }
  renderCanvas() {
    // if (!isPlatformBrowser(this.platformId)) {
    //   // Si no estamos en el navegador, no ejecutar la animación
    //   return;
    // }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.animationFrameId = requestAnimationFrame(() => {
      const canvas = this.canvas.nativeElement;
      const ctx = this.ctx;

      // Limpiar canvas
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Aplicar transformaciones
      ctx.scale(this.scale, this.scale);
      ctx.translate(this.translateX, this.translateY);

      this.drawGrid();

      // Dibujar notas
      this.notes.forEach((note, index) => {
        this.drawNote(note, index === this.draggedNoteIndex);
      });
    });
  }
  initCanvas() {
    // if (!isPlatformBrowser(this.platformId)) {
    //   console.warn('El canvas no se inicializa porque no estamos en el navegador.');
    //   return;
    // }

    if (!this.canvas) {
      console.error('El elemento canvas no está disponible.');
      return;
    }
    const canvas = this.canvas.nativeElement;
    const container = canvas.parentElement;

    if (container) {
      // Ajusta el tamaño del canvas al tamaño del contenedor
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.resizeCanvas();
  }

  drawNote(note: any, isDragging: boolean) {
    const ctx = this.ctx;

    if (this.isRecent(note)) {
      ctx.shadowColor = 'rgba(255, 204, 21, 0.8)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;
    } else if (isDragging) {
      ctx.shadowColor = 'rgba(255, 204, 21, 0.8)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;
    } else {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    // Extraer colores del gradiente
    const gradientColors = this.extractGradientColors(note.radialGradient);
    const gradient = ctx.createRadialGradient(
      note.x + 75, note.y + 50, 10,
      note.x + 75, note.y + 50, 75
    );

    gradient.addColorStop(0, gradientColors[0]);
    gradient.addColorStop(1, gradientColors[1]);

    ctx.fillStyle = gradient;
    ctx.strokeStyle = isDragging ? 'rgba(250, 204, 21, 0.8)' : 'rgba(210, 170, 24, 0.8)';
    ctx.lineWidth = 1 / this.scale;
    ctx.beginPath();
    ctx.roundRect(note.x, note.y, 150, 100, [1]);
    ctx.fill();
    ctx.stroke();

    // Limpiar la sombra antes de dibujar la imagen del avatar y el texto
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Avatar
    const avatarImg = new Image();
    avatarImg.src = note.avatar;
    avatarImg.onload = () => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(note.x + 20, note.y + 20, 15, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImg, note.x + 5, note.y + 5, 30, 30);
      ctx.restore();
    };

    // Nombre completo
    ctx.fillStyle = '#1f2937';
    ctx.font = `bold ${16 / this.scale}px Caveat`;
    ctx.fillText(note.nombreCompleto, note.x + 40, note.y + 15);

    const lineSpacing = 15 / this.scale;
    ctx.fillStyle = '#6b7280';
    ctx.font = `semibold ${14 / this.scale}px Caveat`;
    ctx.fillText(note.nombreCarrera, note.x + 40, note.y + 15 + lineSpacing);

    // Contenido
    ctx.fillStyle = '#1f2937';
    ctx.font = `semibold ${16 / this.scale}px Caveat`;
    const lines = this.wrapText(note.contenido, 130, 12 / this.scale);
    lines.forEach((line, i) => {
      ctx.fillText(line, note.x + 10, note.y + 50 + (i * (12 / this.scale)));
    });

    // Botón de eliminar (solo para administradores)
    if (this.isCurrentUserAdmin) {
      const deleteIcon = new Image();
      deleteIcon.src = '/assets/icons/publication/delete.svg';
      deleteIcon.onload = () => {
        ctx.drawImage(deleteIcon, note.x + 120, note.y + 10, 10, 10);
      };

    }

    // Tooltip "Nuevo" para notas recientes
    if (this.isRecent(note)) {
      ctx.fillStyle = 'rgba(255, 204, 21, 0.9)';
      ctx.font = `${12 / this.scale}px Deezer`;
      ctx.beginPath();
      ctx.roundRect(note.x, note.y - 20, 40, 15, 1);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillText('NUEVO', note.x + 5, note.y - 8);
    }

    // Fecha de publicación
    ctx.fillStyle = '#1f2937';
    ctx.font = `italic semibold ${16 / this.scale}px Caveat`;
    ctx.fillText(TimeUtils.getTimeElapsed(note.fechaPublicacion), note.x + 10, note.y + 90);
  }

  checkIfCurrentUserIsAdmin(): void {
    this.rolService.getRolByUserId(this.currentUserId!).subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          this.isCurrentUserAdmin = response.data.tipo === 'ADMINISTRADOR';
        }
      },
      error: (error) => {
        console.error('Error al verificar el rol del usuario actual:', error);
      }
    });
  }

  deleteNoteById(idNota: string) {
    this.notesService.deleteNoteById(idNota).subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          console.log('Nota eliminada correctamente.');
          this.loadNotesByCareer();
        }
      },
      error: (err) => {
        console.error('Error al eliminar la nota:', err);
      },
    });
  }

  extractGradientColors(gradient: string): [string, string] {
    const regex = /rgba?\([^)]+\)/g;
    const matches = gradient.match(regex);

    if (matches && matches.length >= 2) {
      return [matches[0], matches[1]];
    }

    // Valor por defecto si no se pueden extraer los colores
    return ['#ffffff', '#cccccc'];
  }

  addNote(message: string) {
    if (!this.tokenService.isLoggedIn()) {
      this.modalService.showLoginModal();
      return;
    }

    // Validar que el mensaje no esté vacío
    if (!message || message.trim() === '') {
      this.showToast('Por favor, completa el contenido de la nota.', 'warning');
      return;
    }

    const idUsuario = this.tokenService.getUserId();
    if (!idUsuario) {
      console.error('idUsuario is null');
      return;
    }

    // Verificar si el perfil del usuario tiene idCarrera para que pueda agregar una nota
    this.profileService.getProfileByUserId(idUsuario).subscribe({
      next: (response: any) => {
        if (response.type === 'success' && !response.data.idCarrera) {
          this.modalInfoCompleteService.showInfoCompleteModal();
          return;
        }

        const { backgroundColor, radialGradient } = this.getSelectedColors();
        this.isPublishing = true;

        const formData = new FormData();
        formData.append('idUsuario', idUsuario);
        formData.append('contenido', message);
        formData.append('backgroundColor', backgroundColor);
        formData.append('radialGradient', radialGradient);

        this.notesService.createNote(formData).subscribe({
          next: (response: any) => {
            if (response.type === 'success') {
              this.message = "";
              this.isPublishing = false;
              // Verificar si el usuario está en su propia carrera o en otra
              if (this.careerId === 'all' || this.careerId === this.userProfile.idCarrera) {
                this.showToast('Nota creada con éxito.', 'success');
              } else {
                this.showToast('Nota creada con éxito, para visualizarlo ve a la opcion de tu carrera.', 'success');
              }

              if (this.careerId === 'all') {
                this.loadAllNotes();
              } else {
                this.loadNotesByCareer();
              }
            }
          },
          error: (err) => {
            console.error('Error al insertar la nota:', err);
            this.showToast('Error al insertar la nota.', 'error');
            this.isPublishing = false;

          },
        });
      },
      error: (err) => {
        console.error('Error al verificar el perfil del usuario:', err);
      },
    });
  }

  showToast(message: string, type: 'success' | 'error' | 'warning'): void {
    this.alert = { type, message };
    setTimeout(() => {
      this.alert = null;
    }, 5000);
  }

  generateRadialGradient(color: string): string {
    // Convertimos el color base a formato rgba
    const rgbaColor = this.hexToRgba(color, 1);
    const darkerColor = this.adjustBrightness(color, -20);

    return `radial-gradient(${rgbaColor} 0%, ${darkerColor} 100%)`;
  }

  hexToRgba(hex: string, alpha: number): string {
    // Convertimos un color hexadecimal a formato rgba
    const bigint = parseInt(hex.substring(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  adjustBrightness(hex: string, amount: number): string {
    // Ajustamos el brillo del color para generar un tono más oscuro
    const bigint = parseInt(hex.substring(1), 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;

    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));

    return `rgb(${r}, ${g}, ${b})`;
  }

  getSelectedColors(): { backgroundColor: string; radialGradient: string } {
    if (this.selectedColor) {
      // Si el usuario seleccionó un color desde el color-picker
      return {
        backgroundColor: this.selectedColor,
        radialGradient: this.generateRadialGradient(this.selectedColor),
      };
    }

    // Si el usuario seleccionó un color predeterminado
    const colors: Record<string, { backgroundColor: string; radialGradient: string }> = {
      green: {
        backgroundColor: '#a8d5ba',
        radialGradient: 'radial-gradient(rgba(168, 213, 186, 1) 0%, rgb(137, 179, 154) 100%)',
      },
      yellow: {
        backgroundColor: '#fff3b0',
        radialGradient: 'radial-gradient(rgba(255, 243, 176, 1) 0%, rgb(223, 212, 150) 100%)',
      },
      orange: {
        backgroundColor: '#ffc078',
        radialGradient: 'radial-gradient(rgba(255, 192, 120, 1) 0%, rgb(238, 179, 112) 100%)',
      },
      red: {
        backgroundColor: '#ff6b6b',
        radialGradient: 'radial-gradient(rgba(255, 107, 107, 1) 0%, rgb(252, 103, 103) 100%)',
      },
    };
    return colors[this.selectedCategory] || colors["yellow"];
  }

  toggleEmojiPicker(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any): void {
    const emoji = event.detail.unicode;
    this.message += emoji;
    this.showEmojiPicker = false;
  }

  loadUserProfile(): void {
    const userId = this.tokenService.getUserId();
    if (userId) {
      this.profileService.getUserProfileHover(userId).subscribe(
        (response) => {
          if (response.type === 'success') {
            this.userProfile = response.data;
          } else {
            console.error('Error al obtener el perfil:', response.listMessage);
          }
        },
        (error) => {
          console.error('Error en la solicitud del perfil:', error);
        }
      );
    }
  }


  @HostListener('window:resize')
  resizeCanvas() {
    this.canvas.nativeElement.width = this.canvasContainer.nativeElement.clientWidth;
    this.canvas.nativeElement.height = this.canvasContainer.nativeElement.clientHeight;
    this.renderCanvas();
  }

  setupEventListeners() {
    const canvasEl = this.canvas.nativeElement;

    // Zoom con rueda del mouse
    canvasEl.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.handleZoom(e);
    }, { passive: false });

    // Inicio de arrastre
    canvasEl.addEventListener('mousedown', (e) => {
      const now = Date.now();
      const isDoubleClick = now - this.lastClickTime < 300;
      this.lastClickTime = now;

      const mousePos = this.getMousePos(e);
      const noteIndex = this.findNoteAtPosition(mousePos.x, mousePos.y);

      if (noteIndex !== null) {
        this.isDraggingNote = true;
        this.draggedNoteIndex = noteIndex;
        canvasEl.style.cursor = 'grabbing'; // Cambiar el cursor al iniciar el arrastre
      } else {
        this.isPanning = true;
        this.startPan = { x: e.clientX, y: e.clientY };
        canvasEl.style.cursor = 'grabbing'; // Cambiar el cursor al iniciar el paneo
      }
    });

    // Movimiento durante arrastre
    canvasEl.addEventListener('mousemove', (e) => {
      const mousePos = this.getMousePos(e);
      const noteIndex = this.findNoteAtPosition(mousePos.x, mousePos.y);

      if (this.isPanning) {
        const dx = (e.clientX - this.startPan.x) / this.scale;
        const dy = (e.clientY - this.startPan.y) / this.scale;
        this.translateX += dx;
        this.translateY += dy;
        this.startPan = { x: e.clientX, y: e.clientY };
        this.renderCanvas();
      } else if (this.isDraggingNote && this.draggedNoteIndex !== null) {
        this.notes[this.draggedNoteIndex].x = mousePos.x - 75;
        this.notes[this.draggedNoteIndex].y = mousePos.y - 50;
        this.renderCanvas();
      } else if (noteIndex !== null) {
        canvasEl.style.cursor = 'pointer';
      } else {
        canvasEl.style.cursor = 'default';
      }
    });

    // Fin de arrastre
    canvasEl.addEventListener('mouseup', () => this.endDrag());
    canvasEl.addEventListener('mouseleave', () => this.endDrag());

    // Manejar clics en el canvas
    canvasEl.addEventListener('click', (e: MouseEvent) => {
      const mousePos = this.getMousePos(e);

      for (const note of this.notes) {
        if (
          mousePos.x >= note.x + 120 &&
          mousePos.x <= note.x + 140 &&
          mousePos.y >= note.y + 10 &&
          mousePos.y <= note.y + 30
        ) {
          this.deleteNoteById(note.idNota);
          break;
        }
      }
    });
  }

  endDrag() {
    this.isPanning = false;
    this.isDraggingNote = false;
    this.draggedNoteIndex = null;
    this.canvas.nativeElement.style.cursor = 'default';
  }
  handleZoom(e: WheelEvent) {
    const zoomIntensity = 0.1;
    const mousePos = this.getMousePos(e);
    const worldPos = this.screenToWorld(mousePos.x, mousePos.y);

    // Aplicar zoom
    const newScale = e.deltaY < 0 ?
      this.scale * (1 + zoomIntensity) :
      this.scale / (1 + zoomIntensity);

    // Limitar zoom
    this.scale = Math.min(Math.max(newScale, 0.1), 5);

    // Ajustar la traslación para hacer zoom hacia el puntero
    this.translateX = mousePos.x / this.scale - worldPos.x;
    this.translateY = mousePos.y / this.scale - worldPos.y;

    // Actualizar el indicador de zoom
    const zoomIndicator = document.getElementById('zoom-indicator');
    if (zoomIndicator) {
      zoomIndicator.textContent = `${Math.round(this.scale * 100)}%`;
    }

    this.renderCanvas();
  }

  getMousePos(e: MouseEvent) {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / this.scale - this.translateX,
      y: (e.clientY - rect.top) / this.scale - this.translateY,
    };
  }

  screenToWorld(screenX: number, screenY: number) {
    return {
      x: screenX / this.scale - this.translateX,
      y: screenY / this.scale - this.translateY
    };
  }

  findNoteAtPosition(x: number, y: number): number | null {
    for (let i = this.notes.length - 1; i >= 0; i--) {
      const note = this.notes[i];
      if (x >= note.x && x <= note.x + 150 && y >= note.y && y <= note.y + 100) {
        return i;
      }
    }
    return null;
  }

  drawGrid() {
    const ctx = this.ctx;
    const canvas = this.canvas.nativeElement;
    const gridSize = 50;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1 / this.scale;

    // Calcular área visible
    const visibleLeft = -this.translateX;
    const visibleTop = -this.translateY;
    const visibleRight = visibleLeft + canvas.width / this.scale;
    const visibleBottom = visibleTop + canvas.height / this.scale;

    // Dibujar líneas verticales
    const startX = Math.floor(visibleLeft / gridSize) * gridSize;
    for (let x = startX; x < visibleRight; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, visibleTop);
      ctx.lineTo(x, visibleBottom);
      ctx.stroke();
    }

    // Dibujar líneas horizontales
    const startY = Math.floor(visibleTop / gridSize) * gridSize;
    for (let y = startY; y < visibleBottom; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(visibleLeft, y);
      ctx.lineTo(visibleRight, y);
      ctx.stroke();
    }
  }

  isRecent(note: any): boolean {
    const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000;
    const noteDate = new Date(note.fechaPublicacion).getTime();
    const currentDate = Date.now();
    return currentDate - noteDate <= oneWeekInMilliseconds;
  }

  wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    const ctx = this.ctx;
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine + (currentLine ? ' ' : '') + words[i];

      // Ajuste del ancho dinámicamente según el nivel de zoom
      const width = ctx.measureText(testLine).width * (this.scale < 1 ? (fontSize / this.scale) : 1);

      if (width < maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = words[i];
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

}


