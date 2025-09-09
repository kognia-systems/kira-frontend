const HEYGEN_API_KEY = process.env.NEXT_PUBLIC_HEYGEN_API_KEY;
export async function getAccessToken() {
  const baseApiUrl = process.env.NEXT_PUBLIC_BASE_API_URL;
  try {
    if (!HEYGEN_API_KEY) {
      throw new Error("HEYGEN_API_KEY key is missing from .env");
    }

    const res = await fetch(`${baseApiUrl}/v1/streaming.create_token`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": HEYGEN_API_KEY,
      },
      body: JSON.stringify({}),
    });

    const data = await res.json();

    return data;
  } catch (error) {
    console.error("Error retrieving access token:", error);

    return new Response("Failed to retrieve access token", {
      status: 500,
    });
  }
}
