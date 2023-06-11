import clsx from 'clsx';
import { flattenConnection, Image, Money, useMoney } from '@shopify/hydrogen';
import { Text, Link, AddToCartButton } from '~/components';
import { isDiscounted, isNewArrival } from '~/lib/utils';
import { getProductPlaceholder } from '~/lib/placeholders';
import { Form, PrefetchPageLinks } from "@remix-run/react";

export function ProductCard({
  product,
  label,
  className,
  loading,
  onClick,
  quickAdd,
}) {
  function clkk(e){
      console.log(e.target.getAttribute("data-option_v"));
    console.log(e.target.getAttribute("data-option_n"));
    
    
  }
  function CForm(e){
    e.preventDefault();

  }
  
  let cardLabel;
  const cardProduct = product?.variants ? product : getProductPlaceholder();
  if (!cardProduct?.variants?.nodes?.length) return null;

  const firstVariant = flattenConnection(cardProduct.variants)[0];

  if (!firstVariant) return null;
  const { image, price, compareAtPrice } = firstVariant;

  if (label) {
    cardLabel = label;
  } else if (isDiscounted(price, compareAtPrice)) {
    cardLabel = 'Sale';
  } else if (isNewArrival(product.publishedAt)) {
    cardLabel = 'New';
  }

  const productAnalytics = {
    productGid: product.id,
    variantGid: firstVariant.id,
    name: product.title,
    variantName: firstVariant.title,
    brand: product.vendor,
    price: firstVariant.price.amount,
    quantity: 1,
  };

  return (
    <div className="flex flex-col gap-2">
      <Link
        onClick={onClick}
        to={`/products/${product.handle}`}
        prefetch="intent"
      >
        <div className={clsx('grid gap-4', className)}>
          <div className="card-image aspect-[4/5] bg-primary/5">
            {image && (
              <Image
                className="object-cover w-full fadeIn"
                sizes="(min-width: 64em) 25vw, (min-width: 48em) 30vw, 45vw"
                aspectRatio="4/5"
                data={image}
                alt={image.altText || `Picture of ${product.title}`}
                loading={loading}
              />
            )}
            <Text
              as="label"
              size="fine"
              className="absolute top-0 right-0 m-4 text-right text-notice"
            >
              {cardLabel}
            </Text>
          </div>
          <div className="grid gap-1">
            <Text
              className="w-full overflow-hidden whitespace-nowrap text-ellipsis "
              as="h3"
            >
              {product.title}
            </Text>
            
            <div className="flex gap-4">
              <Text className="flex gap-4">
                <Money withoutTrailingZeros data={price} />
                {isDiscounted(price, compareAtPrice) && (
                  <CompareAtPrice
                    className={'opacity-50'}
                    data={compareAtPrice}
                  />
                )}
              </Text>
            </div>

          </div>

        </div>
      </Link>
      {product?.options[0]?.values && (
        <div className='color__swatch'>
          <ul className='flex flex-row'>
            {(product?.options[0]?.values?.map((option) => {
              return (
                <li data-option_v={`${option}`} data-option_n={`${product.options[0].name}`} className={`pb-4 pt-4 px-4 bg-${option.toLowerCase()}`}   onClick={clkk} >
                  {option}
                </li>
              );
            }))}
          </ul>
        </div>
      )}
      {product?.options[1]?.values && (
        <div className='size__swatch'>
          <form method="post" action="" onSubmit={CForm}>
          <input type="hidden" name="searccccc" value={`${product.id}`} />
          <ul className='flex flex-row'>
            {(product?.options[1]?.values?.map((option) => {
              return (
                <li data-option_v={`${option}`} data-option_n={`${product.options[1].name}`} name="productId" value={`${product.options[1].id}`} className={`pb-2 pt-2 px-2 border border-primary/10`}  onClick={clkk}  >
                  {option}
                </li>
              );
            }))}
          </ul>
          <button>Add to Cart</button>
          </form>
        </div>
      )}
      {quickAdd && (
        <AddToCartButton
          lines={[
            {
              quantity: 1,
              merchandiseId: firstVariant.id,
            },
          ]}
          variant="secondary"
          className="mt-2"
          analytics={{
            products: [productAnalytics],
            totalValue: parseFloat(productAnalytics.price),
          }}
        >
          <Text as="span" className="flex items-center justify-center gap-2">
            Add to Bag
          </Text>
        </AddToCartButton>
      )}
    </div>
  );
}

function CompareAtPrice({ data, className }) {
  const { currencyNarrowSymbol, withoutTrailingZerosAndCurrency } =
    useMoney(data);

  const styles = clsx('strike', className);

  return (
    <span className={styles}>
      {currencyNarrowSymbol}
      {withoutTrailingZerosAndCurrency}
    </span>
  );
}
