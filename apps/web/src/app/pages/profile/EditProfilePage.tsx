import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, Camera, MapPin, Save, UserRound, Globe2, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { SEO } from '../../components/SEO';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { EmptyState } from '../../components/primitives/EmptyState';
import { Field } from '../../components/primitives/Field';
import { Skeleton } from '../../components/primitives/Skeleton';
import { fadeUp, staggerContainer } from '../../lib/motion';

function EditProfileSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-6">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-48 w-full rounded-card" />
      <Skeleton className="h-72 w-full rounded-card" />
    </div>
  );
}
export default function EditProfilePage() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [form, setForm] = useState({
    name: 'Emma Wilson',
    username: 'fashionista_emma',
    bio: 'Fashion & lifestyle creator. Sharing daily outfit inspiration.',
    location: 'New York, USA',
    website: 'emmastyle.com',
    email: 'emma@example.com',
    phone: '+1 234 567 8900',
  });
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);
  const change = (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const save = () => {
    if (!form.name.trim() || !form.username.trim()) {
      setError(true);
      return;
    }
    toast.success('Profile saved');
    navigate(`/profile/${form.username}`);
  };
  if (loading) return <EditProfileSkeleton />;
  if (error)
    return (
      <div className="min-h-screen bg-background px-4 py-10">
        <EmptyState
          kind="error"
          title="Check your profile details"
          description="Name and username are required before saving."
          action={<Button onClick={() => setError(false)}>Continue editing</Button>}
        />
      </div>
    );
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Edit Profile — Ezyify"
        description="Update your Ezyify profile information, photo, and bio."
      />
      <motion.main
        variants={staggerContainer(reduce ? 0 : 0.05)}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-2xl space-y-6 px-4 py-6 lg:py-8"
      >
        <motion.header variants={fadeUp} className="flex items-center gap-3">
          <Link to={`/profile/${form.username}`}>
            <Button aria-label="Back to profile" variant="ghost" size="icon">
              <ArrowLeft />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-semibold">Edit profile</h1>
            <p className="text-sm text-foreground-secondary">
              Make your Ezyify space feel like you.
            </p>
          </div>
          <Button onClick={save} className="hidden sm:inline-flex" leftIcon={<Save />}>
            Save
          </Button>
        </motion.header>
        <motion.section variants={fadeUp}>
          <Card className="overflow-hidden p-0">
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=400&fit=crop"
                alt="Profile cover"
                loading="lazy"
                className="h-44 w-full object-cover sm:h-52"
              />
              <Button
                aria-label="Change cover photo"
                variant="secondary"
                size="icon"
                className="absolute right-3 top-3"
              >
                <Camera />
              </Button>
            </div>
            <div className="flex items-end gap-4 p-4">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1632163506775-db3341414ffb?w=300"
                alt="Emma Wilson"
                loading="lazy"
                className="size-20 rounded-full border-4 border-background object-cover"
              />
              <div>
                <Button variant="outline" size="sm" leftIcon={<Camera />}>
                  Change photo
                </Button>
                <p className="mt-1 text-xs text-foreground-secondary">
                  JPG or PNG, at least 400 × 400
                </p>
              </div>
            </div>
          </Card>
        </motion.section>
        <motion.section variants={fadeUp}>
          <Card className="space-y-4">
            <h2 className="font-display text-lg font-semibold">Public profile</h2>
            <Field
              label="Display name"
              name="name"
              value={form.name}
              onChange={change}
              leftIcon={<UserRound className="size-4" />}
            />
            <Field
              label="Username"
              name="username"
              value={form.username}
              onChange={change}
              hint={`ezyify.com/@${form.username}`}
            />
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Bio
              <textarea
                aria-label="Bio"
                name="bio"
                value={form.bio}
                onChange={(event) =>
                  setForm((current) => ({ ...current, bio: event.target.value.slice(0, 150) }))
                }
                rows={4}
                className="w-full rounded-xl border border-border bg-input-background p-3 text-foreground outline-none transition focus:border-primary focus:shadow-[0_0_0_4px_var(--primary-subtle)]"
              />
              <span className="text-xs font-normal text-foreground-secondary">
                {form.bio.length}/150 characters
              </span>
            </label>
            <Field
              label="Location"
              name="location"
              value={form.location}
              onChange={change}
              leftIcon={<MapPin className="size-4" />}
            />
            <Field
              label="Website"
              name="website"
              value={form.website}
              onChange={change}
              leftIcon={<Globe2 className="size-4" />}
            />
          </Card>
        </motion.section>
        <motion.section variants={fadeUp}>
          <Card className="space-y-4">
            <h2 className="font-display text-lg font-semibold">Private contact details</h2>
            <Field
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={change}
              leftIcon={<Mail className="size-4" />}
            />
            <Field
              label="Phone number"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={change}
              leftIcon={<Phone className="size-4" />}
            />
          </Card>
        </motion.section>
        <motion.div variants={fadeUp} className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate(`/profile/${form.username}`)}>
            Cancel
          </Button>
          <Button onClick={save} leftIcon={<Save />}>
            Save changes
          </Button>
        </motion.div>
      </motion.main>
    </div>
  );
}
