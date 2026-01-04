(async () => {
  try {
    const u = process.env.SNIPEIT_API_URL;
    const k = process.env.SNIPEIT_API_KEY;
    console.log('SNIPEIT_API_URL=', u);
    console.log('SNIPEIT_API_KEY=', !!k);
    if (!u) return;
    const url = u.replace(/\/$/, '') + '/hardware?limit=5';
    const res = await fetch(url, { headers: { Authorization: 'Bearer ' + k, Accept: 'application/json' } });
    console.log('STATUS', res.status);
    const text = await res.text();
    console.log(text.slice(0, 2000));
  } catch (err) {
    console.error('ERR', err);
  }
})();
