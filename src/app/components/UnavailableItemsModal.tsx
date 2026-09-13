import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  PackageX, 
  TrendingDown, 
  Trash2, 
  Edit3, 
  AlertTriangle,
  Heart,
  ArrowRight
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';

export interface UnavailableItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  available: number;
  reason: 'OUT_OF_STOCK' | 'INSUFFICIENT_QUANTITY' | 'PRICE_CHANGED' | 'SELLER_INACTIVE';
  oldPrice?: number;
  newPrice?: number;
  sellerId?: string;
  sellerName?: string;
}

interface UnavailableItemsModalProps {
  isOpen: boolean;
  items: UnavailableItem[];
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onRemoveAll: () => void;
  onMoveToWishlist: (itemId: string) => void;
  onContinue: () => void;
  onViewCart: () => void;
}

export function UnavailableItemsModal({
  isOpen,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onRemoveAll,
  onMoveToWishlist,
  onContinue,
  onViewCart
}: UnavailableItemsModalProps) {
  
  const outOfStockItems = items.filter(item => item.reason === 'OUT_OF_STOCK');
  const insufficientItems = items.filter(item => item.reason === 'INSUFFICIENT_QUANTITY');
  const priceChangedItems = items.filter(item => item.reason === 'PRICE_CHANGED');
  const sellerInactiveItems = items.filter(item => item.reason === 'SELLER_INACTIVE');

  const canContinue = items.every(item => 
    item.reason === 'INSUFFICIENT_QUANTITY' || 
    item.reason === 'PRICE_CHANGED'
  );

  const getItemStatusBadge = (reason: UnavailableItem['reason']) => {
    switch (reason) {
      case 'OUT_OF_STOCK':
        return <Badge variant="destructive" className="gap-1"><PackageX className="w-3 h-3" /> Out of Stock</Badge>;
      case 'INSUFFICIENT_QUANTITY':
        return <Badge variant="secondary" className="gap-1 bg-warning/10 text-warning"><TrendingDown className="w-3 h-3" /> Limited Stock</Badge>;
      case 'PRICE_CHANGED':
        return <Badge variant="secondary" className="gap-1 bg-info/10 text-info"><AlertTriangle className="w-3 h-3" /> Price Updated</Badge>;
      case 'SELLER_INACTIVE':
        return <Badge variant="secondary" className="gap-1 bg-muted text-foreground"><PackageX className="w-3 h-3" /> Seller Unavailable</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onViewCart()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col" aria-describedby={undefined}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-warning" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                {items.length === 1 ? '1 Item' : `${items.length} Items`} Needs Your Attention
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Some items in your cart are no longer available as requested
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Alert Summary */}
        <Alert className="border-warning/30 bg-warning/5">
          <AlertDescription className="text-sm text-warning">
            {outOfStockItems.length > 0 && (
              <span className="font-medium">{outOfStockItems.length} out of stock</span>
            )}
            {outOfStockItems.length > 0 && insufficientItems.length > 0 && ' · '}
            {insufficientItems.length > 0 && (
              <span className="font-medium">{insufficientItems.length} limited availability</span>
            )}
            {(outOfStockItems.length > 0 || insufficientItems.length > 0) && priceChangedItems.length > 0 && ' · '}
            {priceChangedItems.length > 0 && (
              <span className="font-medium">{priceChangedItems.length} price changed</span>
            )}
          </AlertDescription>
        </Alert>

        {/* Scrollable Items List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {items.map((item) => (
            <div key={item.id} className="border rounded-2xl p-4 space-y-3">
              {/* Item Header */}
              <div className="flex gap-3">
                <div className="relative">
                  <img
                      loading="lazy" 
                    src={item.image} 
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl"
                  />
                  {(item.reason === 'OUT_OF_STOCK' || item.reason === 'SELLER_INACTIVE') && (
                    <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                      <PackageX className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate mb-1">{item.name}</h4>
                  <div className="flex items-center gap-2 mb-2">
                    {getItemStatusBadge(item.reason)}
                  </div>
                  
                  {/* Reason-specific details */}
                  {item.reason === 'INSUFFICIENT_QUANTITY' && (
                    <p className="text-sm text-muted-foreground">
                      You want <span className="font-medium">{item.quantity}</span>, 
                      only <span className="font-medium text-warning">{item.available}</span> available
                    </p>
                  )}
                  
                  {item.reason === 'PRICE_CHANGED' && item.newPrice && item.oldPrice && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{item.oldPrice.toLocaleString()}
                      </span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm font-semibold text-primary">
                        ₹{item.newPrice.toLocaleString()}
                      </span>
                      {item.newPrice > item.oldPrice ? (
                        <Badge variant="destructive" className="text-xs">
                          +₹{(item.newPrice - item.oldPrice).toLocaleString()}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs bg-success/10 text-success">
                          Save ₹{(item.oldPrice - item.newPrice).toLocaleString()}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {item.reason === 'OUT_OF_STOCK' && (
                    <p className="text-sm text-error font-medium">
                      Currently unavailable
                    </p>
                  )}
                  
                  {item.reason === 'SELLER_INACTIVE' && (
                    <p className="text-sm text-muted-foreground">
                      {item.sellerName} is temporarily unavailable
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {item.reason === 'INSUFFICIENT_QUANTITY' && item.available > 0 && (
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={() => onUpdateQuantity(item.id, item.available)}
                    className="flex-1"
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    Update to {item.available}
                  </Button>
                )}
                
                {item.reason === 'PRICE_CHANGED' && (
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={() => onContinue()}
                    className="flex-1"
                  >
                    Accept New Price
                  </Button>
                )}
                
                {(item.reason === 'OUT_OF_STOCK' || item.reason === 'SELLER_INACTIVE') && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onMoveToWishlist(item.id)}
                    className="flex-1"
                  >
                    <Heart className="w-3 h-3 mr-1" />
                    Move to Wishlist
                  </Button>
                )}
                
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => onRemoveItem(item.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Footer Actions */}
        <DialogFooter className="flex-col sm:flex-row gap-3">
          <div className="flex gap-3 flex-1">
            <Button 
              variant="outline" 
              onClick={onRemoveAll}
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove All
            </Button>
            <Button 
              variant="outline" 
              onClick={onViewCart}
              className="flex-1"
            >
              Review Cart
            </Button>
          </div>
          {canContinue && (
            <Button 
              onClick={onContinue}
              className="flex-1"
              size="lg"
            >
              Continue to Checkout
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}