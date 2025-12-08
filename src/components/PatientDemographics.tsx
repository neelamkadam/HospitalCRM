import React from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface PatientDemographicsProps {
  chartData: any;
}
const PatientDemographics: React.FC<PatientDemographicsProps> = ({
  chartData,
}) => {
  const categories =
    chartData?.length && chartData.map((item: any) => item.age);
  const maleData =
    chartData?.length && chartData.map((item: any) => item.maleCount);
  const femaleData =
    chartData?.length && chartData.map((item: any) => item.femaleCount);

  const state = {
    series: [
      {
        name: "Women",
        data: femaleData, // Use transformed female data
      },
      {
        name: "Men",
        data: maleData, // Use transformed male data
      },
    ],
    options: {
      chart: {
        type: "bar" as const, // Explicitly set the type to "bar"
        height: 350,
        stacked: true,
        toolbar: {
          show: false, // ❌ Hides download option
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 4,
          borderRadiusApplication: "end" as const,
          borderRadiusWhenStacked: "last" as const,
          barHeight: "20px",
          dataLabels: {
            total: {
              enabled: false, // ✅ Shows total count
              offsetX: 5,
              offsetY: 2,
              style: {
                fontSize: "12px",
                fontWeight: 500,
              },
            },
          },
        },
      },
      dataLabels: {
        enabled: false, // ❌ Hides individual counts
      },
      stroke: {
        width: 0,
        colors: ["#fff"],
      },
      grid: {
        position: "back" as const, // ✅ Moves grid behind bars
        xaxis: {
          lines: {
            show: true, // ✅ Shows vertical grid lines
          },
        },
        yaxis: {
          lines: {
            show: false, // ❌ Hides horizontal grid lines
          },
        },
      },
      annotations: {
        xaxis: [
          {
            x: 10,
            borderColor: "#E9E9E9",
            strokeDashArray: 2,
          },
          {
            x: 30,
            borderColor: "#E9E9E9",
            strokeDashArray: 2,
          },
          {
            x: 50,
            borderColor: "#E9E9E9",
            strokeDashArray: 2,
          },
          {
            x: 70,
            borderColor: "#E9E9E9",
            strokeDashArray: 2,
          },
          {
            x: 90,
            borderColor: "#E9E9E9",
            strokeDashArray: 2,
          },
        ],
      },
      xaxis: {
        categories: categories, // Use transformed age categories
        labels: {
          style: {
            colors: "#8C929A", // Set X-axis label color
            fontSize: "12px", // Set font size
          },
        },
      },
      yaxis: {
        title: {
          text: undefined,
        },
        labels: {
          offsetY: 4,
          style: {
            colors: "#8C929A", // Set Y-axis label color
            fontSize: "12px", // Set font size
          },
        },
      },
      // tooltip: {
      //   y: {
      //     formatter: function (val) {
      //       return val + "";
      //     },
      //   },
      // },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + ""; // This keeps only the value, removing the age range
          },
        },
        x: {
          show: false, // Hides the age range from the tooltip
        },
      },
      fill: {
        opacity: 1,
        colors: ["#ffedf5", "#e7fbff"], // Colors for Women and Men
      },
      states: {
        hover: {
          filter: {
            type: "none",
            value: 1, // Keeps the hover effect unchanged
          },
        },
        active: {
          allowMultipleDataPointsSelection: false, // Prevents selection effect
          filter: {
            type: "none", // Disables the darkening effect on click
          },
        },
      },
      legend: {
        show: false, // ✅ Hides the legend
      },
    } as ApexOptions, // Explicitly type the options object as ApexOptions
  };

  return (
    <div className="h-full">
      <div id="chart" className="h-full min-h-[280px] max-h-[600px]">
        <ReactApexChart
          options={state.options}
          series={state.series}
          type="bar"
          height="100%"
        />
      </div>
      <div id="html-dist"></div>
    </div>
  );
};

export default PatientDemographics;
