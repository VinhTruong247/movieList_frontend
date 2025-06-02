import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "./ReviewForm.scss";

const ReviewSchema = Yup.object().shape({
  rating: Yup.number()
    .min(1, "Rating must be at least 1")
    .max(10, "Rating cannot exceed 10")
    .required("Rating is required"),
  comment: Yup.string()
    .max(1000, "Comment must be less than 1000 characters")
    .required("Comment is required"),
});

const ReviewForm = ({ onSubmit, onCancel, isSubmitting, editingReview }) => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const initialValues = {
    rating: editingReview?.rating || "",
    comment: editingReview?.comment || "",
  };

  useEffect(() => {
    if (editingReview) {
      setSelectedRating(editingReview.rating);
    }
  }, [editingReview]);

  const handleStarClick = (rating, setFieldValue) => {
    setSelectedRating(rating);
    setFieldValue("rating", rating);
  };

  const handleStarHover = (rating) => {
    setHoverRating(rating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  return (
    <div className="review-form-container">
      <div className="review-form-header">
        <h4>{editingReview ? "Edit Your Review" : "Write Your Review"}</h4>
        <p>
          {editingReview
            ? "Update your thoughts about this movie"
            : "Share your thoughts about this movie"}
        </p>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={ReviewSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {({ errors, touched, setFieldValue, values }) => (
          <Form className="review-form">
            <div className="form-group">
              <label>Your Rating *</label>
              <div className="rating-container">
                <div className="star-rating">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star ${
                        star <= (hoverRating || selectedRating || values.rating)
                          ? "active"
                          : ""
                      }`}
                      onClick={() => handleStarClick(star, setFieldValue)}
                      onMouseEnter={() => handleStarHover(star)}
                      onMouseLeave={handleStarLeave}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                <div className="rating-display">
                  {(hoverRating || selectedRating || values.rating) > 0 && (
                    <span className="rating-text">
                      {hoverRating || selectedRating || values.rating}/10
                    </span>
                  )}
                </div>
              </div>
              <ErrorMessage
                name="rating"
                component="div"
                className="error-message"
              />
            </div>

            <div className="form-group">
              <label htmlFor="comment">Your Review *</label>
              <Field
                as="textarea"
                id="comment"
                name="comment"
                rows="6"
                placeholder="Write your review here... What did you think about the story, acting, direction, etc.?"
                className={errors.comment && touched.comment ? "error" : ""}
              />
              <div className="character-count">
                {values.comment?.length || 0}/1000 characters
              </div>
              <ErrorMessage
                name="comment"
                component="div"
                className="error-message"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={onCancel}
                className="cancel-btn"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Saving..."
                  : editingReview
                    ? "Update Review"
                    : "Submit Review"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ReviewForm;
