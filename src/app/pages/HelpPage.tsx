import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import {
  BookOpen,
  ChevronDown,
  Mail,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { Button } from '../components/primitives/Button';
import { Card } from '../components/primitives/Card';
import { EmptyState } from '../components/primitives/EmptyState';
import { Field } from '../components/primitives/Field';
import { Skeleton } from '../components/primitives/Skeleton';
import { fadeUp, staggerContainer } from '../lib/motion';
type Faq = {
  group: 'General' | 'Shopping' | 'Selling' | 'Account';
  question: string;
  answer: string;
};
const faqs: Faq[] = [
  {
    group: 'General',
    question: 'What is Ezyify?',
    answer: 'Ezyify brings shopping, creator content, live moments, and community together.',
  },
  {
    group: 'Shopping',
    question: 'How does escrow protection work?',
    answer: 'Your payment remains protected until your order is delivered and accepted.',
  },
  {
    group: 'Shopping',
    question: 'How do I make a return?',
    answer: 'Open the order details within seven days of delivery to request a return.',
  },
  {
    group: 'Selling',
    question: 'How do I become a seller?',
    answer:
      'Create a store profile, submit verification documents, and start listing after approval.',
  },
  {
    group: 'Account',
    question: 'How do I reset my password?',
    answer: 'Choose Forgot password on the sign-in screen and follow the email instructions.',
  },
];
function HelpSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-6">
      <Skeleton className="h-52 w-full rounded-sheet" />
      <Skeleton className="h-12 w-full" />
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-18 w-full rounded-card" />
      ))}
    </div>
  );
}
export default function HelpPage() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 120);
    return () => clearTimeout(timer);
  }, []);
  const visible = useMemo(
    () =>
      faqs.filter((faq) =>
        `${faq.question} ${faq.answer} ${faq.group}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );
  if (loading) return <HelpSkeleton />;
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Help & Support — Ezyify"
        description="Find help with shopping, selling, and account questions."
      />
      <motion.main
        variants={staggerContainer(reduce ? 0 : 0.05)}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-4xl space-y-8 px-4 py-6 lg:py-8"
      >
        <motion.header
          variants={fadeUp}
          className="rounded-sheet bg-brand-gradient p-6 text-white sm:p-8"
        >
          <BookOpen className="size-8" />
          <h1 className="mt-4 font-display text-3xl font-semibold">How can we help?</h1>
          <p className="mt-2 text-white/85">
            Search guides, find an answer, or connect with our support team.
          </p>
          <Field
            label="Search help"
            hideLabel
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search help topics"
            leftIcon={<Search className="size-4" />}
            containerClassName="mt-5"
            className="bg-background text-foreground"
          />
        </motion.header>
        <motion.section variants={fadeUp} className="grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: MessageCircle,
              title: 'Chat with us',
              text: 'Fast answers from support',
              action: () => navigate('/messages'),
            },
            {
              icon: ShoppingBag,
              title: 'Order help',
              text: 'Track, return, or report an issue',
              action: () => navigate('/orders'),
            },
            {
              icon: ShieldCheck,
              title: 'Safety center',
              text: 'Payments, privacy, and escrow',
              action: () => navigate('/transparency'),
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} interactive className="space-y-2">
                <Icon className="size-6 text-primary" />
                <h2 className="font-display font-semibold">{item.title}</h2>
                <p className="text-sm text-foreground-secondary">{item.text}</p>
                <Button variant="link" onClick={item.action}>
                  Open guide
                </Button>
              </Card>
            );
          })}
        </motion.section>
        <motion.section variants={fadeUp}>
          <div className="mb-4">
            <h2 className="font-display text-xl font-semibold">Popular answers</h2>
            <p className="text-sm text-foreground-secondary">Everything you need to get moving.</p>
          </div>
          {visible.length ? (
            <div className="space-y-2">
              {visible.map((faq) => (
                <Card key={faq.question} className="p-0">
                  <button
                    aria-expanded={open === faq.question}
                    onClick={() =>
                      setOpen((current) => (current === faq.question ? null : faq.question))
                    }
                    className="flex min-h-14 w-full items-center gap-3 px-4 text-left"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="mb-1 block text-xs font-semibold text-primary">
                        {faq.group}
                      </span>
                      <span className="font-semibold">{faq.question}</span>
                    </span>
                    <ChevronDown
                      className={`size-5 text-foreground-secondary transition-transform ${open === faq.question ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {open === faq.question && (
                    <p className="border-t border-border px-4 py-4 text-sm leading-relaxed text-foreground-secondary">
                      {faq.answer}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              kind="search"
              title="No help topics found"
              description="Try a shorter search or contact support."
              action={<Button onClick={() => setQuery('')}>Clear search</Button>}
            />
          )}
        </motion.section>
        <motion.section variants={fadeUp}>
          <Card variant="featured" className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <h2 className="font-display text-lg font-semibold">Still need help?</h2>
              <p className="text-sm text-foreground-secondary">
                Our support team is ready around the clock.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate('/messages')} leftIcon={<MessageCircle />}>
                Start chat
              </Button>
              <Button asChild variant="outline" aria-label="Email Ezyify support">
                <a href="mailto:support@ezyify.com">
                  <Mail />
                  Email
                </a>
              </Button>
            </div>
          </Card>
        </motion.section>
      </motion.main>
    </div>
  );
}
