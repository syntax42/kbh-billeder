$(function(){
  const GALLERY_SLICK_SELECTOR = '.gallery--slick';

  $(GALLERY_SLICK_SELECTOR).slick({
    infinite: false,
    dots: true,
    speed: 600,
    slidesToShow: 4,
    slidesToScroll: 2,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        }
      }
    ]
  });
});
