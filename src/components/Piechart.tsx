import React from "react";
import ReactApexChart from "react-apexcharts";

const ChartSkeleton = () => (
  <div className="animate-pulse h-full flex flex-col gap-4">
    <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto"></div>
    <div className="flex-1 bg-gray-100 rounded"></div>
  </div>
);

interface PiechartProps {
  analyticsLoading: boolean;
  pieChartData: {
    labels?: string[];
    series?: number[];
  };
}

const Piechart: React.FC<PiechartProps> = ({
  analyticsLoading,
  pieChartData,
}: any) => {
  const total =
    pieChartData.series?.reduce((a: number, b: number) => a + b, 0) || 0;

  const donutChartOptions: ApexCharts.ApexOptions = {
    series: pieChartData.series || [],
    chart: {
      type: "donut",
      height: 400,
    },
    labels:
      pieChartData.labels?.map((label: string, index: number) => {
        const percentage = pieChartData.series?.[index]
          ? ((pieChartData.series[index] / total) * 100).toFixed(1)
          : "0";
        return `${label} (${percentage}%)`;
      }) || [],
    colors: [
      "#90EE90",
      "#FFFACD",
      "#FFB6C1",
      "#87CEEB",
      "#D8BFD8",
      "#D3D3D3",
      "#98FB98",
      "#F0E68C",
      "#FFC0CB",
      "#B0C4DE",
      "#FFA07A",
      "#20B2AA",
      "#DEB887",
      "#5F9EA0",
      "#FF69B4",
      "#B22222",
    ],
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 350,
          },
          legend: {
            position: "bottom",
            fontSize: "11px",
          },
        },
      },
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 300,
          },
          legend: {
            position: "bottom",
            fontSize: "10px",
          },
          plotOptions: {
            pie: {
              donut: {
                size: "60%",
              },
            },
          },
        },
      },
      {
        breakpoint: 480,
        options: {
          chart: {
            height: 280,
          },
          legend: {
            position: "bottom",
            fontSize: "9px",
          },
        },
      },
    ],
    plotOptions: {
      pie: {
        donut: {
          size: "55%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              fontFamily: "Arial, sans-serif",
              fontWeight: 600,
              color: "#1A2435",
            },
            total: {
              show: true,
              label: "Total",
              color: "#526279",
              fontSize: "14px",
              fontFamily: "Arial, sans-serif",
              formatter: function (w) {
                return w.globals.seriesTotals.reduce(
                  (a: number, b: number) => a + b,
                  0
                );
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "right",
      horizontalAlign: "center",
      fontSize: "12px",
      fontFamily: "Arial, sans-serif",
      fontWeight: 400,
      labels: {
        colors: "#1A2435",
        useSeriesColors: false,
      },
      itemMargin: {
        horizontal: 8,
        vertical: 4,
      },
    },
    stroke: {
      width: 2,
      colors: ["#fff"],
    },
    states: {
      hover: {
        filter: {
          type: "darken",
        },
      },
    },
  };
  const donutChartSeries = pieChartData.series || [];

  return (
    <div className="h-full min-h-[300px] sm:min-h-[400px]">
      {analyticsLoading ? (
        <ChartSkeleton />
      ) : (
        <ReactApexChart
          options={donutChartOptions}
          series={donutChartSeries}
          type="donut"
          height="100%"
        />
      )}
    </div>
  );
};

export default Piechart;
