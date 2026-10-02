import React from 'react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-md bg-surface shadow-lg rounded-2xl p-6 sm:p-8 md:p-10 border border-black/5">
        
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-textMain tracking-tight">
            Welcome Back
          </h1>
          <p className="mt-1.5 sm:mt-2 text-sm text-muted">
            Enter your credentials to access the campus portal.
          </p>
        </div>

        {/* Login Form */}
        <form className="space-y-6">
          <div className="space-y-4">
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-semibold text-textMain mb-1.5"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="student@campus.edu"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 sm:px-4 sm:py-3 text-base sm:text-sm text-textMain outline-none transition-all placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label 
                  htmlFor="password" 
                  className="block text-sm font-semibold text-textMain"
                >
                  Password
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs font-semibold text-secondary hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Enter your password"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 sm:px-4 sm:py-3 text-base sm:text-sm text-textMain outline-none transition-all placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-primary py-2.5 sm:py-3 text-base sm:text-sm font-bold text-white hover:bg-primary-hover transition-colors shadow-md shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
          >
            Sign In
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 sm:mt-8 text-center text-sm text-muted">
          Don't have an account?{' '}
          <Link 
            href="/signup" 
            className="font-semibold text-secondary hover:underline"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
