import { json } from '@shopify/remix-oxygen';
import { useLoaderData } from '@remix-run/react';
import {
  Grid,
  Heading,
  PageHeader,
  Section,
  Link,
  Pagination,
  getPaginationVariables,
  Button,
} from '~/components';
import { getImageLoadingPriority } from '~/lib/const';
import { seoPayload } from '~/lib/seo.server';
import { CACHE_SHORT, routeHeaders } from '~/data/cache';
import { Image } from '@shopify/hydrogen';

const PAGINATION_SIZE = 8;

export const headers = routeHeaders;

export const loader = async ({ request, context: { storefront } }) => {
  const variables = getPaginationVariables(request, PAGINATION_SIZE);
  const { collections } = await storefront.query(COLLECTIONS_QUERY, {
    variables: {
      ...variables,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });
  const { metas } = await storefront.query(META_OBJECT, {
    variables: {
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });
  const seo = seoPayload.listCollections({
    collections,
    url: request.url,
  });

  return json(
    { collections, seo, metas },
    {
      headers: {
        'Cache-Control': CACHE_SHORT,
      },
    },
  );
};
export function TestM({ data }) {

  // Promise.resolve(data).then(function (data) {
  console.log(data)
  return (
    <Section className='bg-gradient-to-r from-purple-500 to-pink-500'>
      <div className='max-w-[1230px] px-[15px] mx-auto pb-[45px]'>
        <div class="items-center product-page-container flex lg:flex-nowrap flex-wrap w-full mx-auto mb-4 lg:mx-16 flex-row-reverse">
          <div class="video lg:w-[50%] w-full">
            {data.nodes[0]?.image && (
              <Image
                alt={`Image of`}
                data={data.nodes[0].image.reference.previewImage}
                sizes="(max-width: 32em) 100vw, 33vw"
                aspectRatio="3/2"
              />
            )}
          </div>
          <div class="text lg:w-[50%] lg:max-w-50%] px-[15px] py-[15px] lg:mb-0">
            <div class="lg:max-w-[350px]">
            <h3 class="heading-font text-[28px] uppercase title mb:2 font-bold">{data.nodes[0].text.value }</h3>
              <div dangerouslySetInnerHTML={{ __html: data.nodes[0].description.value }} />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );

}
export default function Collections() {
  const { collections, metas } = useLoaderData();

  return (
    <>

      <PageHeader heading="Collections" />
      <Section>
        <Pagination connection={collections}>
          {({
            endCursor,
            hasNextPage,
            hasPreviousPage,
            nextPageUrl,
            nodes,
            prevPageUrl,
            startCursor,
            nextLinkRef,
            isLoading,
          }) => (
            <>
              {hasPreviousPage && (
                <div className="flex items-center justify-center mt-6">
                  <Button
                    to={prevPageUrl}
                    variant="secondary"
                    width="full"
                    prefetch="intent"
                    disabled={!isLoading}
                    state={{
                      pageInfo: {
                        endCursor,
                        hasNextPage,
                        startCursor,
                      },
                      nodes,
                    }}
                  >
                    {isLoading ? 'Loading...' : 'Previous products'}
                  </Button>
                </div>
              )}
              <Grid
                items={nodes.length === 3 ? 3 : 2}
                data-test="collection-grid"
              >
                {nodes.map((collection, i) => (
                  <CollectionCard
                    collection={collection}
                    key={collection.id}
                    loading={getImageLoadingPriority(i, 2)}
                  />
                ))}
              </Grid>
              {hasNextPage && (
                <div className="flex items-center justify-center mt-6">
                  <Button
                    ref={nextLinkRef}
                    to={nextPageUrl}
                    variant="secondary"
                    width="full"
                    prefetch="intent"
                    disabled={!isLoading}
                    state={{
                      pageInfo: {
                        endCursor,
                        hasPreviousPage,
                        startCursor,
                      },
                      nodes,
                    }}
                  >
                    {isLoading ? 'Loading...' : 'Next products'}
                  </Button>
                </div>
              )}
            </>
          )}
        </Pagination>
      </Section>
      {metas && (
        <TestM data={metas} />
      )}
    </>
  );
}

function CollectionCard({ collection, loading }) {
  return (
    <Link to={`/collections/${collection.handle}`} className="grid gap-4">
      <div className="card-image bg-primary/5 aspect-[3/2]">
        {collection?.image && (
          <Image
            data={collection.image}
            aspectRatio="6/4"
            sizes="(max-width: 32em) 100vw, 45vw"
            loading={loading}
          />
        )}
      </div>
      <Heading as="h3" size="copy">
        {collection.title}
      </Heading>
    </Link>
  );
}
const META_OBJECT = `#graphql
  query metaobjects($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    metas: metaobjects(type: "test", first: 10) {
      nodes {
        text: field(key: "text") { value }
        description: field(key: "desc") { value }
        image: field(key: "image"){
                        reference
                            {
                            ... on MediaImage{
                              previewImage{url}
                            }
                            }
                            }
      }
    }
  }`;
const COLLECTIONS_QUERY = `#graphql
  query Collections(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        id
        title
        description
        handle
        seo {
          description
          title
        }
        image {
          id
          url
          width
          height
          altText
        }
        spread: metafield(namespace: "hero", key: "spread") {
          reference {
            ...Media
          }
        }
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
`;
