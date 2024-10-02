const socket = new WebSocket('ws://localhost:4000');

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
                range: [0, 50],
            }
        },
        paper_bgcolor: "white"
    };

    Plotly.newPlot('chart', [pointTrace], layout);
}

socket.onmessage = function(event) {
    const data = JSON.parse(event.data);

    if (data.echoResponses && data.echoResponses.length > 0) {
        var pulseDuration = data.pulseDuration;
        var scanAngle = data.scanAngle;
        var echoResponses = data.echoResponses;

        echoResponses.forEach(response => {
            var power = response.power;
            var pointRadius = response.pointRadius;

            if (pointRadius > 50) {
                pointRadius = 50;
            }

            updatePlot(pointRadius, scanAngle, power);
        });
    }
};

let currentAngle = 0;
const angleStep = 5;

setInterval(() => {
    currentAngle = (currentAngle + angleStep) % 360;
    const randomPointRadius = Math.random() * 50;
    const randomPower = Math.random() * 100;

    updatePlot(randomPointRadius, currentAngle, randomPower);
}, 1000);
