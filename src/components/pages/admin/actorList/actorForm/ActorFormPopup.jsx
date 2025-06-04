import { useEffect } from "react";
import ActorForm from "./ActorForm";
import "./ActorFormPopup.scss";

const ActorFormPopup = ({ actor, onSubmit, onClose, isSubmitting }) => {
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "auto";
    };
  }, [onClose, isSubmitting]);

  return (
    <div className="actor-form-overlay" onClick={onClose}>
      <div className="actor-form-popup" onClick={(e) => e.stopPropagation()}>
        <button
          className="close-button"
          onClick={onClose}
          disabled={isSubmitting}
        >
          &times;
        </button>
        <ActorForm
          actor={actor}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default ActorFormPopup;
