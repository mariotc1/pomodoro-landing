export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email } = req.body;
  if (!email) return res.status(400).json({ error: "Missing email" });

  try {
    const r = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.MAILERLITE_API_KEY}`
      },
      body: JSON.stringify({
        email,
        fields: { name: name || "" },
        groups: ["164707869286990870"],
        resubscribe: true
      })
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error("MailerLite error", data);
      return res.status(r.status).json(data);
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Server subscribe error", err);
    return res.status(500).json({ error: "server_error" });
  }
}