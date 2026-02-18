import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useOwnProfile, useCreateProfile } from '../hooks/useQueries';
import RequireAuth from '../components/auth/RequireAuth';
import Avatar from '../components/profile/Avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob } from '../backend';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useOwnProfile();
  const createProfile = useCreateProfile();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setBio(profile.bio);
    }
  }, [profile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) {
      toast.error('Display name is required');
      return;
    }

    try {
      let avatarBlob: ExternalBlob | null = null;

      if (avatarFile) {
        const arrayBuffer = await avatarFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        avatarBlob = ExternalBlob.fromBytes(uint8Array);
      } else if (profile?.avatar) {
        avatarBlob = profile.avatar;
      }

      await createProfile.mutateAsync({
        displayName: displayName.trim(),
        bio: bio.trim(),
        avatar: avatarBlob,
      });

      toast.success('Profile updated successfully');
      navigate({ to: '/' });
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar
              avatar={avatarPreview ? { getDirectURL: () => avatarPreview } as any : profile?.avatar}
              displayName={displayName}
              size="xl"
            />
            <Label htmlFor="avatar" className="cursor-pointer">
              <div className="flex items-center gap-2 rounded-md border px-4 py-2 hover:bg-accent">
                <Upload className="h-4 w-4" />
                <span className="text-sm">Change Avatar</span>
              </div>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              rows={4}
              maxLength={200}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={createProfile.isPending} className="flex-1">
              {createProfile.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Profile'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: '/' })}
              disabled={createProfile.isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </RequireAuth>
  );
}
