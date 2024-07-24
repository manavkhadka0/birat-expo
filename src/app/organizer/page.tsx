import React from "react";

const OrganizerPage = () => {
  return (
    <div className="container">
      <img src="/21.png" alt="Organizer" className="max-w-5xl mx-auto" />
      <img src="/23.png" alt="Organizer" className="max-w-5xl mx-auto" />
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3571.644890773267!2d87.28418437542416!3d26.467173276915627!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ef74142c843179%3A0x9216f029e3d3b489!2sChamber%20of%20Industries%2C%20Morang!5e0!3m2!1sen!2snp!4v1721833458782!5m2!1sen!2snp"
        width="600"
        height="450"
        style={{
          border: 0,
          width: "100%",
          height: "450px",
        }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
};

export default OrganizerPage;
