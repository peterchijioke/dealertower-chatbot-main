import Form from 'next/form';
import { useState } from 'react';

import { Input } from './ui/input';
import { Label } from './ui/label';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

export function AuthForm({
  action,
  children,
  defaultEmail = '',
}: {
  action: NonNullable<
    string | ((formData: FormData) => void | Promise<void>) | undefined
  >;
  children: React.ReactNode;
  defaultEmail?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 animate-slide-in-left">
        <Label
          htmlFor="email"
          className="text-sm font-medium text-gray-700"
        >
          Email/Username
        </Label>

        <Input
          id="email"
          name="email"
          className="h-12 bg-gray-100 border-0 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-md transition-all duration-200 hover:bg-gray-50"
          type="email"
          placeholder=""
          autoComplete="email"
          required
          defaultValue={defaultEmail}
        />
      </div>

      <div className="flex flex-col gap-2 animate-slide-in-right">
        <Label
          htmlFor="password"
          className="text-sm font-medium text-gray-700"
        >
          Password
        </Label>

        <div className="relative">
          <Input
            id="password"
            name="password"
            className="h-12 bg-gray-100 border-0 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-md pr-10 transition-all duration-200 hover:bg-gray-50"
            type={showPassword ? 'text' : 'password'}
            placeholder=""
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:scale-110"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
          </button>
        </div>
      </div>

      <div className="animate-slide-in-up">
        {children}
      </div>
    </Form>
  );
}
