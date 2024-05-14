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

const availableScreenWidth = document.documentElement.scrollWidth - document.documentElement.scrollWidth * 0.1
export const LineChart = ({chartData, chartLabels, names}) => {

  const step = () => {
    let maxElement = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < chartData.length; i++) {
        for (let j = 0; j < chartData[i].length; j++) {
            if (chartData[i][j] > maxElement) {
                maxElement = chartData[i][j];
            }
        }
    }
    let step = maxElement >= 4  ? Math.ceil(maxElement / 4) : maxElement / 4
    return step;
}
const options = {
  scale: {
    y: {
      beginAtZero: true, 
      ticks: {
        stepSize: step 
      }
    }
  }
};
 
    const labels = chartLabels;
    const data = {
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

    return (<div style={{width: availableScreenWidth}}>
      <Line data={data} options={options}/>
          </div>);
}

export default LineChart;