import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { Plan } from '../../../types';
import { Plus, Trash2 } from 'lucide-react';

interface PlanFormModalProps {
  plan: Plan;
  onClose: () => void;
  onSave: (plan: Plan) => void;
}

export function PlanFormModal({ plan, onClose, onSave }: PlanFormModalProps) {
  const [formData, setFormData] = useState<Plan>(plan);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) : value,
    });
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index].text = value;
    setFormData({ ...formData, features: newFeatures });
  };
  
  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, { text: '', included: true }]});
  };

  const removeFeature = (index: number) => {
    setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Edit ${plan.name} Plan`}
      footer={
        <div className="space-x-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Plan Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="price">Price</Label>
            <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} />
          </div>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Input id="description" name="description" value={formData.description} onChange={handleChange} />
        </div>
        <div>
          <Label>Features</Label>
          <div className="space-y-2">
            {formData.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={feature.text}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  className="flex-grow"
                />
                <Button type="button" variant="ghost" size="sm" onClick={() => removeFeature(index)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" variant="secondary" size="sm" className="mt-2" onClick={addFeature}>
            <Plus className="h-4 w-4 mr-2" />
            Add Feature
          </Button>
        </div>
      </form>
    </Modal>
  );
}
