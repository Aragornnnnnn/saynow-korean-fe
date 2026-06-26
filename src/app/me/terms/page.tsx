import { LegalDocumentPage } from '@/components/LegalDocumentPage';
import { termsDocument } from '@/lib/legalDocuments';

export default function TermsPage() {
  return (
    <LegalDocumentPage
      document={termsDocument}
      backHref="/me"
      backLabel="내 정보로 돌아가기"
    />
  );
}
