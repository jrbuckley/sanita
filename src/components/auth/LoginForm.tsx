'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/auth'

export default function LoginForm() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, isLoading } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await login(identifier, password)
    } catch (err) {
      setError('Invalid credentials. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="max-w-md w-full space-y-8 p-8 bg-base-100 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-base-content">
            Sign in to Sanita
          </h2>
          <p className="mt-2 text-center text-sm text-base-content/60">
            Connect with the health and fitness community
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="identifier" className="sr-only">
                Handle or Email
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                className="input input-bordered w-full rounded-t-md rounded-b-none"
                placeholder="Handle or Email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input input-bordered w-full rounded-t-none"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        <div className="text-center">
          <p className="text-sm">
            Don't have an account?{' '}
            <a
              href="https://bsky.app/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:text-primary-600"
            >
              Sign up on Bluesky
            </a>
          </p>
        </div>
      </div>
    </div>
  )
} 