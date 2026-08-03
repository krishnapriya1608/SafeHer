const express = require('express');
const router = express.Router();
const {
  addContact,
  getContacts,
  editContact,
  deleteContact,
  triggerEmergency,
  acknowledgeAlert,
} = require('../controllers/trustedContactController');

// Replace with your real auth middleware, e.g. requireAuth (JWT/session check)
const requireAuth = require('../middleware/requireAuth');

router.use(requireAuth);

router.route('/').get(getContacts).post(addContact);

router.route('/:id').put(editContact).delete(deleteContact);

router.post('/emergency', triggerEmergency);
router.patch('/emergency/:alertId/ack/:contactId', acknowledgeAlert);

module.exports = router;
