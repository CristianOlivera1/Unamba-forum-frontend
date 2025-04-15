export class TimeUtils {
  static getTimeElapsed(fechaRegistro: string): string {
    const now = new Date();
    const publishedDate = new Date(fechaRegistro);
    const diffMs = now.getTime() - publishedDate.getTime();

    const diffSeconds = Math.floor(diffMs / 1000);
    if (diffSeconds < 60) {
      return `${diffSeconds}s`; // Segundos
    }

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 60) {
      return `${diffMinutes}m`; // Minutos
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours}h`; // Horas
    }

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`; // Días
  }
}
