import departmentsData from './departments.json';
import type { DepartmentsConfig, Department } from '@/lib/types';

export const departments = (departmentsData as DepartmentsConfig).departments;

export function getDepartmentById(id: string): Department | undefined {
  return departments.find(dept => dept.id === id);
}

export function getDepartmentNames(): { id: string; name?: string; nameKey?: string }[] {
  return departments.map(dept => ({ 
    id: dept.id, 
    name: dept.name,
    nameKey: dept.nameKey 
  }));
}

export const sectors = [
  'Teknoloji',
  'Finans',
  'E-ticaret',
  'Sağlık',
  'Eğitim',
  'Telekomünikasyon',
  'Üretim',
  'Danışmanlık',
  'Diğer'
];

export const levelOptions = [
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid' },
  { value: 'senior', label: 'Senior' },
  { value: 'not-fit', label: 'Uygun Değil' }
];

