
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';
import { format } from 'date-fns';

interface VoucherEmailProps {
  productName: string;
  productImageUrl: string;
  voucherDescription: string;
  claimedDate: Date;
}

const VoucherEmail = ({
  productName,
  productImageUrl,
  voucherDescription,
  claimedDate,
}: VoucherEmailProps) => {
  const formattedDate = format(new Date(claimedDate), "MMMM d, yyyy 'at' h:mm a");

  return (
    <Html>
      <Head />
      <Preview>Your Voucher for {productName} is confirmed!</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white border border-gray-200 rounded-lg shadow-sm my-10 mx-auto p-8 max-w-xl w-full">
            <Heading className="text-2xl font-bold text-gray-800 text-center">
              Voucher Claimed!
            </Heading>

            <Section className="mt-6 text-center">
              <Text className="text-gray-600">
                Thank you for claiming your voucher for:
              </Text>
              <Text className="text-xl font-semibold text-gray-900">
                {productName}
              </Text>
            </Section>

            <Section className="my-6">
              <Img
                src={productImageUrl || `https://picsum.photos/seed/${productName}/600/400`}
                width="100%"
                alt={productName}
                className="rounded-md object-contain max-h-80"
              />
            </Section>

            <Section className="bg-purple-50 border border-dashed border-purple-300 rounded-lg p-6 my-6 text-center">
              <Heading as="h2" className="text-lg font-semibold text-purple-800 mt-0">
                Your Voucher Details
              </Heading>
              <Text className="text-purple-700 text-base m-0">
                {voucherDescription}
              </Text>
            </Section>

            <Hr className="border-t border-gray-200 my-6" />

            <Section>
              <Text className="text-sm text-gray-500">
                <strong>Date Claimed:</strong> {formattedDate}
              </Text>
              <Text className="text-sm text-gray-500 mt-2">
                Please present this email or your voucher code upon purchase. Terms and conditions may apply.
              </Text>
            </Section>

            <Section className="text-center mt-8">
              <Text className="text-xs text-gray-400">
                This is an automated email. Please do not reply.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default VoucherEmail;
