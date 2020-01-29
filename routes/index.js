export default function routes(app, addon, Freshdesk) {

    app.get('/', (req, res) => {
        res.redirect('/atlassian-connect.json');
    });

    app.get('/freshdesk-configure', addon.authenticate(), (req, res) => {
        addon.settings.get('freshdeskInfo', req.context.clientKey).then(function (data) {
            res.render('freshdesk-configuration', {
                title: 'Atlassian Connect',
                fdInfo: data
            })
        });
    });

    app.post('/freshdesk-configure', addon.checkValidToken(), (req, res) => {
        var fdinfo = req.body;
        addon.settings.set('freshdeskInfo', fdinfo, req.context.clientKey).then(function () {
            res.render('freshdesk-configuration', {
                title: 'Atlassian Connect',
                fdInfo: fdinfo
            });
        });
    });

    app.get('/freshdesk-ticket-list', addon.authenticate(), (req, res) => {
        var issueId = req.query['issueId']
        var httpClient = addon.httpClient({ clientKey: req.context.clientKey });
        var baseUrl = '';
        addon.settings.get('freshdeskInfo', req.context.clientKey).then(function (data) {
            baseUrl = data.fdUrl;
            httpClient.get('/rest/api/2/issue/' + issueId + '/properties/freshdesk', function (err, response, body) {
                var fdData = JSON.parse(response.body)
                var issues = []
                if (!fdData.errorMessages) {
                    issues = fdData.value.fdData
                }
                res.render('freshdesk-ticket-list', {
                    title: 'Atlassian Connect',
                    issues: issues,
                    fdBaseUrl: baseUrl
                });
            });
        });
    })

    app.get('/freshdesk-ticket-create', addon.authenticate(), (req, res) => {
        addon.settings.get('clientInfo', req.context.clientKey).then(function (data) {
            var issueId = req.query['issueId']
            var httpClient = addon.httpClient({ clientKey: data.clientKey });

            httpClient.get('/rest/api/2/issue/' + issueId, function (err, response, body) {
                res.render('freshdesk-ticket-create', {
                    title: 'Atlassian Connect',
                    issue: JSON.parse(body)
                });
            });
        });
    })

    app.post('/freshdesk-ticket-create', addon.checkValidToken(), (req, res) => {
        var issueId = req.query['issueId']
        var ticket = req.body
        addon.settings.get('freshdeskInfo', req.context.clientKey).then(function (data) {
            var freshdesk = new Freshdesk(data.fdUrl, data.fdKey);
            freshdesk.createTicket({
                name: ticket.fdReporter,
                email: ticket.fdEmail,
                subject: ticket.fdTitle,
                description: ticket.fdDesc,
                status: 2,
                priority: 1
            }, function (err, data) {
                var _fdData = data
                addon.settings.get('clientInfo', req.context.clientKey).then(function (data) {
                    var httpClient = addon.httpClient({ clientKey: data.clientKey });
                    httpClient.get('/rest/api/2/issue/' + issueId + '/properties/freshdesk', function (err, response, body) {
                        var _oldFdData = JSON.parse(response.body)
                        if (!_oldFdData.errorMessages) {
                            _oldFdData = _oldFdData.value.fdData
                            _oldFdData.push(_fdData)
                            var options = { "fdData": _oldFdData }
                        } else {
                            var options = { "fdData": [_fdData] }
                        }
                        httpClient.put({ url: '/rest/api/2/issue/' + issueId + '/properties/freshdesk', body: JSON.stringify(options) });
                    });
                });
            });
        });
    })
}