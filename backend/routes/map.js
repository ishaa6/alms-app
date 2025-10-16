const express = require('express');
const router = express.Router();
const {fetchSecrets} = require('../vault/vault-client');

router.post('/reverse-geocode', async (req, res) => {
  const { latitude, longitude } = req.body;

  try {
    const secrets = await fetchSecrets();
    const response = await fetch(`https://us1.locationiq.com/v1/reverse?key=${secrets.API_MAPS}&lat=${latitude}&lon=${longitude}&format=json`);
    const data = await response.json();
    const address = data.address;
    const locationParts = [
      address.name,
      address.road,
      address.suburb,
      address.city,
      address.state_district,
      address.state,
      address.postcode,
      address.country,
    ].filter(Boolean);

    const location = locationParts.join(', ');
    console.log(location);
    res.json({ location });
  } catch (err) {
    console.error('Reverse geocoding failed:', err);
    res.status(500).json({ error: 'Failed to fetch location' });
  }
});

module.exports = router;
