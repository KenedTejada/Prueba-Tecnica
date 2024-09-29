import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { TaskService } from '../../services/general.service';
import { Task } from '../../models/tarea.models';

@Component({
  selector: 'app-task-manager',
  templateUrl: './tareas-manager.component.html',
  styleUrls: ['./tareas-manager.component.scss']
})
export class TaskManagerComponent implements OnInit {
  public taskForm: FormGroup;
  public filteredTasks: Task[] = []; // Inicializa un Array para almacenar tareas filtradas
  public filterOption: 'all' | 'completed' | 'pending' = 'all'; // Opción de filtro
  public isTaskSaved = false; // Variable para controlar la visibilidad del filtro y la tabla

  constructor(public fb: FormBuilder, public taskService: TaskService) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      dueDate: ['', Validators.required],
      completed: [false], // Checkbox para indicar si la tarea está completada
      assignedPeople: this.fb.array([]) // Array de personas asignadas a la tarea
    });
  }

  ngOnInit(): void {
    this.taskService.tasks$.subscribe(tasks => {
      this.filteredTasks = tasks; // Muestra todas las tareas inicialmente
      this.filterTasks(this.filterOption); // Aplica el filtro al iniciar
    });
  }

  public get assignedPeople(): FormArray {
    return this.taskForm.get('assignedPeople') as FormArray;
  }

  public getSkills(personIndex: number): FormArray {
    return this.assignedPeople.at(personIndex).get('skills') as FormArray;
  }

  public addPerson(): void {
    this.assignedPeople.push(this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(5)]],
      age: ['', [Validators.required, Validators.min(18)]],
      skills: this.fb.array(['']) // Inicia con una habilidad vacía
    }));
  }

  public addSkill(personIndex: number): void {
    const skills = this.getSkills(personIndex);
    skills.push(this.fb.control('', Validators.required));
  }

  public removePerson(index: number): void {
    this.assignedPeople.removeAt(index);
  }

  public removeSkill(personIndex: number, skillIndex: number): void {
    const skills = this.getSkills(personIndex);
    skills.removeAt(skillIndex);
  }

  private checkForDuplicateNames(): boolean {
    const names = this.assignedPeople.controls.map(person => person.get('fullName')?.value);
    return new Set(names).size !== names.length; // Verifica si hay nombres duplicados
  }

  // Método para verificar si una tarea ya existe
  public taskExists(taskTitle: string): boolean {
    return this.filteredTasks.some(task => task.title === taskTitle);
  }

  // Método para guardar la tarea al hacer clic en el botón guardar
  public submit(): void {
    const newTaskTitle = this.taskForm.value.title;

    // Verificar si la tarea ya existe
    if (this.taskExists(newTaskTitle)) {
      alert('Ya existe una tarea con este título.');
      return; // Evita guardar la tarea si ya existe
    }

    if (this.checkForDuplicateNames()) {
      alert('No se pueden repetir los nombres entre las personas asignadas a la misma tarea.');
      return; // Evita guardar la tarea si hay nombres duplicados
    }

    if (this.taskForm.valid) {
      const newTaskDueDate = this.taskForm.value.dueDate;
      const isCompleted = this.taskForm.value.completed; // Recoge el valor del checkbox

      // Añade nueva tarea al servicio, incluyendo si está completada o no
      this.taskService.addTask(newTaskTitle, newTaskDueDate, isCompleted);

      const taskIndex = this.taskService.tasks.length - 1;

      // Asignar personas a la nueva tarea
      this.assignedPeople.controls.forEach((person) => {
        const personValue = person.value;
        this.taskService.assignPersonToTask(taskIndex, personValue);
      });

      this.taskForm.reset({ completed: false }); // Resetea el formulario y mantiene el checkbox en falso
      
      // Mostrar la sección de filtro y tabla después de guardar
      this.isTaskSaved = true; 
      this.filterTasks(this.filterOption); // Refiltra después de añadir la tarea
    }
  }

  // Método para filtrar las tareas según la opción seleccionada
  public filterTasks(filter: 'all' | 'completed' | 'pending'): void {
    this.filterOption = filter; // Actualiza la opción de filtro
    this.filteredTasks = this.taskService.filterTasks(filter); 
  }

  // Método para alternar el estado de completado de una tarea
  public toggleTaskCompletion(taskIndex: number): void {
    const task = this.filteredTasks[taskIndex];
    task.completed = !task.completed; 
    this.taskService.updateTask(taskIndex, task); // Actualiza la tarea en el servicio
    this.filterTasks(this.filterOption); // Aplica el filtro actual
  }
}
