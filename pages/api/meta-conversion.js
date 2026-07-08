const pixelId = process.env.META_PIXEL_ID || "1351506237081523";
const graphVersion = process.env.META_GRAPH_VERSION || "v21.0";
const allowedEvents = new Set(["PageView", "AddToCart", "Purchase"]);

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const accessToken = process.env.META_ACCESS_TOKEN;
  if (!accessToken) {
    return res.status(200).json({ ok: false, disabled: true, error: "META_ACCESS_TOKEN is not configured" });
  }

  const { eventName, eventId, eventSourceUrl, fbp, fbc, customData } = req.body || {};
  if (!allowedEvents.has(eventName)) {
    return res.status(400).json({ ok: false, error: "Unsupported event" });
  }

  const userData = {
    client_ip_address: getClientIp(req),
    client_user_agent: req.headers["user-agent"]
  };

  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website",
        event_source_url: eventSourceUrl,
        event_id: eventId,
        user_data: userData,
        custom_data: customData || {}
      }
    ]
  };

  if (process.env.META_TEST_EVENT_CODE) {
    payload.test_event_code = process.env.META_TEST_EVENT_CODE;
  }

  const response = await fetch(`https://graph.facebook.com/${graphVersion}/${pixelId}/events?access_token=${accessToken}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    return res.status(502).json({ ok: false, error: result });
  }

  return res.status(200).json({ ok: true, result });
}
