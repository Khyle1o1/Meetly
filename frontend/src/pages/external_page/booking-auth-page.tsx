import { useNavigate } from "react-router-dom";
import { BookingAuth } from "./_components/booking-auth";
import PageContainer from "./_components/page-container";

const BookingAuthPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    // Go back to the previous page
    navigate(-1);
  };

  return (
    <PageContainer isLoading={false} className="!min-w-auto sm:!w-auto">
      <BookingAuth onBack={handleBack} />
    </PageContainer>
  );
};

export default BookingAuthPage; 