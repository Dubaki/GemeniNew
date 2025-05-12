// File: api/telegram-webhook.js
export default function handler(req, res) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Full Minimal Logger: Request received! Method: ${req.method}, URL: ${req.url}`);

  try {
    if (req.body) {
      let bodyToLog;
      if (typeof req.body === 'object') {
        bodyToLog = JSON.stringify(req.body, null, 2);
      } else {
        bodyToLog = req.body.toString();
      }
      console.log(`[${timestamp}] Full Minimal Logger: Request body: ${bodyToLog}`);
    } else {
      console.log(`[${timestamp}] Full Minimal Logger: No request body.`);
    }

    res.status(200).json({
      message: "Full Minimal Logger on Vercel received your request.",
      receivedAt: timestamp,
      method: req.method
    });

  } catch (error) {
    console.error(`[${timestamp}] !!! ERROR in Full Minimal Logger !!!`);
    console.error(`[${timestamp}] Error message: ${error.message}`);
    console.error(`[${timestamp}] Error stack: ${error.stack}`);
    if (req.body) {
      try {
        console.error(`[${timestamp}] Request body during error: ${JSON.stringify(req.body, null, 2)}`);
      } catch (e) {
        console.error(`[${timestamp}] Request body (raw) during error: ${req.body.toString()}`);
      }
    }
    res.status(500).json({
      message: "Error in Full Minimal Logger on Vercel.",
      error: error.message,
      receivedAt: timestamp
    });
  }
}
