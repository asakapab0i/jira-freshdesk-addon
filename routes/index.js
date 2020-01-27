export default function routes(app, addon) {
    // Redirect root path to /atlassian-connect.json,
    // which will be served by atlassian-connect-express.
    app.get('/', (req, res) => {
        res.redirect('/atlassian-connect.json');
    });

    // This is an example route used by "generalPages" module (see atlassian-connect.json).
    // Verify that the incoming request is authenticated with Atlassian Connect.
    app.get('/fd-configure', addon.authenticate(), (req, res) => {

        var freshDesk = new FreshDesk('test', 'test')

        // Rendering a template is easy; the render method takes two params:
        // name of template and a json object to pass the context in.
        addon.settings.get('freshdeskInfo', req.context.clientKey).then(function (data) {
            res.render('hello-world', {
                title: 'Atlassian Connect',
                fdInfo: data
            })
        });
    });

    app.post('/fd-configure', addon.checkValidToken(), (req, res) => {
        var fdinfo = req.body;
        addon.settings.set('freshdeskInfo', fdinfo, req.context.clientKey).then(function () {
            res.render('hello-world', {
                title: 'Atlassian Connect',
                fdInfo: fdinfo
            })
        });
    });
}
