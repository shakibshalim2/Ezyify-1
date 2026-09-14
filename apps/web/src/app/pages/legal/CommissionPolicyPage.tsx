import { ArrowLeft, DollarSign, Info, Shield } from 'lucide-react';
import { Link } from 'react-router';
import { Card, CardContent } from '../../components/ui/card';
import { SEO } from '../../components/SEO';

export default function CommissionPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Platform Fees & Commission Policy - Ezyify"
        description="Understand Ezyify's platform fees, commission structure, and revenue model. Transparent pricing for sellers and creators."
        keywords="platform fees, commission policy, seller fees, creator earnings, pricing"
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header */}
        <Link
          to="/settings" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Settings</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-foreground mb-3">Platform Fees & Commission Policy</h1>
          <p className="text-muted-foreground text-lg">
            Last updated: January 2026
          </p>
        </div>

        <div className="space-y-6">
          {/* Overview */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-foreground mb-2">Overview</h2>
                  <p className="text-muted-foreground">
                    Ezyify operates on a commission-based model to sustain platform operations, ensure security, 
                    and continuously improve user experience. All fees are automatically deducted from transactions 
                    before seller payouts.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Commission Structure */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <DollarSign className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-foreground mb-2">Platform Commission Structure</h2>
                  <p className="text-muted-foreground mb-4">
                    Commission rates vary by product category and are automatically calculated at checkout. 
                    These rates are subject to change based on business agreements and market conditions.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-muted rounded-xl">
                      <p className="text-sm text-foreground font-medium">General Categories</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Commission ranges from 5% to 18% depending on product type, brand partnerships, and seller tier
                      </p>
                    </div>
                    
                    <div className="p-3 bg-muted rounded-xl">
                      <p className="text-sm text-foreground font-medium">Creator Partnerships</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Commission structures for creator-exclusive products and branded collaborations are negotiated individually
                      </p>
                    </div>
                    
                    <div className="p-3 bg-muted rounded-xl">
                      <p className="text-sm text-foreground font-medium">Affiliate Earnings</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Creators earn commission on products shared through in-platform affiliate links based on product category
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How Commissions Work */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-foreground mb-4">How Commissions Work</h2>
              
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <p className="text-sm text-foreground font-medium mb-1">1. Customer Purchase</p>
                  <p className="text-sm text-muted-foreground">
                    Customer completes purchase through Ezyify checkout
                  </p>
                </div>
                
                <div className="border-l-4 border-primary pl-4">
                  <p className="text-sm text-foreground font-medium mb-1">2. Automatic Deduction</p>
                  <p className="text-sm text-muted-foreground">
                    Platform commission is automatically deducted from the transaction amount
                  </p>
                </div>
                
                <div className="border-l-4 border-primary pl-4">
                  <p className="text-sm text-foreground font-medium mb-1">3. Revenue Distribution</p>
                  <p className="text-sm text-muted-foreground">
                    Remaining amount is distributed to seller, creator (if applicable), and affiliate (if eligible)
                  </p>
                </div>
                
                <div className="border-l-4 border-primary pl-4">
                  <p className="text-sm text-foreground font-medium mb-1">4. Payout Processing</p>
                  <p className="text-sm text-muted-foreground">
                    Sellers and creators receive their earnings according to the payout schedule
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Fees */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-foreground mb-4">Additional Fees</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-start p-3 bg-muted rounded-xl">
                  <div className="flex-1">
                    <p className="text-sm text-foreground font-medium">Payment Processing</p>
                    <p className="text-xs text-muted-foreground mt-1">Standard card processing and gateway fees</p>
                  </div>
                  <p className="text-sm text-foreground font-medium">2.5% + $0.30</p>
                </div>
                
                <div className="flex justify-between items-start p-3 bg-muted rounded-xl">
                  <div className="flex-1">
                    <p className="text-sm text-foreground font-medium">Withdrawal Fee</p>
                    <p className="text-xs text-muted-foreground mt-1">Per withdrawal to bank account</p>
                  </div>
                  <p className="text-sm text-foreground font-medium">$5.00</p>
                </div>
                
                <div className="flex justify-between items-start p-3 bg-muted rounded-xl">
                  <div className="flex-1">
                    <p className="text-sm text-foreground font-medium">Currency Conversion</p>
                    <p className="text-xs text-muted-foreground mt-1">Applied when converting between currencies</p>
                  </div>
                  <p className="text-sm text-foreground font-medium">2.5%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax & Compliance Disclaimer */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-foreground mb-2">Tax & Compliance</h2>
                  <p className="text-sm text-muted-foreground mb-3">
                    <strong>Important Notice:</strong> Applicable taxes, VAT, or withholding charges may apply 
                    based on seller location, customer location, and local regulations. Sellers are responsible 
                    for understanding and complying with their local tax obligations.
                  </p>
                  
                  <div className="p-4 bg-warning/8 border border-warning/20 rounded-xl">
                    <p className="text-sm text-foreground">
                      Ezyify does not provide tax advice. Please consult with a qualified tax professional 
                      regarding your specific tax obligations and reporting requirements.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Control */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-foreground mb-3">Commission Management</h2>
              <p className="text-sm text-muted-foreground mb-3">
                Platform commission rates are system-level and cannot be modified by users, sellers, or creators. 
                All commission calculations are automated and transparent in seller/creator earnings dashboards.
              </p>
              
              <div className="p-4 bg-info/10 dark:bg-info/20 border border-info/30 rounded-xl">
                <p className="text-sm text-foreground">
                  <strong>Note:</strong> Users cannot control, bypass, or negotiate platform commission rates 
                  outside of formal business partnership agreements with Ezyify.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact & Support */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-foreground mb-3">Questions?</h2>
              <p className="text-sm text-muted-foreground mb-4">
                For questions about platform fees, commission rates, or revenue distribution, please contact our support team.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Link to="/help">
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors text-sm font-medium">
                    Visit Help Center
                  </button>
                </Link>
                <Link to="/help">
                  <button className="px-4 py-2 border border-border rounded-xl hover:bg-muted transition-colors text-sm font-medium text-foreground">
                    Contact Support
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Footer Note */}
          <div className="p-4 bg-muted rounded-xl">
            <p className="text-xs text-muted-foreground">
              Ezyify reserves the right to update commission rates and fee structures with prior notice to users. 
              Changes will be communicated through email and platform notifications. Continued use of the platform 
              constitutes acceptance of updated fee structures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}