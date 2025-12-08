import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { cn } from "../lib/utils";

type AppModalProps = {
  isOpen: boolean;
  toggle: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  theme?: string;
  disableOutsideClick?: boolean;
  hideCloseButton?: boolean;
};

const AppModal = (props: AppModalProps) => {
  const {
    isOpen,
    toggle,
    title,
    className,
    children,
    theme,
    disableOutsideClick = false,
    hideCloseButton = true,
  } = props;

  const backgroundClass =
    theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black";

  return (
    <Dialog
      open={isOpen}
      onOpenChange={disableOutsideClick ? undefined : toggle}
    >
      <DialogContent
        className={cn(
          `max-h-[90%] w-[calc(100vw-32px)] sm:max-w-lg rounded-xl overflow-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-white ${backgroundClass}`,
          className
        )}
      >
        <DialogHeader>
          {!hideCloseButton && <DialogClose className="ml-auto">✕</DialogClose>}
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{children}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default AppModal;
