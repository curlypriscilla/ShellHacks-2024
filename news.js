// Your Guardian API key (Note: Exposing API keys client-side is not recommended)
const guardianApiKey = 'd81ff309-3965-4563-a8b9-ebd3cc9000c8';  // Replace with your Guardian API key

// Define the API endpoint and request fields like trailText
const guardianApiUrl = `https://content.guardianapis.com/search?q=tropical+storm&api-key=${guardianApiKey}&show-fields=trailText,headline`;

// Fetch news from the Guardian API
async function fetchNews() {
    try {
        const response = await fetch(guardianApiUrl);
        const data = await response.json();
        
        // Check if the request was successful
        if (data.response && data.response.status === "ok") {
            displayNews(data.response.results);
        } else {
            document.getElementById('news-container').innerHTML = 'Failed to load news.';
        }
    } catch (error) {
        console.error("Error fetching news:", error);
        document.getElementById('news-container').innerHTML = 'Error loading news.';
    }
}

// Function to display the news articles
function displayNews(articles) {
    const newsContainer = document.getElementById('news-container');
    newsContainer.innerHTML = ''; // Clear the loading message or any previous content

    if (articles.length === 0) {
        newsContainer.innerHTML = 'No news available.';
        return;
    }

    // Loop through the articles and display them
    articles.forEach(article => {
        const articleElement = document.createElement('div');
        articleElement.innerHTML = `
            <h3>${article.webTitle}</h3>
            <p>${article.fields ? article.fields.trailText : 'Read more below'}</p>
            <a href="${article.webUrl}" target="_blank">Read more</a>
            <hr>
        `;

        newsContainer.appendChild(articleElement);
    });
}

// Call fetchNews after the page and scripts have loaded
fetchNews();