import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, couponCode, rewardText, businessName, expiryDate } =
    await req.json();

  if (!email || !couponCode) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Email service not configured" },
      { status: 500 }
    );
  }

  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  );

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; background: #FDFAF4; padding: 0;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #166534, #15803D); padding: 32px 24px; text-align: center; border-radius: 0 0 24px 24px;">
        <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.15); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 28px;">🎁</span>
        </div>
        <h1 style="color: #fff; font-size: 22px; font-weight: 800; margin: 0 0 4px;">Your Reward is Ready!</h1>
        <p style="color: rgba(255,255,255,0.8); font-size: 13px; margin: 0;">from <strong>${businessName}</strong></p>
      </div>

      <!-- Coupon Code -->
      <div style="padding: 24px; text-align: center;">
        <div style="background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(22,101,52,0.1); border: 1px solid #E8E2D6;">
          <div style="background: linear-gradient(135deg, #166534, #15803D); padding: 20px; text-align: center;">
            <p style="color: rgba(255,255,255,0.7); font-size: 10px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 8px; font-weight: 600;">Your Coupon Code</p>
            <p style="color: #fff; font-size: 28px; font-weight: 800; letter-spacing: 3px; font-family: 'Courier New', monospace; margin: 0;">${couponCode}</p>
          </div>
          <div style="padding: 20px; text-align: center;">
            <p style="color: #166534; font-size: 16px; font-weight: 700; margin: 0 0 8px;">${rewardText}</p>
            <p style="color: #8B9A7E; font-size: 12px; margin: 0;">Expires in <strong style="color: #6B7B68;">${daysLeft} days</strong> &nbsp;|&nbsp; ${expiryDate}</p>
          </div>
        </div>
      </div>

      <!-- Instructions -->
      <div style="padding: 0 24px 32px; text-align: center;">
        <p style="color: #8B9A7E; font-size: 12px; margin: 0 0 16px;">Show this code to the cashier at <strong style="color: #166534;">${businessName}</strong> to redeem your reward.</p>
        <div style="border-top: 1px solid #E8E2D6; padding-top: 16px;">
          <p style="color: #C4BBA8; font-size: 10px; margin: 0;">Powered by <strong style="color: #166534;">RevuGo</strong></p>
        </div>
      </div>
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "RevuGo <coupons@reviewflow.in>",
        to: [email],
        subject: `🎁 Your coupon from ${businessName} — ${couponCode}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json(
        { error: err.message || "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
