import { useEffect } from "react";
import DirectorForm from "./DirectorForm";
import "./DirectorForm.scss";

const DirectorFormPopup = ({ director, onSubmit, onClose, isSubmitting }) => {
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
    <div className="director-form-overlay" onClick={onClose}>
      <div className="director-form-popup" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose} disabled={isSubmitting}>
          &times;
        </button>
        <DirectorForm
          director={director}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default DirectorFormPopup;