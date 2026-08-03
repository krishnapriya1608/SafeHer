const express = require('express');
const router = express.Router();
const {
  addContact,
  getContacts,
  editContact,
  deleteContact,
  triggerEmergency,
  acknowledgeAlert,
} = require('../Controller/trustedContactController');


const requireAuth = require('../Middleware/requireAuth');

router.use(requireAuth);

router.route('/contact/:userId')
  .get(getContacts)
  .post(addContact);

router.route('/contact/:userId/:contactId')
  .put(editContact)
  .delete(deleteContact);

router.post('/emergency/:userId', triggerEmergency);
router.patch('/emergency/:alertId/ack/:contactId', acknowledgeAlert);

module.exports = router;