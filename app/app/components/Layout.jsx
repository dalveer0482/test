import { useIsHomePath } from '~/lib/utils';
import {
  Drawer,
  useDrawer,
  Text,
  Input,
  IconLogin,
  IconAccount,
  IconBag,
  IconSearch,
  Heading,
  IconMenu,
  IconCaret,
  Section,
  CountrySelector,
  Cart,
  CartLoading,
  Link,
  AnnousementBar
} from '~/components';
import { Image, Money, useMoney } from '@shopify/hydrogen';

import invariant from 'tiny-invariant';
import { PRODUCT_CARD_FRAGMENT } from '~/data/fragments';

// import {PAGINATION_SIZE} from '~/lib/const';


import { useParams, Form, Await, useMatches, useFetcher } from '@remix-run/react';
import { useWindowScroll } from 'react-use';
import { Disclosure } from '@headlessui/react';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useIsHydrated } from '~/hooks/useIsHydrated';
import { useCartFetchers } from '~/hooks/useCartFetchers';
export function Layout({ children, layout }) {
 // console.log(layout?.metass?.nodes[0]?.annousementText);
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <div className="">
          <a href="#mainContent" className="sr-only">
            Skip to content
          </a>
        </div>
        <AnnousementBar data={layout?.metass?.nodes[0]} />
        <Header
          title={layout?.shop.name ?? 'Hydrogen'}
          menu={layout?.headerMenu}
        />
        <main role="main" id="mainContent" className="flex-grow">
          {children}
        </main>
      </div>
      <Footer menu={layout?.footerMenu} />
    </>
  );
}
function Header({ title, menu }) {
  const isHome = useIsHomePath();
  const {
    isOpen: isCartOpen,
    openDrawer: openCart,
    closeDrawer: closeCart,
  } = useDrawer();
  const {
    isOpen: isMenuOpen,
    openDrawer: openMenu,
    closeDrawer: closeMenu,
  } = useDrawer();
  const addToCartFetchers = useCartFetchers('ADD_TO_CART');
  // toggle cart drawer when adding to cart
  useEffect(() => {
    if (isCartOpen || !addToCartFetchers.length) return;
    openCart();
  }, [addToCartFetchers, isCartOpen, openCart]);
  return (
    <>
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
      {menu && (
        <MenuDrawer isOpen={isMenuOpen} onClose={closeMenu} menu={menu} />
      )}
      <DesktopHeader
        isHome={isHome}
        title={title}
        menu={menu}
        openCart={openCart}
      />
      <MobileHeader
        isHome={isHome}
        title={title}
        openCart={openCart}
        openMenu={openMenu}
      />
    </>
  );
}
function CartDrawer({ isOpen, onClose }) {
  const [root] = useMatches();
  return (
    <Drawer open={isOpen} onClose={onClose} heading="Cart" openFrom="right">
      <div className="grid">
        <Suspense fallback={<CartLoading />}>
          <Await resolve={root.data?.cart}>
            {(cart) => <Cart layout="drawer" onClose={onClose} cart={cart} />}
          </Await>
        </Suspense>
      </div>
    </Drawer>
  );
}
export function MenuDrawer({ isOpen, onClose, menu }) {
  return (
    <Drawer open={isOpen} onClose={onClose} openFrom="left" heading="Menu">
      <div className="grid">
        <MenuMobileNav menu={menu} onClose={onClose} />
      </div>
    </Drawer>
  );
}
function MenuMobileNav({ menu, onClose }) {
  return (
    <nav className="grid gap-4 p-6 sm:gap-6 sm:px-12 sm:py-8">
      {/* Top level menu items */}
      {(menu?.items || []).map((item) => (
        <span key={item.id} className="block">
          <Link
            to={item.to}
            target={item.target}
            onClick={onClose}
            className={({ isActive }) =>
              isActive ? 'pb-1 border-b -mb-px' : 'pb-1'
            }
          >
            <Text as="span" size="copy">
              {item.title}
            </Text>
          </Link>
        </span>
      ))}
    </nav>
  );
}
function MobileHeader({ title, isHome, openCart, openMenu }) {
  // useHeaderStyleFix(containerStyle, setContainerStyle, isHome);
  const params = useParams();
  return (
    <header
      role="banner"
      className={`${isHome
        ? 'bg-primary/80 dark:bg-contrast/60 text-contrast dark:text-primary shadow-darkHeader'
        : 'bg-contrast/80 text-primary'
        } flex lg:hidden items-center h-nav sticky backdrop-blur-lg z-40 top-0 justify-between w-full leading-none gap-4 px-4 md:px-8`}
    >
      <div className="flex items-center justify-start w-full gap-4">
        <button
          onClick={openMenu}
          className="relative flex items-center justify-center w-8 h-8"
        >
          <IconMenu />
        </button>
        <Form
          method="get"
          action={params.lang ? `/${params.lang}/search` : '/search'}
          className="items-center gap-2 sm:flex"
        >
          <button
            type="submit"
            className="relative flex items-center justify-center w-8 h-8"
          >
            <IconSearch />
          </button>
          <Input
            className={
              isHome
                ? 'focus:border-contrast/20 dark:focus:border-primary/20'
                : 'focus:border-primary/20'
            }
            type="search"
            variant="minisearch"
            placeholder="Search"
            name="q"
          />
        </Form>
      </div>
      <Link
        className="flex items-center self-stretch leading-[3rem] md:leading-[4rem] justify-center flex-grow w-full h-full"
        to="/"
      >
        <Heading
          className="font-bold text-center leading-none"
          as={isHome ? 'h1' : 'h2'}
        >
          {title}
        </Heading>
      </Link>
      <div className="flex items-center justify-end w-full gap-4">
        <AccountLink className="relative flex items-center justify-center w-8 h-8" />
        <CartCount isHome={isHome} openCart={openCart} />
      </div>
    </header>
  );
}
function DesktopHeader({ isHome, menu, openCart, title }) {
  const params = useParams();
  const { y } = useWindowScroll();
  const initialState = [{}];
  const [result, setResult] = useState(initialState);
  function navHide(e) {
    e.target.closest(".test").querySelector("ul").classList.add(" hidden ");
  }
  function navShow(e) {
    e.target.closest(".test").querySelector("ul").classList.add(" inline-block	");
  } function openSearch() {
    document.querySelector(".header-search").classList.add(" translate-x-[0%]");
  }
  function closeSearch() {
    document.querySelector(".header-search").classList.remove(" translate-x-[0%] ");
    setsrchData(null);
    document.querySelector('input[variant="minisearch"]').value="";
  }
  const fetcher = useFetcher();
  const isHydrated = useIsHydrated();
  const [srchData, setsrchData] = useState([]);
    function refreshSearch(e) {
    //console.log(`/search?q=${e.target.value}`);
    fetcher.load(`/search?q=${e.target.value}`);
   }
 
   useEffect(() => {
    if(isHydrated && fetcher.data){
      setsrchData(fetcher.data);
      console.log(fetcher.data)
       }else{
      console.log("no data");
    }
     }, [fetcher, isHydrated]);
  //  useEffect(() => {
  //   if(isHydrated && fetcher.data){
  //     console.log(srchData?.products?.nodes);
  //   }else{
  //     console.log(srchData);
  //   }
  //    }, [fetcher, isHydrated]);

  // async function test(t) {
  //   setResult([]);
  //   var response = await fetch(`https://mbrands12.myshopify.com/api/2022-10/graphql.json`, {
  //     method: "POST",
  //     'headers': {
  //       'Content-Type': 'application/json',
  //       'X-Shopify-Storefront-Access-Token': "",
  //     },
  //     body: JSON.stringify({
  //       query: ` 
  //     ${PRODUCT_CARD_FRAGMENT}
  //     query layoutMenus(
  //       $language: LanguageCode
        
  //     ) @inContext(language: $language) {
       
  //       products(
  //             sortKey: RELEVANCE
  //         query: "${t}"
  //         first: 10
  //       ) {
  //         nodes {
  //           ...ProductCard
  //         }
  //         pageInfo {
  //           startCursor
  //           endCursor
  //           hasNextPage
  //           hasPreviousPage
  //         }
  //       }
  //     }` })
  //   }).then((response) => {
  //     if (response.status === 200) {
  //       return response.json();
  //     } else {
  //       throw new Error("Something went wrong on API server!");
  //     }
  //   })
  //     .then((y) => {
  //       //console.log(y.data.products);
  //       const arr1 = [], arr2 = [];
  //       //console.log(y.data.products.nodes[1].id);
  //       setResult(y?.data?.products?.nodes.map(g =>

  //         [...[{ id: g?.id, title: g?.title, handle: g?.handle, image: g?.variants?.nodes[0]?.image?.url }]]

  //         //arr3 = [...arr1, ...arr2]
  //         //setResult([...result, ...[{ id: g?.id, title: g?.title, handle: g?.handle, image: g?.variants?.nodes[0]?.image?.url }]])
  //       ));
  //      // console.log(arr1);

  //     })
  //     .catch((error) => {
  //       console.error(error);
  //     });


  // }
  return (
    <header
      role="banner"
      className={`${isHome
        /*//bg-primary/80 dark:bg-contrast/60*/
        ? ' text-contrast dark:text-primary shadow-darkHeader bg-contrast/80 text-primary'
        : 'bg-contrast/80 text-primary'
        } ${!isHome && y > 50 && ' shadow-lightHeader'
        } hidden h-nav lg:flex items-center sticky transition duration-300 backdrop-blur-lg z-40 top-0 justify-between w-full leading-none gap-8 px-12 py-8`}
    >
      <Link className="font-bold" to="/" prefetch="intent">
        <img src="https://cdn.shopify.com/s/files/1/0623/9911/9575/files/main-logo.png?v=1671166202&width=250" />
      </Link>
      <div className="flex gap-12">
        <nav className="flex gap-8">
          {/* Top level menu items */}
          {(menu?.items || []).map((item) => (
            <div className='test relative'  key={item.id}
            >
              <Link
                key={item.id}
                to={item.to}
                target={item.target}
                onMouseEnter={navShow}
                onMouseLeave={navHide}
                prefetch="intent"
                className={({ isActive }) =>
                  isActive ? 'pb-1 border-b -mb-px' : 'pb-1'
                }
              >
                {item.title}
              </Link>
              {item?.items?.length > 0 ? (
                <ul className="hidden group-hover:block delay-300 transition-all shadow-[0px_10px_15px_0px_#0000001a] bg-white absolute top-[100%] left-0 w-full min-w-[170px] right-auto py-[20px] second-level-menu" onMouseEnter={navShow} onMouseLeave={navHide}>
                  {item.items.map((subItem) => (
                    <li className='px-[20px] py-[5px] relative second-level-menu-li'  key={subItem.id}>
                      <Link
                        key={subItem.id}
                        to={subItem.to}
                        target={subItem.target}
                        prefetch="intent"
                        className={({ isActive }) =>
                          isActive ? ' pb-1 border-b -mb-px' : 'pb-1 '
                        }
                      >
                        {subItem.title}
                      </Link>
                    </li>
                  ))}
                </ul>

              ) : null}
            </div>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-1">
        <div className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5 cursor-pointer" onClick={openSearch}>
          <IconSearch />
        </div>
        <AccountLink className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5" />
        <CartCount isHome={isHome} openCart={openCart} />
        <div className="header-search translate-x-[-100%] absolute left-0 right-0 top-0 bottom-0 bg-white z-[101] flex justify-center	">
          <Form
            method="get"
            action={params.lang ? `/${params.lang}/search` : '/search'}
            className="relative h-full gap-4 flex items-center search-form max-w-[500px] px-4 mx-autoflex items-center gap-2"
          >
            <input
              className={
                isHome
                  ? 'focus:border-contrast/5 dark:focus:border-primary/5 w-full rounded h-[42px]'
                  : 'focus:border-primary/5 border-t-1 border-x-1  border-4 w-full rounded h-[42px]'
              }
              type="text"
              variant="minisearch"
              placeholder="Search"
              onKeyUp={refreshSearch} 
              name="q"

            />
            <button
              type="submit"
              className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5 rounded w-[62px] bg-black h-[42px] flex justify-center items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="25" height="25" childfill="#fff" fill="currentColor" className="relative"><title>Search</title><path fill="#fff" xmlns="http://www.w3.org/2000/svg" d="m867.94,836.28l-144.58-174.9c-13.22-16-32.79-23.61-52.03-22.31l-76.82-93.08c-.64-.77-1.31-1.48-2-2.19,52.79-50.99,85.72-122.41,85.72-201.43,0-154.5-125.69-280.2-280.2-280.2S117.84,187.88,117.84,342.38s125.69,280.2,280.2,280.2c49.94,0,96.83-13.2,137.48-36.19,1.03,1.84,2.22,3.63,3.61,5.32l76.64,92.86c-5.11,18.79-1.37,39.69,11.99,55.84l144.58,174.9c12.27,14.84,29.98,22.51,47.84,22.51,13.91,0,27.92-4.66,39.48-14.22,26.4-21.83,30.11-60.92,8.29-87.32ZM189.65,342.38c0-114.9,93.48-208.39,208.38-208.39s208.38,93.48,208.38,208.39-93.48,208.38-208.38,208.38-208.38-93.48-208.38-208.38Z"></path></svg>
            </button>
            <svg onClick={closeSearch} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="35" height="35" fill="currentColor lg:absolute top-0 left-0 right-0 bottom-0" className="cursor-pointer"><title>Close</title><path d="M1.18691 11.7751C0.921127 12.0409 0.490201 12.0409 0.224414 11.7751C-0.0413731 11.5094 -0.0413731 11.0784 0.224414 10.8126L5.03691 6.00015L0.224414 1.18765C-0.0413733 0.921859 -0.041373 0.490933 0.224414 0.225146C0.490201 -0.0406405 0.921127 -0.0406407 1.18691 0.225146L5.99941 5.03765L10.8119 0.225146C11.0777 -0.040641 11.5086 -0.0406408 11.7744 0.225146C12.0402 0.490933 12.0402 0.921859 11.7744 1.18765L6.96191 6.00015L11.7744 10.8126C12.0402 11.0784 12.0402 11.5094 11.7744 11.7751C11.5086 12.0409 11.0777 12.0409 10.8119 11.7751L5.99941 6.96265L1.18691 11.7751Z" fill="black"></path></svg>
           {srchData?.products?(<div className="overflow-y-auto left-0 right-0 absolute top-[100%] bg-white w-full max-h-[300px] shadow-[0_0_1px_#272c300d,0_1px_5px_1px_#272c3029]">
              <ul className="list">
             
                {srchData?.products?.nodes.map(product =>
                  product?.title ? (
                    <li  key={product.id} className="item p-4 items-center flex gap-4 border-b border-[#ccc]">
                      <div className="img max-w-[80px]">
                        <Link to={`/products/${product.handle}`} onClick={closeSearch}>
                          {product?.variants?.nodes[0].image?.url && (<img alt={`${product.title}`}
                            className="w-full  block"
                            src={product?.variants?.nodes[0].image?.url}
                            width="auto" height="auto"
                            decoding="async" />)
                          }
                        </Link>
                      </div>
                      <div className="product-details">
                        <Text
                          className="title"
                          as="h3"
                        >
                          <Link to={`/products/${product.handle}`} onClick={closeSearch}>
                            {product.title}
                          </Link>
                        </Text>
                        <div className="text-[14px] text-[#828282]">
                        <Money withoutTrailingZeros data={{amount:product?.variants?.nodes[0]?.price?.amount.toString(), currencyCode: product?.variants?.nodes[0]?.price?.currencyCode}} /></div>
                      </div>
                    </li>
                  ) : null
                )}
              </ul>
            </div>
           ): null
           }
          </Form>
        </div>
      </div>
    </header>
  );
}
function AccountLink({ className }) {
  const [root] = useMatches();
  const isLoggedIn = root.data?.isLoggedIn;
  return isLoggedIn ? (
    <Link to="/account" className={className}>
      <IconAccount />
    </Link>
  ) : (
    <Link to="/account/login" className={className}>
      <IconLogin />
    </Link>
  );
}
function CartCount({ isHome, openCart }) {
  const [root] = useMatches();
  return (
    <Suspense fallback={<Badge count={0} dark={isHome} openCart={openCart} />}>
      <Await resolve={root.data?.cart}>
        {(cart) => (
          <Badge
            dark={isHome}
            openCart={openCart}
            count={cart?.totalQuantity || 0}
          />
        )}
      </Await>
    </Suspense>
  );
}
function Badge({ openCart, dark, count }) {
  const isHydrated = useIsHydrated();
  const BadgeCounter = useMemo(
    () => (
      <>
        <IconBag />
        <div
          className={`${dark
            ? 'text-primary bg-contrast dark:text-contrast dark:bg-primary'
            : 'text-contrast bg-primary'
            } absolute bottom-1 right-1 text-[0.625rem] font-medium subpixel-antialiased h-3 min-w-[0.75rem] flex items-center justify-center leading-none text-center rounded-full w-auto px-[0.125rem] pb-px`}
        >
          <span>{count || 0}</span>
        </div>
      </>
    ),
    [count, dark],
  );
  return isHydrated ? (
    <button
      onClick={openCart}
      className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5"
    >
      {BadgeCounter}
    </button>
  ) : (
    <Link
      to="/cart"
      className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5"
    >
      {BadgeCounter}
    </Link>
  );
}
function Footer({ menu }) {
  const isHome = useIsHomePath();
  const itemsCount = menu
    ? menu?.items?.length + 1 > 4
      ? 4
      : menu?.items?.length + 1
    : [];
  return (
    <Section
      divider={isHome ? 'none' : 'top'}
      as="footer"
      role="contentinfo"
      className={`footer text-white bg-[#142744] block hidden lg:block sm:block `}
    >
      <div className='max-w-[1230px] px-[15px] mx-auto pb-[45px]'>
        <div className="footer-header flex items-center justify-between pb-[15px] mb-[35px] border-b border-b-white">
          <h4 className="heading-font title uppercase text-[32px] text-center block mb-[0px] w-auto">not your everyday test brand!</h4>
          <div className="img max-w-[330px]">
            <img className="cursor-pointer" src="https://cdn.shopify.com/s/files/1/0623/9911/9575/files/review.png?v=1684736932" width="100%" height="100%" alt="Reviews"
              loading="lazy" decoding="async" />
          </div>
        </div>
        <div className='footer-items flex justify-between mb-[25px] sm:flex-direction-column'>
          <div className="item">
            <div className="item-content">
              <div className="max-w-[390px]">
                <div className="news-letter">
                  <Heading className="heading-font item-title uppercase text-[24px] mb-[15px]" size="lead" as="h3">
                    Love Rewards? Join Today
                  </Heading>
                  <p className="newsltter-info mb-[15px]">Our clubhouse subscribers get the very best discounts &amp; free gifts!</p>
                  <form className="news-letter-form">
                    <input placeholder="Enter your email" type="email" name="email" className="block w-full rounded mb-[16px] text-black" />
                    <button type="submit" className="rounded-[30px] h-[40px] flex items-center justify-center uppercase font-semibold bg-[#C40314] w-full block submit max-w-[200px]">sign up</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <FooterMenu menu={menu} />
          <div className="item mb-[0]">
            <Heading className="heading-font item-title uppercase text-[24px] mb-[15px]" size="lead" as="h3">
              customer service
            </Heading>
            <ul className="item-content">
              <li className="mb-[5px]">Monday to Friday</li>
              <li className="mb-[5px]">10 am - 7:30pm (New test Time)</li>
              <li className="mb-[5px]">help@test.com.au</li>
            </ul>
          </div>
        </div>
        <div className="footer-header flex items-center justify-between pb-[15px] mb-[35px] border-b border-t border-b-white">
          <div className={`self-end pt-4 opacity-50 md:col-span-2 lg:col-span-${itemsCount}`} >
            &copy; {new Date().getFullYear()} / Shopify, Inc. Hydrogen is an MIT
            Licensed Open Source project.
          </div>
          <div className=" max-w-[330px]">

          </div>
        </div>
        <div className=" max-w-[180px]">
          <CountrySelector />
        </div>
      </div>
    </Section>
  );
}
const FooterLink = ({ item }) => {
  if (item.to.startsWith('http')) {
    return (
      <a href={item.to} target={item.target} rel="noopener noreferrer">
        {item.title}
      </a>
    );
  }
  return (
    <Link to={item.to} target={item.target} prefetch="intent">
      {item.title}
    </Link>
  );
};
function FooterMenu({ menu }) {
  const styles = {
    section: 'grid gap-4',
    nav: 'grid gap-2 pb-6',
  };
  return (
    <>
      {(menu?.items || []).map((item) => (
        <section key={item.id} className={styles.section}>
          <Disclosure>
            {({ open }) => (
              <>
                <Disclosure.Button className="text-left md:cursor-default">
                  <Heading className="heading-font item-title uppercase text-[24px] mb-[15px]" size="lead" as="h3">
                    {item.title}
                    {item?.items?.length > 0 && (
                      <span className="md:hidden">
                        <IconCaret direction={open ? 'up' : 'down'} />
                      </span>
                    )}
                  </Heading>
                </Disclosure.Button>
                {item?.items?.length > 0 ? (
                  <div
                    className={`${open ? `max-h-48 h-fit` : `max-h-0 md:max-h-fit`
                      } overflow-hidden transition-all duration-300`}
                  >
                    <Suspense data-comment="This suspense fixes a hydration bug in Disclosure.Panel with static prop">
                      <Disclosure.Panel static>
                        <nav className={styles.nav}>
                          {item.items.map((subItem) => (
                            <FooterLink key={subItem.id} item={subItem} />
                          ))}
                        </nav>
                      </Disclosure.Panel>
                    </Suspense>
                  </div>
                ) : null}
              </>
            )}
          </Disclosure>
        </section>
      ))}
    </>
  );
}