// app/user/consultants/thank-you/page.tsx
export default function ThankYou() {
  return (
    <div className="container text-center py-5 mt-5">
      <h1 className="text-success mb-4">Application Submitted!</h1>
      <p className="text-black">We've received your consultant application. 
        Applications will be reviewed by our team, and you will be notified via email once a decision has been made.
      </p>
      <a href="/user/home" className="btn btn-primary mt-3">
        Return to Home
      </a>
    </div>
  );
}