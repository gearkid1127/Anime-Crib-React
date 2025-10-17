import { useEffect, useRef, useState } from "react";
import { useUI } from "../Context/UIContext.jsx";
import animeGirl from "../assets/happy-anime-girl.png";

export default function ContactModal() {
  const { isContactOpen, setIsContactOpen } = useUI();
  const dialogRef = useRef(null);
  const nameRef = useRef(null);
  const [sent, setSent] = useState(false);

  // Sync the native <dialog> with React state
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isContactOpen && !dialog.open) dialog.showModal();
    if (!isContactOpen && dialog.open) dialog.close();
  }, [isContactOpen]);
  // lock body scroll when modal is open; restore on close/unmount
  useEffect(() => {
    if (isContactOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isContactOpen]);

  // keep state in sync with native dialog events (Esc key, programmatic close)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const onCancel = () => setIsContactOpen(false);
    const onClose = () => setIsContactOpen(false);

    dialog.addEventListener("cancel", onCancel);
    dialog.addEventListener("close", onClose);
    return () => {
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("close", onClose);
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      onClose={() => setIsContactOpen(false)}
    >
      <form
        method="dialog"
        className="modal__card"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const name = encodeURIComponent(fd.get("name") || "");
          const email = encodeURIComponent(fd.get("email") || "");
          const message = encodeURIComponent(fd.get("message") || "");

          // show confirmation panel immediately
          setSent(true);

          // keep your current mailto flow (no paid service needed)
          window.location.href =
            `mailto:gearkid1127@gmail.com?subject=Message from ${name}` +
            `&body=From:%20${email}%0A%0A${message}`;

        }}
      >
        <h2 className="modal__title">Contact Me</h2>

        {!sent && (
          <>
            <input
              ref={nameRef}
              name="name"
              className="modal__input"
              type="text"
              placeholder="Your Name"
              autoComplete="name"
            />
            <input
              name="email"
              className="modal__input"
              type="email"
              placeholder="Your Email"
              required
              autoComplete="email"
              inputMode="email"
              autoCapitalize="off"
              spellCheck={false}
            />

            <textarea
              name="message"
              className="modal__textarea"
              placeholder="Your Message"
              rows="5"
            ></textarea>

            <div className="modal__actions">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setIsContactOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn">
                Send
              </button>
            </div>
          </>
        )}

        {sent && (
          <div style={{ textAlign: "center", padding: "1rem 0.5rem" }}>
            <img
              src={animeGirl}
              alt="Happy anime character"
              style={{
                width: "8rem",
                height: "auto",
                display: "block",
                margin: "0 auto 0.5rem",
                filter: "drop-shadow(0 4px 10px rgba(0,0,0,.2))",
              }}
            />

            <p style={{ fontWeight: 800, margin: "0.5rem 0" }}>
              Message ready to send!
            </p>
            <p style={{ fontSize: "0.95rem", opacity: 0.9 }}>
              Your email app is opening. Thanks!
            </p>
          </div>
        )}
      </form>
      <div
        className="modal__backdrop"
        onClick={() => setIsContactOpen(false)}
      />
    </dialog>
  );
}
