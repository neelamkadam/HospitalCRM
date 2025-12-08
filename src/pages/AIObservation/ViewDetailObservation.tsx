import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetApi } from "../../services/use-api";
import API_CONSTANTS from "../../constants/apiConstants";
import ReactJson from "react-json-view";
import AppButton from "../../components/AppButton";
import { ArrowLeft } from "lucide-react";
import { ROUTES } from "../../constants/routesConstants";

const ViewDetailObservation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const patientId = searchParams.get("id");
  const { getData: GetreportData } = useGetApi<any>("");
  const [report, setReport] = useState<any>({});

  useEffect(() => {
    GetReportData();
  }, []);

  const GetReportData = async () => {
    const response: any = await GetreportData(
      `${API_CONSTANTS.REPORT_PROCESSING}/${patientId}`
    );
    if (response?.data.success) {
      setReport(response.data.data);
    }
  };

  return (
    <div className="min-h-screen p-4 !bg-[#f3f4f6]">
      <header className="flex justify-between -mt-10 mb-4">
        <AppButton
          onClick={() => navigate(ROUTES.AIOBSERVATIONS)}
          className="py-3 rounded-[30px] w-[130px] h-[40px] !bg-white !text-[#293343] border-none flex items-center justify-center pl-1 text-sm"
        >
          <ArrowLeft className="w-7 h-7" />
          Back
        </AppButton>
      </header>
      <div className="flex flex-wrap gap-6 mb-6">
        <div className="flex-1 min-w-[400px] rounded-lg p-4 shadow-lg bg-white">
          <h2 className="text-xl font-bold mb-4 text-[#293343]">
            Extraction Response
          </h2>
          <div className="h-96 overflow-auto">
            <ReactJson
              name={"Extraction Response"}
              src={report.extractionResponse || {}}
              style={{
                backgroundColor: "transparent",
                textAlign: "left",
                paddingLeft: "0px",
              }}
              iconStyle="triangle"
              theme="bright:inverted"
              collapsed={1}
              indentWidth={4}
              displayDataTypes={false}
              quotesOnKeys={false}
            />
          </div>
        </div>

        <div className="flex-1 min-w-[400px] rounded-lg p-4 shadow-lg bg-white">
          <h2 className="text-xl font-bold mb-4 text-[#293343]">
            Interpretation Response
          </h2>
          <div className="h-96 overflow-auto">
            <ReactJson
              name={"Interpretation Response"}
              src={report.interpretationResponse || {}}
              style={{
                backgroundColor: "transparent",
                textAlign: "left",
                paddingLeft: "0px",
              }}
              iconStyle="triangle"
              theme="bright:inverted"
              collapsed={1}
              indentWidth={4}
              displayDataTypes={false}
              quotesOnKeys={false}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg p-6 shadow-lg bg-white">
        <h2 className="text-xl font-bold text-[#293343]">PDF Content</h2>
        <pre className="whitespace-pre-wrap font-mono text-sm p-4 rounded-md max-h-96 overflow-auto">
          {report.pdfText}
        </pre>
      </div>
    </div>
  );
};

export default ViewDetailObservation;
