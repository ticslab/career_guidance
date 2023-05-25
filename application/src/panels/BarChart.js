import { Bar } from "react-chartjs-2";
import Chart from 'chart.js/auto';
export const BarChart = ({ chartData }) => {
  return (
    <div className="chart-container">
      <p style={{ textAlign: "center", fontSize: '20px', width: 500 }}>Любимые тематики сообществ</p>
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