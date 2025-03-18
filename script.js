const API_KEY = "3e22ff3c3d485684d4ef358a6fe96f04";
let movieImage = [];
const imgContainer = document.getElementById("img-container");
const paginationElement = document.getElementById("pagination");
let currentPage = 1;
const rows = 3;
const prevoiusButton = document.getElementById("prevoius");
const nextButton = document.getElementById("next");
let info = document.getElementById("info");
fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${API_KEY}`)
  .then((response) =>
    response.ok ? response.json() : console.error("Fetching Error!")
  )
  .then((data) => {
    movieImage = data.results;
    displayMovies();
    setupPagination();
  })
  .catch((error) => console.log(error));

function displayMovies() {
  const start = (currentPage - 1) * rows;
  const end = start + rows;
  const paginatedMovies = movieImage.slice(start, end);

  imgContainer.innerHTML = paginatedMovies
    .map(
      (movie) => ` 
      <div id="movie">
        <img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${
        movie.title
      }"/>
        <div class="details">
            <span>${movie.media_type}</span>
            <h2>${movie.title}</h2>
            <div>
              <p>${movie.release_date.substring(0, 4)}</p>
              <p>Rating : ${movie.vote_average}</p>
              <p>Review : ${movie.vote_count}</p>
            </div>

            <button class="detail-btn" data-id=${movie.id}>Details</button>
        </div>
      </div>
  `
    )
    .join("");
  document.querySelectorAll(".detail-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      const movieId = event.target.dataset.id;
      console.log("Movie ID:", movieId);
      fetchMovieDetail(movieId);
    });
  });
}

function fetchMovieDetail(id) {
  let genres = [];
  fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`)
    .then((response) =>
      response.ok ? response.json() : console.error("Fetching Error!")
    )
    .then((data) => {
      genres = data.genres.map((genre) => genre.name).join(" , ");
      fetch(
        `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${API_KEY}`
      )
        .then((response2) =>
          response2.ok ? response2.json() : console.log("Fetching Error!")
        )
        .then((data2) => {
          const directors = data2.crew.filter(
            (person) => person.job === "Director"
          );
          const directorName = directors
            .map((director) => director.name)
            .join(" , ");

          const topTenActor = data2.cast.slice(0, 10);
          const topTenActorsString = topTenActor
            .map((actor) => `${actor.name} ( ${actor.character} )`)
            .join(" , ");

          const writer = data2.crew.filter((person) => person.job === "Writer");
          let Wrtiers;
          Wrtiers = writer.map((writer) => `${writer.name}`).join(" , ");
          if (writer == "") Wrtiers = "Writer not found in this API!";
          info.style.display = "flex";
          info.innerHTML = `
          <img
          src="https://image.tmdb.org/t/p/w500/${data.poster_path}"
          alt=""
        />
        <div class="movie-details">
          <p><span>Title:</span></p>
          <p>${data.title}</p>
          <p><span>Released:</span></p>
          <p>${data.release_date}</p>
          <p><span>Genre:</span></p>
          <p>${genres}</p>
          <p><span>Country:</span></p>
          <p>${data.origin_country}</p>
          <p><span>Director:</span></p>
          <p>${directorName}</p>
          <p><span>Writer:</span></p>
          <p>${Wrtiers}</p>
          <p><span>Actors:</span></p>
          <p>${topTenActorsString}</p>
          <p><span>Awards:</span></p>
          <p>2 wins & 10 nominations</p>
        </div>
        `;
        })
        .catch((error) => console.log(error));
    })
    .catch((error) => console.log(error));
}

let pageCountTemp;
function setupPagination() {
  const pageCount = Math.ceil(movieImage.length / rows);
  pageCountTemp = pageCount;
  paginationElement.innerHTML = "";
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

    paginationElement.appendChild(button);
  }
}
prevoiusButton.addEventListener("click", () => {
  if (currentPage == 1) {
    return;
  }
  currentPage--;
  displayMovies();
  setupPagination();
});
nextButton.addEventListener("click", () => {
  if (currentPage > pageCountTemp - 1) {
    return;
  }
  currentPage++;
  displayMovies();
  setupPagination();
});
