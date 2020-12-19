// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
var store = {
  track_id: undefined,
  player_id: undefined,
  race_id: undefined,
};

const customRacerName = {
  'Racer 1': 'Koke',
  'Racer 2': 'Son',
  'Racer 3': 'Oblak',
  'Racer 4': 'Torres',
  'Racer 5': 'Saul',
};

const customTrackName = {
  'Track 1': 'SPA-FRANCORCHAMPS',
  'Track 2': 'SUZUKA',
  'Track 3': 'CIRCUIT DE LA SARTHE',
  'Track 4': 'LAGUNA SECA',
  'Track 5': 'MONZA',
  'Track 6': 'INTERLAGOS',
};

// We need our javascript to wait until the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  onPageLoad();
  setupClickHandlers();
});

async function onPageLoad() {
  try {
    getTracks().then((tracks) => {
      const html = renderTrackCards(tracks);
      renderAt('#tracks', html);
    });

    getRacers().then((racers) => {
      const html = renderRacerCars(racers);
      renderAt('#racers', html);
    });
  } catch (error) {
    console.log('Problem getting tracks and racers ::', error.message);
    console.error(error);
  }
}

function setupClickHandlers() {
  document.addEventListener(
    'click',
    function (event) {
      const { target } = event;

      // Race track form field
      if (target.matches('.card.track')) {
        handleSelectTrack(target);
      }

      // Podracer form field
      if (target.matches('.card.podracer')) {
        handleSelectPodRacer(target);
      }

      // Submit create race form
      if (target.matches('#submit-create-race')) {
        event.preventDefault();

        // start race
        handleCreateRace();
      }

      // Handle acceleration click
      if (target.matches('#gas-peddle')) {
        handleAccelerate(target);
      }
    },
    false
  );
}

async function delay(ms) {
  try {
    return await new Promise((resolve) => setTimeout(resolve, ms));
  } catch (error) {
    console.log("an error shouldn't be possible here");
    console.log(error);
  }
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
  // render starting UI
  const { player_id, track_id } = store;

  try {
    // invoke the API call to create the race, then save the result
    const race = await createRace(player_id, track_id);
    const { Track } = race;
    renderAt('#race', renderRaceStartView(Track));
    // update the store with the race id
    store = { ...store, race_id: race.ID };
    // The race has been created, now start the countdown
    await runCountdown();
    // call the async function startRace
    await startRace(race.ID);
    // call the async function runRace
    await runRace(race.ID);
  } catch (err) {
    console.log('fail to create a race');
    console.log('Error: ', err);
  }
}

function runRace(raceID) {
  return new Promise((resolve, reject) => {
    // use Javascript's built in setInterval method to get race info every 500ms
    const interval = setInterval(async () => {
      try {
        const race = await getRace(raceID);
        const { status, positions } = race;
        if (status === 'in-progress') {
          renderAt('#leaderBoard', raceProgress(positions));
        } else if (status === 'finished') {
          clearInterval(interval);
          renderAt('#race', resultsView(positions));
          resolve(race);
        }
      } catch (err) {
        console.log(err);
      }
    }, 500);
  }).catch((err) => {
    console.log('fail to run the race');
    console.log('Error: ', err);
  });
  // remember to add error handling for the Promise
}

async function runCountdown() {
  try {
    // wait for the DOM to load
    await delay(1000);
    let timer = 3;

    return new Promise((resolve) => {
      // use Javascript's built in setInterval method to count down once per second
      const interval = setInterval(async () => {
        document.getElementById('big-numbers').innerHTML = --timer;
        if (timer === 0) {
          clearInterval(interval);
          resolve();
        }
      }, 1000);
    });
  } catch (error) {
    console.log('fail to run the countdown');
    console.log('Error: ', err);
  }
}

function handleSelectPodRacer(target) {
  console.log('selected a pod', target.id);

  // remove class selected from all racer options
  const selected = document.querySelector('#racers .selected');
  if (selected) {
    selected.classList.remove('selected');
  }

  // add class selected to current target
  target.classList.add('selected');

  // save the selected racer to the store
  store = { ...store, player_id: parseInt(target.id) };
}

function handleSelectTrack(target) {
  console.log('selected a track', target.id);

  // remove class selected from all track options
  const selected = document.querySelector('#tracks .selected');
  if (selected) {
    selected.classList.remove('selected');
  }

  // add class selected to current target
  target.classList.add('selected');

  // save the selected track id to the store
  store = { ...store, track_id: parseInt(target.id) };
}

async function handleAccelerate() {
  const { race_id } = store;
  try {
    accelerate(race_id);
  } catch (err) {
    console.log('Problem with accelerating the car:::', err);
  } // Invoke the API call to accelerate
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
  if (!racers.length) {
    return `
			<h4>Loading Racers...</4>
		`;
  }

  const results = racers.map(renderRacerCard).join('');

  return `
		<ul id="racers">
			${results}
		</ul>
	`;
}

function renderRacerCard(racer) {
  const { id, driver_name, top_speed, acceleration, handling } = racer;

  return `
		<li class="card podracer" id="${id}">
			<h3>${customRacerName[driver_name]}</h3>
			<p>${top_speed}</p>
			<p>${acceleration}</p>
			<p>${handling}</p>
		</li>
	`;
}

function renderTrackCards(tracks) {
  if (!tracks.length) {
    return `
			<h4>Loading Tracks...</4>
		`;
  }

  const results = tracks.map(renderTrackCard).join('');

  return `
		<ul id="tracks">
			${results}
		</ul>
	`;
}

function renderTrackCard(track) {
  const { id, name } = track;

  return `
		<li id="${id}" class="card track">
			<h3>${customTrackName[name]}</h3>
		</li>
	`;
}

function renderCountdown(count) {
  return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`;
}

function renderRaceStartView(track) {
  return `
		<header>
			<h1>Race: ${track.name}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`;
}

function resultsView(positions) {
  positions.sort((a, b) => (a.final_position > b.final_position ? 1 : -1));

  return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`;
}

function raceProgress(positions) {
  let userPlayer = positions.find((e) => e.id === store.player_id);
  const name = `${customRacerName[userPlayer.driver_name]} (you)`;

  const newPositions = positions.sort((a, b) =>
    a.segment > b.segment ? -1 : 1
  );
  let count = 1;

  const results = newPositions.map((p) => {
    return `
			<tr>
				<td>
            <h3>${count++} - ${
      p.id === store.player_id ? name : customRacerName[p.driver_name]
    }</h3>
				</td>
			</tr>
		`;
  });

  return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard">
				${results}
			</section>
		</main>
	`;
}

function renderAt(element, html) {
  const node = document.querySelector(element);

  node.innerHTML = html;
}

// ^ Provided code ^ do not remove

// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:8000';

function defaultFetchOpts() {
  return {
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': SERVER,
    },
  };
}

function getTracks() {
  return fetch(`${SERVER}/api/tracks`, { ...defaultFetchOpts() })
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log('Problem with getTracks request::', err));
}

function getRacers() {
  return fetch(`${SERVER}/api/cars`, { ...defaultFetchOpts() })
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log('Problem with getTracks request::', err));
}

function createRace(player_id, track_id) {
  player_id = parseInt(player_id);
  track_id = parseInt(track_id);
  const body = { player_id, track_id };

  return fetch(`${SERVER}/api/races`, {
    method: 'POST',
    ...defaultFetchOpts(),
    dataType: 'jsonp',
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .catch((err) => console.log('Problem with createRace request::', err));
}

function getRace(id) {
  return fetch(`${SERVER}/api/races/${id - 1}`, {
    method: 'GET',
    ...defaultFetchOpts(),
  })
    .then((res) => res.json())
    .catch((err) => console.log('Problem with getRace request::', err));
}

function startRace(id) {
  return fetch(`${SERVER}/api/races/${id - 1}/start`, {
    method: 'POST',
    ...defaultFetchOpts(),
  }).catch((err) => console.log('Problem with startRace request::', err));
}

function accelerate(id) {
  return fetch(`${SERVER}/api/races/${id - 1}/accelerate`, {
    method: 'POST',
    ...defaultFetchOpts(),
  }).catch((err) => console.log('Problem with accelerating the car::', err));
}
