const socket = new WebSocket('ws://localhost:4000');

// Функция для обновления графика радара
function updatePlot(pointRadius, scanAngle, power) {
    const pointTrace = {
        type: 'scatterpolar',
        mode: 'markers',
        r: [pointRadius],
        theta: [scanAngle],
        marker: {
            size: 10,
            color: power,
            colorscale: 'Viridis',
        }
    };

    const layout = {
        font: {
            size: 15
        },
        polar: {
            angularaxis: {
                tickwidth: 2,
                linewidth: 3,
                layer: "below traces"
            },
            radialaxis: {
                side: "counterclockwise",
                showline: true,
                linewidth: 2,
                tickwidth: 2,
                gridcolor: "grey",
                gridwidth: 2,
                range: [0, 130], // Максимальный радиус
            }
        },
        paper_bgcolor: "white"
    };

    Plotly.newPlot('chart', [pointTrace], layout);
}

// Обработчик для получения данных с WebSocket
socket.onmessage = function(event) {
    const data = JSON.parse(event.data);

    if (data.echoResponses && data.echoResponses.length > 0) {
        const scanAngle = data.scanAngle;
        const echoResponses = data.echoResponses;

        echoResponses.forEach(response => {
            const power = response.power;
            const time = response.time;
            const pointRadius = (300000 * time) / 2; // Вычисляем радиус

            updatePlot(pointRadius, scanAngle, power);
        });
    }
};

// Функция для отправки параметров через API
function updateRadarConfig() {
    const measurementsPerRotation = parseInt(document.getElementById('measurementsPerRotation').value);
    const rotationSpeed = parseInt(document.getElementById('rotationSpeed').value);
    const targetSpeed = parseInt(document.getElementById('targetSpeed').value);

    const configData = {
        measurementsPerRotation: measurementsPerRotation,
        rotationSpeed: rotationSpeed,
        targetSpeed: targetSpeed,
    };

    // Отправляем данные на сервер через API
    fetch('http://localhost:4000/config', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(configData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Radar parameters updated:', data);
    })
    .catch(error => {
        console.error('Error updating radar parameters:', error);
    });
}

// Обработчик для кнопки "Update Parameters"
document.getElementById('updateParams').addEventListener('click', function() {
    updateRadarConfig();
});
