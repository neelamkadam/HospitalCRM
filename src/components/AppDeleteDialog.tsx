import AppButton from "./AppButton";

interface AppDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  onClose: () => void;
  onConfirm: () => void;
  confirmTitle?: string;
  isLoading: boolean;
  hideCloseBtn?: boolean;
}

const AppDeleteDialog = ({
  isOpen,
  title,
  description,
  onClose,
  onConfirm,
  confirmTitle = "Confirm",
  isLoading,
  hideCloseBtn = false,
}: AppDialogProps) => {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[999] overflow-auto bg-black bg-opacity-40 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div
            className="bg-background rounded-xl shadow-xl p-6 m-4 max-w-md md:w-2/4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center items-center relative">
              <h2 className="text-xl font-bold">{title}</h2>
              {!hideCloseBtn && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:opacity-25 transition duration-150 ease-in-out absolute right-0"
                >
                  <svg
                    className="h-6 w-6"
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
              )}
            </div>
            <p className="py-6">{description}</p>
            <div className="mt-3 flex justify-center space-x-3">
              {!hideCloseBtn && <AppButton label="Close" className="mt-0 text-base" onClick={onClose} />}
              <AppButton
                isLoading={isLoading}
                label={confirmTitle}
                onClick={onConfirm}
                className="!bg-red-500 mt-0 !border-red-500 text-base"
                variant="destructive"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default AppDeleteDialog;
