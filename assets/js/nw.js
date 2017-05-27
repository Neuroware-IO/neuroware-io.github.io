document.addEventListener('DOMContentLoaded', function()
{
    $('.scroll-down').on('click', function(e)
    {
        var height = $('#sub-content').offset().top;
        e.preventDefault();
        $(window).scroll({
            top: height,
            behavior: 'smooth' 
        });
    });
    $('.scroll-up').on('click', function(e)
    {
        e.preventDefault();
        $(window).scroll({
            top: 0,
            behavior: 'smooth' 
        });
    });
    $('.navbar-toggle').on('click', function(e)
    {
        e.preventDefault();
        $('#bs-example-navbar-collapse-1').toggle(500);
    });
});