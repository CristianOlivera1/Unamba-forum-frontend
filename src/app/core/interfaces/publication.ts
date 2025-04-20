
export interface Publication {
    idPublicacion: string;
    idUsuario: string;
    titulo: string;
    contenido: string;
    archivos: { tipo: string; rutaArchivo: string }[]; // Archivos (imágenes/videos)
    avatar: string; // URL del avatar del usuario
    nombreCompleto: string; // Nombre completo del usuario
    nombreCarrera: string; // Carrera del usuario
    nombreCategoria: string; // Categoría de la publicación
    fechaRegistro: string; // Fecha de registro de la publicación
    isReactionModalVisible: boolean;
    reactionUsers: any[];
    reactionType: string;
    hoverPosition: { top: number; left: number };
    tipoRol?: string;
    isCommentModalVisible?: boolean;
    commentHoverPosition?: { top: number; left: number };
    usersComment?: any[];
    totalComentarios?: number; // Added this property

  }