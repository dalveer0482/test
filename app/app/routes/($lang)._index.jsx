import { defer } from '@shopify/remix-oxygen';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { Await, useLoaderData } from '@remix-run/react';
import { ProductSwimlane, FeaturedCollections, Hero, Heading, Section, Grid, Link } from '~/components';
import { MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT } from '~/data/fragments';
import { getHeroPlaceholder } from '~/lib/placeholders';
import { seoPayload } from '~/lib/seo.server';
import { AnalyticsPageType, Image } from '@shopify/hydrogen';
import { routeHeaders, CACHE_SHORT } from '~/data/cache';
export const headers = routeHeaders;

import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';



export async function loader({request, params, context }) {
  const { language, country } = context.storefront.i18n;
  const searchpara = new URLSearchParams(new URL(request.url).searchParams);
  const filtertag = searchpara.get("tag") ? `tag:${searchpara.get("tag")}` : 'tag:test'
  //const minisearchTerm = searchpara.get("miniSearch") ? `miniSearch:${searchpara.get("miniSearch")}` : 'miniSearch'
  console.log(filtertag);
  if (
    params.lang &&
    params.lang.toLowerCase() !== `${language}-${country}`.toLowerCase()
  ) {
    // If the lang URL param is defined, yet we still are on `EN-US`
    // the the lang param must be invalid, send to the 404 page
    throw new Response(null, { status: 404 });
  }
  const { shop, hero } = await context.storefront.query(HOMEPAGE_SEO_QUERY, {
    variables: { handle: 'kitchen' },
  });
  
  const seo = seoPayload.home();
  return defer(
    {
      shop,
      primaryHero: hero,
      // These different queries are separated to illustrate how 3rd party content
      // fetching can be optimized for both above and below the fold.
      featuredProducts: context.storefront.query(
        HOMEPAGE_FEATURED_PRODUCTS_QUERY,
        {
          variables: {
            filtertag,
            /**
             * Country and language properties are automatically injected
             * into all queries. Passing them is unnecessary unless you
             * want to override them from the following default:
             */
            country,
            language,
          },
        },
      ),
      featuredCollections:  context.storefront.query(
        FEATURED_COLLECTIONS_QUERY,
        {
          variables: {
            
            country,
            language,
          },
        },
      ),
      secondaryHero: context.storefront.query(COLLECTION_HERO_QUERY, {
        variables: {
          handle: 'artifacts',
          country,
          language,
        },
      }),
      tertiaryHero1: context.storefront.query(COLLECTION_HERO_QUERY, {
        variables: {
          handle: 'cleansers-toners',
          country,
          language,
        },
      }),
      
      metas: context.storefront.query(META_OBJECT,
        {
          variables: {
            country,
            language,
          },
        },
      ),
      tertiaryHero: context.storefront.query(COLLECTION_HERO_QUERY, {
        variables: {
          handle: 'kitchen1',
          country,
          language,
        },
      }),
      analytics: {
        pageType: AnalyticsPageType.home,
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
export function Metas({ data }) {
 
  // Promise.resolve(data).then(function (data) {
  //console.log(data.nodes[0].collection.references.edges)
  //   fdata = data;
  const haveCollections = data.nodes[0].collection.references.edges && data.nodes[0].collection.references.edges.length > 0;
  if (!haveCollections) return null;

  const items = data.nodes[0].collection.references.edges.filter((item) => item.node.image).length;

  return (
    <Section className={"relative"}>
         
<div className="relative max-w-screen-2xl	mx-auto">
            <Swiper
      // install Swiper modules
      modules={[Navigation, Pagination, Scrollbar, A11y]}
      spaceBetween={50}
      slidesPerView={3}
      navigation
      pagination={{ clickable: true }}
      scrollbar={{ draggable: true }}
      // onSwiper={(swiper) => console.log(swiper)}
      // onSlideChange={() => console.log('slide change')}
    >
    
        {data.nodes[0].collection.references.edges.map((collection) => {
          
          return (<><SwiperSlide   key={collection.id}>
           
              <div className="relative">
              <Link key={collection.node.id} to={`/collections/${collection.node.handle}`}>
                <div className="relative	">
                  {collection?.node.image && (
                    <Image
                      alt={`Image of ${collection.node.title}`}
                      data={collection.node.image}
                      sizes=""
                      aspectratio=""
                    />
                  )}
                </div>
               
                <Heading size="copy">{collection.node.title}</Heading>
                </Link>
              </div>
           
            </SwiperSlide>
     
    
   
    
            </>
          );
        })}
   
   </Swiper>
   </div>
    </Section>
  );
  // })

}
export default function Homepage() {
  const {
    primaryHero,
    secondaryHero,
    tertiaryHero,
    tertiaryHero1,
    featuredCollections,
    featuredProducts,
    metas,
  } = useLoaderData();

 

  // TODO: skeletons vs placeholders
  const skeletons = getHeroPlaceholder([{}, {}, {}]);

  return (
    <>
      {primaryHero && (
        <Hero {...primaryHero} height="full" top loading="eager" />
      )}

      {featuredProducts && (
        <Suspense>
          <Await resolve={featuredProducts}>
            {({ products }) => {

              if (!products?.nodes) return <></>;
              return (
                <ProductSwimlane
                  products={products.nodes}
                  title="Featured Products"
                  count={4}
                />
              );
            }}
          </Await>
        </Suspense>
      )}

      {metas && (
        <Suspense>
          <Await resolve={metas}>
            {({ metas }) => {
              if (!metas) return <></>;
              return <Metas data={metas} />;
            }}

          </Await>
        </Suspense>
      )}
      {secondaryHero && (
        <Suspense fallback={<Hero {...skeletons[1]} />}>
          <Await resolve={secondaryHero}>
            {({ hero }) => {
              if (!hero) return <></>;
              return <Hero {...hero} />;
            }}
          </Await>
        </Suspense>
      )}
      {tertiaryHero1 && (
        <Suspense fallback={<Hero {...skeletons[2]} />}>
          <Await resolve={tertiaryHero1}>
            {({ hero }) => {
              if (!hero) return <></>;
              return <Hero {...hero} />;
            }}
          </Await>
        </Suspense>
      )}
      {featuredCollections && (
        <Suspense>
          <Await resolve={featuredCollections}>
            {({ collections }) => {
              if (!collections?.nodes) return <></>;
              return (
                <FeaturedCollections
                  collections={collections.nodes}
                  title="Collections"
                />
              );
            }}
          </Await>
        </Suspense>
      )}

      {tertiaryHero && (
        <Suspense fallback={<Hero {...skeletons[2]} />}>
          <Await resolve={tertiaryHero}>
            {({ hero }) => {
              if (!hero) return <></>;
              return <Hero {...hero} />;
            }}
          </Await>
        </Suspense>
      )}

    </>
  );
}

const META_OBJECT = `#graphql
  query metaobjects($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    metas: metaobjects(type: "test", first: 10) {
      nodes {
           collection: field(key: "collection"){references(first: 5)
          {
            edges
             {
              node {
              ... on Collection {id title handle image{url}}
              }
            }
         }
        }
        
      }
    }
}`;
const COLLECTION_CONTENT_FRAGMENT = `#graphql
  ${MEDIA_FRAGMENT}
  fragment CollectionContent on Collection {
    id
    handle
    title
    descriptionHtml
    heading: metafield(namespace: "hero", key: "title") {
      value
    }
    byline: metafield(namespace: "hero", key: "byline") {
      value
    }
    cta: metafield(namespace: "hero", key: "cta") {
      value
    }
    spread: metafield(namespace: "hero", key: "spread") {
      reference {
        ...Media
      }
    }
    spreadSecondary: metafield(namespace: "hero", key: "spread_secondary") {
      reference {
        ...Media
      }
    }
  }
`;

const HOMEPAGE_SEO_QUERY = `#graphql
  ${COLLECTION_CONTENT_FRAGMENT}
  query collectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    hero: collection(handle: $handle) {
      ...CollectionContent
    }
    shop {
      name
      description
    }
  }
`;

const COLLECTION_HERO_QUERY = `#graphql
  ${COLLECTION_CONTENT_FRAGMENT}
  query collectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    hero: collection(handle: $handle) {
      ...CollectionContent
    }
  }
`;

// @see: https://shopify.dev/api/storefront/2023-04/queries/products
export const HOMEPAGE_FEATURED_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query homepageFeaturedProducts($country: CountryCode, $language: LanguageCode, $filtertag: String)
  @inContext(country: $country, language: $language) {
    products(first: 8,   query: $filtertag) {
      nodes {
        ...ProductCard
      }
    }
  }
`;

// @see: https://shopify.dev/api/storefront/2023-04/queries/collections
export const FEATURED_COLLECTIONS_QUERY = `#graphql
  query homepageFeaturedCollections($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collections(
      first: 4,
    ) {
      nodes {
        id
        title
        handle
        image {
          altText
          width
          height
          url
        }
      }
    }
  }
`;
export const META_OBJECT___a = `#graphql
  query metaobjects($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    metaobjects(type: "test", first: 10) {
      nodes {
        handle
        type
        fields{
          key 
          type 
          value
          reference
               {
              ... on MediaImage{previewImage{url}}
              ... on Page{handle id title seo{title description} body bodySummary}
               }
              references(first: 5)
              {
                edges
                 {
                  node {
                  ... on Product {id title handle}
                  ... on ProductVariant{id }
                  ... on Collection {id title handle image { altText width height url } }
                  }
                }
             }    
        }
      }
    }
    
}`;

export const META_OBJECT____ba = `#graphql
  query metaobjects($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    metaobjects(type: "test", first: 10) {
      nodes {
        handle
        type
        text: field(key: "text") { value }
        description: field(key: "desc") { value }
        richtext: field(key: "richtext") { value }
        image: field(key: "image"){
          reference
               {
              ... on MediaImage{previewImage{url}
            }
              }
            }
         product: field(key: "product"){
          references(first: 5)
          {
            edges
             {
              node {
              ... on Product {id title handle}
              }
            }
         }
        }
        pvariant: field(key: "pvariant"){
          references(first: 5)
          {
            edges
             {
              node {
              ... on ProductVariant{id  }
              }
            }
         }
        }
        page: field(key: "page"){reference
          {
         ... on Page{handle id title seo{title description} body bodySummary}
         }
       }
        collection: field(key: "collection"){references(first: 5)
          {
            edges
             {
              node {
              ... on Collection {id title handle image{url}}
              }
            }
         }
        }
        color: field(key: "color"){value}
        checked: field(key: "checked"){value}
        url: field(key: "url"){value}
      }
    }
}`;