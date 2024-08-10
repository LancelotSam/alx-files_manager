const express = require('express');
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController'); // Import AuthController

const router = express.Router();

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', UsersController.postNew);
router.get('/connect', AuthController.getConnect); // Add /connect endpoint
router.get('/disconnect', AuthController.getDisconnect); // Add /disconnect endpoint
router.get('/users/me', UsersController.getMe); // Add /users/me endpoint

module.exports = router;
