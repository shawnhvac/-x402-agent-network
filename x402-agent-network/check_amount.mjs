
const probe = await fetch('http://localhost:3001/api/v1/search', {
  method: 'POST', headers: {'Content-Type':'application/json'},
  body: JSON.stringify({ category: 'hvac', location: 'Phoenix, AZ' })
});
const header = probe.headers.get('payment-required') || probe.headers.get('x-payment-required');
if (!header) {
  console.log('No payment-required header! status:', probe.status);
  const body = await probe.text();
  console.log('Body:', body.slice(0, 300));
} else {
  const payReq = JSON.parse(Buffer.from(header, 'base64').toString());
  console.log('Payment required:', JSON.stringify(payReq, null, 2).slice(0, 600));
}
