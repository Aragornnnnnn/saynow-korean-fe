import { LegalDocumentPage } from '@/components/LegalDocumentPage';
import { privacyDocument } from '@/lib/legalDocuments';

export default function PrivacyPage() {
  return (
    <LegalDocumentPage
      document={privacyDocument}
      backHref="/me"
      backLabel="Back to Profile"
    />
  );
}
