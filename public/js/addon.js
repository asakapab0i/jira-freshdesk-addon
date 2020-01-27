/* App frontend script */
AP.events.on('ISSUE_QUICK_ADD_CLICKED', function(event){
  AP.dialog.create({
        key: 'freshdesk-ticket-create'
  });
});

