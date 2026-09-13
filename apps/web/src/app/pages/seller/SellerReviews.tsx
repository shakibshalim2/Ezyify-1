import { motion, useReducedMotion } from 'motion/react';
import { Star, ThumbsUp, MessageCircle } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
import { Button } from '../../components/primitives/Button';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO, SEOConfigs } from '../../components/SEO';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';

export default function SellerReviews() {
  const reduce = useReducedMotion();

  const reviews = [
    { id: 1, customer: 'Ahmed Hassan', avatar: 'https://i.pravatar.cc/150?img=1', rating: 5, text: 'Excellent product and fast shipping!', helpful: 12 },
    { id: 2, customer: 'Sarah Ahmed', avatar: 'https://i.pravatar.cc/150?img=2', rating: 4, text: 'Good quality, but took a bit longer to arrive', helpful: 8 },
    { id: 3, customer: 'Mike Johnson', avatar: 'https://i.pravatar.cc/150?img=3', rating: 5, text: 'Highly recommend!', helpful: 5 },
  ];

  return (
    <SellerLayout>
      <SEO {...SEOConfigs.reviews} />
      <motion.div
        variants={staggerContainer(reduce ? 0 : 0.05)}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={fadeUp}>
          <h1 className="font-display text-2xl font-semibold text-foreground">Reviews</h1>
          <p className="text-sm text-foreground-secondary mt-1">Manage customer feedback</p>
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary-subtle flex items-center justify-center">
                <Star className="size-5 text-primary fill-primary" />
              </div>
              <div>
                <p className="text-xs text-foreground-secondary">Avg Rating</p>
                <p className="font-display font-bold text-2xl text-foreground">4.8</p>
              </div>
            </div>
          </Card>
          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-success-subtle flex items-center justify-center">
                <MessageCircle className="size-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-foreground-secondary">Total Reviews</p>
                <p className="font-display font-bold text-2xl text-foreground">234</p>
              </div>
            </div>
          </Card>
          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-warning-subtle flex items-center justify-center">
                <ThumbsUp className="size-5 text-warning" />
              </div>
              <div>
                <p className="text-xs text-foreground-secondary">This Month</p>
                <p className="font-display font-bold text-2xl text-foreground">12</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card variant="default" padding="lg">
            <h2 className="font-display font-semibold text-lg mb-4 text-foreground">Recent Reviews</h2>
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="p-4 bg-background-elevated rounded-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="size-10">
                        <AvatarImage src={review.avatar} />
                        <AvatarFallback>{review.customer.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{review.customer}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="size-3 fill-warning text-warning" />
                          ))}
                        </div>
                        <p className="text-sm text-foreground mt-2">{review.text}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" leftIcon={<ThumbsUp className="size-4" />}>
                      {review.helpful}
                    </Button>
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
