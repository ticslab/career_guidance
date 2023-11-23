import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

// export const options = {
//   responsive: true,
//   plugins: {
//     legend: {
//       position: 'top' as const,
//     },
//     title: {
//       display: true,
//       text: 'Chart.js Line Chart',
//     },
//   },
// };



export const LineChart = ({chartData, chartLabels, names}) => {
    const labels = chartLabels;
    const data = {
        // chartLabels,
        labels,
        datasets: [
            {
            fill: true,
            label: 'Вы',
            data: chartData[0],
            borderColor: 'rgb(87,129,213)',
            backgroundColor: 'rgba(197,217,250, 0.5)',
            },
            {
            fill: true,
            label: names[0],
            data: chartData[1],
            borderColor: 'rgb(239,190,59)',
            backgroundColor: 'rgba(255,232,195, 0.5)',
            },
            {
            fill: true,
            label: names[1],
            data: chartData[2],
            borderColor: 'rgb(84,167,157)',
            backgroundColor: 'rgba(187,212,206, 0.5)',
            },
            {
            fill: true,
            label: names[2],
            data: chartData[3],
            borderColor: 'rgb(190,86,75)',
            backgroundColor: 'rgba(240,203,195, 0.5)',
            },
        ],
        };

    return (<Line data={data}/>);
}

export default LineChart;