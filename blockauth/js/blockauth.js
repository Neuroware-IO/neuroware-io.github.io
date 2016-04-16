var bc_large_screen = 740;
var bc_minimum_height = 600;
var bc_hand_top = -20;
var bc_hand_bottom = -270;

var blockauth = {
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
        blockauth.resize();
    },
    resize: function()
    {
        var width = $(window).width();
        var height = $(window).height();
        if(height > bc_large_screen)
        {
            blockauth.hand.middle(height);
        }
        else if(height < bc_minimum_height)
        {
            blockauth.hand.top(height);
        }
        else
        {
            blockauth.hand.bottom(height);
        }
    }
};

$(window).on('resize', function()
{
    blockauth.resize();
});

$(document).ready(function()
{
    blockauth.init();
});