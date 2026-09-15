import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { useAuth, useSellerProductMutation } from '@ezyify/core';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO, SEOConfigs } from '../../components/SEO';
import { ProductForm, emptyProductForm, productServerErrors } from '../../components/seller/ProductForm';

/** `POST /seller/products` — drafts stay owner-only until published. */
export default function AddProductPage() {
  const navigate = useNavigate();
  const status = useAuth(s => s.status);
  const mutation = useSellerProductMutation();
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === 'anonymous') navigate('/login', { replace: true, state: { next: '/seller/add-product' } });
  }, [status, navigate]);

  return (
    <SellerLayout>
      <SEO {...SEOConfigs.addProduct} />
      <ProductForm
        mode="create"
        initial={emptyProductForm}
        saving={mutation.isPending}
        serverErrors={serverErrors}
        onSubmit={body => {
          setServerErrors({});
          mutation.mutate(
            { action: 'create', body },
            {
              onSuccess: r => {
                if ('published' in r) toast.success(r.published ? `${r.name} is live in your store` : `${r.name} saved as a draft`);
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
    </SellerLayout>
  );
}
