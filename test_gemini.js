const key = 'AIzaSyCI-y-j09OHtoIfsYUaLRyFVdKEVCyB5Dc';
const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + key;

fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
  })
})
.then(res => res.json().then(data => ({ status: res.status, data })))
.then(res => console.log(JSON.stringify(res, null, 2)))
.catch(err => console.error(err));
