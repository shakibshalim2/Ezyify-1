import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Link, useNavigate, useParams } from 'react-router';
import { useAuth, useSellerProduct, useSellerProductMutation } from '@ezyify/core';
import { Button } from '../../components/primitives/Button';
import { EmptyState } from '../../components/primitives/EmptyState';
import { Skeleton } from '../../components/primitives/Skeleton';
import { ConfirmDialog, type ConfirmState } from '../../components/ConfirmDialog';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO } from '../../components/SEO';
import { ProductForm, productToForm, productServerErrors } from '../../components/seller/ProductForm';
import { formErrors } from '../../lib/apiErrors';

function FormSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6" aria-busy="true" aria-label="Loading product">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-56 w-full rounded-card" />
          <Skeleton className="h-80 w-full rounded-card" />
          <Skeleton className="h-40 w-full rounded-card" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-28 w-full rounded-card" />
          <Skeleton className="h-40 w-full rounded-card" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/** `GET/PATCH/DELETE /seller/products/:id` — owner-scoped; products with order history archive instead of deleting. */
export default function EditProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const status = useAuth(s => s.status);
  const product = useSellerProduct(id);
  const mutation = useSellerProductMutation();
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  useEffect(() => {
    if (status === 'anonymous') navigate('/login', { replace: true, state: { next: `/seller/edit-product/${id}` } });
  }, [status, navigate, id]);

  const remove = () => {
    if (!product.data) return;
    const p = product.data;
    const hasSales = p.soldCount > 0;
    setConfirm({
      title: `${hasSales ? 'Archive' : 'Delete'} ${p.name}?`,
      message: hasSales
        ? 'This product has been ordered before, so it will be hidden from your store instead of removed. Past orders keep their details; you can publish it again later.'
        : 'This permanently removes the product, its variants and reviews. Shoppers who have it in their cart will lose it.',
      confirmLabel: hasSales ? 'Archive' : 'Delete',
      destructive: true,
      onConfirm: () =>
        mutation.mutate(
          { action: 'delete', id: p.id },
          {
            onSuccess: r => {
              toast.success('mode' in r && r.mode === 'archived' ? `${p.name} archived — it's hidden from shoppers` : `${p.name} deleted`);
              navigate('/seller/products');
            },
            onError: err => toast.error(formErrors(err).message ?? 'Could not delete the product'),
          },
        ),
    });
  };

  return (
    <SellerLayout>
      <SEO title={product.data ? `Edit ${product.data.name} — Ezyify Seller` : 'Edit Product — Ezyify Seller'} description="Edit product details in your Ezyify store." />
      {product.isLoading ? (
        <FormSkeleton />
      ) : product.isError || !product.data ? (
        <EmptyState
          kind="error"
          title="Couldn’t load this product"
          description={product.error ? (formErrors(product.error).message ?? 'It may have been removed, or it belongs to another store.') : 'It may have been removed, or it belongs to another store.'}
          action={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => product.refetch()}>Retry</Button>
              <Button asChild><Link to="/seller/products">Back to products</Link></Button>
            </div>
          }
        />
      ) : (
        <ProductForm
          key={product.data.updatedAt}
          mode="edit"
          product={product.data}
          initial={productToForm(product.data)}
          saving={mutation.isPending}
          serverErrors={serverErrors}
          onDelete={remove}
          onSubmit={body => {
            setServerErrors({});
            mutation.mutate(
              { action: 'update', id: product.data!.id, body },
              {
                onSuccess: () => {
                  toast.success('Product updated');
                  navigate('/seller/products');
                },
                onError: err => {
                  const errors = productServerErrors(err);
                  setServerErrors(errors);
                  toast.error(errors._ ?? 'Check the highlighted fields');
                },
              },
            );
          }}
        />
      )}
      <ConfirmDialog state={confirm} onClose={() => setConfirm(null)} />
    </SellerLayout>
  );
}
