import departmentsData from './departments.json';
import type { DepartmentsConfig, Department, Category } from '@/lib/types';

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

// Get department criteria with organization customization support
export function getDepartmentCriteria(
  departmentId: string,
  orgCustomCategories?: Category[]
): { name?: string; nameKey?: string; categories: Category[] } | null {
  const defaultDept = getDepartmentById(departmentId);
  
  if (!defaultDept) {
    return null;
  }

  // If organization has custom categories, use them
  if (orgCustomCategories && orgCustomCategories.length > 0) {
    return {
      name: defaultDept.name,
      nameKey: defaultDept.nameKey,
      categories: orgCustomCategories,
    };
  }

  // Otherwise use default
  return {
    name: defaultDept.name,
    nameKey: defaultDept.nameKey,
    categories: defaultDept.categories,
  };
}

export const sectors = [
  'technology',
  'finance',
  'ecommerce',
  'healthcare',
  'education',
  'telecommunications',
  'manufacturing',
  'consulting',
  'other'
];

export const levelOptions = [
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid' },
  { value: 'senior', label: 'Senior' },
  { value: 'not-fit', label: 'Uygun Değil' }
];

