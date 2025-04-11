import {Bar} from 'react-chartjs-2';

import{
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';

ChartJS .register(
    CategoryScale,
    LinearScale,
    PointElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

var consumo = [150, 100, 190, 320, 300, 250, 340];
var maquinas = ["Maquina 1", "Maquina 2", "Maquina 3", "Maquina 4", "Maquina 5", "Maquina 6", "Maquina 7"];

var misoptions = {
    responsive : true,
    animation : false,
    plugins : {
        legend : {
            display : false
        }
    },
    scales : {
        y : {
            min : 0,
            max : 400,
        },
        x : {
            ticks : {color: '#000000'}
        }
    }
};

var midata = {
    labels : maquinas,
    datasets : [
        {
            label : "Consumo kWh",
            data : consumo,
            backgroundColor : "#32CD32"
        }
    ]
};

export default function Bars() {
    return <Bar data = {midata} options = {misoptions} />
}