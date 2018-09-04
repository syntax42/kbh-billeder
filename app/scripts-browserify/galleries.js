$(function(){
  const GALLERY_SLICK_SELECTOR = '.gallery--slick';

  $(GALLERY_SLICK_SELECTOR).slick({
    infinite: false,
    dots: true,
    speed: 600,
    slidesToShow: 4,
    slidesToScroll: 2,
    prevArrow: '<div class="slick-button-container"><button type="button" class="slick-prev">Previous</button></div>',
    nextArrow: '<div class="slick-button-container"><button type="button" class="slick-next">Next</button></div>',
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
