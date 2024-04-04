import { Bar } from "react-chartjs-2";
import Chart from 'chart.js/auto';

const availableScreenWidth = document.documentElement.scrollWidth - document.documentElement.scrollWidth * 0.1
export const BarChart = ({ chartData }) => {
  return (
    <div className="chart-container" style={{width: availableScreenWidth}}>
      <p style={{ textAlign: "center", fontSize: '20px' }}>Любимые тематики сообществ</p>
      <Bar
        data={chartData}
        options={{
          plugins: {
            legend: {
              display: false
            }
          }
        }}
      />
    </div>
  );
};

export default BarChart