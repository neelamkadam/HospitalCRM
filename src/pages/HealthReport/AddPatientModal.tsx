import React, { useEffect, useState } from "react";
import API_CONSTANTS from "../../constants/apiConstants";
import { useGetApi, usePostApi } from "../../services/use-api";
import AppSelectField from "../../components/AppSelect";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { selectPatient } from "../../utils/validationSchems";
import AppButton from "../../components/AppButton";
import { AuthResponseBodyDataModel } from "../../types/response.types";

export interface selectPatient {
  patientId: string;
}

interface AddPatientModalProps {
  isModalOpenPatients: React.Dispatch<React.SetStateAction<boolean>>;
  selectedData?: any; // Adjust type based on your usage
}

const AddPatientModal: React.FC<AddPatientModalProps> = ({
  isModalOpenPatients,
  selectedData,
}) => {
  const [patientList, setPatientList] = useState<any[]>([]);
  const { getData: GetPatientList } = useGetApi<any>("");

  const { postData: AddPatient, isLoading } =
    usePostApi<AuthResponseBodyDataModel>({
      path: API_CONSTANTS.INVITE_MEMBER,
    });

  const form = useForm<selectPatient>({
    resolver: yupResolver(selectPatient),
    defaultValues: {
      patientId: "",
    },
  });

  const fetchPatient = async () => {
    try {
      const response: any = await GetPatientList(
        `${API_CONSTANTS.GET_ALL_PATIENTS_WITH_ID}`
      );
      if (response.data.success) {
        const transformedData = response.data.data.clients.map((item: any) => ({
          label: item.name,
          value: item._id,
        }));
        setPatientList(transformedData);
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
    }
  };

  useEffect(() => {
    fetchPatient();
  }, []);

  const onSubmit: SubmitHandler<selectPatient> = async (
    data: selectPatient
  ) => {
    const payload = {
      patientId: data?.patientId,
      reportId: selectedData._id,
    };
    const resData: any = await AddPatient(payload);
    console.log(
      "🚀 ~ constonSubmit:SubmitHandler<AddMemer>= ~ resData:",
      resData
    );
    form.reset();
    isModalOpenPatients(false);
  };

  return (
    <div>
      <form
        className="space-y-6 text-[#1A2435] font-bolder text-[16px] p-6"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div>
          <AppSelectField
            name="patientId"
            form={form}
            label="Select Patient"
            placeholder="Select Patient"
            options={patientList}
          />
        </div>

        <div>
          <AppButton
            isLoading={isLoading}
            type="submit"
            className="w-full"
          ></AppButton>
        </div>
      </form>
    </div>
  );
};

export default AddPatientModal;
