var blockauth = {
    buttons: function()
    {
        $('body').on('click', '.btn-demo', function(e)
        {
            e.preventDefault();
            blockauth.modal.new('Warning', 'This demo is not yet hooked-up to a blockchain so is unable to provide the full functionality that will be available once it has been connected...');
        });
        $('body').on('click', '.modal-action', function(e)
        {
            e.preventDefault();
            var button = $(this);
            var modal = $(button).attr('data-modal');
            blockauth.modal.open(modal);
        });
    },
    extras: function()
    {
        $('.extra-panel').on('shown.bs.collapse', function() 
        {
            $(this).parent().find('.list-group-item.active').removeClass('active');
            $(this).prev().addClass('active');
            var id = $(this).attr('id');
            $('.extra-panel.service').each(function()
            {
                console.log("$(this).attr('id')", $(this).attr('id'));
                if($(this).attr('id') != id && $(this).hasClass('in'))
                {
                    $(this).collapse('hide');
                }
            });
            $('.extra-panel.contact').each(function()
            {
                console.log("$(this).attr('id')", $(this).attr('id'));
                if($(this).attr('id') != id && $(this).hasClass('in'))
                {
                    $(this).collapse('hide');
                }
            });
            $('.extra-panel.message').each(function()
            {
                console.log("$(this).attr('id')", $(this).attr('id'));
                if($(this).attr('id') != id && $(this).hasClass('in'))
                {
                    $(this).collapse('hide');
                }
            });
        });
        $('.extra-panel').on('hidden.bs.collapse', function() 
        {
            $(this).prev().removeClass('active');
        });
    },
    init: function()
    {
        blockauth.buttons();
        blockauth.extras();
        blockauth.inputs();
        blockauth.resize();
    },
    inputs: function()
    {
        $('.panel-input.auto-select').on('click', function(e)
        {
            $(this).focus();
            $(this).select();
        });
        $('label.alert-title').on('click', function(e)
        {
            $('input#' + $(this).attr('for')).focus();
        });
    },
    modal: {
        close: function(id)
        {
            $('#'+id).modal('hide');
        },
        new: function(title, content, footer)
        {
            if($('.modal.in').length > 0)
            {
                $('.modal').modal('hide');
                setTimeout(function()
                {
                    blockauth.modal.spawn(title, content, footer);
                }, 750);
            }
            else
            {
                blockauth.modal.spawn(title, content, footer);
            }
        },
        open: function(id)
        {
            if($('.modal.in').length > 0)
            {
                $('.modal').modal('hide');
                setTimeout(function()
                {
                    $('#'+id).modal('show');
                }, 750);
            }
            else
            {
                $('#'+id).modal('show');
            }
        },
        spawn: function(title, content, footer)
        {
            if(typeof title == 'undefined' || !title) title = '';
            if(typeof content == 'undefined' || !content) content = '';
            if(typeof footer == 'undefined' || !footer) footer = '';
            $('#default-modal').find('.modal-title').html(title);
            $('#default-modal').find('.modal-body').html(content);
            $('#default-modal').find('.modal-footer').html(footer);
            if(!title) $('#default-modal').find('.modal-title').hide();
            else $('#default-modal').find('.modal-title').show();
            if(!footer) $('#default-modal').find('.modal-footer').hide();
            else $('#default-modal').find('.modal-footer').show();
            $('#default-modal').modal('show');
        }
    },
    resize: function()
    {
        
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