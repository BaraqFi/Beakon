const required = ['REACT_APP_API_URL'];

const missing = required.filter((key) => {
  const value = process.env[key];
  return !value || String(value).trim().length === 0;
});

if (missing.length > 0) {
  console.error(`Missing required client env vars: ${missing.join(', ')}`);
  process.exit(1);
}

console.log('Client environment check passed.');
