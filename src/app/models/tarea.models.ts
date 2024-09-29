// el modelo que se conecta con service

export interface Task {
  title: string;  // Titulo de la tarea
  dueDate: string; // Fecha limite de la tarea
  completed: boolean; // Estado de la tarea (completada o no)
  assignedPeople: { 
    fullName: string; // Nombre completo de la persona asignada
    age: number; // Edad de la persona asignada
    skills: string[]; // Habilidades de la persona asignada
  }[];  
}
