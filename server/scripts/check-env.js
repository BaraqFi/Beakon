const required = ['JWT_SECRET', 'MONGO_URI', 'CLIENT_URL'];

const missing = required.filter((key) => {
  const value = process.env[key];
  return !value || String(value).trim().length === 0;
});

if (missing.length > 0) {
  console.error(`Missing required server env vars: ${missing.join(', ')}`);
  process.exit(1);
}

console.log('Server environment check passed.');
