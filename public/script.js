(async () => {
    const startBtn = document.querySelector('.start-btn');
    const stopBtn = document.querySelector('.stop-btn');
    const result = document.querySelector('.result');
    const helper = document.querySelector('.helper');
    const highScores = document.querySelector('.high-scores');
    const input = document.querySelector('#user-name');
    const saveBtn = document.querySelector('.save-btn');

    startBtn.addEventListener('click', handleStartClick);
    stopBtn.addEventListener('click', handleStopClick);
    saveBtn.addEventListener('click', handleSaveClick);

    const timeGoal = 10000;
    const scores = await getScores();
    let timeStart, timeEnd, totalTime, intervalId;
    let elapsedTime = 0;
    let username = localStorage.getItem("username") || 'unknown';

    if (localStorage.getItem("username")) {
        input.classList.add("hidden");
        saveBtn.classList.add("hidden");
        document.querySelector(".username").innerText = username;
    }

    addHighScores(scores);

    async function addHighScores(scores) {
        const tableHtml = createTable(scores);
        highScores.innerHTML = tableHtml;
    }

    function handleStartClick() {
        startBtn.classList.add('hidden');
        stopBtn.classList.remove('hidden');
        timeStart = new Date().getTime();
        intervalId = setInterval(() => {
            elapsedTime++;
            if (elapsedTime <= 3) {
                helper.classList.add('blurry');
                setTimeout(() => helper.classList.remove('blurry'), 900);
            } else {
                helper.innerText = '';
            }
        }, 1000);
    }

    function handleStopClick() {
        stopBtn.classList.add('hidden');
        helper.classList.add('hidden');
        result.classList.remove('hidden');
        clearInterval(intervalId);

        timeEnd = new Date().getTime();
        totalTime = timeEnd - timeStart;

        result.innerText = (timeGoal - totalTime).toString() + "ms";
        sendToServer();

        const newScores = calculateNewScores(scores, {
            player: username || 'unknown',
            time: Math.abs(timeGoal - totalTime),
            created_at: new Date,
        });
        addHighScores(newScores);
    }

    function handleSaveClick() {
        input.classList.add("hidden");
        saveBtn.classList.add("hidden");
        document.querySelector(".username").innerText = input.value;
        username = input.value;
        localStorage.setItem("username", username);
    }

    function calculateNewScores(scores, newScore) {
        return [...scores, newScore].sort((a, b) => a.time - b.time).slice(0, 20);
    }
 
    function createTable(scores) {
        let table = `<table><tr><th>Player Name</th> <th>Time</th> <th>Date</th></tr>`;
        scores.forEach((score) => {
            table += `<tr><td>${score.player}</td><td>${score.time}</td><td>${formatDate(
                score.created_at,
            )}</td></tr>`;
        });
        table += `</table>`;
        return table;
    }

    function formatDate(dateString) {
        let o = new Intl.DateTimeFormat('en-GB', {
            timeStyle: 'medium',
            dateStyle: 'short',
        });
        return o.format(new Date(dateString));
    }

    async function getScores() {
        const response = await fetch('/api/get-scores');
        const data = await response.json();
        return data;
    }

    async function sendToServer() {
        await fetch('/api/add-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                player: username || 'unknown',
                time: Math.abs(timeGoal - totalTime),
            }),
        });
    }
})();
