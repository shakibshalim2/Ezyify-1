import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, Search, UserCheck, UserPlus } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { VerifiedBadge } from '../../components/VerifiedBadge';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { EmptyState } from '../../components/primitives/EmptyState';
import { Field } from '../../components/primitives/Field';
import { Skeleton } from '../../components/primitives/Skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { fadeUp, staggerContainer } from '../../lib/motion';

type Person = {
  id: string;
  username: string;
  name: string;
  avatar: string;
  verified: boolean;
  bio: string;
  followers: number;
  following: boolean;
};
const people: Person[] = [
  {
    id: '1',
    username: 'sarah_styles',
    name: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    verified: true,
    bio: 'Fashion blogger & stylist',
    followers: 45000,
    following: true,
  },
  {
    id: '2',
    username: 'mike_tech',
    name: 'Michael Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    verified: false,
    bio: 'Tech enthusiast & reviewer',
    followers: 23000,
    following: false,
  },
  {
    id: '3',
    username: 'lisa_fitness',
    name: 'Lisa Anderson',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    verified: true,
    bio: 'Fitness coach',
    followers: 67000,
    following: true,
  },
  {
    id: '4',
    username: 'david_photo',
    name: 'David Martinez',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    verified: true,
    bio: 'Professional photographer',
    followers: 89000,
    following: false,
  },
];
function FollowersSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <Skeleton className="h-11 w-full" />
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-20 w-full rounded-card" />
      ))}
    </div>
  );
}
function PersonRow({ person, onToggle }: { person: Person; onToggle: () => void }) {
  return (
    <Card className="flex items-center gap-3">
      <Link to={`/profile/${person.username}`}>
        <ImageWithFallback
          src={person.avatar}
          alt=""
          loading="lazy"
          className="size-12 rounded-full object-cover"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <Link to={`/profile/${person.username}`} className="flex items-center gap-1 font-semibold">
          <span className="truncate">{person.name}</span>
          {person.verified && <VerifiedBadge size="sm" />}
        </Link>
        <p className="truncate text-sm text-foreground-secondary">
          @{person.username} · {(person.followers / 1000).toFixed(0)}K followers
        </p>
        <p className="truncate text-xs text-foreground-tertiary">{person.bio}</p>
      </div>
      <Button
        variant={person.following ? 'outline' : 'primary'}
        size="sm"
        onClick={onToggle}
        leftIcon={person.following ? <UserCheck /> : <UserPlus />}
      >
        {person.following ? 'Following' : 'Follow'}
      </Button>
    </Card>
  );
}
export default function FollowersPage() {
  const { username } = useParams();
  const reduce = useReducedMotion();
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [followers, setFollowers] = useState(people);
  const [following, setFollowing] = useState(people.slice(0, 3));
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);
  const filter = (list: Person[]) =>
    list.filter((person) =>
      `${person.name} ${person.username}`.toLowerCase().includes(query.toLowerCase()),
    );
  if (loading) return <FollowersSkeleton />;
  const renderPeople = (list: Person[], setter: React.Dispatch<React.SetStateAction<Person[]>>) => {
    const filtered = filter(list);
    return filtered.length ? (
      <motion.div
        variants={staggerContainer(reduce ? 0 : 0.05)}
        initial="hidden"
        animate="visible"
        className="space-y-2"
      >
        {filtered.map((person) => (
          <motion.div variants={fadeUp} key={person.id}>
            <PersonRow
              person={person}
              onToggle={() =>
                setter((current) =>
                  current.map((item) =>
                    item.id === person.id ? { ...item, following: !item.following } : item,
                  ),
                )
              }
            />
          </motion.div>
        ))}
      </motion.div>
    ) : (
      <EmptyState
        compact
        kind="search"
        title="No connections found"
        description="Try a different name or username."
      />
    );
  };
  return (
    <div className="min-h-screen bg-background">
      <SEO title="Connections — Ezyify" description="View followers and following on Ezyify." />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <header className="mb-5 flex items-center gap-3">
          <Link to={`/profile/${username || 'me'}`}>
            <Button aria-label="Back to profile" variant="ghost" size="icon">
              <ArrowLeft />
            </Button>
          </Link>
          <div>
            <h1 className="font-display text-2xl font-semibold">Connections</h1>
            <p className="text-sm text-foreground-secondary">@{username || 'me'}</p>
          </div>
        </header>
        <Field
          label="Search connections"
          hideLabel
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search people"
          leftIcon={<Search className="size-4" />}
          containerClassName="mb-5"
        />
        <Tabs defaultValue="followers">
          <TabsList className="mb-4 grid h-11 w-full grid-cols-2">
            <TabsTrigger value="followers">Followers · {filter(followers).length}</TabsTrigger>
            <TabsTrigger value="following">Following · {filter(following).length}</TabsTrigger>
          </TabsList>
          <TabsContent value="followers" className="mt-0">
            {renderPeople(followers, setFollowers)}
          </TabsContent>
          <TabsContent value="following" className="mt-0">
            {renderPeople(following, setFollowing)}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
