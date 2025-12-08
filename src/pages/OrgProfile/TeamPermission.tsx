import React, { useState } from "react";
import AppModal from "../../components/AppModal";
import AppInputField from "../../components/AppInput";
import { SwitchWithLabel } from "../../components/AppSwitchWithLabel";
import AppButton from "../../components/AppButton";
import { SubmitHandler, useForm } from "react-hook-form";
import { addTeamMemberNew } from "../../utils/validationSchems";
import { yupResolver } from "@hookform/resolvers/yup";
import { accessOptions } from "../../constants/AppConstants";
import { usePostApi } from "../../services/use-api";
import { AuthResponseBodyDataModel } from "../../types/response.types";
import API_CONSTANTS from "../../constants/apiConstants";
import { Checkbox } from "../../components/ui/checkbox";

interface TeamPermissionProps {
  id: string | undefined;
}

export interface AddMemer {
  email: string;
  access: Record<string, boolean>;
}

const TeamPermission: React.FC<TeamPermissionProps> = ({ id }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [fullAccess, setFullAccess] = useState(false);

  const edit = false;
  const deleteLoading = false;
  const handleDelete = () => {};
  const handleFullAccessChange = (value: boolean) => setFullAccess(value);

  const { postData: inviteMember, isLoading } =
    usePostApi<AuthResponseBodyDataModel>({
      path: API_CONSTANTS.INVITE_MEMBER,
    });

  const form = useForm<AddMemer>({
    resolver: yupResolver(addTeamMemberNew),
    defaultValues: {
      email: "",
      access: Object.fromEntries(
        accessOptions.map((option) => [option.key, false])
      ),
    },
  });

  const toggleClose = () => {
    form.reset();
    setIsModalOpen((prev) => !prev);
  };

  const onSubmit: SubmitHandler<AddMemer> = async (data) => {
    const trueAccess = Object.entries(data.access)
      .filter(([, value]) => value === true)
      .map(([key]) => key);

    const permissions = fullAccess
      ? [...trueAccess, "full_access"]
      : [...trueAccess, "limited_access"];

    const payload = {
      email: data.email,
      organizationId: id,
      permissions,
    };

    const resData: any = await inviteMember(payload);
    console.log("🚀 ~ onSubmit ~ resData:", resData);
    toggleClose();
    form.reset();
  };

  return (
    <div className="flex justify-start">
      <AppModal isOpen={isModalOpen} toggle={toggleClose} title="">
        <div className="rounded-md shadow-sm">
          <header className="text-xl text-[#1A2435] font-medium px-6 py-4 border-b text-left">
            <h1>Add Member</h1>
            <p className="text-sm text-[#394557]">
              Invite a new member to your organization
            </p>
          </header>

          <form
            className="space-y-6 text-[#394557] font-bolder text-[16px] px-6 py-4 pb-6"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <AppInputField<AddMemer>
              name="email"
              form={form}
              readonly={edit}
              label="Email id"
              placeholder="Username"
            />

            <div className="p-4 bg-[#F7F8F8] border border-[#E6E7E9] rounded-lg">
              <label className="block text-sm font-medium mb-2 text-[#1A2435] text-left">
                Access Options
              </label>
              <div className="grid grid-cols-2 gap-2">
                {accessOptions.map((option) => (
                  <div key={option.key} className="flex items-center">
                    <Checkbox
                      id={option.key}
                      checked={!!form.watch(`access.${option.key}`)}
                      onCheckedChange={(checked) => {
                        if (option.key === "admin") {
                          const allChecked = checked === true;
                          accessOptions.forEach((accessOption) => {
                            form.setValue(
                              `access.${accessOption.key}`,
                              allChecked
                            );
                          });
                        } else {
                          form.setValue(
                            `access.${option.key}`,
                            checked === true
                          );
                          if (!checked && form.watch("access.admin")) {
                            form.setValue("access.admin", false);
                          }
                        }
                      }}
                      className="mr-2"
                    />
                    <label
                      htmlFor={option.key}
                      className="text-sm text-[#1A2435]"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
              {form.formState.errors.access && (
                <p className="text-red-600 text-sm mt-1 text-left">
                  At least one permission is required
                </p>
              )}
            </div>

            <SwitchWithLabel
              id="full_access"
              label="Full Access"
              checked={fullAccess}
              labelRight="Limited Access"
              onCheckedChange={handleFullAccessChange}
            />

            <AppButton
              isLoading={isLoading}
              type="submit"
              className="w-full text-base"
            >
              {edit ? "Update" : "Submit"}
            </AppButton>

            {edit && (
              <AppButton
                disable={deleteLoading}
                className="w-full !bg-[#f68f80] text-base"
                onClick={handleDelete}
              >
                Delete Member
              </AppButton>
            )}
          </form>
        </div>
      </AppModal>

      <AppButton
        onClick={() => setIsModalOpen(true)}
        className="self-end relative flex w-[147px] h-[40px] px-[10px] py-[6px] justify-center items-center gap-[8px] flex-shrink-0 !text-[#ffffff] !bg-[#01576A] border-none mt-[10px] mb-2 mr-[16px] rounded-[30px] text-sm"
      >
        Add Member
      </AppButton>
    </div>
  );
};

export default TeamPermission;
