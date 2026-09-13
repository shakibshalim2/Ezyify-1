import React, { useState } from 'react';
import { 
  Shield, 
  DollarSign, 
  Users, 
  Lock, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  TrendingUp,
  FileText,
  Database,
  Cpu,
  Activity
} from 'lucide-react';

/**
 * EZYIFY Escrow System - Interactive System Architecture Visualizer
 * Visual representation of the complete escrow system architecture
 */

interface ArchitectureNode {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  status: 'active' | 'processing' | 'completed';
}

type FlowType = 'buyer' | 'seller' | 'security' | 'all';

export default function SystemArchitectureVisualizer() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [activeFlow, setActiveFlow] = useState<FlowType>('all');

  // Architecture layers
  const layers = {
    presentation: [
      {
        id: 'buyer-ui',
        label: 'Buyer Interface',
        description: 'Checkout, order tracking, delivery confirmation',
        icon: <Users className="w-5 h-5" />,
        color: 'text-info',
        status: 'active' as const
      },
      {
        id: 'seller-ui',
        label: 'Seller Dashboard',
        description: 'Earnings, withdrawals, payout settings',
        icon: <TrendingUp className="w-5 h-5" />,
        color: 'text-primary',
        status: 'active' as const
      }
    ],
    business: [
      {
        id: 'escrow-engine',
        label: 'Escrow Engine',
        description: '7-day hold, auto-release, dispute management',
        icon: <Lock className="w-5 h-5" />,
        color: 'text-success',
        status: 'processing' as const
      },
      {
        id: 'commission',
        label: 'Commission Calculator',
        description: '7% platform fee (5% + 2%)',
        icon: <DollarSign className="w-5 h-5" />,
        color: 'text-warning',
        status: 'active' as const
      },
      {
        id: 'fraud-prevention',
        label: 'Fraud Prevention',
        description: '4-layer security architecture',
        icon: <Shield className="w-5 h-5" />,
        color: 'text-error',
        status: 'active' as const
      }
    ],
    data: [
      {
        id: 'database',
        label: 'Database Layer',
        description: 'PostgreSQL with 15-min backups',
        icon: <Database className="w-5 h-5" />,
        color: 'text-primary',
        status: 'active' as const
      },
      {
        id: 'monitoring',
        label: 'Monitoring System',
        description: 'Real-time health & performance',
        icon: <Activity className="w-5 h-5" />,
        color: 'text-like',
        status: 'active' as const
      }
    ],
    external: [
      {
        id: 'payment-gateway',
        label: 'Payment Gateway',
        description: 'Stripe/PayPal integration',
        icon: <Cpu className="w-5 h-5" />,
        color: 'text-info',
        status: 'active' as const
      },
      {
        id: 'kyc-provider',
        label: 'KYC Provider',
        description: 'Onfido verification',
        icon: <FileText className="w-5 h-5" />,
        color: 'text-warning',
        status: 'active' as const
      }
    ]
  };

  // Data flows
  const flows = {
    buyer: [
      { from: 'buyer-ui', to: 'escrow-engine', label: 'Payment' },
      { from: 'escrow-engine', to: 'payment-gateway', label: 'Capture' },
      { from: 'buyer-ui', to: 'escrow-engine', label: 'Confirm Delivery' }
    ],
    seller: [
      { from: 'escrow-engine', to: 'commission', label: 'Calculate' },
      { from: 'commission', to: 'seller-ui', label: 'Display Earnings' },
      { from: 'seller-ui', to: 'fraud-prevention', label: 'Request Withdrawal' },
      { from: 'fraud-prevention', to: 'payment-gateway', label: 'Process Payout' }
    ],
    security: [
      { from: 'fraud-prevention', to: 'kyc-provider', label: 'Verify' },
      { from: 'fraud-prevention', to: 'database', label: 'Audit Log' },
      { from: 'monitoring', to: 'fraud-prevention', label: 'Alert' }
    ]
  };

  const renderNode = (node: ArchitectureNode, index: number) => {
    const isSelected = selectedNode === node.id;
    const isHighlighted = (activeFlow as string) === 'all' || 
      ((activeFlow as string) === 'buyer' && ['buyer-ui', 'escrow-engine', 'payment-gateway'].includes(node.id)) ||
      ((activeFlow as string) === 'seller' && ['seller-ui', 'escrow-engine', 'commission', 'fraud-prevention', 'payment-gateway'].includes(node.id)) ||
      ((activeFlow as string) === 'security' && ['fraud-prevention', 'kyc-provider', 'database', 'monitoring'].includes(node.id));

    return (
      <div
        key={node.id}
        onClick={() => setSelectedNode(isSelected ? null : node.id)}
        className={`
          relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300
          ${isSelected ? 'border-purple-500 bg-primary/10 shadow-lg scale-105' : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'}
          ${!isHighlighted && activeFlow !== 'all' ? 'opacity-30' : 'opacity-100'}
        `}
      >
        {/* Status indicator */}
        <div className="absolute -top-2 -right-2">
          {node.status === 'active' && (
            <div className="w-4 h-4 bg-success rounded-full border-2 border-white animate-pulse" />
          )}
          {node.status === 'processing' && (
            <div className="w-4 h-4 bg-info rounded-full border-2 border-white">
              <div className="absolute inset-0 bg-info rounded-full animate-ping opacity-75" />
            </div>
          )}
          {node.status === 'completed' && (
            <CheckCircle2 className="w-4 h-4 text-success" />
          )}
        </div>

        {/* Icon */}
        <div className={`flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3 ${node.color}`}>
          {node.icon}
        </div>

        {/* Label */}
        <h3 className="font-semibold text-sm mb-1 text-foreground">{node.label}</h3>

        {/* Description (on hover or selected) */}
        {isSelected && (
          <p className="text-xs text-muted-foreground mt-2 animate-fadeIn">
            {node.description}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 text-brand-gradient">
          EZYIFY Escrow System Architecture
        </h1>
        <p className="text-muted-foreground">Interactive visualization of the complete system</p>
      </div>

      {/* Flow selector */}
      <div className="flex gap-2 mb-6 justify-center">
        <button
          onClick={() => setActiveFlow('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeFlow === 'all' 
              ? 'bg-primary/10 text-white shadow-md' 
              : 'bg-white text-muted-foreground border border-gray-200 hover:border-purple-300'
          }`}
        >
          All Systems
        </button>
        <button
          onClick={() => setActiveFlow('buyer')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeFlow === 'buyer' 
              ? 'bg-info text-white shadow-md' 
              : 'bg-white text-muted-foreground border border-gray-200 hover:border-info/40'
          }`}
        >
          Buyer Flow
        </button>
        <button
          onClick={() => setActiveFlow('seller')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeFlow === 'seller' 
              ? 'bg-primary/10 text-white shadow-md' 
              : 'bg-white text-muted-foreground border border-gray-200 hover:border-purple-300'
          }`}
        >
          Seller Flow
        </button>
        <button
          onClick={() => setActiveFlow('security')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeFlow === 'security' 
              ? 'bg-error text-white shadow-md' 
              : 'bg-white text-muted-foreground border border-gray-200 hover:border-error/40'
          }`}
        >
          Security Flow
        </button>
      </div>

      {/* Architecture layers */}
      <div className="space-y-6">
        {/* Presentation Layer */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-info rounded-full" />
            <h2 className="font-semibold text-foreground">Presentation Layer</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {layers.presentation.map((node, i) => renderNode(node, i))}
          </div>
        </div>

        {/* Business Logic Layer */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-primary/10 rounded-full" />
            <h2 className="font-semibold text-foreground">Business Logic Layer</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {layers.business.map((node, i) => renderNode(node, i))}
          </div>
        </div>

        {/* Data Layer */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-primary rounded-full" />
            <h2 className="font-semibold text-foreground">Data Layer</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {layers.data.map((node, i) => renderNode(node, i))}
          </div>
        </div>

        {/* External Services */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-cyan-500 rounded-full" />
            <h2 className="font-semibold text-foreground">External Services</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {layers.external.map((node, i) => renderNode(node, i))}
          </div>
        </div>
      </div>

      {/* Stats footer */}
      <div className="mt-8 grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-2xl text-center">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>
          <div className="text-2xl font-bold text-success">100%</div>
          <div className="text-xs text-success">System Health</div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl text-center">
          <div className="flex items-center justify-center mb-2">
            <Shield className="w-5 h-5 text-info" />
          </div>
          <div className="text-2xl font-bold text-info">4</div>
          <div className="text-xs text-info">Security Layers</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-2xl text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-primary">7</div>
          <div className="text-xs text-primary">Day Escrow Hold</div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-2xl text-center">
          <div className="flex items-center justify-center mb-2">
            <DollarSign className="w-5 h-5 text-warning" />
          </div>
          <div className="text-2xl font-bold text-warning">7%</div>
          <div className="text-xs text-warning">Platform Fee</div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-muted/50 rounded-xl">
        <h3 className="text-sm font-semibold text-foreground mb-2">Legend</h3>
        <div className="flex gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
            <span>Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-info rounded-full relative">
              <div className="absolute inset-0 bg-info rounded-full animate-ping opacity-75" />
            </div>
            <span>Processing</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3 text-success" />
            <span>Completed</span>
          </div>
        </div>
      </div>

      {/* Click instruction */}
      <p className="text-center text-xs text-muted-foreground mt-4">
        Click on any component to see details • Select flow to highlight data paths
      </p>
    </div>
  );
}
