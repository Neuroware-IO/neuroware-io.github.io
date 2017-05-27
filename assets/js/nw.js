document.addEventListener('DOMContentLoaded', function()
{
    $('.scroll-down').on('click', function(e)
    {
        var height = $('#sub-content').offset().top;
        e.preventDefault();
        $('html, body').animate({
            scrollTop: height
        }, 500);
    });
    $('.scroll-up').on('click', function(e)
    {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: 0
        }, 500);
    });
    $('.navbar-toggle').on('click', function(e)
    {
        e.preventDefault();
        $('#bs-example-navbar-collapse-1').toggle(500);
    });
});