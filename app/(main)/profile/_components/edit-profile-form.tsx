'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Field, FieldGroup, FieldLabel, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface EditProfileFormProps {
  session: {
    id: string
    email: string
    fullName: string | null
    avatarUrl: string | null
    role: string
  }
}

export function EditProfileForm({ session }: EditProfileFormProps) {
  const router = useRouter()
  const [fullName, setFullName] = useState(session.fullName || '')
  const [avatarUrl, setAvatarUrl] = useState(session.avatarUrl || '')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (fullName && (fullName.length < 2 || fullName.length > 100)) {
      newErrors.fullName = 'Full name must be 2-100 characters'
    }

    if (avatarUrl && !isValidUrl(avatarUrl)) {
      newErrors.avatarUrl = 'Please enter a valid URL'
    }

    if (username && (username.length < 3 || username.length > 20)) {
      newErrors.username = 'Username must be 3-20 characters'
    }

    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = 'Username can only contain alphanumeric characters and underscores'
    }

    if (bio && bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setLoading(true)
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName || undefined,
          avatarUrl: avatarUrl || undefined,
          username: username || undefined,
          bio: bio || undefined,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        toast.error(error.error || 'Failed to update profile')
        return
      }

      toast.success('Profile updated successfully')
      router.refresh()
    } catch (err) {
      toast.error('An error occurred while updating your profile')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFullName(session.fullName || '')
    setAvatarUrl(session.avatarUrl || '')
    setUsername('')
    setBio('')
    setErrors({})
  }

  return (
    <div className="max-w-2xl rounded-lg border bg-card p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FieldGroup>
          {/* Email (read-only) */}
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              value={session.email}
              disabled
              className="opacity-50"
            />
            <p className="text-xs text-muted-foreground mt-1">Cannot be changed</p>
          </Field>

          {/* Role (read-only) */}
          <Field>
            <FieldLabel htmlFor="role">Role</FieldLabel>
            <Input
              id="role"
              value={session.role}
              disabled
              className="opacity-50"
            />
            <p className="text-xs text-muted-foreground mt-1">Contact admin to change</p>
          </Field>
        </FieldGroup>

        <FieldGroup>
          {/* Full Name */}
          <Field data-invalid={errors.fullName ? 'true' : undefined}>
            <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              aria-invalid={!!errors.fullName}
            />
            {errors.fullName && <FieldError>{errors.fullName}</FieldError>}
          </Field>

          {/* Avatar URL */}
          <Field data-invalid={errors.avatarUrl ? 'true' : undefined}>
            <FieldLabel htmlFor="avatarUrl">Avatar URL</FieldLabel>
            <Input
              id="avatarUrl"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              aria-invalid={!!errors.avatarUrl}
            />
            {errors.avatarUrl && <FieldError>{errors.avatarUrl}</FieldError>}
          </Field>

          {/* Username */}
          <Field data-invalid={errors.username ? 'true' : undefined}>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="alphanumeric_underscore"
              aria-invalid={!!errors.username}
            />
            {errors.username && <FieldError>{errors.username}</FieldError>}
          </Field>

          {/* Bio */}
          <Field data-invalid={errors.bio ? 'true' : undefined}>
            <FieldLabel htmlFor="bio">Bio</FieldLabel>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              aria-invalid={!!errors.bio}
            />
            {errors.bio && <FieldError>{errors.bio}</FieldError>}
          </Field>
        </FieldGroup>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={loading} className="min-w-24">
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={loading}
            className="min-w-24"
          >
            Reset
          </Button>
        </div>
      </form>
    </div>
  )
}
