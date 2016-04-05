var bc_large_screen = 740;
var bc_minimum_height = 600;
var bc_hand_top = -20;
var bc_hand_bottom = -270;

var bc_homepage = {
    hand: {
        bottom: function(height)
        {
            $('#hand').css({top: 'auto', bottom: bc_hand_bottom});
        },
        middle: function(height)
        {
            $('#hand').css({top: 'auto', bottom: (bc_hand_bottom + ((height - bc_minimum_height) / 2)) + 20});
        },
        top: function(height)
        {
            $('#hand').css({bottom: 'auto', top: bc_hand_top});
        }
    },
    init: function()
    {
        bc_homepage.resize();
    },
    resize: function()
    {
        var width = $(window).width();
        var height = $(window).height();
        if(height > bc_large_screen)
        {
            bc_homepage.hand.middle(height);
        }
        else if(height < bc_minimum_height)
        {
            bc_homepage.hand.top(height);
        }
        else
        {
            bc_homepage.hand.bottom(height);
        }
    }
};

$(window).on('resize', function()
{
    bc_homepage.resize();
});

$(document).ready(function()
{
    bc_homepage.init();
});