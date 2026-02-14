"use server";

const SERPER_API_KEY = process.env.SERPER_API_KEY;

export async function getSerperNews(query: string) {
    if (!SERPER_API_KEY) {
        throw new Error("Serper API key not configured");
    }

    const response = await fetch("https://google.serper.dev/news", {
        method: "POST",
        headers: {
            "X-API-KEY": SERPER_API_KEY,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ q: query, gl: "us", hl: "en" }),
    });

    if (!response.ok) {
        throw new Error(`Serper API error: ${response.statusText}`);
    }

    return response.json();
}

export async function getTrendingTopics() {
    if (!SERPER_API_KEY) {
        throw new Error("Serper API key not configured");
    }

    // Use Serper search to grab real Google Trends data
    const response = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
            "X-API-KEY": SERPER_API_KEY,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            q: "site:trends.google.com/trending",
            gl: "us",
            hl: "en",
            num: 10,
        }),
    });

    if (!response.ok) {
        throw new Error(`Serper API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Also fetch "related searches" for financial trending topics
    const financeResponse = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
            "X-API-KEY": SERPER_API_KEY,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            q: "trending financial news today",
            gl: "us",
            hl: "en",
            num: 5,
        }),
    });

    const financeData = financeResponse.ok ? await financeResponse.json() : null;

    // Combine and extract meaningful trending items
    const trends: { term: string; value: string; link?: string }[] = [];

    // Extract from relatedSearches
    if (data.relatedSearches) {
        for (const rs of data.relatedSearches.slice(0, 5)) {
            trends.push({ term: rs.query, value: "Trending" });
        }
    }

    // Extract from organic results
    if (financeData?.organic) {
        for (const item of financeData.organic.slice(0, 5)) {
            // Avoid duplicates
            if (!trends.find(t => t.term === item.title)) {
                trends.push({
                    term: item.title,
                    value: "Finance",
                    link: item.link,
                });
            }
        }
    }

    return trends.slice(0, 8);
}
