// Backend: middleware/auth.js

const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
      // User is authenticated
      next();
    } else {
      // User is not authenticated
      res.status(401).json({ error: 'Unauthorized' });
    }
  };
  
  module.exports = { isAuthenticated} ;