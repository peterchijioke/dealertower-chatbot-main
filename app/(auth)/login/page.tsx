'use client';
import { redirect, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {  clearState, loginUser } from '@/lib/auth';
import {  useSessionStore } from '@/stores/session-store';
import { getCurrentUserServer } from '@/lib/auth-server';
import {  useReCaptcha } from "next-recaptcha-v3";
import { Input } from '@/components/ui/input';

// Zod validation schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Page() {

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [turnstileKey, setTurnstileKey] = useState(0); // Force re-render key
  
  // Get the site key

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  
  const { session, initializeSession } = useSessionStore();
  // Reset Turnstile function
  const resetTurnstile = () => {
    setCaptchaToken('');
    setTurnstileKey(prev => prev + 1); // Force re-render
  };

  const { executeRecaptcha } = useReCaptcha();

  const onSubmit = async (data: LoginFormData) => {
    // const token = await executeRecaptcha('login');
      
    //   if (!token) {
    //     toast.error('Security verification failed. Please try again.');
    //     setIsLoading(false);
    //     return;
    //   }
  grecaptcha.ready(() => {
      grecaptcha.execute('6Lcf-bErAAAAADjwHuudhTaO41KP1StXRqloadYI', {action: 'login'}).then(async (token: string) => {
      setIsLoading(true);
if ( !token ) {
       toast.error('Security verification failed. Please try again.');
       setIsLoading(false);
       return;
      }

      try {
        const result = await loginUser(data.username, data.password);
        if (result.success) {
          const userProfile = await getCurrentUserServer();
          if (userProfile?.data) {
            initializeSession(userProfile.data);
            router.push('/chat'); // Use router.push instead of redirect
          }
        } else {
          toast.error(result.message || 'Login failed');
        }
      } catch (error) {
        console.error('Login submission error:', error);
        toast.error('An error occurred during login. Please try again.');
      } finally {
        setIsLoading(false);
      }
    });
  })
  };

  useEffect(()=>{
    clearState()
  },[])

  return (
    // <ReCAPTCHAv3Provider>

     

    <div className="flex flex-col gap-8 animate-fade-in">
      
      <div className="flex flex-col gap-2 text-center animate-slide-down">
        <h1 className="text-3xl font-semibold text-sidebar">Sign In</h1>
        <span className='flex items-center justify-center gap-3'>
          <span className='h-px w-6 bg-gray-400 animate-expand-width' />
          <p className="text-sm text-gray-400">
            Sign In with username
          </p>
          <span className='h-px w-6 bg-gray-400 animate-expand-width' />
        </span>
      </div>
      
      <div className="animate-slide-up mt-3">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 animate-slide-in-left">
            <label
              htmlFor="username"
              className="text-sm font-medium text-sidebar"
            >
              Username *
            </label>
            <Input
              {...register('username')}
              autoCapitalize='none'
              autoComplete='username'
              autoFocus
              id="username"
              className="h-12 bg-gray-100 border-none text-gray-900 outline-none placeholder:text-gray-500 focus-visible:ring-transparent focus-visible:focus:ring-transparent rounded-md transition-all duration-200 hover:bg-gray-50 shadow px-3"
              type="text"
              placeholder=""
            />
            {errors.username && (
              <p className="text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2 animate-slide-in-right">
            <label
              htmlFor="password"
              className="text-sm font-medium text-sidebar"
            >
              Password *
            </label>
            <div className="relative">
              <Input
                {...register('password')}
                autoCorrect='off'
                spellCheck='false'
                id="password"
               className="h-12 bg-gray-100 border-none text-gray-900 outline-none placeholder:text-gray-500 shadow focus-visible:ring-transparent focus-visible:focus:ring-transparent rounded-md transition-all duration-200 hover:bg-gray-50 px-3"
                type={showPassword ? 'text' : 'password'}
                placeholder=""
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="animate-slide-in-up  mt-8">
            <button
              type="submit"
              disabled={isLoading }
              className="relative h-12 bg-sidebar hover:bg-sidebar text-white font-medium w-full rounded-md mt-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
              {isLoading && (
                <span className="animate-spin absolute right-4">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}