import { LegalDocumentPage } from '@/components/LegalDocumentPage';
import { privacyDocument } from '@/lib/legalDocuments';

export default function PrivacyPage() {
  return (
    <LegalDocumentPage
      document={privacyDocument}
      backHref="/me"
      backLabel="내 정보로 돌아가기"
    />
  );
}
