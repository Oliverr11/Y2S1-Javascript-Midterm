const API_KEY = "3e22ff3c3d485684d4ef358a6fe96f04";
const IMG_CONTAINER = document.getElementById("movieDisplay");
let movieImage = [];

let currentPage = 1;
const PAGINATION_ELEMENT = document.getElementById("pagination");
const ROWS = 3;
const PREVOIUS_BTN = document.getElementById("prevoius");
const NEXT_BTN = document.getElementById("next");
const SEARCH_BTN = document.getElementById("searchBtn");

const FILTER = document.getElementById("filter");
const MOVIE_FILTER = document.getElementById("movieFilter");
const SERIES_FILTER = document.getElementById("seriesFilter");
let info = document.getElementById("info");
let filterValue;

fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${API_KEY}`)
  .then((response) =>
    response.ok ? response.json() : console.error("Fetching Error!")
  )
  .then((data) => {
    filterValue = "Trending";
    movieImage = data.results;
    displayMovies();
    setupPagination();
  })
  .catch((error) => console.log(error));

function displayMovies() {
  const start = (currentPage - 1) * ROWS;
  const end = start + ROWS;
  const paginatedMovies = movieImage.slice(start, end);

  IMG_CONTAINER.innerHTML = paginatedMovies
    .map((movie) => {
      return ` 
      <div data-aos="zoom-in-up" id="movie">
                <img src="${
                  movie.poster_path
                    ? "https://image.tmdb.org/t/p/w500/" + movie.poster_path
                    : "https://cdn-icons-png.flaticon.com/512/2748/2748558.png"
                }" alt="${filterValue == "Series" ? movie.name : movie.title}"/>
        <div class="details">
            <span>${filterValue == "Series" ? "Series" : "Movie"}</span>
            <h2>${filterValue == "Series" ? movie.name : movie.title}</h2>
            <div>
              <p>${
                filterValue == "Series"
                  ? movie.first_air_date.substring(0, 4)
                  : movie.release_date.substring(0, 4)
              }</p>
              <p>Rating : ${movie.vote_average}</p>
              <p>Review : ${movie.vote_count}</p>
            </div>

            <button class="detail-btn" data-id=${movie.id}>Details</button>
        </div>
      </div>
  `;
    })
    .join("");
  document.querySelectorAll(".detail-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      const movieId = event.target.dataset.id;
      console.log("Movie ID:", movieId);
      fetchMovieDetail(movieId);
    });
  });
}
MOVIE_FILTER.addEventListener("click", () => {
  FILTER.innerHTML = MOVIE_FILTER.textContent;
});
SERIES_FILTER.addEventListener("click", () => {
  FILTER.innerHTML = SERIES_FILTER.textContent;
});
SEARCH_BTN.addEventListener("click", () => {
  const movieName = document.getElementById("searchBox").value;
  if (FILTER.innerHTML == "Type ▼") {
    alert("Please select type");
  }
  if (movieName == "") {
    return;
  }
  currentPage = 1;
  if (FILTER.innerHTML == "Movie") {
    filterValue = "Movie";
    trending.innerHTML = `Searching for "${movieName}"`;
    fetch(
      `https://api.themoviedb.org/3/search/movie?query=${movieName}&api_key=${API_KEY}`
    )
      .then((response) =>
        response.ok ? response.json() : console.error("Fetching Error!")
      )
      .then((data) => {
        movieImage = data.results;
        displayMovies();
        setupPagination();
      })
      .catch((error) => console.log(error));
  } else if (FILTER.innerHTML == "Series") {
    filterValue = "Series";

    trending.innerHTML = `Searching for "${movieName}"`;
    fetch(
      `https://api.themoviedb.org/3/search/tv?query=${movieName}&api_key=${API_KEY}`
    )
      .then((response) =>
        response.ok ? response.json() : console.error("Fetching Error!")
      )
      .then((data) => {
        movieImage = data.results;
        displayMovies();
        setupPagination();
      })
      .catch((error) => console.log(error));
  }
});

function fetchMovieDetail(id) {
  const isMovie = filterValue === "Movie" || filterValue === "Trending";
  const url = isMovie
    ? `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`
    : `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}`;

  fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error("Fetching Error!");
      return response.json();
    })
    .then((data) => {
      const creditsUrl = isMovie
        ? `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${API_KEY}`
        : `https://api.themoviedb.org/3/tv/${id}/credits?api_key=${API_KEY}`;

      fetch(creditsUrl)
        .then((creditsResponse) => {
          if (!creditsResponse.ok) throw new Error("Fetching Credits Error!");
          return creditsResponse.json();
        })
        .then((creditsData) => {
          const genres = data.genres.map((genre) => genre.name).join(", ");
          const directors = creditsData.crew.filter(
            (person) => person.job === "Director"
          );
          const directorName = directors.length
            ? directors.map((director) => director.name).join(", ")
            : "Director not found in this API!";
          const topTenActors = creditsData.cast
            .slice(0, 10)
            .map((actor) => `${actor.name} (${actor.character})`)
            .join(", ");
          const writers = creditsData.crew.filter(
            (person) => person.job === "Writer"
          );
          const writersName = writers.length
            ? writers.map((writer) => writer.name).join(", ")
            : "Writer not found in this API!";
          info.style.display = "flex";
          info.innerHTML = `
            <img data-aos="flip-left" src="https://image.tmdb.org/t/p/w500/${
              data.poster_path
            }" alt="${isMovie ? data.title : data.name}" />
            <div class="movie-details">
              <p><span>Title:</span></p>
              <p>${isMovie ? data.title : data.name}</p>
              <p><span>Released:</span></p>
              <p>${isMovie ? data.release_date : data.first_air_date}</p>
              <p><span>Genre:</span></p>
              <p>${genres}</p>
              <p><span>Country:</span></p>
              <p>${data.origin_country}</p>
              <p><span>Director:</span></p>
              <p>${directorName}</p>
              <p><span>Writer:</span></p>
              <p>${writersName}</p>
              <p><span>Actors:</span></p>
              <p>${topTenActors}</p>
              <p><span>Awards:</span></p>
              <p>2 wins & 10 nominations</p>
            </div>
          `;
        })
        .catch((error) => console.error("Error fetching credits:", error));
    })
    .catch((error) => console.error("Error fetching movie details:", error));
}

let pageCountTemp;
function setupPagination() {
  const pageCount = Math.ceil(movieImage.length / ROWS);
  pageCountTemp = pageCount;
  PAGINATION_ELEMENT.innerHTML = "";
  // Show a maximum of 4 page buttons
  let startPage = Math.max(currentPage - 2, 1);
  let endPage = Math.min(startPage + 3, pageCount);

  for (let i = startPage; i <= endPage; i++) {
    const button = document.createElement("button");
    button.innerText = i;

    if (currentPage == i) button.classList.add("active");
    button.addEventListener("click", () => {
      currentPage = i;
      displayMovies();
      setupPagination();
    });

    PAGINATION_ELEMENT.appendChild(button);
  }
}

PREVOIUS_BTN.addEventListener("click", () => {
  if (currentPage == 1) {
    return;
  }
  currentPage--;
  displayMovies();
  setupPagination();
});
NEXT_BTN.addEventListener("click", () => {
  if (currentPage > pageCountTemp - 1) {
    return;
  }

  currentPage++;
  displayMovies();
  setupPagination();
});
