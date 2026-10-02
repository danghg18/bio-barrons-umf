// Local preview callbacks retain the query/fragment until the existing account page handles them.
const accountDestination = new URL('../cont.html', location.href);
accountDestination.search = location.search;
accountDestination.hash = location.hash;
location.replace(accountDestination.href);
