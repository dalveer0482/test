import {ProductCard, Section} from '~/components';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import {useFetcher} from '@remix-run/react';
import { useEffect, useState } from 'react';
const mockProducts = new Array(12).fill('');

export function ProductSwimlane({
  title = 'Featured Products',
  products = mockProducts,
  count = 12,
  ...props
}) {

  const fetcher = useFetcher();
 const [category, setCategory] = useState(products);
  function cateEvent(event){
    document.querySelectorAll(".text-3xl.font-light.tracking-wide").forEach(item =>{
      item.classList.remove("underline");
      item.classList.remove("underline-offset-8");
    })
    //console.log(event.target.dataset.tag)
        fetcher.load(`/?tag=${event.target.dataset.tag}`);
        event.target.classList.add("underline");
        event.target.classList.add("underline-offset-8");
  }
  useEffect(() => {
    if (!fetcher.data){
      setCategory(products);
      return;
    }else{
      setCategory(fetcher.data.featuredProducts.products.nodes);
  }
  }, [fetcher]);
  return (
    <Section  padding="y" {...props}>
      <div className="relative max-w-screen-2xl	mx-auto" heading={title}>
        <h2 className='h2 text-center pt-8'>{title}</h2>
        <div className='flex justify-center gap-3 pt-3 mb-8'>
       
          <button className="text-3xl font-light tracking-wide  underline  underline-offset-8" data-tag="Gifts" onClick={cateEvent}>Gifts</button>
          <button className="text-3xl font-light tracking-wide  underline-offset-8" data-tag="Furniture" onClick={cateEvent}>Furniture</button>
          <button className="text-3xl font-light tracking-wide  underline-offset-8" data-tag="Artifacts" onClick={cateEvent}>Artifacts</button>
          <button className="text-3xl font-light tracking-wide  underline-offset-8" data-tag="test" onClick={cateEvent}>Fashion</button>
          </div>
      <Swiper
      // install Swiper modules
      modules={[Navigation, Pagination, Scrollbar, A11y]}
      spaceBetween={50}
      slidesPerView={4}
      navigation
      pagination={{ clickable: true }}
      scrollbar={{ draggable: true }}
      // onSwiper={(swiper) => console.log(swiper)}
      // onSlideChange={() => console.log('slide change')}
    >
    
        {category.map((product) => (
          <SwiperSlide   key={product.id}>
             <div className="relative">
          <ProductCard
            product={product}
          
            className="snap-start w-80"
          /></div>
          </SwiperSlide>
        ))}
   </Swiper>
   </div>
    </Section>
  );
}
