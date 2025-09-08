import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Building2, Check } from 'lucide-react';
import { plans } from '../../lib/plans';
import { cn } from '../../lib/utils';
import { formatCurrency } from '../../lib/utils';

const registerSchema = z.object({
  name: z.string().min(2, 'Business name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  planId: z.string().min(1, 'Please select a plan'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { register: registerVendor, loading } = useAuth();
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
        planId: 'trial',
    }
  });

  const selectedPlanId = watch('planId');

  const onSubmit = (data: RegisterFormValues) => {
    registerVendor({ name: data.name, email: data.email, password: data.password }, data.planId);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <Building2 className="mx-auto h-12 w-12 text-blue-600" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Create a Vendor Account</h1>
          <p className="mt-2 text-sm text-gray-600">Start managing your business with FluxPOS.</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="name">Business Name</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register('password')} />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Choose your plan</Label>
            <input type="hidden" {...register('planId')} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {plans.map(plan => (
                    <div
                        key={plan.id}
                        onClick={() => setValue('planId', plan.id, { shouldValidate: true })}
                        className={cn(
                            'p-4 border rounded-lg cursor-pointer transition-all',
                            selectedPlanId === plan.id ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300'
                        )}
                    >
                        <h4 className="font-semibold">{plan.name}</h4>
                        <p className="text-xl font-bold">{formatCurrency(plan.price)}</p>
                        <p className="text-xs text-gray-500">{plan.duration}</p>
                    </div>
                ))}
            </div>
            {errors.planId && <p className="text-red-500 text-xs mt-1">{errors.planId.message}</p>}
          </div>

          <Button 
            size="lg" 
            className="w-full" 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Create Account'}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                    Sign In
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
}
