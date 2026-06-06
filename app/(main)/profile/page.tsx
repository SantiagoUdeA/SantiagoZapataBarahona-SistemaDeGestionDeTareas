import { requireAuth, getSession } from '@/lib/auth/guard'
import { EditProfileForm } from './_components/edit-profile-form'

export default async function ProfilePage() {
  const user = await requireAuth()
  const session = await getSession()

  if (!session) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-muted-foreground">Error loading session</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Edit Profile</h1>
        <p className="text-muted-foreground">Update your profile information</p>
      </div>
      <EditProfileForm session={session} />
    </div>
  )
}
