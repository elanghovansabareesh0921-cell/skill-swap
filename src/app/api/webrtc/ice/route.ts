import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Default public STUN fallbacks
    const iceServers: RTCIceServer[] = [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ];

    // Check if custom TURN server credentials exist in environment variables
    const turnUrl = process.env.TURN_SERVER_URL; // e.g. "turn:global.relay.metered.ca:80"
    const turnUsername = process.env.TURN_SERVER_USERNAME;
    const turnCredential = process.env.TURN_SERVER_CREDENTIAL;

    if (turnUrl && turnUsername && turnCredential) {
      iceServers.push(
        {
          urls: turnUrl,
          username: turnUsername,
          credential: turnCredential,
        },
        {
          urls: turnUrl.replace(":80", ":443"),
          username: turnUsername,
          credential: turnCredential,
        }
      );
    }

    return NextResponse.json({ iceServers });
  } catch (err: any) {
    return NextResponse.json(
      {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      },
      { status: 200 }
    );
  }
}