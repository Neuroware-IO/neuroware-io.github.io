var blockauth = {
    buttons: function()
    {
        $('body').on('click', '.modal-action', function(e)
        {
            e.preventDefault();
            var button = $(this);
            var modal = $(button).attr('data-modal');
            blockauth.modal.open(modal);
        });
    },
    init: function()
    {
        blockauth.buttons();
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
        },
        open: function(id)
        {
            $('#'+id).modal('show');
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