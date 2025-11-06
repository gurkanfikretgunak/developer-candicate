'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getDepartmentNames } from '@/config/assessment';
import type { Step1Data } from '@/lib/types';

interface Step1GeneralProps {
  data: Step1Data;
  onChange: (data: Step1Data) => void;
  department: string;
  onDepartmentChange: (dept: string) => void;
}

export function Step1General({ data, onChange, department, onDepartmentChange }: Step1GeneralProps) {
  const departments = getDepartmentNames();

  const handleChange = (field: keyof Step1Data, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Ad Soyad *</Label>
          <Input
            id="name"
            placeholder="Ahmet Yılmaz"
            value={data.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-posta *</Label>
          <Input
            id="email"
            type="email"
            placeholder="ahmet@example.com"
            value={data.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="position">Pozisyon *</Label>
          <Input
            id="position"
            placeholder="Senior Backend Developer"
            value={data.position || ''}
            onChange={(e) => handleChange('position', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Departman *</Label>
          <Select value={department} onValueChange={onDepartmentChange} required>
            <SelectTrigger id="department">
              <SelectValue placeholder="Departman seçin" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notlar</Label>
        <Textarea
          id="notes"
          placeholder="İK notları, genel izlenimler..."
          value={data.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={4}
        />
      </div>
    </div>
  );
}

