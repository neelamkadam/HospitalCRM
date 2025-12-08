import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useGetApi } from "../../services/use-api";
import API_CONSTANTS from "../../constants/apiConstants";
import moment from "moment";


interface OrgonChartProps {
  row: any;
  reportDataInfo: any;
}

interface ProcessedData {
  date: string;
  value: number;
  unit: string;
}

interface ChartState {
  series: ApexOptions["series"];
  options: ApexOptions;
}

const OrgonChart: React.FC<OrgonChartProps> = ({ row, reportDataInfo }) => {
  const [chartState, setChartState] = useState<ChartState>({
    series: [],
    options: {
      chart: {
        height: 350,
        type: "line",
        toolbar: {
          show: false,
        },
      },
      xaxis: { categories: [] },
      colors: ["#CEF1F8"],
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const { getData: GetReportApi } = useGetApi<any>("");

  useEffect(() => {
    const fetchAndProcessData = async () => {
      setIsLoading(true);
      try {
        const metricName = row.original?.metric || row.original?.name;
        if (!metricName || !reportDataInfo?.clientId?._id) return;

        const response = await GetReportApi(
          `${API_CONSTANTS.OVERTIMEDATA}?clientId=${reportDataInfo.clientId._id}&name=${metricName}`
        );

        const rawData = response?.data?.overtimeReport || [];

        // Process data
        // const processedData: ProcessedData[] = rawData
        //   .filter((entry: any) => entry.reportDate)
        //   .sort(
        //     (a: any, b: any) =>
        //       new Date(a.reportDate).getTime() -
        //       new Date(b.reportDate).getTime()
        //   )
        //   .map((entry: any) => ({
        //     date: new Date(entry.reportDate).toISOString().split("T")[0],
        //     value: parseFloat(entry.values[0]?.value || 0),
        //     unit: entry.values[0]?.unit || "μIU/mL",
        //   }));

        const processedData: ProcessedData[] = rawData
          .filter((entry: any) => {
            const value = entry?.values?.[0]?.value;
            return entry?.reportDate && !isNaN(parseFloat(value));
          })
          .sort(
            (a: any, b: any) =>
              new Date(a?.reportDate)?.getTime() -
              new Date(b?.reportDate)?.getTime()
          )
          .map((entry: any) => ({
            date: moment(entry?.reportDate).format("DD-MM-YYYY"),
            value: parseFloat(entry?.values[0]?.value),
            unit: entry?.values[0]?.unit || "μIU/mL",
          }));
        // console.log("🚀 ~ fetchAndProcessData ~ processedData:", processedData);

        // Update chart state
        setChartState({
          series: [
            {
              name: metricName,
              data: processedData?.map((item) => item.value),
            },
          ],
          options: {
            ...chartState.options,
            colors: ["#01576a"],
            xaxis: {
              categories: processedData?.map((item) => item.date),
              title: { text: "Date" },
              labels: {
                offsetY: 4,
              },
            },
            yaxis: {
              title: {
                text: `${metricName} (${processedData[0]?.unit || "μIU/mL"})`,
                style: {
                  fontSize: "12px",
                },
              },
              labels: {
                formatter: (value: number) =>
                  `${value} ${processedData[0]?.unit || ""}`,
                style: {
                  fontSize: "12px",
                },
              },
            },
            title: {
              text: `${metricName} Over Time`,
              align: "left",
            },
          },
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndProcessData();
  }, [row.original, reportDataInfo?.clientId?._id]);

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (!chartState?.series?.length)
    return <div className="p-4">No data available</div>;

  return (
    <div id="chart">
      <ReactApexChart
        options={chartState.options}
        series={chartState.series}
        type="line"
        height={350}
      />
    </div>
  );
};

export default OrgonChart;
