import { Injectable } from '@angular/core';
import { Task } from '../models/tarea.models';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  public tasks: Task[] = [];
  public tasksSubject = new BehaviorSubject<Task[]>(this.tasks);
  
  tasks$ = this.tasksSubject.asObservable();

  addTask(title: string, dueDate: string, completed: boolean = false): void {
    const newTask: Task = { title, dueDate, completed, assignedPeople: [] }; 
    this.tasks.push(newTask);
    this.tasksSubject.next(this.tasks);
  }

  completeTask(index: number): void {
    this.tasks[index].completed = true;
    this.tasksSubject.next(this.tasks);
  }

  filterTasks(status: 'all' | 'completed' | 'pending'): Task[] {
    if (status === 'all') {
      return this.tasks;
    }
    return this.tasks.filter(task => task.completed === (status === 'completed'));
  }

  assignPersonToTask(taskIndex: number, person: { fullName: string; age: number; skills: string[] }): void {
    this.tasks[taskIndex].assignedPeople.push(person);
    this.tasksSubject.next(this.tasks);
  }

  removePersonFromTask(taskIndex: number, personIndex: number): void {
    this.tasks[taskIndex].assignedPeople.splice(personIndex, 1);
    this.tasksSubject.next(this.tasks);
  }

  addSkillToPerson(taskIndex: number, personIndex: number, skill: string): void {
    this.tasks[taskIndex].assignedPeople[personIndex].skills.push(skill);
    this.tasksSubject.next(this.tasks);
  }

  removeSkillFromPerson(taskIndex: number, personIndex: number, skillIndex: number): void {
    this.tasks[taskIndex].assignedPeople[personIndex].skills.splice(skillIndex, 1);
    this.tasksSubject.next(this.tasks);
  }
  updateTask(index: number, updatedTask: Task): void {
    this.tasks[index] = updatedTask; 
    this.tasksSubject.next(this.tasks);
  }
  
}
