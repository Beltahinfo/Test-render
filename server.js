// Simple Node.js HTTP server to launch your app
const app = require('./xmd.js');

// If xmd.js exports an Express app, use this
if (typeof app.listen === 'function') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} else {
  // If xmd.js runs itself, just require it to start
  require('./xmd.js');
}
