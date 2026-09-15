import { useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { toast } from 'sonner';
import { ArrowLeft, Search, UserCheck, UserPlus } from 'lucide-react';
import { avatarUrlFor, useAuth, useFollowers, useProfile, useToggleFollow, type UserSummary } from '@ezyify/core';
import { SEO } from '../../components/SEO';
import { VerifiedBadge } from '../../components/VerifiedBadge';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { EmptyState } from '../../components/primitives/EmptyState';
import { Field } from '../../components/primitives/Field';
import { Img } from '../../components/primitives/Img';
import { Skeleton } from '../../components/primitives/Skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { formErrors } from '../../lib/apiErrors';
import { fadeUp, staggerContainer } from '../../lib/motion';

type Kind = 'followers' | 'following';

function PeopleSkeleton() {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Loading people">
      {[1, 2, 3, 4, 5].map(i => (
        <Card key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-3 w-1/4" /></div>
          <Skeleton className="h-9 w-24 rounded-full" />
        </Card>
      ))}
    </div>
  );
}

function PersonRow({ person, isMe, following, pending, onToggle }: { person: UserSummary; isMe: boolean; following: boolean; pending: boolean; onToggle: () => void }) {
  return (
    <Card className="flex items-center gap-3 p-3" data-testid={`person-${person.username}`}>
      <Link to={`/profile/${person.username}`} className="flex min-w-0 flex-1 items-center gap-3">
        <Img src={avatarUrlFor(person, 96)} alt="" className="size-12 rounded-full object-cover bg-background-elevated" />
        <div className="min-w-0">
          <p className="flex items-center gap-1 truncate font-semibold">{person.name}{person.verified && <VerifiedBadge size="sm" />}</p>
          <p className="truncate text-sm text-foreground-secondary">@{person.username}</p>
        </div>
      </Link>
      {!isMe && (
        <Button variant={following ? 'outline' : 'primary'} size="sm" onClick={onToggle} loading={pending} leftIcon={following ? <UserCheck /> : <UserPlus />} aria-pressed={following}>
          {following ? 'Following' : 'Follow'}
        </Button>
      )}
    </Card>
  );
}

/** `/profile/:username/followers|following` on `GET /users/:username/{followers,following}`; follow state derives from the viewer's own following list. */
export default function FollowersPage() {
  const { username: param } = useParams();
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  const me = useAuth(s => s.user);
  const authed = useAuth(s => s.status) === 'authenticated';
  const username = param && param !== 'me' ? param : me?.username;
  const initialTab: Kind = pathname.endsWith('/following') ? 'following' : 'followers';
  const [tab, setTab] = useState<Kind>(initialTab);
  const [query, setQuery] = useState('');

  const profile = useProfile(username);
  const followers = useFollowers(username, 'followers');
  const following = useFollowers(username, 'following');
  // The viewer's own list decides which rows show "Following" (not the profile owner's).
  const mine = useFollowers(authed ? me?.username : undefined, 'following');
  const myFollowing = useMemo(() => new Set((mine.data ?? []).map(u => u.username)), [mine.data]);
  const toggle = useToggleFollow();
  const [pendingUser, setPendingUser] = useState<string | null>(null);

  const onToggle = (person: UserSummary) => {
    if (!authed) return void toast.error('Sign in to follow people');
    const isFollowing = myFollowing.has(person.username);
    setPendingUser(person.username);
    toggle.mutate(
      { username: person.username, following: isFollowing },
      {
        onSettled: () => setPendingUser(null),
        onError: err => toast.error(formErrors(err).message ?? 'Could not update follow'),
      },
    );
  };

  const filter = (list: UserSummary[] | undefined) => {
    const q = query.trim().toLowerCase();
    return (list ?? []).filter(p => !q || `${p.name} ${p.username}`.toLowerCase().includes(q));
  };

  const renderList = (q: typeof followers, kind: Kind) => {
    if (q.isLoading) return <PeopleSkeleton />;
    if (q.isError) return <EmptyState compact kind="error" title="Couldn’t load people" description={formErrors(q.error).message ?? 'Please try again.'} action={<Button onClick={() => q.refetch()}>Retry</Button>} />;
    const list = filter(q.data);
    if (!list.length) {
      return query ? (
        <EmptyState compact kind="search" title="No one matches" description="Try a different name or username." />
      ) : (
        <EmptyState
          compact
          kind="feed"
          title={kind === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
          description={kind === 'followers' ? 'Share posts and loops to grow your audience.' : 'Discover creators and stores to follow on Explore.'}
          action={kind === 'following' ? <Button asChild><Link to="/explore">Explore</Link></Button> : undefined}
        />
      );
    }
    return (
      <motion.ul variants={staggerContainer(reduce ? 0 : 0.04)} initial="hidden" animate="visible" className="space-y-2">
        {list.map(person => (
          <motion.li variants={fadeUp} key={person.id}>
            <PersonRow person={person} isMe={person.username === me?.username} following={myFollowing.has(person.username)} pending={pendingUser === person.username} onToggle={() => onToggle(person)} />
          </motion.li>
        ))}
      </motion.ul>
    );
  };

  const counts = { followers: profile.data?.followers ?? followers.data?.length, following: profile.data?.following ?? following.data?.length };

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`${profile.data?.name ?? username ?? 'Profile'} · Connections — Ezyify`} description="View followers and following on Ezyify." />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <header className="mb-5 flex items-center gap-3">
          <Button aria-label="Back to profile" variant="ghost" size="icon" asChild>
            <Link to={`/profile/${username ?? 'me'}`}><ArrowLeft /></Link>
          </Button>
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold">Connections</h1>
            <p className="truncate text-sm text-foreground-secondary">{profile.data ? `${profile.data.name} · @${profile.data.username}` : `@${username ?? 'me'}`}</p>
          </div>
        </header>
        {!username ? (
          <EmptyState kind="feed" title="Sign in to see your connections" action={<Button asChild><Link to="/login" state={{ next: pathname }}>Sign in</Link></Button>} />
        ) : profile.isError ? (
          <EmptyState kind="error" title="Profile not found" description="This account may have been removed." action={<Button asChild><Link to="/explore">Explore</Link></Button>} />
        ) : (
          <>
            <Field label="Search connections" hideLabel value={query} onChange={e => setQuery(e.target.value)} placeholder="Search people" leftIcon={<Search className="size-4" />} containerClassName="mb-5" type="search" />
            <Tabs value={tab} onValueChange={v => setTab(v as Kind)}>
              <TabsList className="mb-4 grid h-11 w-full grid-cols-2">
                <TabsTrigger value="followers">Followers{counts.followers != null ? ` · ${counts.followers}` : ''}</TabsTrigger>
                <TabsTrigger value="following">Following{counts.following != null ? ` · ${counts.following}` : ''}</TabsTrigger>
              </TabsList>
              <TabsContent value="followers" className="mt-0">{renderList(followers, 'followers')}</TabsContent>
              <TabsContent value="following" className="mt-0">{renderList(following, 'following')}</TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}
