import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
);

// Defaults communs
ChartJS.defaults.font.family = 'Inter, system-ui, sans-serif';
ChartJS.defaults.font.size = 12;
ChartJS.defaults.color = 'oklch(0.52 0.005 240)'; // text-muted
