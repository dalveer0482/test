import { defer } from '@shopify/remix-oxygen';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useMatches,
  useRouteError,
} from '@remix-run/react';
import { ShopifySalesChannel, Seo } from '@shopify/hydrogen';
import { Layout } from '~/components';
import { GenericError } from './components/GenericError';
import { NotFound } from './components/NotFound';
import styles from './styles/app.css';
import styles1 from './styles/custom_css.css';
import favicon from '../public/favicon.svg';
import { seoPayload } from '~/lib/seo.server';
import { DEFAULT_LOCALE, parseMenu, getCartId } from './lib/utils';
import invariant from 'tiny-invariant';
import swipercss from 'swiper/css';
import swipercss1 from 'swiper/css/navigation';
import swipercss2 from 'swiper/css/pagination';
import swipercss3 from 'swiper/css/scrollbar';
import { useAnalytics } from './hooks/useAnalytics';
export const links = () => {
  return [
    { rel: 'stylesheet', href: styles },
    { rel: 'stylesheet', href: styles1 },
    { rel: "stylesheet", href: swipercss },
    { rel: "stylesheet", href: swipercss1 },
    { rel: "stylesheet", href: swipercss2 },
    { rel: "stylesheet", href: swipercss3 },
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    { rel: 'icon', type: 'image/svg+xml', href: favicon },
  ];
};

export async function loader({ request, context }) {
  const cartId = getCartId(request);
  const searchpara = new URLSearchParams(new URL(request.url).searchParams);
  const searchTerms = searchpara.get("miniSearch") ? `miniSearch:${searchpara.get("miniSearch")}` : ''
  // console.log(searchTerms);

  const [customerAccessToken, layout] = await Promise.all([
    context.session.get('customerAccessToken'),
    getLayoutData(context),
  ]);
  //const [searchDatat] = await Promise.all([
  // const searchDatat = getsearchData(context, searchTerms);
  //]);

  const seo = seoPayload.root({ shop: layout.shop, url: request.url });

  return defer({
    isLoggedIn: Boolean(customerAccessToken),
    layout,
    // searchDatat,

    selectedLocale: context.storefront.i18n,
    cart: cartId ? getCart(context, cartId) : undefined,
    analytics: {
      shopifySalesChannel: ShopifySalesChannel.hydrogen,
      shopId: layout.shop.id,
    },
    seo,

  });
}

export default function App() {
  const data = useLoaderData();
  const locale = data.selectedLocale ?? DEFAULT_LOCALE;
  const hasUserConsent = true;

  useAnalytics(hasUserConsent, locale);
  //console.log(data);
  return (
    <html lang={locale.language}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Seo />
        <Meta />
        <Links />

      </head>
      <body>
        <Layout
          layout={data.layout}
          key={`${locale.language}-${locale.country}`}
        >
          <Outlet />
        </Layout>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }) {
  const [root] = useMatches();
  const locale = root?.data?.selectedLocale ?? DEFAULT_LOCALE;
  const routeError = useRouteError();
  const isRouteError = isRouteErrorResponse(routeError);

  let title = 'Error';
  let pageType = 'page';

  if (isRouteError) {
    title = 'Not found';
    if (routeError.status === 404) pageType = routeError.data || pageType;
  }

  return (
    <html lang={locale.language}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>{title}</title>
        <Meta />
        <Links />
      </head>
      <body>
        <Layout
          layout={root?.data?.layout}
          key={`${locale.language}-${locale.country}`}
        >
          {isRouteError ? (
            <>
              {routeError.status === 404 ? (
                <NotFound type={pageType} />
              ) : (
                <GenericError
                  error={{ message: `${routeError.status} ${routeError.data}` }}
                />
              )}
            </>
          ) : (
            <GenericError error={error instanceof Error ? error : undefined} />
          )}
        </Layout>
        <Scripts />
      </body>
    </html>
  );
}
// const SEARCH_QUERY = `
// #graphql
//   query search(
//     $language: LanguageCode
//     $searchTerms: String
//   ) @inContext(language: $language) {
//         productsaa: products(query: $searchTerms, first: 5) {
//       nodes {

//         title id
//       }
//     }
//   }
// `;
// async function getsearchData({storefront, searchTerms}) {
//   const searchTermss = searchTerms;
//   const seachdata = await storefront.query(SEARCH_QUERY, {
//   variables: {
//     searchTerms: `${searchTerms}`,
//     language: storefront.i18n.language,
//   },
// });

// invariant(seachdata, 'No data returned from Shopify API');
// return {search: {searchTermss2: searchTermss, searchTermss1: seachdata}};
// }
const LAYOUT_QUERY = `
#graphql
  query layoutMenus(
    $language: LanguageCode
    $headerMenuHandle: String!
    $footerMenuHandle: String!
   
  ) @inContext(language: $language) {
    shop {
      id
      name
      description
      primaryDomain {
        url
      }
      brand {
       logo {
         image {
          url
         }
       }
     }
    }
    
    headerMenu: menu(handle: $headerMenuHandle) {
      id
      items {
        ...MenuItem
        items {
          ...MenuItem
        }
      }
    }
    metas: metaobjects(type: "test", first: 10) {
      nodes {
        annousementText: field(key: "annousement_bar") { value }
        annousementTimer: field(key: "annousement_bar_timer") { value }
         
        
      }
    }
    footerMenu: menu(handle: $footerMenuHandle) {
      id
      items {
        ...MenuItem
        items {
          ...MenuItem
        }
      }
    }
 
  }
  
  fragment MenuItem on MenuItem {
    id
    resourceId
    tags
    title
    type
    url
  }
`;


async function getLayoutData({ storefront }) {
  const HEADER_MENU_HANDLE = 'menu-header';
  const FOOTER_MENU_HANDLE = 'footer';

  const data = await storefront.query(LAYOUT_QUERY, {
    variables: {

      headerMenuHandle: HEADER_MENU_HANDLE,
      footerMenuHandle: FOOTER_MENU_HANDLE,
      language: storefront.i18n.language,
    },
  });

  invariant(data, 'No data returned from Shopify API');

  /*
        Modify specific links/routes (optional)
        @see: https://shopify.dev/api/storefront/unstable/enums/MenuItemType
        e.g here we map:
          - /blogs/news -> /news
          - /blog/news/blog-post -> /news/blog-post
          - /collections/all -> /products
      */
  const customPrefixes = { BLOG: '', CATALOG: 'products' };

  const headerMenu = data?.headerMenu
    ? parseMenu(data.headerMenu, customPrefixes)
    : undefined;

  const footerMenu = data?.footerMenu
    ? parseMenu(data.footerMenu, customPrefixes)
    : undefined;
const metass = data.metas

  return { shop: data.shop, headerMenu, footerMenu, metass};
}

const CART_QUERY = `#graphql
  query CartQuery($cartId: ID!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    cart(id: $cartId) {
      ...CartFragment
    }
  }

  fragment CartFragment on Cart {
    id
    checkoutUrl
    totalQuantity
    buyerIdentity {
      countryCode
      customer {
        id
        email
        firstName
        lastName
        displayName
      }
      email
      phone
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          attributes {
            key
            value
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
            amountPerQuantity {
              amount
              currencyCode
            }
            compareAtAmountPerQuantity {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              availableForSale
              compareAtPrice {
                ...MoneyFragment
              }
              price {
                ...MoneyFragment
              }
              requiresShipping
              title
              image {
                ...ImageFragment
              }
              product {
                handle
                title
                id
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
    cost {
      subtotalAmount {
        ...MoneyFragment
      }
      totalAmount {
        ...MoneyFragment
      }
      totalDutyAmount {
        ...MoneyFragment
      }
      totalTaxAmount {
        ...MoneyFragment
      }
    }
    note
    attributes {
      key
      value
    }
    discountCodes {
      code
    }
  }

  fragment MoneyFragment on MoneyV2 {
    currencyCode
    amount
  }

  fragment ImageFragment on Image {
    id
    url
    altText
    width
    height
  }
`;
export async function getCart({ storefront }, cartId) {
  invariant(storefront, 'missing storefront client in cart query');

  const { cart } = await storefront.query(CART_QUERY, {
    variables: {
      cartId,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
    cache: storefront.CacheNone(),
  });
  console.log(cart);
  return cart;
}


// export async function getSearch({storefront}) {
//   invariant(storefront, 'missing storefront client in search query');

//   const {search} = await storefront.query(FILMS_QUERY, {
//     variables: {
//        country: storefront.i18n.country,
//       language: storefront.i18n.language,
//     },
//     cache: storefront.CacheNone(),
//   });

//   return search;
// }