import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { TokenService } from '../../../../../core/services/oauth/token.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
interface Notification {
  idNotificacion: string;
  mensaje: string;
  tipo: string;
  idRecurso: string | null;
  leido: boolean;
  idActor: string;
  nombreActor: string;
  avatar: string;
  fechaRegistro: string;
}
@Component({
  selector: 'app-notification',
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];
  page = 0;
  size = 5;
  loading = false;
  hasMore = true;
  userId: string | null = null;
    showNotifications = false;

  constructor(
    private notificationService: NotificationService,
    private tokenService: TokenService, private router: Router,
    private eRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.userId = this.tokenService.getUserId();
    if (this.userId) {
      this.loadNotifications();
    }
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.leido).length;
  }

  loadNotifications(): void {
    if (!this.userId || this.loading || !this.hasMore) return;
    this.loading = true;
    this.notificationService.getNotifications(this.userId, this.page, this.size).subscribe({
      next: (res) => {
        const data = res.data || [];
        this.notifications = [...this.notifications, ...data];
        this.hasMore = data.length === this.size;
        this.page++;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  markAsRead(notification: Notification): void {
    if (!notification.leido) {
      this.notificationService.markAsRead(notification.idNotificacion).subscribe(() => {
        notification.leido = true;
      });
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => {
      if (!n.leido) this.markAsRead(n);
    });
  }

// Cierra el dropdown al hacer click fuera
  @HostListener('document:click', ['$event'])
  clickout(event: MouseEvent) {
    if (this.showNotifications && !this.eRef.nativeElement.contains(event.target)) {
      this.showNotifications = false;
    }
  }

  // Maneja el click en la notificación y redirige según el tipo
  handleNotificationClick(n: Notification) {
    this.markAsRead(n);
    this.showNotifications = false;
    if (n.tipo === 'SEGUIMIENTO' || n.tipo === 'BIENVENIDA') {
      this.router.navigate(['/profile', n.idActor]);
    } else if (n.tipo === 'REACCION' || n.tipo === 'COMENTARIO' || n.tipo === 'PUBLICACION') {
      if (n.idRecurso) this.router.navigate(['/publication', n.idRecurso]);
    } else if (n.tipo === 'NOTA') {
      if (n.idRecurso) this.router.navigate(['/career', n.idRecurso]);
    }
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }
}
