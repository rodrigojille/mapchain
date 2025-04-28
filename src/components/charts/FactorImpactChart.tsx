import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface FactorImpactChartProps {
  data: ChartData<'bar'>;
  options?: ChartOptions<'bar'>;
}

const FactorImpactChart: React.FC<FactorImpactChartProps> = ({ data, options }) => {
  const defaultOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const, // Horizontal bar chart
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.x !== null) {
              label += `${context.parsed.x.toFixed(1)}%`;
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Impact (%)'
        },
        ticks: {
          callback: function(value) {
            return `${value}%`;
          }
        }
      }
    }
  };

  const mergedOptions = { ...defaultOptions, ...options };

  return <Bar data={data} options={mergedOptions} />;
};

export default FactorImpactChart;
