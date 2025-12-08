interface AppDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

const BroadcastMessageView = ({ isOpen, onClose, data }: AppDialogProps) => {
  if (!isOpen) return null;

  const formatMessage = (message: string) => {
    if (!message) return "No message content available";

    const processedMessage = message.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-semibold text-gray-900">$1</strong>'
    );

    return (
      <div
        dangerouslySetInnerHTML={{
          __html: processedMessage
            .split("\n")
            .map((line) => {
              const trimmedLine = line.trim();
              if (!trimmedLine) return "<br>";

              // Numbered lists
              if (/^\d+\..+/.test(trimmedLine)) {
                const [number, ...rest] = trimmedLine.split(".");
                const content = rest.join(".").trim();
                return `<div class="mb-2 ml-4"><span class="font-semibold text-medistryColor">${number}.</span><span class="ml-2">${content}</span></div>`;
              }

              // Email addresses
              if (trimmedLine.includes("@") && trimmedLine.includes(".com")) {
                return `<p class="mb-2 text-blue-600 font-medium">✉️ ${trimmedLine.replace(
                  "✉️ ",
                  ""
                )}</p>`;
              }

              // Phone numbers
              if (trimmedLine.includes("📞") || /\+\d+/.test(trimmedLine)) {
                return `<p class="mb-2 text-blue-600 font-medium">${trimmedLine}</p>`;
              }

              // Separator lines
              if (trimmedLine === "***") {
                return '<hr class="my-4 border-gray-300">';
              }

              // Regular paragraphs
              return `<p class="mb-3 leading-relaxed text-gray-700">${trimmedLine}</p>`;
            })
            .join(""),
        }}
      />
    );
  };

  return (
    <div
      className="fixed inset-0 z-[999] overflow-auto bg-black bg-opacity-60 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto transform transition-all duration-200 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b rounded-t-2xl">
          <h1 className="text-xl text-[#1A2435] font-medium  text-left">
            Broadcast Details
          </h1>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110 group"
          >
            <svg
              className="h-6 w-6 text-gray-500 group-hover:text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 ">
          {/* Subject Card */}

          <div className="flex items-center mb-2 gap-2">
            <div className="p-1.5 bg-[#e3eef0] rounded-md">
              <svg
                className="h-4 w-4 text-medistryColor"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Subject
            </label>
          </div>
          <div className="bg-gray-50 text-left rounded-lg p-2 border border-gray-200 mb-4">
            <p className="text-gray-900 font-medium text-lg">
              {data?.details?.subject || "No subject provided"}
            </p>
          </div>

          {/* Type Card */}

          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-[#e3eef0] rounded-md">
              <svg
                className="h-4 w-4 text-medistryColor"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Type
            </label>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 mb-4 border border-gray-200 text-left">
            <span className="inline-flex items-center py-1 rounded-full text-sm ">
              {data?.details?.type || "Not specified"}
            </span>
          </div>

          {/* Message Card */}

          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-[#e3eef0] rounded-md">
              <svg
                className="h-4 w-4 text-medistryColor"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Message
            </label>
          </div>
          <div className="bg-gray-50 rounded-lg text-left p-4 border border-gray-200 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-100">
            <div className="prose prose-sm max-w-none">
              <div className="text-gray-700">
                {formatMessage(data?.details?.message)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BroadcastMessageView;
