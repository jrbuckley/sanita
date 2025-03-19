'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/auth'

export default function SettingsPage() {
  const { session } = useAuthStore()
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    workoutReminders: false,
    mealReminders: false,
  })
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showProgress: true,
    showWorkouts: true,
    showRecipes: true,
  })

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handlePrivacyChange = (key: keyof typeof privacy, value: any) => {
    setPrivacy((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
          <p className="text-gray-600">
            You need to be signed in to access settings.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      {/* Profile Settings */}
      <div className="bg-base-100 rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text">Display Name</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full max-w-md"
              placeholder="Your display name"
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text">Bio</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full max-w-md"
              placeholder="Tell us about yourself"
              rows={3}
            ></textarea>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-base-100 rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
        <div className="space-y-4">
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Email Notifications</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={notifications.email}
                onChange={() => handleNotificationChange('email')}
              />
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Push Notifications</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={notifications.push}
                onChange={() => handleNotificationChange('push')}
              />
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Workout Reminders</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={notifications.workoutReminders}
                onChange={() => handleNotificationChange('workoutReminders')}
              />
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Meal Reminders</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={notifications.mealReminders}
                onChange={() => handleNotificationChange('mealReminders')}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-base-100 rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Privacy Settings</h2>
        <div className="space-y-4">
          <div className="form-control w-full max-w-md">
            <label className="label">
              <span className="label-text">Profile Visibility</span>
            </label>
            <select
              className="select select-bordered"
              value={privacy.profileVisibility}
              onChange={(e) =>
                handlePrivacyChange('profileVisibility', e.target.value)
              }
            >
              <option value="public">Public</option>
              <option value="followers">Followers Only</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Show Progress Updates</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={privacy.showProgress}
                onChange={() =>
                  handlePrivacyChange('showProgress', !privacy.showProgress)
                }
              />
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Show Workout History</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={privacy.showWorkouts}
                onChange={() =>
                  handlePrivacyChange('showWorkouts', !privacy.showWorkouts)
                }
              />
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Show Recipe Contributions</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={privacy.showRecipes}
                onChange={() =>
                  handlePrivacyChange('showRecipes', !privacy.showRecipes)
                }
              />
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="btn btn-primary">Save Changes</button>
      </div>
    </div>
  )
} 