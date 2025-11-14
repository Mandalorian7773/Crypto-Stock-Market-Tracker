import Plot from 'react-plotly.js';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface PlotlyChartProps {
  data: any[];
  layout?: any;
  config?: any;
}

export const PlotlyChart = ({ data, layout, config }: PlotlyChartProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="h-[400px] glass rounded-lg animate-pulse" />;
  }

  const defaultLayout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#e2e8f0', size: 12 },
    xaxis: {
      gridcolor: 'rgba(255,255,255,0.1)',
      color: '#94a3b8',
      showgrid: true,
      gridwidth: 1,
      tickformat: '%b %d', // Format as "Jan 01"
      tickangle: -45,
      showline: true,
      linewidth: 1,
      linecolor: 'rgba(255,255,255,0.2)',
      mirror: true,
      ticks: 'outside',
      tickwidth: 1,
      tickcolor: 'rgba(255,255,255,0.2)',
      ticklen: 5,
    },
    yaxis: {
      gridcolor: 'rgba(255,255,255,0.1)',
      color: '#94a3b8',
      showgrid: true,
      gridwidth: 1,
      tickformat: '$,.2f', // Format as "$1,234.56"
      showline: true,
      linewidth: 1,
      linecolor: 'rgba(255,255,255,0.2)',
      mirror: true,
      ticks: 'outside',
      tickwidth: 1,
      tickcolor: 'rgba(255,255,255,0.2)',
      ticklen: 5,
      automargin: true,
    },
    margin: { l: 60, r: 20, t: 20, b: 80 },
    hovermode: 'x unified',
    hoverlabel: {
      bgcolor: 'rgba(30, 41, 59, 0.9)',
      bordercolor: 'rgba(255,255,255,0.1)',
      font: { color: '#e2e8f0', size: 12 }
    },
    ...layout,
  };

  const defaultConfig = {
    displayModeBar: true,
    modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d'],
    displaylogo: false,
    responsive: true,
    ...config,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass rounded-lg p-4"
    >
      <Plot
        data={data}
        layout={defaultLayout}
        config={defaultConfig}
        style={{ width: '100%', height: '400px' }}
      />
    </motion.div>
  );
};