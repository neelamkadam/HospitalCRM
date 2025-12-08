import React from "react";
import ReactApexChart from "react-apexcharts";

const ChartSkeleton = () => (
  <div className="animate-pulse h-full flex flex-col gap-4">
    <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto"></div>
    <div className="flex-1 bg-gray-100 rounded"></div>
  </div>
);

interface SeriesData {
  name: string;
  data: number[];
}

interface BarChartProps {
  series: SeriesData[];
  categories: string[];

  isLoading?: boolean;

  title?: string;
  yaxisTitle?: string;
  colors?: string[];
  height?: string | number;
  stacked?: boolean;
  horizontal?: boolean;

  dataLabelFormatter?: (val: number) => string;
  tooltipFormatter?: (val: number) => string;
}

const BarChart: React.FC<BarChartProps> = ({
  series,
  categories,
  isLoading = false,
  title = "Chart Title",
  yaxisTitle = "Values",
  colors = ["#ffedf5", "#e7fbff"],
  height = "100%",
  stacked = true,
  horizontal = false,
  dataLabelFormatter,
  tooltipFormatter,
}) => {
  const defaultDataLabelFormatter = (val: number) => val.toString();
  const defaultTooltipFormatter = (val: number) => val.toString();

  const chartOptions: ApexCharts.ApexOptions = {
    series: series,
    chart: {
      type: "bar",
      height: 350,
      stacked: stacked,
      toolbar: {
        show: true,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: horizontal,
        columnWidth: "45%",
        dataLabels: {
          position: horizontal ? "center" : "top",
        },
      },
    },
    colors: colors,
    fill: {
      opacity: 1,
    },
    dataLabels: {
      enabled: true,
      offsetY: horizontal ? 0 : -20,
      formatter: dataLabelFormatter || defaultDataLabelFormatter,
      style: {
        fontSize: "12px",
        colors: ["#304758"],
      },
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          colors: categories.map(() => "#526279"),
          fontSize: "11px",
        },
        rotate: horizontal ? 0 : -90,
        trim: true,
        hideOverlappingLabels: true,
      },
    },
    yaxis: {
      title: {
        text: yaxisTitle,
        style: {
          fontSize: "12px",
        },
      },
    },
    title: {
      text: title,
      align: "center",
      style: {
        fontSize: "14px",
        fontWeight: "bold",
      },
    },
    tooltip: {
      y: {
        formatter: tooltipFormatter || defaultTooltipFormatter,
      },
    },
    states: {
      hover: {
        filter: {
          type: "none",
        },
      },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: {
          type: "none",
        },
      },
    },
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "12px",
      markers: {
        size: 12,
        strokeWidth: 2,
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 300,
          },
          plotOptions: {
            bar: {
              columnWidth: "60%",
            },
          },
          xaxis: {
            labels: {
              style: {
                fontSize: "10px",
              },
            },
          },
          title: {
            style: {
              fontSize: "12px",
            },
          },
        },
      },
    ],
  };

  return (
    <div className="h-full min-h-[300px] sm:min-h-[400px]">
      {isLoading ? (
        <ChartSkeleton />
      ) : (
        <ReactApexChart
          options={chartOptions}
          series={chartOptions.series }
          type="bar"
          height={height}
        />
      )}
    </div>
  );
};

export default BarChart;
