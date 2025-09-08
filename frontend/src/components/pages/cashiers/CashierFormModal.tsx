import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { User, WorkSchedule } from '../../../types';

interface CashierFormModalProps {
  cashier: User | null;
  onClose: () => void;
  onSave: (cashier: User) => void;
}

export function CashierFormModal({ cashier, onClose, onSave }: CashierFormModalProps) {
  const [formData, setFormData] = useState<Partial<User>>(
    cashier || {
      name: '',
      email: '',
      isActive: true,
      workSchedule: {
        checkInTime: '09:00',
        checkOutTime: '17:00',
        workDays: [1, 2, 3, 4, 5], // Monday to Friday
        timezone: 'UTC'
      }
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleScheduleChange = (field: keyof WorkSchedule, value: any) => {
    setFormData({
      ...formData,
      workSchedule: {
        ...formData.workSchedule!,
        [field]: value
      }
    });
  };

  const handleWorkDayToggle = (day: number) => {
    const currentDays = formData.workSchedule?.workDays || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort();
    
    handleScheduleChange('workDays', newDays);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as User);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={cashier ? 'Edit Cashier' : 'Add New Cashier'}
      footer={
        <div className="space-x-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Cashier</Button>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" placeholder={cashier ? 'Leave blank to keep unchanged' : ''} />
        </div>
        
        {/* Work Schedule Section */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-4">Work Schedule</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="checkInTime">Check-in Time</Label>
              <Input 
                id="checkInTime" 
                type="time" 
                value={formData.workSchedule?.checkInTime || '09:00'}
                onChange={(e) => handleScheduleChange('checkInTime', e.target.value)}
                required 
              />
            </div>
            <div>
              <Label htmlFor="checkOutTime">Check-out Time</Label>
              <Input 
                id="checkOutTime" 
                type="time" 
                value={formData.workSchedule?.checkOutTime || '17:00'}
                onChange={(e) => handleScheduleChange('checkOutTime', e.target.value)}
                required 
              />
            </div>
          </div>
          
          <div>
            <Label>Working Days</Label>
            <div className="grid grid-cols-7 gap-2 mt-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <label key={index} className="flex flex-col items-center">
                  <input
                    type="checkbox"
                    checked={formData.workSchedule?.workDays?.includes(index) || false}
                    onChange={() => handleWorkDayToggle(index)}
                    className="h-4 w-4 rounded"
                  />
                  <span className="text-xs mt-1">{day}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
            <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 rounded" />
            <Label htmlFor="isActive">Cashier is Active</Label>
        </div>
      </form>
    </Modal>
  );
}
