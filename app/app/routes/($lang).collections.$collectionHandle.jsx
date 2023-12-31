import {json} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import {flattenConnection, AnalyticsPageType} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';
import {PageHeader, Section, Text, SortFilter} from '~/components';
import {ProductGrid} from '~/components/ProductGrid';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {CACHE_SHORT, routeHeaders} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';

import { useState } from 'react';
// const [variant_handle, setVariant_handle] = useState([{data: "sdhsjhd", mssm: "asasjkajskj"}]);
// console.log(variant_handle);

export const headers = routeHeaders;
const PAGINATION_SIZE = 48;

export async function loader({params, request, context}) {

   
  const {collectionHandle} = params;
  invariant(collectionHandle, 'Missing collectionHandle param');
  const searchParams = new URL(request.url).searchParams;
  const knownFilters = ['productVendor', 'productType'];
  const available = 'available';
  const variantOption = 'variantOption';
  const {sortKey, reverse} = getSortValuesFromParam(searchParams.get('sort'));
  const cursor = searchParams.get('cursor');
  const filters = [];
  const appliedFilters = [];
  for (const [key, value] of searchParams.entries()) {
    if (available === key) {
      filters.push({available: value === 'true'});
      appliedFilters.push({
        label: value === 'true' ? 'In stock' : 'Out of stock',
        urlParam: {
          key: available,
          value,
        },
      });
    } else if (knownFilters.includes(key)) {
      filters.push({[key]: value});
      appliedFilters.push({label: value, urlParam: {key, value}});
    } else if (key.includes(variantOption)) {
      const [name, val] = value.split(':');
      filters.push({variantOption: {name, value: val}});
      appliedFilters.push({label: val, urlParam: {key, value}});
    }
  }
  // Builds min and max price filter since we can't stack them separately into
  // the filters array. See price filters limitations:
  // https://shopify.dev/custom-storefronts/products-collections/filter-products#limitations
  if (searchParams.has('minPrice') || searchParams.has('maxPrice')) {
    const price = {};
    if (searchParams.has('minPrice')) {
      price.min = Number(searchParams.get('minPrice')) || 0;
      appliedFilters.push({
        label: `Min: $${price.min}`,
        urlParam: {key: 'minPrice', value: searchParams.get('minPrice')},
      });
    }
    if (searchParams.has('maxPrice')) {
      price.max = Number(searchParams.get('maxPrice')) || 0;
      appliedFilters.push({
        label: `Max: $${price.max}`,
        urlParam: {key: 'maxPrice', value: searchParams.get('maxPrice')},
      });
    }
    filters.push({
      price,
    });
  }

 

  const selectedOptions = [{"name": "Color", "value": "Blue"},{"name": "Size", "value": "XL"}];
  const {product} = await context.storefront.query(PRODUCT_QUERY, {
    variables: {
      handle: "lennox-hoodie",
      selectedOptions,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  },
  );



  const {collection, collections} = await context.storefront.query(
    COLLECTION_QUERY,
    {
      variables: {
        handle: collectionHandle,
        pageBy: PAGINATION_SIZE,
        cursor,
        filters,
        sortKey,
        reverse,
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
    },
  );
  if (!collection) {
    throw new Response('collection', {status: 404});
  }
  const collectionNodes = flattenConnection(collections);
  const seo = seoPayload.collection({collection, url: request.url});
  return json(
    {product,
      collection,
      appliedFilters,
      collections: collectionNodes,
      analytics: {
        pageType: AnalyticsPageType.collection,
        collectionHandle,
        resourceId: collection.id,
      },
      seo,
    },
    {
      headers: {
        'Cache-Control': CACHE_SHORT,
      },
    },
  );
}
export default function Collection() {
  
  const {collection, collections, appliedFilters, product} = useLoaderData();
  return (
    <>
      <PageHeader heading={collection.title}>
        {collection?.description && (
          <div className="flex items-baseline justify-between w-full">
            <div>
           
            {collection.spread && (
          <img
            src={collection?.spread?.reference?.previewImage.url}
            aspectRatio="6/4"
            sizes="(max-width: 32em) 100vw, 45vw"
            
          />
        )} 
              <div className='max-w-[50%] mx-auto'>
                {collection.description}
              </div>
            </div>
          </div>
        )}
      </PageHeader>
      <Section>
        <SortFilter
          filters={collection.products.filters}
          appliedFilters={appliedFilters}
          collections={collections}
        >
          <ProductGrid
            key={collection.id}
            collection={collection}
            url={`/collections/${collection.handle}`}
            data-test="product-grid"
           
          />
        </SortFilter>
      </Section>
    </>
  );
}
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query CollectionDetails(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $pageBy: Int!
    $cursor: String
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys!
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      seo {
        description
        title
      }
      spread: metafield(namespace: "hero", key: "spread") {
        reference {
          ... on MediaImage{
            previewImage{url}
          }
        }
      }
      image {
        id
        url
        width
        height
        altText
      }
      products(
        first: $pageBy,
        after: $cursor,
        filters: $filters,
        sortKey: $sortKey,
        reverse: $reverse
      ) {
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
        nodes {
          ...ProductCard
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
    collections(first: 100) {
      edges {
        node {
          title
          handle
        }
      }
    }
  }
`;
function getSortValuesFromParam(sortParam) {
  switch (sortParam) {
    case 'price-high-low':
      return {
        sortKey: 'PRICE',
        reverse: true,
      };
    case 'price-low-high':
      return {
        sortKey: 'PRICE',
        reverse: false,
      };
    case 'best-selling':
      return {
        sortKey: 'BEST_SELLING',
        reverse: false,
      };
    case 'newest':
      return {
        sortKey: 'CREATED',
        reverse: true,
      };
    case 'featured':
      return {
        sortKey: 'MANUAL',
        reverse: false,
      };
    default:
      return {
        sortKey: 'RELEVANCE',
        reverse: false,
      };
  }
}



const PRODUCT_VARIANT_FRAGMENT = `#graphql

selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions) {
  ...ProductVariantFragment
}



  fragment ProductVariantFragment on ProductVariant {
    id
    availableForSale
    selectedOptions {
      name
      value
    }
    image {
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
  }
`;

const PRODUCT_QUERY = `#graphql
   query Product(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      vendor
      handle
      selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions) {
        id title
      }
    }
    
  }
`;