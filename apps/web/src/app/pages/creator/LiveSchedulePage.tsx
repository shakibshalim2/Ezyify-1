import { motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { Calendar, Clock, Plus, Zap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { Field } from '../../components/primitives/Field';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO } from '../../components/SEO';
import { fadeUp, staggerContainer } from '../../lib/motion';

export default function LiveSchedulePage() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);

  const schedule = [
    { id: 1, title: 'Product Launch Live', date: 'Jan 20, 2024', time: '3:00 PM', viewers: 2400 },
    { id: 2, title: 'Q&A Session', date: 'Jan 22, 2024', time: '5:00 PM', viewers: 1800 },
    { id: 3, title: 'Behind the Scenes', date: 'Jan 25, 2024', time: '2:00 PM', viewers: 950 },
  ];

  return (
    <SellerLayout>
      <SEO title="Live Schedule — Ezyify Creator" description="Manage your live streams." />
      <motion.div
        variants={staggerContainer(reduce ? 0 : 0.05)}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">Live Schedule</h1>
            <p className="text-sm text-foreground-secondary mt-1">Plan and manage your live streams</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient" size="lg" leftIcon={<Plus className="size-5" />} className="shadow-brand">
                Schedule Live
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule a Live Stream</DialogTitle>
                <DialogDescription>Plan your next live session</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Field label="Title" placeholder="Live stream title" />
                <Field label="Date" type="date" />
                <Field label="Time" type="time" />
                <Field label="Description" placeholder="Tell viewers what to expect" />
                <Button fullWidth onClick={() => setOpen(false)}>Schedule</Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card variant="default" padding="lg">
            <h2 className="font-display font-semibold text-lg mb-4 text-foreground">Upcoming Lives</h2>
            <div className="space-y-3">
              {schedule.map(live => (
                <div key={live.id} className="p-4 bg-background-elevated rounded-lg hover:bg-background-elevated/80 transition cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="size-4 text-accent-brand" />
                        <p className="font-semibold text-foreground text-sm">{live.title}</p>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-foreground-secondary">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" /> {live.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" /> {live.time}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-foreground-secondary">Expected viewers</p>
                      <p className="font-semibold text-foreground">{live.viewers.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </SellerLayout>
  );
}
