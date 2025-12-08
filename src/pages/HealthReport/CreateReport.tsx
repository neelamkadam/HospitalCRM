import React, { useState, useEffect, useRef } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  ArrowLeft,
  AudioLines,
  BookUser,
  Edit,
  EllipsisVertical,
  Eye,
  FileText,
  Mic,
  Plus,
  Trash2,
} from "lucide-react";
import { useDeleteApi, useGetApi, usePostApi } from "../../services/use-api";
import { AuthResponseBodyDataModel } from "../../types/response.types";
import API_CONSTANTS from "../../constants/apiConstants";
import AppButton from "../../components/AppButton";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routesConstants";
import AppModal from "../../components/AppModal";
import AddPatient from "../Patients/AddPatient";
import Select from "react-select";
import { yupResolver } from "@hookform/resolvers/yup";
import { addReporttSchems } from "../../utils/validationSchems";
import { marked } from "marked";
import { useSidebar } from "../../components/ui/sidebar";
import AudioRecorderPolyfill from "audio-recorder-polyfill";
import MediaRecorderPolyfill from "audio-recorder-polyfill";
import AddReportType from "../../components/AddReportType";
import { ScrollMenu } from "react-horizontal-scrolling-menu";
import "react-horizontal-scrolling-menu/dist/styles.css";
import RightArrowScroll from "../../components/RightArrowScroll";
import LeftArrowScroll from "../../components/LeftArrowScroll";
import {
  blobToBase64,
  // customSelectStylesAppointment,
  customSelectStylesDocter,
  // customStyle,
  editorStyles,
} from "../../utils/common-utils";
import { CreateReportTypes } from "../../types/app.types";
import CustomSingleValue from "../../components/CustomSingleValue";
import CustomPlaceholder from "../../components/CustomPlaceholder";
import socketService from "../../utils/socket";
import { v4 as uuidv4 } from "uuid";
import Loader from "../../components/AppVoiceLoader";
import "@toast-ui/editor/dist/toastui-editor.css";
import { Editor } from "@toast-ui/react-editor";
import CustomSheet from "../../components/AppSheet";
import PatientsOverAllReportSidePannel from "../Patients/PatientsOverAllReportSidePannel";
import { useSelector } from "react-redux";
import { Data_Constcnts } from "../../constants/AppConstants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

if (typeof window !== "undefined" && !window.MediaRecorder) {
  window.MediaRecorder = AudioRecorderPolyfill;
}
const TIME_INTERVAL = 90000; // 2 minutes for testing
const OVERLAP_DURATION = 10000; // 10 seconds overlap for testing

const CreateReport: React.FunctionComponent = () => {
  // Add this useEffect at the top of your component hooks
  useEffect(() => {
    const hasReloaded = sessionStorage.getItem("hasReloadedForCreateReport");
    if (!hasReloaded) {
      sessionStorage.setItem("hasReloadedForCreateReport", "true");
      window.location.reload();
    }
  }, []);

  const location = useLocation();
  const navigate = useNavigate();
  const { userData } = useSelector((state: any) => state.authData);
  const searchParams = new URLSearchParams(location.search);
  const reportId = searchParams.get("report_id");
  const patientId = searchParams.get("id");
  const { getData: GetReportApi } = useGetApi<any>("");
  const { postData: createReportText, isLoading: loading } =
    usePostApi<AuthResponseBodyDataModel>({
      path: API_CONSTANTS.CREATE_REPORTS,
    });
  const { postData: createReportTextDraft, isLoading: IsLoading } =
    usePostApi<AuthResponseBodyDataModel>({
      path: API_CONSTANTS.CREATE_REPORTS_DRAFT,
    });
  const { deleteData: deleteReport } = useDeleteApi({
    path: `${API_CONSTANTS.DELETE_REPORT}`,
  });
  const { getData: GetPatientList } = useGetApi<any>("");
  const { getData: GetReportTyesList } = useGetApi<any>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [patientList, setPatientList] = useState([]);
  const [selectedOption, setSelectedOption] = useState<any>({});
  const [isRecording, setIsRecording] = useState(false);
  const [editorHtml, setEditorHtml] = useState("<p></p>");
  const [isInitialRender, setIsInitialRender] = useState(true);
  const { state } = useSidebar();
  const [pics, setPics] = useState<any>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaRecorder] = useState<MediaRecorder | null>(null);
  const [isPolyfillLoaded, setIsPolyfillLoaded] = useState(false);
  const [reportType, setReportType] = useState("");
  const [reportTypeList, setReportTypeList] = useState([]);
  const [isReportTypeModalOpen, setIsreportTypeModalOpen] =
    useState<boolean>(false);
  const [Isloading, setIsloading] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [chunkInterval, setChunkInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const isRecordingRef = useRef(false);
  const streamRef: any = useRef(null);
  const [currentRecorder, setCurrentRecorder] = useState<any>(null);
  const [sentChunks, setSentChunks] = useState<{ blob: Blob; index: number }[]>(
    []
  );
  const editorRef = React.useRef<Editor>(null);
  const accumulatedTextRef = useRef<string>("");
  const [deletedDraftImages, setDeletedDraftImages] = useState<any>([]);
  const [reportTypeModalMode, setReportTypeModalMode] = useState<
    "create" | "view" | "edit"
  >("create");
  const [selectedReportType, setSelectedReportType] = useState<any>(null);
  const [petientDetailSidepanel, setPetientDetailSidepanel] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const chunkCounterRef = useRef(0);
  const sessionIdRef = useRef(uuidv4());
  const EMRStatus =
    userData?.organizationId?.emrEnabled &&
    userData?.organizationId?.emrType === Data_Constcnts?.EMR_TYPE;

  const form = useForm<CreateReportTypes>({
    resolver: yupResolver(addReporttSchems),
    defaultValues: {
      patientId: null,
      reportText: "",
      audioFile: null,
      images: [],
    },
    mode: "onTouched",
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

        // Set selected patient if patientId exists in URL params
        if (patientId && !selectedOption?.value) {
          const matchedPatient = transformedData.find(
            (patient: any) => patient.value === patientId
          );
          if (matchedPatient) {
            setSelectedOption(matchedPatient);
            form.setValue("patientId", matchedPatient, {
              shouldValidate: true,
            });
            form.clearErrors("patientId");
          }
        }
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
    }
  };

  useEffect(() => {
    if (!isModalOpen) {
      fetchPatient();
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (isReportTypeModalOpen) {
      // Close any open dropdowns when modal opens
      setDropdownOpen(null);
    }
  }, [isReportTypeModalOpen]);

  const handleTranscriptionChunk = async (data: any) => {
    console.log("Received chunk:", data);
    setIsloading(false);
    if (data?.text) {
      const newAccumulatedText = accumulatedTextRef.current + data.text;
      accumulatedTextRef.current = newAccumulatedText;
      try {
        const newHtml = await marked(newAccumulatedText);
        form.setValue("reportText", newAccumulatedText);
        setEditorHtml(newHtml);
        if (editorRef.current) {
          const editorInstance = editorRef.current.getInstance();
          editorInstance.setHTML(newHtml);
        }
      } catch (error) {
        console.error("Error converting chunk markdown to HTML:", error);
      }
    }
  };

  useEffect(() => {
    if (reportId) {
      fetchReports();
    }
    if (!socketService.isConnected()) {
      socketService.connect();
    }

    socketService.on("connect", () => console.log("Connected"));
    socketService.on("disconnect", (reason: string) => {
      console.log("Disconnected:", reason);
      if (!socketService.isConnected()) {
        setTimeout(() => socketService.connect(), 500);
      }
    });

    // socketService.on("transcriptionComplete", handleTranscriptionComplete);
    socketService.on("transcriptionChunk", handleTranscriptionChunk);

    return () => {
      socketService.off("connect", () => console.log("Connected"));
      socketService.off("disconnect", (reason: string) => {
        console.log("Disconnected:", reason);
      });
      // socketService.off("transcriptionComplete", handleTranscriptionComplete);
      socketService.off("transcriptionChunk", handleTranscriptionChunk);
    };
  }, []);

  // load polyfill browser
  useEffect(() => {
    fetchReportTypes();
    const initializeMediaRecorder = async () => {
      if (typeof window !== "undefined" && !MediaRecorder) {
        const AudioRecorderPolyfill = await import("audio-recorder-polyfill");
        window.MediaRecorder = AudioRecorderPolyfill.default as any;
      }
    };
    const initializeRecorder = async () => {
      if (typeof window !== "undefined") {
        if (!window.MediaRecorder) {
          window.MediaRecorder = MediaRecorderPolyfill as any;
        }
        setIsPolyfillLoaded(true);
      }
    };
    if (navigator.mediaDevices?.getUserMedia as any) {
      initializeRecorder();
    }
    initializeMediaRecorder();
  }, []);

  const fetchReports = async () => {
    const response: any = await GetReportApi(
      `${API_CONSTANTS.GET_ALL_REPORT}/${reportId}`
    );
    if (response?.data.success) {
      setPics(response?.data?.report?.reportImages);
      const reportText = response?.data?.report?.reportText;
      setReportType(response?.data?.report?.reportType);
      form.setValue("reportText", reportText);
      const patient_id = {
        label: response?.data?.report?.clientId?.name,
        value: response?.data?.report?.clientId?._id,
      };
      setSelectedOption(patient_id);
      navigate(
        `${ROUTES.CREATE_REPORT}?id=${
          patient_id?.value
        }&summary=${true}&report_id=${reportId}`
      );
      form.setValue("patientId", patient_id, { shouldValidate: true });
      form.clearErrors("patientId");

      const html = await marked(reportText);
      setEditorHtml(html);
      if (editorRef.current) {
        const editorInstance = editorRef.current.getInstance();
        editorInstance.setHTML(html);
      }
    }
  };

  useEffect(() => {
    const setupInitialContent = async () => {
      const initialMarkdown = form.getValues("reportText") || "";
      if (initialMarkdown) {
        try {
          const html = await marked(initialMarkdown);
          setEditorHtml(html);
          if (editorRef.current) {
            const editorInstance = editorRef.current.getInstance();
            editorInstance.setHTML(html);
          }
        } catch (error) {
          console.error("Error converting markdown to HTML:", error);
        }
      }
      setIsInitialRender(false);
    };

    if (isInitialRender) {
      setupInitialContent();
    }
  }, [form, isInitialRender]);

  const onSubmit: SubmitHandler<CreateReportTypes> = async (
    data: CreateReportTypes
  ) => {
    if (!data.patientId) {
      form.setError("patientId", {
        type: "manual",
        message: "Patient is required",
      });
      return;
    }
    const formData = new FormData();
    formData.append("patientId", form.getValues("patientId.value"));
    formData.append(
      "reportText",
      await marked(form.getValues("reportText") as any)
    );
    if (reportId) {
      formData.append("existingReportId", reportId);
    }
    formData.append("reportType", reportType);
    // Append image files
    const imageFiles = form.getValues("images");

    if (Array.isArray(imageFiles)) {
      imageFiles.forEach((file) => {
        // Only append actual File objects
        if (file instanceof File) {
          formData.append("images", file); // or "images[]" for array format
        }
      });
    }

    //deleted images id pass
    if (deletedDraftImages && deletedDraftImages.length > 0) {
      if (Array.isArray(deletedDraftImages)) {
        deletedDraftImages.forEach((imageId) => {
          formData.append("imageIdsToDelete[]", imageId);
        });
      } else {
        formData.append("imageIdsToDelete[]", deletedDraftImages);
      }
    }
    try {
      const resData: any = await createReportText(formData);
      if (resData?.data?.success) {
        navigate(ROUTES.HEALTHREPORT);
      }
    } catch (error) {
      console.error("Error submitting report:", error);
    }
  };

  const toggleClose = () => {
    setIsModalOpen((prev) => !prev);
  };
  const togglePetientSidepanel = () => {
    setPetientDetailSidepanel((prev) => !prev);
  };

  const toggleReporyTypeClose = () => {
    // Close any open dropdowns first
    setDropdownOpen(null);
    // Add a small delay to ensure proper cleanup
    setTimeout(() => {
      setIsreportTypeModalOpen(false);
      setSelectedReportType(null);
      setReportTypeModalMode("create");
    }, 10);
  };

  const handleSelectChange = (
    option: { value: string; label: string } | null
  ) => {
    setSelectedOption(option);
    option?.value
      ? navigate(`${ROUTES.CREATE_REPORT}?id=${option?.value}&summary=${true}`)
      : navigate(`${ROUTES.CREATE_REPORT}`);
    form.setValue("patientId", option, { shouldValidate: true });
    form.clearErrors("patientId");
  };

  const handleEditorChange = () => {
    if (!editorRef.current) return;
    const editorInstance = editorRef.current.getInstance();
    const currentMarkdown = editorInstance.getMarkdown();
    // Only update your form state, NOT the editor's initialValue
    form.setValue("reportText", currentMarkdown);
  };

  const handleStopRecording = async (
    audioBlob: Blob,
    isStop: boolean = false,
    hasOverlap: boolean = false
  ) => {
    if (audioBlob && audioBlob.size > 0) {
      try {
        let processedBlob = audioBlob;
        let fileExtension = "webm";
        let fileType = audioBlob.type || "audio/webm";

        if (fileType.includes("mp3")) {
          fileExtension = "mp3";
          fileType = "audio/mp3";
        } else if (fileType.includes("mp4")) {
          fileExtension = "mp4";
          fileType = "audio/mp4";
        } else if (fileType.includes("ogg")) {
          fileExtension = "ogg";
          fileType = "audio/ogg";
        } else if (fileType.includes("wav")) {
          fileExtension = "wav";
          fileType = "audio/wav";
        }

        const file = new File(
          [processedBlob],
          `recording_${Date.now()}.${fileExtension}`,
          { type: fileType }
        );

        const base64Audio = await blobToBase64(file);
        form.setValue("audioFile", base64Audio);

        const AudioChuksPayload = {
          audioData: base64Audio,
          sessionId: sessionIdRef.current,
          isLast: isStop,
          reportType: reportType,
          hasOverlap: hasOverlap,
          existingText: isStop ? form.watch("reportText") : undefined,
        };

        if (socketService.isConnected()) {
          isStop && setIsloading(true);
          socketService.getSocket().emit("audioChunk", AudioChuksPayload);
          console.log("🔊 Emitted audioChunk:", {
            ...AudioChuksPayload,
            audioData: `${base64Audio.substring(0, 50)}...`, // Log only part of base64
          });

          // Store chunk for debugging
          const chunkIndex = sentChunks.length + 1;
          setSentChunks((prev) => [
            ...prev,
            { blob: processedBlob, index: chunkIndex },
          ]);

          // Debug download
          // setTimeout(() => {
          //   const url = URL.createObjectURL(processedBlob);
          //   const a = document.createElement("a");
          //   a.href = url;
          //   a.download = `chunk-${chunkIndex}-${
          //     hasOverlap ? "with-overlap" : "no-overlap"
          //   }.webm`;
          //   a.style.display = "none";
          //   document.body.appendChild(a);
          //   a.click();
          //   setTimeout(() => {
          //     document.body.removeChild(a);
          //     URL.revokeObjectURL(url);
          //   }, 100);
          // }, 100);
        } else {
          console.warn("❌ Socket not connected. Cannot emit audioChunk.");
        }
      } catch (error: any) {
        console.error("Error processing audio:", error);
      }
    } else {
      console.error("❌ Blob is empty or invalid!");
    }
  };

  const saveAsDraft = async () => {
    if (!form.getValues("patientId")) {
      form.setError("patientId", {
        type: "manual",
        message: "Patient is required",
      });
      return;
    }
    // Create FormData to match the curl request format
    const formData = new FormData();
    // Add basic fields (matching curl format)
    formData.append(
      "reportText",
      await marked(form.getValues("reportText") as any)
    );
    formData.append("patientId", form.getValues("patientId.value"));
    formData.append("reportType", reportType);
    // Add existingReportId only if it exists
    if (reportId) {
      console.log("🚀 ~ saveAsDraft ~ reportId:", reportId);
      formData.append("existingReportId", reportId);
    }
    // Append image files
    const imageFiles = form.getValues("images") as File[];
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((file: File) => {
        formData.append("images", file);
      });
    }
    // Append deleted images IDs (matching curl format with array notation)
    if (deletedDraftImages && deletedDraftImages.length > 0) {
      if (Array.isArray(deletedDraftImages)) {
        deletedDraftImages.forEach((imageId) => {
          formData.append("imageIdsToDelete[]", imageId);
        });
      } else {
        formData.append("imageIdsToDelete[]", deletedDraftImages);
      }
    }

    try {
      const resData: any = await createReportTextDraft(formData);
      if (resData?.data?.success) {
        navigate(ROUTES.HEALTHREPORT);
      }
    } catch (error) {
      console.error("Error submitting report:", error);
    }
  };

  const fetchReportTypes = async () => {
    try {
      const response: any = await GetReportTyesList(
        `${API_CONSTANTS.REPORTS.USER_REPORT_TYPES}`
      );
      if (response.data.success) {
        setReportTypeList(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
    }
  };
  const startRecording = async () => {
    try {
      console.log("🎤 Starting recording with overlap...");

      // Reset states
      accumulatedTextRef.current = "";
      setSentChunks([]);
      chunkCounterRef.current = 0;

      // Clean up previous recording
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track: any) => track.stop());
      }
      if (currentRecorder) {
        currentRecorder.stop();
      }
      if (chunkInterval) {
        clearInterval(chunkInterval);
        setChunkInterval(null);
      }

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      streamRef.current = stream;
      setAudioStream(stream);
      setIsRecording(true);
      isRecordingRef.current = true;

      // Determine mime type
      let mimeType = "audio/webm";
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
      }

      console.log("Using MIME type:", mimeType);

      let chunkCount = 0;
      let activeRecorders: MediaRecorder[] = [];

      const startOverlappingRecording = () => {
        chunkCount++;

        const recorder = new MediaRecorder(streamRef.current, {
          mimeType: mimeType,
          audioBitsPerSecond: 128000,
        });

        activeRecorders.push(recorder);

        recorder.ondataavailable = (e: BlobEvent) => {
          if (e.data.size > 0) {
            const hasOverlap = chunkCount > 1;
            const isManualStop = !isRecordingRef.current;
            console.log(
              `📦 Sending chunk ${chunkCount} (${
                hasOverlap ? "with 10s overlap" : "first chunk"
              }) - ${isManualStop ? "FINAL" : "intermediate"}`
            );
            handleStopRecording(e.data, isManualStop, hasOverlap);
          }
          // Remove from active recorders when done
          activeRecorders = activeRecorders.filter((r) => r !== recorder);
        };

        recorder.onerror = (error: any) => {
          console.error("❌ Recorder error:", error);
          activeRecorders = activeRecorders.filter((r) => r !== recorder);
        };

        recorder.start();

        // Each chunk records for exactly TIME_INTERVAL
        setTimeout(() => {
          if (recorder.state === "recording") {
            recorder.stop();
          }
        }, TIME_INTERVAL);

        return recorder;
      };

      // Start first chunk immediately
      let currentChunkRecorder = startOverlappingRecording();
      setCurrentRecorder(currentChunkRecorder);

      // Set up interval for subsequent chunks with overlap
      const interval = setInterval(() => {
        if (!isRecordingRef.current) return;

        // Start next overlapping chunk while previous is still recording
        currentChunkRecorder = startOverlappingRecording();
        setCurrentRecorder(currentChunkRecorder);
      }, TIME_INTERVAL - OVERLAP_DURATION); // Start next chunk with overlap

      setChunkInterval(interval);
      console.log("🚀 Recording started with overlap logic...");
    } catch (err) {
      console.error("❌ Microphone access failed:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    console.log("🛑 Stopping recording...");
    setIsRecording(false);
    isRecordingRef.current = false;

    // Clear interval
    if (chunkInterval) {
      clearInterval(chunkInterval);
      setChunkInterval(null);
    }

    // Stop current recorder - the ondataavailable handler will send the final chunk
    if (currentRecorder && currentRecorder.state === "recording") {
      currentRecorder.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: any) => track.stop());
      streamRef.current = null;
    }

    setAudioStream(null);
    setCurrentRecorder(null);
    console.log("✅ Recording stopped completely");
  };

  useEffect(() => {
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
      }
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        try {
          mediaRecorder.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, [audioStream, mediaRecorder]);

  useEffect(() => {
    // Inject custom styles when component mounts
    const styleElement = document.createElement("style");
    styleElement.innerHTML = editorStyles;
    document.head.appendChild(styleElement);

    // Remove page scroll
    document.body.style.overflow = "hidden";

    return () => {
      document.head.removeChild(styleElement);
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleDeleteReport = async (reportType: any) => {
    try {
      const response = await deleteReport(
        null,
        `${API_CONSTANTS.REPORTS.USER_REPORT_TYPES}/${reportType?._id}`
      );
      if (response?.data?.success) {
        setReportTypeList((prev) =>
          prev.filter((item: any) => item?._id !== reportType?._id)
        );
        const deletedItem: any = reportTypeList.find(
          (item: any) => item?._id === reportType?._id
        );
        if (reportType === deletedItem?.name) {
          setReportType("");
        }
      }
    } catch (error) {
      console.error("Failed to delete report:", error);
    }
  };

  const selectRef = useRef<any>(null);

  return (
    // Replace your main wrapper and container with this approach:

    <div className="!bg-[#f3f4f6] h-screen overflow-hidden md:overflow-hidden overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <header className="mb-3 flex justify-start -mt-6 ml-4 absolute z-10">
        <AppButton
          onClick={() => navigate(`${ROUTES.HEALTHREPORT}`)}
          className={`${
            state === "collapsed" ? "ml-7" : ""
          } py-3 rounded-[30px] w-[130px] h-[40px] !bg-white !text-[#293343] border-none pl-1 text-sm hidden xl:block`}
        >
          <div className="flex items-center justify-center gap-3 leading-none">
            <ArrowLeft className="w-7 h-7" />
            Back
          </div>
        </AppButton>
      </header>

      <div
        style={{ height: "calc(100% - 80px)" }}
        className="flex items-start justify-center h-full pt-4 px-4 lg:px-0 md:overflow-hidden overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        <div className="w-[100%] lg:w-[70%] rounded-xl shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] bg-white h-full md:overflow-hidden overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="pt-2 text-start font-medium text-lg text-[#1A2435] pl-[24px] flex justify-between items-center mb-3">
            <p>Select Patient</p>
            <div
              className="hover:underline cursor-pointer pl-[24px] pr-[24px]"
              onClick={() =>
                selectedOption?.value && EMRStatus
                  ? togglePetientSidepanel()
                  : toggleClose()
              }
            >
              <p className="font-medium text-lg text-[#01576A] flex items-center">
                <span className="mr-1">
                  {selectedOption?.value && EMRStatus ? (
                    <BookUser size={17} />
                  ) : (
                    <Plus size={17} />
                  )}
                </span>
                {selectedOption?.value && EMRStatus
                  ? "Patient Details"
                  : "Add a Patient"}
              </p>
            </div>
          </div>

          <CustomSheet
            title=""
            isOpen={petientDetailSidepanel}
            toggle={togglePetientSidepanel}
            className="dark:bg-gray-800 dark:text-gray-100"
            content={
              <PatientsOverAllReportSidePannel isFullViewProfileShow={false} />
            }
          />

          <form
            className="h-full flex flex-col text-[16px] pl-[24px] pr-[24px] md:overflow-hidden overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            onSubmit={form.handleSubmit(onSubmit)}
            style={{ height: "calc(100% - 65px)" }}
          >
            {/* Patient Select */}
            <div className="relative mb-4">
              <Select
                value={selectedOption}
                onChange={handleSelectChange}
                options={patientList}
                ref={selectRef}
                // styles={customStyle(form)}
                className="search-patient"
                components={{
                  SingleValue: CustomSingleValue,
                  Placeholder: CustomPlaceholder,
                }}
                isSearchable={true}
                isClearable={true}
                closeMenuOnSelect={true}
                blurInputOnSelect={true}
                openMenuOnClick={true}
                openMenuOnFocus={false}
                styles={{
                  ...customSelectStylesDocter,
                  control: (base) => ({
                    ...base,
                    border: form.formState.errors.patientId ? "1px solid #ef4444" : "1px solid #e5e7eb",
                    boxShadow: "none",
                    fontSize: "16px",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "0.375rem",
                    backgroundColor: "#fffff",
                    opacity: 1,
                    cursor: "pointer",
                    "&:hover": {
                      border: form.formState.errors.patientId ? "1px solid #ef4444" : "1px solid #e5e7eb",
                    },
                  }),
                  menu: (provided: any) => ({
                    ...provided,
                    backgroundColor: "#E5ECED",
                    borderRadius: "0.375rem",
                    zIndex: 9999,
                  }),
                  option: (provided: any, state: any) => ({
                    ...provided,
                    padding: "0.75rem",
                    fontSize: "1rem",
                    textAlign: "left",
                    transition:
                      "background-color 0.2s ease-in-out, color 0.2s ease-in-out",
                    backgroundColor: state.isSelected
                      ? "#E5ECED"
                      : state.isFocused
                      ? "#E5ECED"
                      : "#fff",
                    color: state.isSelected ? "#01576A" : "#526279",
                  }),
                  placeholder: (provided: any) => ({
                    ...provided,
                    color: "#526279",
                    fontSize: "0.875rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    minHeight: "auto",
                  }),
                  valueContainer: (provided: any) => ({
                    ...provided,
                    padding: "0",
                  }),
                  input: (provided: any) => ({
                    ...provided,
                    margin: "0",
                    padding: "0",
                  }),
                }}
              />
            </div>

            {/* ScrollMenu */}
            <div className="w-full overflow-hidden mb-2 flex-shrink-0">
              <ScrollMenu
                LeftArrow={<LeftArrowScroll />}
                RightArrow={<RightArrowScroll />}
              >
                {[
                  <div
                    key="add-template"
                    itemID="add-template"
                    className="mx-1 inline-block"
                  >
                    <AppButton
                      onClick={() => {
                        setDropdownOpen(null);
                        setTimeout(() => {
                          setIsreportTypeModalOpen(true);
                        }, 50);
                      }}
                      className="py-3 rounded-[30px] w-auto h-[40px] border border-slate-300 text-sm mt-0 shadow-none font-normal add-btn hover:border-white"
                    >
                      <div className="flex items-center justify-center gap-2 leading-none">
                        <Plus className="w-5 h-5 cursor-pointer" />
                        Add Template
                      </div>
                    </AppButton>
                  </div>,
                  ...reportTypeList.map((val: any) => (
                    <div
                      key={val._id || val.name}
                      itemID={val._id || val.name}
                      className="mx-2 inline-block"
                    >
                      <div
                        className={`p-2 hover:border-white rounded-full border border-slate-300 px-3 pl-5 text-center text-sm transition-all text-slate-600 disabled:pointer-events-none whitespace-nowrap disabled:opacity-50 flex items-center justify-between cursor-pointer disabled:shadow-none hover:bg-[#CBE1E5] hover:text-[#01576A] ${
                          reportType === val.name
                            ? "bg-[#CBE1E5] text-[#01576A]"
                            : ""
                        }`}
                        onClick={(e: any) => {
                          console.log("🚀 ~ e:", e);
                          // Close dropdown if it's open for this item
                          if (dropdownOpen === val._id) {
                            setDropdownOpen(null);
                            return;
                          }
                          // Otherwise handle report type selection
                          reportType === val.name
                            ? setReportType("")
                            : setReportType(val.name);
                        }}
                      >
                        <span className="flex-1 text-center">{val.name}</span>
                        <span
                          className="ms-4 relative flex items-center justify-center rounded-full transition-colors group"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <DropdownMenu
                            open={dropdownOpen === val._id}
                            onOpenChange={(open) => {
                              setDropdownOpen(open ? val._id : null);
                            }}
                          >
                            <DropdownMenuTrigger asChild>
                              <button
                                className="absolute p-1 transition-opacity duration-200 opacity-0 group-hover:opacity-100 hover:border-medistryColor rounded"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                }}
                                type="button"
                              >
                                <EllipsisVertical className="w-4 h-4 text-gray-600" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-[80px]"
                              side="bottom"
                              sideOffset={5}
                            >
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();

                                  // Close dropdown immediately
                                  setDropdownOpen(null);

                                  // Small delay before opening modal
                                  setTimeout(() => {
                                    setSelectedReportType(val);
                                    setReportTypeModalMode("view");
                                    setIsreportTypeModalOpen(true);
                                  }, 100);
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();

                                  // Close dropdown immediately
                                  setDropdownOpen(null);

                                  // let processedStructure = val.structure;

                                  // Handle structure parsing for edit mode
                                  // if (typeof val.structure === "string") {
                                  //   if (val.structure.includes("\n")) {
                                  //     processedStructure = val.structure
                                  //       .split("\n")
                                  //       .map((h: string) => h.trim())
                                  //       .filter((h: string) => h.length > 0);
                                  //   } else if (val.structure.includes(",")) {
                                  //     processedStructure = val.structure
                                  //       .split(",")
                                  //       .map((h: string) => h.trim())
                                  //       .filter((h: string) => h.length > 0);
                                  //   } else {
                                  //     processedStructure = [val.structure];
                                  //   }
                                  // } else if (!Array.isArray(val.structure)) {
                                  //   processedStructure = val.structure
                                  //     ? [val.structure]
                                  //     : [];
                                  // }

                                  // const reportData = {
                                  //   ...val,
                                  //   structure: processedStructure,
                                  // };

                                  // Small delay before opening modal
                                  setTimeout(() => {
                                    setSelectedReportType(val);
                                    setReportTypeModalMode("edit");
                                    setIsreportTypeModalOpen(true);
                                  }, 100);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer text-red-400 focus:text-red-400"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();

                                  // Close dropdown immediately
                                  setDropdownOpen(null);

                                  // Small delay before deleting
                                  setTimeout(() => {
                                    handleDeleteReport(val);
                                  }, 100);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </span>
                      </div>
                    </div>
                  )),
                ]}
              </ScrollMenu>
            </div>

            {/* Files section */}
            {pics.length > 0 && (
              <div className="flex overflow-x-auto flex-nowrap gap-3 mb-2  max-w-full flex-shrink-0">
                {pics.map((file: any, index: any) => {
                  const isImage =
                    file?.type?.startsWith("image/") || file?.imageUrl;
                  const isPDF =
                    file?.type === "application/pdf" ||
                    file?.name?.endsWith(".pdf");
                  const fileName =
                    file?.name || file?.originalName || `File ${index + 1}`;

                  return (
                    <div
                      key={index}
                      className="relative w-20 h-20 mt-2 flex-shrink-0"
                    >
                      {isImage ? (
                        <img
                          src={file?.imageUrl || URL.createObjectURL(file)}
                          alt={`Preview ${index}`}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : isPDF ? (
                        <div
                          className="w-full h-full border border-medistryColor rounded flex items-center justify-center cursor-pointer hover:bg-[#e3eef0] transition-colors"
                          onClick={() => {
                            const url =
                              file?.imageUrl || URL.createObjectURL(file);
                            window.open(url, "_blank");
                          }}
                        >
                          <FileText className="w-8 h-8 text-medistryColor" />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gray-100 border border-gray-300 rounded flex flex-col items-center justify-center p-1">
                          <div className="text-gray-600 text-xs font-bold mb-1">
                            FILE
                          </div>
                          <div className="text-xs text-center text-gray-600 leading-tight overflow-hidden">
                            {fileName.length > 12
                              ? fileName.substring(0, 12) + "..."
                              : fileName}
                          </div>
                        </div>
                      )}
                      <div
                        onClick={() => {
                          file?.imageUrl &&
                            setDeletedDraftImages((prev: any) => [
                              ...prev,
                              file._id,
                            ]);
                          const updatedPics = pics.filter(
                            (_: any, i: any) => i !== index
                          );
                          setPics(updatedPics);
                          form.setValue("images", updatedPics);
                        }}
                        className="absolute -top-2 -right-2 bg-gray-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs cursor-pointer"
                      >
                        ×
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Hidden file input */}
            <div className="space-y-1 hidden">
              <div className="flex space-x-1 justify-between">
                <div>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      const newImages = [...pics, ...files];
                      setPics(newImages);
                      form.setValue("images", newImages);
                    }}
                    ref={fileInputRef}
                  />
                </div>
              </div>
            </div>

            {/* Report Information - This takes up remaining space */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex items-center justify-between space-x-1 mb-2 flex-shrink-0">
                <label className="block text-lg text-[#1A2435] font-medium">
                  Report Information
                </label>
                <p
                  className="font-medium text-lg text-[#01576A] flex items-center cursor-pointer hover:underline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="mr-1">
                    <Plus size={17} />
                  </span>
                  Add Files
                </p>
              </div>

              {/* Editor container - takes remaining height */}
              <div className="relative flex-1 overflow-hidden">
                <Editor
                  initialValue={editorHtml}
                  height="100%"
                  initialEditType="wysiwyg"
                  useCommandShortcut={true}
                  ref={editorRef}
                  onChange={handleEditorChange}
                  toolbarItems={[]}
                  hideToolbar={true}
                />
                {Isloading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
                    <Loader />
                  </div>
                )}
                <div className="absolute bottom-3 right-3 flex gap-2 items-center !z-50">
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`p-2 rounded-full transition-colors bg-medistryColor ${
                      isRecording ? "bg-[#028ba9]" : "hover:bg-medistryColor "
                    }`}
                    disabled={
                      !isPolyfillLoaded ||
                      !navigator.mediaDevices?.getUserMedia ||
                      Isloading
                    }
                    aria-label={
                      isRecording ? "Stop recording" : "Start recording"
                    }
                    aria-busy={isRecording}
                  >
                    {isRecording ? (
                      <div className="relative h-[28px] w-[28px]">
                        <AudioLines className="w-7 h-7 text-white z-50 absolute" />
                        <span className="flex h-11 w-11 absolute top-[-8px] left-[-8px]">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-11 w-11 bg-[#028ba9] shrink-0"></span>
                        </span>
                      </div>
                    ) : (
                      <Mic className="w-7 h-7 text-white hover:text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Buttons - Fixed at bottom */}
            <div className="gap-4 flex justify-around flex-shrink-0">
              <AppButton
                isLoading={IsLoading}
                disable={Isloading || isRecording}
                onClick={() => saveAsDraft()}
                label="Save as Draft"
                className="!mt-4 !text-medistryColor text-base flex-1 !bg-transparent !border-medistryColor hover:!bg-[#e3eef0]"
              />
              <AppButton
                isLoading={loading}
                disable={loading || Isloading || isRecording}
                loaddingClass="flex"
                type="submit"
                className="!mt-4 text-base flex-1"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Your existing modals */}
      <AppModal isOpen={isModalOpen} toggle={toggleClose} title="">
        <AddPatient
          toggleClose={toggleClose}
          setNewPatient={(patient: any) => {
            setSelectedOption(patient);
            navigate(
              `${ROUTES.CREATE_REPORT}?id=${patient?.value}&summary=${true}`
            );
            form.setValue("patientId", patient, { shouldValidate: true });
            form.clearErrors("patientId");
          }}
        />
      </AppModal>

      <AppModal
        isOpen={isReportTypeModalOpen}
        toggle={toggleReporyTypeClose}
        title=""
      >
        <AddReportType
          key={`${reportTypeModalMode}-${selectedReportType?._id || "new"}`}
          mode={reportTypeModalMode}
          reportTypeData={selectedReportType}
          setIsreportTypeModalOpen={setIsreportTypeModalOpen}
          fetchReportTypes={fetchReportTypes}
          setReportType={setReportType}
          closeModal={toggleReporyTypeClose}
        />
      </AppModal>
    </div>
  );
};

export default CreateReport;
