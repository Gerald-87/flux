import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { ShieldCheck } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login, loading } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'vendor@flux.com',
      password: 'password123'
    }
  });

  const onSubmit = (data: LoginFormValues) => {
    login(data);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <ShieldCheck className="mx-auto h-12 w-12 text-blue-600" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Sign in to FluxPOS</h1>
          <p className="mt-2 text-sm text-gray-600">Enter your credentials to access your account.</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          <Button 
            size="lg" 
            className="w-full" 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                    Register as a Vendor
                </Link>
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-xs text-gray-600 space-y-1 text-left">
                <p className="font-bold text-gray-700 text-center mb-2">Demo Credentials:</p>
                <p><b>Superadmin:</b> admin@flux.com / password123</p>
                <p><b>Vendor:</b> vendor@flux.com / password123</p>
                <p><b>Cashier:</b> cashier@flux.com / password123</p>
            </div>
        </div>
      </div>
    </div>
  );
}
