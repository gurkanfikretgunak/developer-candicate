'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { 
  getOrganizationDepartmentCriteriaById,
  upsertOrganizationDepartmentCriteria,
  deleteOrganizationDepartmentCriteria 
} from '@/lib/actions';
import { getDepartmentById, getDepartmentNames } from '@/config/assessment';
import { Loader2, Plus, Trash2, RotateCcw } from 'lucide-react';
import type { Category } from '@/lib/types';

export function DepartmentCriteriaManager() {
  const t = useTranslations('settings.departmentCriteria');
  const tActions = useTranslations('settings.actions');
  const tMessages = useTranslations('settings.messages');
  const tDept = useTranslations('departments');
  const [selectedDept, setSelectedDept] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCustomized, setIsCustomized] = useState(false);

  const departments = getDepartmentNames();

  useEffect(() => {
    if (selectedDept) {
      loadDepartmentCriteria(selectedDept);
    }
  }, [selectedDept]);

  const loadDepartmentCriteria = async (deptId: string) => {
    setIsLoading(true);
    try {
      // Try to load custom criteria first
      const { data: customCriteria } = await getOrganizationDepartmentCriteriaById(deptId);
      
      if (customCriteria) {
        setCategories(customCriteria.criteria.categories);
        setIsCustomized(true);
      } else {
        // Load default criteria
        const defaultDept = getDepartmentById(deptId);
        if (defaultDept) {
          setCategories(defaultDept.categories);
          setIsCustomized(false);
        }
      }
    } catch (error) {
      console.error('Error loading criteria:', error);
      toast.error(tMessages('error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedDept) return;

    setIsSaving(true);
    try {
      const dept = departments.find(d => d.id === selectedDept);
      if (!dept) return;

      // Get department name (translate if nameKey exists, otherwise use name)
      const deptName = dept.nameKey 
        ? tDept(dept.nameKey.split('.')[1] as any)
        : dept.name || '';

      const result = await upsertOrganizationDepartmentCriteria({
        department_id: selectedDept,
        department_name: deptName,
        categories,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t('saveSuccess'));
        setIsCustomized(true);
      }
    } catch (error) {
      console.error('Error saving criteria:', error);
      toast.error(tMessages('error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!selectedDept) return;
    
    if (!confirm(t('resetConfirm'))) return;

    setIsLoading(true);
    try {
      // Delete custom criteria
      await deleteOrganizationDepartmentCriteria(selectedDept);
      
      // Load default criteria
      const defaultDept = getDepartmentById(selectedDept);
      if (defaultDept) {
        setCategories(defaultDept.categories);
        setIsCustomized(false);
        toast.success(t('deleteSuccess'));
      }
    } catch (error) {
      console.error('Error resetting criteria:', error);
      toast.error(tMessages('error'));
    } finally {
      setIsLoading(false);
    }
  };

  const addCategory = () => {
    setCategories([...categories, { name: '', criteria: [] }]);
  };

  const deleteCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const updateCategoryName = (index: number, name: string) => {
    const updated = [...categories];
    updated[index].name = name;
    setCategories(updated);
  };

  const addCriterion = (categoryIndex: number) => {
    const updated = [...categories];
    updated[categoryIndex].criteria.push('');
    setCategories(updated);
  };

  const updateCriterion = (categoryIndex: number, criterionIndex: number, value: string) => {
    const updated = [...categories];
    updated[categoryIndex].criteria[criterionIndex] = value;
    setCategories(updated);
  };

  const deleteCriterion = (categoryIndex: number, criterionIndex: number) => {
    const updated = [...categories];
    updated[categoryIndex].criteria = updated[categoryIndex].criteria.filter((_, i) => i !== criterionIndex);
    setCategories(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-gray-900">{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Department Selector */}
        <div className="space-y-2">
          <Label>{t('selectDepartment')}</Label>
          <Select value={selectedDept} onValueChange={setSelectedDept}>
            <SelectTrigger>
              <SelectValue placeholder={t('selectDepartment')} />
            </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.nameKey ? tDept(dept.nameKey.split('.')[1] as any) : dept.name}
              </SelectItem>
            ))}
          </SelectContent>
          </Select>
        </div>

        {/* Criteria Editor */}
        {selectedDept && !isLoading && (
          <>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {isCustomized ? t('customize') : t('useDefault')}
              </div>
              {isCustomized && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  {t('reset')}
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {categories.map((category, catIndex) => (
                <Card key={catIndex} className="border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Input
                        value={category.name}
                        onChange={(e) => updateCategoryName(catIndex, e.target.value)}
                        placeholder={t('categoryName')}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCategory(catIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {category.criteria.map((criterion, critIndex) => (
                      <div key={critIndex} className="flex items-center gap-2">
                        <Input
                          value={criterion}
                          onChange={(e) => updateCriterion(catIndex, critIndex, e.target.value)}
                          placeholder={t('criterionPlaceholder')}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCriterion(catIndex, critIndex)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addCriterion(catIndex)}
                      className="w-full gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      {t('addCriterion')}
                    </Button>
                  </CardContent>
                </Card>
              ))}

              <Button
                variant="outline"
                onClick={addCategory}
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                {t('addCategory')}
              </Button>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {tActions('save')}
              </Button>
            </div>
          </>
        )}

        {selectedDept && isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}

        {!selectedDept && (
          <div className="text-center py-8 text-gray-600">
            {t('noDepartmentSelected')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

