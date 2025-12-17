const API_KEY = "732854a61c8b45e3882142704250912"; 
const WEATHER_API_BASE = "https://api.weatherapi.com/v1/current.json"; 

// Below are DOM Elements
const cityInput = document.getElementById('city-input');
const searchButton = document.getElementById('search-button');
const errorMessage = document.getElementById('error-message');
const weatherInfoDiv = document.getElementById('weather-info');

// Hamburger Menu Elements 
const hamburger = document.getElementById('hamburger-menu');
const navLinks = document.querySelector('.nav-links');

//1. Navigation Bar & Smooth Scrolling 

// DOM manipulation for hamburger menu toggle
function toggleHamburgerMenu() {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('is-active'); 
}

hamburger.addEventListener('click', toggleHamburgerMenu);

// JavaScript event listeners for the purpose of smooth scrolling 
document.querySelectorAll('.scroll-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        document.querySelector(targetId).scrollIntoView({
            behavior: 'smooth' 
        });
        
        
        if (navLinks.classList.contains('active')) {
            toggleHamburgerMenu();
        }
    });
});


// Helper Functions

// Date Formatting 
function formatWeatherDate(dateTimeStr) {
   const date = new Date(dateTimeStr.replace(' ', 'T')); 
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options); 
}

// Function to choose a simple emoji for weather based on condition text
function getWeatherEmoji(conditionText) {
    const text = conditionText.toLowerCase();
    if (text.includes('sunny') || text.includes('clear')) return '☀️'; 
    if (text.includes('rain') || text.includes('drizzle')) return '🌧️'; 
    if (text.includes('cloud') || text.includes('overcast')) return '☁️'; 
    if (text.includes('snow') || text.includes('sleet')) return '❄️';
    if (text.includes('fog') || text.includes('mist')) return '🌫️';
    return '❓';
}

// Function to display the fetched weather data
function displayWeather(data) {
    weatherInfoDiv.innerHTML = ''; 
    
    // Checking for API error response (e.g., city not found)
    if (data.error) {
        errorMessage.textContent = "City not found. Please check the spelling and try again.";
        return;
    }

    // Clearing any existing error message
    errorMessage.textContent = ''; 

    // Extracting necessary data
    const location = data.location;
    const current = data.current;

    const weatherEmoji = getWeatherEmoji(current.condition.text);

    // Building the dynamic HTML content
    const htmlContent = `
        <h3>${location.name}, ${location.country}</h3> <p class="date">${formatWeatherDate(location.localtime)}</p> <div class="main-temp">
            <span class="emoji">${weatherEmoji}</span> <span class="temperature">${current.temp_c}°C</span> </div>
        <p class="description"><strong>Condition:</strong> ${current.condition.text}</p> <hr>
        <div class="details-grid">
            <p><strong>Humidity:</strong> ${current.humidity}%</p> <p><strong>Wind Speed:</strong> ${current.wind_kph} kph</p> <p><strong>Pressure:</strong> ${current.pressure_mb} mb</p> </div>
    `;

    weatherInfoDiv.innerHTML = htmlContent;
}

// 2. Search Bar Section & API Fetching 

// Main function to fetch weather data
async function fetchWeather(city) {
  
    if (!city) {
        errorMessage.textContent = "Please enter a city name."; 
        weatherInfoDiv.innerHTML = '<p>Search for a city above to see the weather details.</p>';
        return;
    }

    errorMessage.textContent = 'Fetching weather...'; 
    weatherInfoDiv.innerHTML = ''; 

    try {
        const url = `${WEATHER_API_BASE}?key=${API_KEY}&q=${city}`;
        
        const response = await fetch(url);

        const data = await response.json();

        if (response.status === 400 || data.error) {
            displayWeather(data);
            return;
        }

        // Processing and displaying the data
        displayWeather(data);

        addToSearchHistory(city);

    } catch (error) {
        console.error('Fetch error:', error);
        errorMessage.textContent = 'Failed to connect to weather service. Check your API key or network.';
    }
}

// Event listener for the Search button click 
searchButton.addEventListener('click', () => {
    const city = cityInput.value.trim();
    fetchWeather(city);
});

// Event listener for Enter key press on the input field 
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        fetchWeather(city);
    }
});



let searchHistory = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];

function addToSearchHistory(city) {
    const lowerCity = city.trim();
    // Storing last 5 unique searches using array logic 
    
    // Removing if already exists to ensure uniqueness and move to next
    searchHistory = searchHistory.filter(item => item.toLowerCase() !== lowerCity.toLowerCase());
    
    // Adding to the beginning of the array (most recent first)
    searchHistory.unshift(lowerCity);

    // Keeping only the first 5 elements
    if (searchHistory.length > 5) {
        searchHistory.splice(5); 
    }

    localStorage.setItem('weatherSearchHistory', JSON.stringify(searchHistory));
    renderSearchHistory();
}

function renderSearchHistory() {
    const historyContainer = document.getElementById('search-history-container');
    historyContainer.innerHTML = '<h4>Recent Searches:</h4>';
    
    if (searchHistory.length === 0) {
        historyContainer.innerHTML += '<p>No recent searches yet.</p>';
        return;
    }

    const ul = document.createElement('ul');
    searchHistory.forEach(city => {
        const li = document.createElement('li');
        li.textContent = city;
        // Event listener to re-fetch weather on click
        li.addEventListener('click', () => {
            cityInput.value = city;
            fetchWeather(city);
        });
        ul.appendChild(li);
    });
    historyContainer.appendChild(ul);
}


//  6. Footer: Back-to-Top Button
const backToTopButton = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
    // Show the button when scrolling down 400px
    if (window.scrollY > 400) {
        backToTopButton.style.display = 'block';
    } else {
        backToTopButton.style.display = 'none';
    }
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});


// Initialization on page load 
document.addEventListener('DOMContentLoaded', () => {
    // Setting the current year in the footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Load and display search history
    renderSearchHistory();
});