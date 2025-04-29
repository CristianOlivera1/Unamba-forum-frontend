export interface Publication {
    idPublicacion: string;
    idUsuario: string;
    titulo: string;
    contenido: string;
    archivos: { tipo: string; rutaArchivo: string }[]; 
    avatar: string; 
    nombreCompleto: string;
    nombreCarrera: string;
    nombreCategoria: string; 
    fechaRegistro: string; 
    isReactionModalVisible: boolean;
    reactionUsers: any[];
    reactionType: string;
    hoverPosition: { top: number; left: number };
    tipoRol?: string;
    reacciones: any[]; 
    isCommentModalVisible?: boolean;
    commentHoverPosition?: { top: number; left: number };
    usersComment?: any[];
    totalComentarios?: number; 
      isDropdownVisible?: boolean;
  }