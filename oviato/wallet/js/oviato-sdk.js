var OVISDK = 
{
    connected: false,
    init: function()
    {
        if(!OVISDK.connected)
        {
            OVISDK.buttons.connect();
            OVISDK.ux.modals.connect();
            OVISDK.connected = true;
        }
    },
    buttons:
    {
        connect: function()
        {
            // Open modal on click
        }
    },
    ux:
    {
        modals:
        {
            connect: function()
            {
                // Inject HTML for modals
            }
        }
    }
};