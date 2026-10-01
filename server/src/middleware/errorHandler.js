// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  console.error('[api-error]', err);
  const status = err.status || 500;
  const message = status >= 500 ? 'Something went wrong. Please try again.' : (err.message || 'Request failed');
  res.status(status).json({ error: message });
}

function notFound(_req, res) {
  res.status(404).json({ error: 'Not found' });
}

module.exports = { errorHandler, notFound };
