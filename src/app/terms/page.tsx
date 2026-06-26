import { LegalDocumentPage } from '@/components/LegalDocumentPage';
import { termsDocument } from '@/lib/legalDocuments';

export default function PublicTermsPage() {
  return (
    <LegalDocumentPage
      document={termsDocument}
      backHref="/"
      backLabel="Back to Landit home"
    />
  );
}
