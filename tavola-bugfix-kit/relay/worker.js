// Tavola bug relay (Cloudflare Worker).
// Receives a report from the app, checks the sender is one of the two approved Google accounts,
// and opens a GitHub issue. The GitHub workflow then asks Claude to fix it.
//
// Settings (Worker > Settings > Variables and Secrets):
//   ALLOWED_ORIGIN    https://joolsoneill-hash.github.io
//   ALLOWED_EMAILS    jools.oneill@gmail.com,wife@gmail.com   (comma separated)
//   FIREBASE_API_KEY  the apiKey from the app's Firebase config
//   GITHUB_REPO       joolsoneill-hash/recipe-box
//   GITHUB_TOKEN      (secret) fine-grained token, this repo only, Issues: read and write

export default {
  async fetch(req, env) {
    const cors = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
      'Access-Control-Allow-Headers': 'authorization,content-type',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Vary': 'Origin'
    };
    const reply = (status, msg) => new Response(JSON.stringify({ ok: status < 300, msg }), { status, headers: { ...cors, 'content-type': 'application/json' } });

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (req.method !== 'POST') return reply(405, 'POST only');
    if (req.headers.get('Origin') !== env.ALLOWED_ORIGIN) return reply(403, 'wrong origin');

    // 1. Who is this? Ask Google to validate the Firebase sign-in token.
    const m = /^Bearer (.+)$/.exec(req.headers.get('Authorization') || '');
    if (!m) return reply(401, 'no token');
    const who = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + env.FIREBASE_API_KEY, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ idToken: m[1] })
    });
    if (!who.ok) return reply(401, 'bad token');
    const user = ((await who.json()).users || [])[0];
    const email = ((user && user.email) || '').toLowerCase();
    const allowed = env.ALLOWED_EMAILS.toLowerCase().split(',').map(x => x.trim()).filter(Boolean);
    if (!user || !user.emailVerified || !allowed.includes(email)) return reply(403, 'not approved');

    // 2. What are they reporting?
    let b; try { b = await req.json(); } catch (e) { return reply(400, 'bad json'); }
    const type = b.type === 'feature' ? 'feature' : 'bug';
    const text = String(b.text || '').trim().slice(0, 2000);
    if (!text) return reply(400, 'empty');
    const clean = v => String(v || '').replace(/[\r\n`]/g, ' ').slice(0, 120);
    const title = (type === 'bug' ? 'Bug: ' : 'Feature: ') + text.split('\n')[0].slice(0, 70);
    const body = [
      '**Reported by:** ' + email,
      '**Screen:** ' + clean(b.screen),
      '**App version:** ' + clean(b.version),
      '**Report id:** ' + clean(b.id),
      '',
      '---',
      '',
      text
    ].join('\n');

    // 3. Open the issue. The label decides what the workflow does: bugs are pushed, features become a pull request.
    const gh = await fetch('https://api.github.com/repos/' + env.GITHUB_REPO + '/issues', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json', 'User-Agent': 'tavola-relay', 'content-type': 'application/json' },
      body: JSON.stringify({ title, body, labels: [type === 'bug' ? 'tavola-bug' : 'tavola-feature'] })
    });
    if (!gh.ok) return reply(502, 'github refused: ' + gh.status);
    return reply(200, 'sent');
  }
};
