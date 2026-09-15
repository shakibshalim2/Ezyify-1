import { Link } from 'react-router';
import { ShieldCheck, Flag, Ban, Eye, Scale, Phone, Mail, Clock, UserCheck, Lock } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Button } from '../../components/primitives/Button';

/**
 * Google Play "Child Safety Standards" policy (social/dating apps): a public page describing CSAE
 * prohibitions, in‑app reporting, how CSAM is handled, legal compliance and a named contact.
 * Declared in Play Console → App content → Child safety standards.
 */
export default function ChildSafetyPage() {
  const commitments = [
    { icon: Ban, tone: 'error', title: 'Zero tolerance for CSAE', body: 'Any content, message, listing or live stream that sexualises, exploits or endangers a minor is prohibited. Offending accounts are permanently removed on first confirmed violation.' },
    { icon: UserCheck, tone: 'primary', title: '18+ platform', body: 'Ezyify includes wallet and escrow features and is only for adults. Accounts believed to belong to minors are suspended and deleted after verification.' },
    { icon: Eye, tone: 'info', title: 'Proactive detection', body: 'Uploads are scanned with industry hash‑matching (PhotoDNA‑class) and classifiers before they are visible. Matches are blocked and escalated within minutes.' },
    { icon: Clock, tone: 'warning', title: '24‑hour review SLA', body: 'Child‑safety reports skip the normal queue. A trained reviewer acts within 24 hours; confirmed CSAM is removed immediately and preserved only for law enforcement.' },
    { icon: Scale, tone: 'success', title: 'Reporting to authorities', body: 'We report confirmed CSAM to NCMEC (CyberTipline) and cooperate with local law enforcement and regional hotlines such as INHOPE members.' },
    { icon: Lock, tone: 'primary', title: 'Safety by design', body: 'Strangers cannot send images or links in a first message, live streams can be reported in one tap, and grooming‑pattern detection flags risky conversations.' },
  ] as const;

  const toneClass: Record<(typeof commitments)[number]['tone'], string> = {
    error: 'bg-error/5 border-error/30 text-error',
    primary: 'bg-primary/10 border-primary/25 text-primary',
    info: 'bg-info/5 border-info/30 text-info',
    warning: 'bg-warning/5 border-warning/30 text-warning',
    success: 'bg-success/5 border-success/30 text-success',
  };

  return (
    <>
      <SEO
        title="Child Safety Standards"
        description="Ezyify’s published standards against child sexual abuse and exploitation (CSAE): prohibited conduct, in‑app reporting, detection, law‑enforcement cooperation and our dedicated safety contact."
        type="article"
      />
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="py-20 text-white rounded-b-3xl" style={{ background: 'var(--brand-gradient)' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-white/15 mb-4">
              <ShieldCheck className="size-8" aria-hidden />
            </div>
            <h1 className="text-4xl mb-3">Child Safety Standards</h1>
            <p className="text-lg text-white/85 max-w-2xl mx-auto">
              Our standards against child sexual abuse and exploitation (CSAE), how to report it, and how we respond.
            </p>
            <p className="text-sm text-white/70 mt-2">Last updated: September 14, 2026 · Applies to the Ezyify web and Android apps</p>
          </div>
        </div>

        <Alert className="mt-6 mb-6 border-error/30 bg-error/5">
          <Flag className="size-5 text-error" aria-hidden />
          <AlertDescription className="text-error">
            <p>
              If a child is in immediate danger, contact your local emergency services first. To report content on Ezyify, use
              the <strong>Report</strong> button on any post, profile, message or live stream and choose <strong>“Child safety”</strong>.
            </p>
          </AlertDescription>
        </Alert>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="size-5" aria-hidden />Our commitments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {commitments.map(({ icon: Icon, tone, title, body }) => (
                <div key={title} className={`p-4 rounded-2xl border ${toneClass[tone]}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="size-5" aria-hidden />
                    <h3 className="font-semibold text-foreground">{title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Ban className="size-5" aria-hidden />What is prohibited</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>The following is banned everywhere on Ezyify — posts, loops, stories, live streams, product listings, reviews, profiles and private messages:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Child sexual abuse material (CSAM) of any kind, including illustrated, AI‑generated or “implied” depictions.</li>
              <li>Sexualisation of minors: sexual comments, requests, role‑play or framing of anyone under 18.</li>
              <li>Grooming or solicitation: attempting to contact, befriend or move a minor to another platform for sexual purposes.</li>
              <li>Sextortion, trafficking, or advertising minors for sexual services or “modelling”.</li>
              <li>Sharing, requesting or linking to any of the above, including coded language, hashtags or off‑platform links.</li>
              <li>Selling products that facilitate child abuse or that are marketed with sexualised imagery of minors.</li>
            </ul>
            <p>
              Violations result in permanent account termination, forfeiture of pending payouts under our{' '}
              <Link to="/terms" className="text-primary hover:underline">Terms</Link>, device and payment‑method bans, and referral to law enforcement.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Flag className="size-5" aria-hidden />How to report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <ol className="list-decimal pl-5 space-y-2">
              <li>Open the menu (⋯) on the post, profile, message or live stream and tap <strong>Report</strong>.</li>
              <li>Choose <strong>Child safety</strong>. The report is routed to our specialist team and marked highest priority.</li>
              <li>You can add context; we never reveal your identity to the reported account.</li>
              <li>You will receive a status update in <strong>Notifications</strong> once the case is closed.</li>
            </ol>
            <p>You do not need an account to report. Use the web form or email below — include the URL or username, and do not forward the material itself.</p>
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <Button asChild variant="primary" size="md"><Link to="/report-problem">Report content</Link></Button>
              <Button asChild variant="outline" size="md"><a href="mailto:childsafety@ezyify.app">Email childsafety@ezyify.app</a></Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Scale className="size-5" aria-hidden />How we respond</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Remove</strong> — confirmed CSAM is removed immediately and the hash is added to our block list so it cannot be re‑uploaded.</li>
              <li><strong>Preserve</strong> — the material and account records are preserved in a restricted evidence store for 90 days solely for law‑enforcement purposes (extended on legal request).</li>
              <li><strong>Report</strong> — we file a CyberTipline report with the National Center for Missing &amp; Exploited Children (NCMEC) and respond to lawful requests from law enforcement worldwide.</li>
              <li><strong>Terminate</strong> — the account, linked devices and payment instruments are permanently banned; escrow funds are frozen pending investigation.</li>
              <li><strong>Review</strong> — every child‑safety decision is double‑checked by a second trained reviewer; our reviewers have access to wellbeing support.</li>
            </ul>
            <p>
              We comply with applicable child‑safety laws including the US PROTECT Act and 18 U.S.C. § 2258A reporting obligations, the EU Digital Services
              Act, the UK Online Safety Act, and equivalent regional regulations, and we follow Google Play’s Child Safety Standards policy.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Phone className="size-5" aria-hidden />Designated child‑safety contact</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Our designated point of contact for child‑safety matters, including Google Play, hotlines and law enforcement:</p>
            <ul className="space-y-1">
              <li className="flex items-center gap-2"><Mail className="size-4 text-primary" aria-hidden /><a href="mailto:childsafety@ezyify.app" className="text-primary hover:underline">childsafety@ezyify.app</a> (monitored 24/7, acknowledged within 24 hours)</li>
              <li className="flex items-center gap-2"><Mail className="size-4 text-primary" aria-hidden /><a href="mailto:lawenforcement@ezyify.app" className="text-primary hover:underline">lawenforcement@ezyify.app</a> for legal process and preservation requests</li>
            </ul>
            <p className="pt-2">
              Related policies: <Link to="/community-guidelines" className="text-primary hover:underline">Community Guidelines</Link> ·{' '}
              <Link to="/safety" className="text-primary hover:underline">Safety Center</Link> ·{' '}
              <Link to="/transparency" className="text-primary hover:underline">Transparency Report</Link> ·{' '}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
