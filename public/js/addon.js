/* App frontend script */
AP.events.on('ISSUE_QUICK_ADD_CLICKED', function (event) {
  AP.dialog.create({
    key: 'freshdesk-ticket-create'
  });
});
AP.dialog.disableCloseOnSubmit();
AP.events.on('dialog.button.click', function (event) {
  if (event.button.name === 'submit') {
    console.log("submit button")
    $('#d1').submit();
    // event.preventDefault();
  }
  AP.dialog.close();
});
