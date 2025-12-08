import React, { useEffect, useRef, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useGetApi, usePostApi } from "../../services/use-api";
import { InitiateChat, ResumeChat } from "../../types/response.types";
import API_CONSTANTS from "../../constants/apiConstants";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { Mic, SendHorizontal, X, AudioLines } from "lucide-react";
import AudioRecorderPolyfill from "audio-recorder-polyfill";
import NewAppLogo from "../../assets/MedistryNew.png";
import Draggable from "react-draggable";
import { closeChat, openChat, setChatId } from "../../redux/chatSlice";
// import { set } from "lodash";

// Initialize polyfill for browsers without MediaRecorder
if (typeof window !== "undefined" && !window.MediaRecorder) {
  window.MediaRecorder = AudioRecorderPolyfill;
}

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
};

const ChatBot = () => {
  // const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [showTooltip, setShowTooltip] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { userData } = useAppSelector((state: any) => state.authData);
  // const [chatId, setChatId] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { isOpen, chatId } = useAppSelector((state) => state.chat);
  const dispatch = useAppDispatch();
  const { getData: GetReportApioading } = useGetApi<any>("");

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [isPolyfillLoaded, setIsPolyfillLoaded] = useState(false);
  const [loadingVoice, setLoadingVoice] = useState<boolean>(false);
  const [audioProcessing, setAudioProcessing] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);

  const { postData: initiateChat, isLoading: loading } =
    usePostApi<InitiateChat>({
      path: API_CONSTANTS.CHATAI.INITIATE_CHAT,
    });
  const { postData: resumeChat, isLoading: isLoadingChat } =
    usePostApi<ResumeChat>({
      path: `${API_CONSTANTS.CHATAI.RESUME_CHAT}/${chatId}`,
    });
  const { postData: renameChat } = usePostApi<ResumeChat>({
    path: `${API_CONSTANTS.CHATAI.RENAME_CHAT}/${chatId}`,
  });

  useEffect(() => {
    // Always show popup if chat is open
    if (isOpen) setShowPopup(true);
  }, [isOpen]);

  useEffect(() => {
    fetchChats();
  }, [chatId, GetReportApioading]);

  const fetchChats = async () => {
    if (chatId) {
      const response = await GetReportApioading(
        `${API_CONSTANTS.CHATAI.GET_CHAT_DATA}/${chatId}`
      );
      if (response?.data?.chat?.conversation) {
        setMessages(
          response.data.chat.conversation
            ?.filter(
              (item: any) =>
                item?.role !== "system" &&
                item?.role &&
                item?.content.length > 0
            )
            ?.map((item: any, index: number) => ({
              id: item?.createdAt || index.toString(),
              text:
                item?.content
                  ?.filter((c: any) => c.type === "text")
                  ?.map((c: any) => c.text)
                  ?.join("\n") || "",
              sender: item?.role === "assistant" ? "assistant" : "user",
            }))
        );
      }
    }
  };

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent =
        navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent.toLowerCase()
        );
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Initialize MediaRecorder polyfill
  useEffect(() => {
    const initializeRecorder = async () => {
      if (typeof window !== "undefined") {
        if (!window.MediaRecorder) {
          try {
            const AudioRecorderPolyfill = await import(
              "audio-recorder-polyfill"
            );
            window.MediaRecorder = AudioRecorderPolyfill.default as any;
          } catch (error) {
            console.warn("Failed to load audio recorder polyfill:", error);
          }
        }
        setIsPolyfillLoaded(true);
      }
    };

    initializeRecorder();
    return () => {
      setMessages([]);
    };
  }, []);

  const toggleChat = useCallback(async () => {
    setShowTooltip(false);

    if (!isOpen) {
      // Open globally
      dispatch(openChat(chatId || "")); // chatId may be null initially

      // Initiate chat if no chatId
      if (!chatId) {
        const payload = { clientId: userData?._id };

        try {
          const resData: any = await initiateChat(payload);
          if (resData?.data?.chatId) {
            dispatch(setChatId(resData.data.chatId));
          }

          if (resData?.status === 200 && resData?.data?.message) {
            const botMsg: Message = {
              id: uuidv4(),
              text: resData.data.message,
              sender: "bot",
            };
            setMessages((prev) => [...prev, botMsg]);
          }
        } catch (error) {
          console.error("Error initiating chat:", error);
          // setMessages([
          //   {
          //     id: uuidv4(),
          //     text: "Sorry, I'm having trouble connecting. Please try again.",
          //     sender: "bot",
          //   },
          // ]);
        }
      }

      // Show popup
      setTimeout(() => setShowPopup(true), isMobile ? 5 : 10);
    } else {
      dispatch(closeChat());
      dispatch(setChatId(""));
      setMessages([]);
      renameChat(chatId);
      setShowPopup(false);
      setTimeout(() => {}, isMobile ? 200 : 300);
    }
  }, [isOpen, chatId, userData?._id, initiateChat, dispatch, isMobile]);

  const sendMessage = async () => {
    if (!input.trim() || isLoadingChat) return;

    const userMsg: Message = {
      id: uuidv4(),
      text: input,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setIsBotTyping(true);

    try {
      const payload = {
        message: currentInput,
        audio: "",
      };

      const res: any = await resumeChat(payload);

      if (res?.status === 200 && res?.data?.message) {
        const botMsg: Message = {
          id: uuidv4(),
          text: res.data.message,
          sender: "bot",
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        // Handle error case
        // const errorMsg: Message = {
        //   id: uuidv4(),
        //   text: "Sorry, I didn't receive your message properly. Could you please try again?",
        //   sender: "bot",
        // };
        // setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // const errorMsg: Message = {
      //   id: uuidv4(),
      //   text: "Sorry, there was an error sending your message. Please try again.",
      //   sender: "bot",
      // };
      // setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const startRecording = async () => {
    try {
      console.log("🎤 Starting audio recording...");

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Audio recording not supported on this device/browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      setAudioStream(stream);
      setIsRecording(true);

      // Determine the best supported mime type
      let mimeType = "audio/webm";
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
      } else if (MediaRecorder.isTypeSupported("audio/wav")) {
        mimeType = "audio/wav";
      } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
        mimeType = "audio/ogg";
      }

      const recorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000,
      });

      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        console.log("📊 Data available:", event.data.size, "bytes");
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        console.log("✅ Recording stopped, chunks:", chunks.length);

        if (chunks.length === 0) {
          console.error("❌ No audio chunks recorded");
          setAudioProcessing(false);
          return;
        }

        const blob = new Blob(chunks, { type: mimeType });
        console.log("📦 Created blob:", blob.size, "bytes", blob.type);

        if (blob.size === 0) {
          console.error("❌ Audio blob is empty");
          setAudioProcessing(false);
          return;
        }

        await processAudioFile(blob);
      };

      recorder.onerror = (error) => {
        console.error("❌ Recording error:", error);
        setIsRecording(false);
        setAudioProcessing(false);
        alert("Recording error occurred. Please try again.");
      };

      recorder.start(1000);
      setMediaRecorder(recorder);

      console.log("📹 MediaRecorder started with state:", recorder.state);
    } catch (error) {
      console.error("❌ Error accessing microphone:", error);
      alert(
        "Could not access microphone. Please check permissions and try again."
      );
      setIsRecording(false);
      setAudioProcessing(false);
    }
  };

  const stopRecording = () => {
    console.log("🛑 Stopping recording...");

    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      setAudioProcessing(true);
      mediaRecorder.stop();
      setIsRecording(false);
      console.log("📹 MediaRecorder stopped");
    }

    if (audioStream) {
      audioStream.getTracks().forEach((track) => {
        track.stop();
        console.log("🔇 Audio track stopped");
      });
      setAudioStream(null);
    }

    setMediaRecorder(null);
  };

  const processAudioFile = async (audioBlob: Blob) => {
    console.log("🎵 Processing audio file...", audioBlob.size, "bytes");

    if (!audioBlob || audioBlob.size === 0) {
      console.error("❌ No audio data to process");
      setAudioProcessing(false);
      return;
    }

    try {
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

      console.log("📄 File type:", fileType, "Extension:", fileExtension);

      const audioFile = new File(
        [audioBlob],
        `chat_audio_${Date.now()}.${fileExtension}`,
        { type: fileType }
      );

      console.log(
        "📁 Created audio file:",
        audioFile.name,
        audioFile.size,
        "bytes"
      );

      const formData = new FormData();
      formData.append("message", input.trim());
      formData.append("audio", audioFile);

      setLoadingVoice(true);
      console.log("📤 Sending audio to server...");

      const res: any = await resumeChat(formData);
      console.log("📥 Audio response:", res);

      if (res?.status === 200) {
        const userMsg: Message = {
          id: uuidv4(),
          text: res?.data?.userMessage || "Voice message sent",
          sender: "user",
        };
        setLoadingVoice(false);
        setMessages((prev) => [...prev, userMsg]);

        setIsBotTyping(true);

        setTimeout(() => {
          const botMsg: Message = {
            id: uuidv4(),
            text: res?.data?.message,
            sender: "bot",
          };

          setMessages((prev) => [...prev, botMsg]);
          setIsBotTyping(false);
        }, 1000);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("❌ Error processing audio:", error);
      // const errorMsg: Message = {
      //   id: uuidv4(),
      //   text: "Sorry, there was an error processing your audio message. Please try typing instead.",
      //   sender: "bot",
      // };
      // setMessages((prev) => [...prev, errorMsg]);
      setLoadingVoice(false);
    } finally {
      setAudioProcessing(false);
    }
  };

  const handleAudioRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
      }
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        try {
          mediaRecorder.stop();
        } catch (e) {
          console.log("Cleanup error:", e);
        }
      }
    };
  }, [audioStream, mediaRecorder]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loadingVoice]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        128
      )}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    if (input === "" && textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [input]);

  // Add touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  useEffect(() => {
    // Check if tooltip was already shown for this session
    const tooltipShown = sessionStorage.getItem("tooltipShownForThisPage");
    console.log("tooltipShown:", tooltipShown);

    if (!tooltipShown) {
      setShowTooltip(true);

      // Hide after 10 seconds
      const timer = setTimeout(() => {
        setShowTooltip(false);
        // Save flag in sessionStorage so it won’t appear again in this session
        sessionStorage.setItem("tooltipShownForThisPage", "true");
      }, 10000);

      return () => clearTimeout(timer);
    } else if (tooltipShown) {
      setShowTooltip(false);
    }
  }, []);

  return (
    <>
      {/* Chat icon wrapper - Only show when chat is closed */}
      {!isOpen && (
        <>
          {/* <Draggable bounds="body" disabled={isMobile}>
            <div className="fixed bottom-5 right-5 z-[1000] flex flex-col items-end cursor-move">
              {showTooltip && (
                <div className="absolute bottom-[71px] right-0 bg-medistryColor text-white px-3.5 py-2.5 rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.15)] text-sm z-[1000] w-[262px] after:content-[''] after:absolute after:top-full after:right-5 after:border-l-8 after:border-r-8 after:border-t-8 after:border-l-transparent after:border-r-transparent after:border-t-[#01576A]">
                  Hi 👋 I'm your personal Medistry AI Assistant. How can I
                  assist you today?
                </div>
              )}
              <div className="flex flex-col items-center gap-1.5 relative">
                <img
                  onClick={toggleChat}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  className="w-14 aspect-square text-[26px] bg-medistryColor text-white rounded-full flex items-center justify-center cursor-pointer shadow-[0_0_12px_rgba(0,0,0,0.3)] animate-pulse active:scale-95 transition-transform"
                  alt="chat logo"
                  src={NewAppLogo}
                  style={{ touchAction: "manipulation" }}
                />
              </div>
            </div>
          </Draggable> */}
          {/* <Draggable bounds="body" disabled={isMobile}> */}
          <div className="fixed bottom-5 right-5 z-[1000] flex flex-col items-end cursor-move">
            {showTooltip && (
              <div className="absolute bottom-[71px] right-0 bg-medistryColor text-white px-3.5 py-2.5 rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.15)] text-sm z-[1000] w-[262px] after:content-[''] after:absolute after:top-full after:right-5 after:border-l-8 after:border-r-8 after:border-t-8 after:border-l-transparent after:border-r-transparent after:border-t-[#01576A]">
                Hi 👋 I'm your personal Medistry AI Assistant. How can I assist
                you today?
              </div>
            )}
            <div className="flex flex-col items-center gap-1.5 relative">
              <img
                onClick={toggleChat}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="w-14 aspect-square text-[26px] bg-medistryColor text-white rounded-full flex items-center justify-center cursor-pointer shadow-[0_0_12px_rgba(0,0,0,0.3)] animate-pulse active:scale-95 transition-transform"
                alt="chat logo"
                src={NewAppLogo}
                style={{ touchAction: "manipulation" }}
              />
            </div>
          </div>
          {/* </Draggable> */}
        </>
      )}

      {/* Modal popup - Only show when chat is open */}
      {isOpen && (
        <Draggable
          handle=".chatbot-drag-handle"
          bounds="body"
          disabled={isMobile}
          defaultPosition={{ x: 0, y: 0 }}
        >
          <div
            className={`fixed z-[999] ${
              isMobile ? "inset-0" : "bottom-2 right-4 mb-[9px]"
            }`}
          >
            <div
              className={`bg-white overflow-hidden flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-300 ease-in-out ${
                isMobile
                  ? "w-full h-full rounded-none"
                  : "w-[400px] h-[807px] lg:w-[420px] lg:h-[calc(100vh-5rem)] xl:w-[450px] xl:h-[calc(100vh-5rem)] 2xl:h-[calc(100vh-5rem)] rounded-[15px]"
              } ${showPopup ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
            >
              {/* Header */}
              <div
                className={`bg-medistryColor px-4 py-3 flex justify-between items-center text-white ${
                  isMobile
                    ? ""
                    : "cursor-move chatbot-drag-handle md:rounded-t-[15px]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <img
                    className="w-10 bg-medistryColor text-white rounded-full border-medistryColor border-2 flex"
                    alt="chat logo"
                    src={NewAppLogo}
                  />
                  <div>
                    <div className="font-semibold text-[15px]">Medistry AI</div>
                  </div>
                </div>
                <button
                  className="text-xs text-white bg-transparent border-none cursor-pointer hover:text-red-300 transition-colors duration-300 active:scale-95"
                  onClick={toggleChat}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  style={{ touchAction: "manipulation" }}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Chat body */}
              {/* <div className="px-3 py-2">
                <div className="bg-gray-100 text-[11px] text-[#888] px-4 py-2 text-center rounded-lg">
                  ⚠️ This chat is for informational purposes only and should not
                  be considered medical advice. Always consult a qualified
                  healthcare professional.
                </div>
              </div> */}
              <div
                className="flex-1 p-4 overflow-y-scroll scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-white flex flex-col gap-2.5 bg-[#fafafa]"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                <div className="px-3 py-2">
                  <div className="bg-gray-100 text-[11px] text-[#888] px-4 py-2 text-center rounded-lg">
                    ⚠️ This chat is for informational purposes only and should
                    not be considered medical advice. Always consult a qualified
                    healthcare professional.
                  </div>
                </div>
                {messages &&
                  messages?.map((msg) => (
                    <React.Fragment key={msg.id}>
                      <div
                        className={`max-w-[75%] px-3.5 py-2.5 rounded-[18px] whitespace-pre-wrap leading-[1.4] text-left ${
                          msg.sender === "user"
                            ? "bg-medistryColor text-white self-end rounded-tr-none"
                            : "bg-[#f0f0f0] self-start rounded-tl-none"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </React.Fragment>
                  ))}
                {loadingVoice && (
                  <div className="w-1/3 px-3.5 py-2.5 rounded-[18px] whitespace-pre-wrap leading-[1.4] bg-medistryColor text-white self-end rounded-tr-none">
                    <div className="w-[12px] aspect-square rounded-full animate-l5 m-auto text-gray-400"></div>
                  </div>
                )}
                {(isBotTyping || loading) && (
                  <div className="w-1/3 px-3.5 py-2.5 rounded-[18px] whitespace-pre-wrap leading-[1.4] bg-[#f0f0f0] self-start rounded-tl-none">
                    <div className="w-[12px] aspect-square rounded-full animate-l5 m-auto text-gray-400"></div>
                  </div>
                )}
                <div ref={bottomRef}></div>
              </div>

              {/* Input area */}
              <div className="flex border-t border-[#ddd] p-2.5 gap-1.5 bg-white items-end">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message here..."
                  rows={1}
                  className="flex-1 px-3 py-2.5 rounded-[20px] border border-[#ccc] outline-none resize-none overflow-y-auto max-h-32"
                  style={{
                    minHeight: "44px",
                    maxHeight: "100px",
                    touchAction: "manipulation",
                    WebkitAppearance: "none",
                  }}
                />
                <button
                  onClick={sendMessage}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  className="w-12 aspect-square flex items-center justify-center bg-medistryColor border-none text-white text-lg rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
                  disabled={
                    isRecording ||
                    audioProcessing ||
                    isLoadingChat ||
                    !input.trim()
                  }
                  style={{ touchAction: "manipulation" }}
                >
                  <SendHorizontal size={18} />
                </button>
                <button
                  onClick={handleAudioRecording}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  className={`w-12 aspect-square flex items-center justify-center border-none text-white text-lg rounded-full cursor-pointer transition-all relative active:scale-95 ${
                    isRecording
                      ? "bg-medistryColor"
                      : "bg-medistryColor hover:bg-[#026b7a]"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={
                    !isPolyfillLoaded ||
                    !navigator.mediaDevices?.getUserMedia ||
                    audioProcessing ||
                    isLoadingChat
                  }
                  aria-label={
                    isRecording ? "Stop recording" : "Start recording"
                  }
                  style={{ touchAction: "manipulation" }}
                >
                  {isRecording ? (
                    <div className="relative">
                      <AudioLines size={18} className="text-white z-10" />
                      <span className="absolute -inset-2 flex">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-medistryColor opacity-75"></span>
                      </span>
                    </div>
                  ) : (
                    <Mic size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </Draggable>
      )}
    </>
  );
};

export default ChatBot;
