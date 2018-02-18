(function () {
  $(".main-nav a").click(function (e) {
    e.preventDefault();
    $(".main-nav a").removeClass('active');
    $(this).find(".main-nav__link").addClass('active');
    console.log( $(this) );
    
  });
})();