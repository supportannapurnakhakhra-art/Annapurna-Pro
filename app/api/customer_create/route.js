// Proxy endpoint to forward requests to production Shopify app
export async function POST(req) {
    try {
        const body = await req.json();

        console.log("� Proxying customer creation request to production API...", {
            email: body.email,
            phone: body.phone,
        });

        // Forward the request to your production Shopify app
        const response = await fetch(
            "https://khakhra-x-megachat.megascale.co.in/app/api/customer_create",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            }
        );

        const data = await response.json();

        console.log("✅ Production API response:", data);

        return Response.json(data, { status: response.status });
    } catch (error) {
        console.error("❌ Proxy Error:", error.message);
        return Response.json(
            {
                success: false,
                message: `Proxy error: ${error.message}`,
            },
            { status: 500 }
        );
    }
}
