import { LegalDocumentPage } from '@/components/LegalDocumentPage';
import { termsDocument } from '@/lib/legalDocuments';

export default function TermsPage() {
  return (
    <LegalDocumentPage
      document={termsDocument}
      backHref="/me"
      backLabel="Back to Profile"
    />
  );
}
