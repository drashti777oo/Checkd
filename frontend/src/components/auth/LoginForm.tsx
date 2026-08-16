import React from 'react';
import { Button } from '../ui/button';

export const LoginForm: React.FC = () => {
  return (
    <form className="flex flex-col gap-4 max-w-sm w-full p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-slate-800">Sign In</h2>
      <input type="email" placeholder="Email address" className="p-2 border rounded-md" />
      <input type="password" placeholder="Password" className="p-2 border rounded-md" />
      <Button type="button">Sign In</Button>
    </form>
  );
};
